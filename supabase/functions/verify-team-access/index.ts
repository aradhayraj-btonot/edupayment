import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyAccessRequest {
  access_password: string;
  email: string;
  password: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const TEAM_ACCESS_PASSWORD = Deno.env.get("TEAM_ACCESS_PASSWORD");

    if (!TEAM_ACCESS_PASSWORD) {
      console.error("TEAM_ACCESS_PASSWORD not configured");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { access_password, email, password }: VerifyAccessRequest = await req.json();

    console.log(`Team login attempt for email: ${email}`);

    // Step 1: Verify access password
    if (access_password !== TEAM_ACCESS_PASSWORD) {
      console.log("Invalid access password");
      return new Response(
        JSON.stringify({ error: "Invalid access password" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Check if user exists and has team role BEFORE attempting login
    // First, get the user by email from profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (profileError) {
      console.error("Error checking profile:", profileError);
    }

    if (!profile) {
      console.log(`No user found with email: ${email}`);
      return new Response(
        JSON.stringify({ error: "You do not have team access. Contact EduPay administration." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if this user has team role
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", profile.id)
      .eq("role", "team")
      .maybeSingle();

    if (roleError) {
      console.error("Error checking role:", roleError);
    }

    if (!roleData) {
      console.log(`User ${email} does not have team role`);
      return new Response(
        JSON.stringify({ error: "You do not have team access. Contact EduPay administration." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 3: User has team role, now verify their password by attempting sign in
    // Use the anon key for sign in (we'll create a temporary client)
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);

    const { data: authData, error: authError } = await anonClient.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.log(`Authentication failed for ${email}: ${authError.message}`);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Team login successful for ${email}`);

    // Return the session tokens so the client can use them
    return new Response(
      JSON.stringify({
        success: true,
        session: authData.session,
        user: authData.user,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in verify-team-access function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
