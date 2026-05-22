// AI-powered app health monitor — runs every 1 minute via pg_cron.
// Probes critical DB queries, edge function logs, RLS boundaries, then
// asks Lovable AI to summarize anomalies into structured bug reports.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

type Probe = {
  name: string;
  category: string;
  ok: boolean;
  ms: number;
  error?: string;
  detail?: unknown;
};

async function timed<T>(name: string, category: string, fn: () => Promise<T>): Promise<Probe & { data?: T }> {
  const t0 = Date.now();
  try {
    const data = await fn();
    return { name, category, ok: true, ms: Date.now() - t0, data };
  } catch (e) {
    return { name, category, ok: false, ms: Date.now() - t0, error: e instanceof Error ? e.message : String(e) };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const probes: Probe[] = [];

  // 1. Core table read checks
  for (const table of ["schools", "students", "payments", "user_roles", "school_subscriptions", "fee_structures", "student_fees", "notifications", "blog_posts", "support_tickets"]) {
    probes.push(await timed(`read:${table}`, "database", async () => {
      const { error, count } = await admin.from(table).select("*", { count: "exact", head: true });
      if (error) throw new Error(error.message);
      return { count };
    }));
  }

  // 2. Critical RPC / helper functions
  probes.push(await timed("rpc:has_team_role", "rls", async () => {
    const { error } = await admin.rpc("has_team_role", { _user_id: "00000000-0000-0000-0000-000000000000" });
    if (error) throw new Error(error.message);
    return true;
  }));

  // 3. Subscription consistency — active flag must match active row
  probes.push(await timed("consistency:subscription_active_flag", "data-integrity", async () => {
    const { data: schools } = await admin.from("schools").select("id, subscription_active").limit(1000);
    const { data: subs } = await admin.from("school_subscriptions").select("school_id, status, expires_at").limit(1000);
    const activeMap = new Map(subs?.filter(s => s.status === "active" && new Date(s.expires_at) > new Date()).map(s => [s.school_id, true]));
    const mismatches = (schools ?? []).filter(s => !!s.subscription_active !== !!activeMap.get(s.id));
    if (mismatches.length > 0) throw new Error(`${mismatches.length} schools have inconsistent subscription_active flag`);
    return { checked: schools?.length ?? 0 };
  }));

  // 4. Orphaned records
  probes.push(await timed("orphan:students_without_school", "data-integrity", async () => {
    const { data, error } = await admin
      .from("students")
      .select("id, school_id, schools!inner(id)")
      .is("schools.id", null)
      .limit(50);
    if (error && !error.message.includes("inner")) throw new Error(error.message);
    if ((data?.length ?? 0) > 0) throw new Error(`${data!.length} students reference missing schools`);
    return { orphans: 0 };
  }));

  probes.push(await timed("orphan:payments_without_student", "data-integrity", async () => {
    const { data: pays } = await admin.from("payments").select("id, student_id").limit(500);
    if (!pays || pays.length === 0) return { orphans: 0 };
    const ids = [...new Set(pays.map(p => p.student_id))];
    const { data: students } = await admin.from("students").select("id").in("id", ids);
    const have = new Set((students ?? []).map(s => s.id));
    const orphans = pays.filter(p => !have.has(p.student_id));
    if (orphans.length > 0) throw new Error(`${orphans.length} payments reference missing students`);
    return { orphans: 0 };
  }));

  // 5. Auth - users without profile
  probes.push(await timed("auth:users_without_profile", "auth", async () => {
    const { data: users } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const ids = users.users.map(u => u.id);
    const { data: profiles } = await admin.from("profiles").select("id").in("id", ids);
    const have = new Set((profiles ?? []).map(p => p.id));
    const missing = users.users.filter(u => !have.has(u.id));
    if (missing.length > 0) throw new Error(`${missing.length} auth users have no profile row`);
    return { checked: ids.length };
  }));

  // 6. Stuck pending payments older than 24h
  probes.push(await timed("workflow:stuck_pending_payments", "workflow", async () => {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await admin
      .from("payments")
      .select("id")
      .eq("status", "pending")
      .lt("created_at", since)
      .limit(100);
    if (error) throw new Error(error.message);
    if ((data?.length ?? 0) > 5) throw new Error(`${data!.length} pending payments stuck >24h`);
    return { stuck: data?.length ?? 0 };
  }));

  // 7. Slow queries (any probe >2s)
  const slow = probes.filter(p => p.ok && p.ms > 2000);
  if (slow.length > 0) {
    probes.push({ name: "perf:slow_probes", category: "performance", ok: false, ms: 0, error: `${slow.length} probes >2s`, detail: slow.map(s => ({ name: s.name, ms: s.ms })) });
  }

  const failures = probes.filter(p => !p.ok);
  const summary = {
    ran_at: new Date().toISOString(),
    total: probes.length,
    failed: failures.length,
    avg_ms: Math.round(probes.reduce((a, p) => a + p.ms, 0) / probes.length),
  };

  // If failures, send to AI for triage + dedup against open bugs
  let inserted = 0;
  if (failures.length > 0) {
    const { data: openBugs } = await admin
      .from("bug_reports")
      .select("title, category, severity")
      .eq("status", "open")
      .order("occurred_at", { ascending: false })
      .limit(50);

    try {
      const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "You are a senior SRE. Given failing health probes from a multi-tenant school payment SaaS, produce a deduplicated list of bug reports. Skip anything already in 'existing_open_bugs' (same title or near-duplicate). Severity must be critical|high|medium|low." },
            { role: "user", content: JSON.stringify({ failures, existing_open_bugs: openBugs ?? [] }) },
          ],
          tools: [{
            type: "function",
            function: {
              name: "report_bugs",
              description: "Report deduplicated bugs",
              parameters: {
                type: "object",
                properties: {
                  bugs: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
                        category: { type: "string" },
                        description: { type: "string" },
                        suggested_fix: { type: "string" },
                      },
                      required: ["title", "severity", "category", "description", "suggested_fix"],
                    },
                  },
                },
                required: ["bugs"],
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "report_bugs" } },
        }),
      });

      if (aiResp.ok) {
        const aij = await aiResp.json();
        const call = aij.choices?.[0]?.message?.tool_calls?.[0];
        const args = call ? JSON.parse(call.function.arguments) : null;
        const bugs = args?.bugs ?? [];
        if (bugs.length > 0) {
          const rows = bugs.map((b: any) => ({
            title: b.title,
            severity: b.severity,
            category: b.category,
            description: b.description,
            suggested_fix: b.suggested_fix,
            metadata: { probes: failures.map(f => ({ name: f.name, error: f.error })) },
          }));
          const { error: insErr } = await admin.from("bug_reports").insert(rows);
          if (!insErr) inserted = rows.length;
        }
      } else {
        // AI failed (rate limit / credits) — insert raw failure as a bug so we don't lose signal
        await admin.from("bug_reports").insert(failures.map(f => ({
          title: `Health probe failed: ${f.name}`,
          severity: "high",
          category: f.category,
          description: f.error ?? "Probe failed without error message",
          suggested_fix: "AI triage unavailable — investigate probe manually.",
          metadata: { probe: f },
        })));
        inserted = failures.length;
      }
    } catch (e) {
      console.error("AI triage error:", e);
    }
  }

  return new Response(JSON.stringify({ ...summary, inserted_bugs: inserted, failures: failures.map(f => f.name) }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
