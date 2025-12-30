import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateAdminRequest {
  email: string;
  password: string;
  fullName: string;
  schoolId: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Verify the caller is a team member
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const anonClient = createClient(supabaseUrl, anonKey!, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } }
    });

    // Get current user
    const { data: { user }, error: userError } = await anonClient.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role to check if user has team role
    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });

    const { data: teamRole, error: roleError } = await serviceClient
      .from('user_roles')
      .select('id')
      .eq('user_id', user.id)
      .eq('role', 'team')
      .single();

    if (roleError || !teamRole) {
      console.error('Not a team member:', roleError);
      return new Response(
        JSON.stringify({ error: 'Only team members can create admin accounts' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { email, password, fullName, schoolId }: CreateAdminRequest = await req.json();

    if (!email || !password || !fullName || !schoolId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, password, fullName, schoolId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if school exists
    const { data: school, error: schoolError } = await serviceClient
      .from('schools')
      .select('id, name')
      .eq('id', schoolId)
      .single();

    if (schoolError || !school) {
      return new Response(
        JSON.stringify({ error: 'School not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Creating admin account for ${email} in school ${school.name}`);

    // Create the user using service role (admin API)
    const { data: newUser, error: createError } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    });

    if (createError) {
      console.error('Error creating user:', createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`User created with ID: ${newUser.user.id}`);

    // Assign admin role with school_id
    const { error: roleInsertError } = await serviceClient
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: 'admin',
        school_id: schoolId
      });

    if (roleInsertError) {
      console.error('Error assigning role:', roleInsertError);
      // Try to clean up the user if role assignment fails
      await serviceClient.auth.admin.deleteUser(newUser.user.id);
      return new Response(
        JSON.stringify({ error: 'Failed to assign admin role: ' + roleInsertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Admin role assigned successfully for school ${schoolId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Admin account created for ${email}`,
        userId: newUser.user.id 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
