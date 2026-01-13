// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // This is a PUBLIC key by design; we still serve it from the backend so
  // the frontend doesn't rely on build-time environment variables.
  const publicKey = Deno.env.get("VAPID_PUBLIC_KEY") ?? Deno.env.get("VITE_VAPID_PUBLIC_KEY") ?? "";

  if (!publicKey) {
    return new Response(
      JSON.stringify({ error: "VAPID public key not configured" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  return new Response(JSON.stringify({ publicKey }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
