import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TeamLoginRequest {
  access_password: string;
  email: string;
  password: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const teamAccessPassword = Deno.env.get("TEAM_ACCESS_PASSWORD");

    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!teamAccessPassword) {
      console.error("TEAM_ACCESS_PASSWORD not configured");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { access_password, email, password }: TeamLoginRequest = await req.json();
    const normalizedEmail = email.toLowerCase().trim();

    console.log(`[Team Login] Attempt for: ${normalizedEmail}`);

    // Step 1: Verify master access password
    if (access_password !== teamAccessPassword) {
      console.log(`[Team Login] Invalid access password for: ${normalizedEmail}`);
      return new Response(
        JSON.stringify({ error: "Invalid access password" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Team Login] Access password verified for: ${normalizedEmail}`);

    // Step 2: Use service role client to check if user exists and has team role
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get profile by email
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("id, email, full_name")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (profileError) {
      console.error(`[Team Login] Profile lookup error:`, profileError);
      return new Response(
        JSON.stringify({ error: "Failed to verify user" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!profile) {
      console.log(`[Team Login] No profile found for: ${normalizedEmail}`);
      return new Response(
        JSON.stringify({ error: "No account found with this email. Please sign up first." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Team Login] Profile found: ${profile.id}`);

    // Step 3: Check if user has team role
    const { data: teamRole, error: roleError } = await adminClient
      .from("user_roles")
      .select("id, role")
      .eq("user_id", profile.id)
      .eq("role", "team")
      .maybeSingle();

    if (roleError) {
      console.error(`[Team Login] Role lookup error:`, roleError);
      return new Response(
        JSON.stringify({ error: "Failed to verify team access" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!teamRole) {
      console.log(`[Team Login] User ${normalizedEmail} does not have team role`);
      return new Response(
        JSON.stringify({ error: "You do not have team access. Contact EduPay administration." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Team Login] Team role verified for: ${normalizedEmail}`);

    // Step 4: Authenticate user with their credentials using anon client
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data: authData, error: authError } = await anonClient.auth.signInWithPassword({
      email: normalizedEmail,
      password: password,
    });

    if (authError) {
      console.log(`[Team Login] Auth failed for ${normalizedEmail}: ${authError.message}`);
      return new Response(
        JSON.stringify({ error: "Invalid email or password" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Team Login] SUCCESS for: ${normalizedEmail}`);

    return new Response(
      JSON.stringify({
        success: true,
        session: authData.session,
        user: authData.user,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[Team Login] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
