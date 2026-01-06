import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for web app access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushNotificationRequest {
  schoolId?: string;
  userId?: string;
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
}

// Helper to convert base64url to Uint8Array
function base64urlToUint8Array(base64url: string): Uint8Array {
  const padding = '='.repeat((4 - base64url.length % 4) % 4);
  const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Helper to convert Uint8Array to base64url
function uint8ArrayToBase64url(arr: Uint8Array): string {
  const binary = Array.from(arr).map(b => String.fromCharCode(b)).join('');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Create VAPID JWT token
async function createVapidJwt(
  audience: string,
  subject: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<{ authorization: string; cryptoKey: string }> {
  const header = { typ: 'JWT', alg: 'ES256' };
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
    sub: subject,
  };

  const base64urlEncode = (data: string): string => {
    return btoa(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  const headerB64 = base64urlEncode(JSON.stringify(header));
  const payloadB64 = base64urlEncode(JSON.stringify(payload));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  try {
    // Try to import the private key and sign the JWT
    const privateKeyBytes = base64urlToUint8Array(vapidPrivateKey);
    
    // Create JWK format for EC private key
    const jwk = {
      kty: 'EC',
      crv: 'P-256',
      d: vapidPrivateKey,
      x: vapidPublicKey.substring(0, 43), // First 32 bytes of public key (base64url)
      y: vapidPublicKey.substring(43), // Remaining 32 bytes
    };

    const key = await crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      key,
      new TextEncoder().encode(unsignedToken)
    );

    const signatureB64 = uint8ArrayToBase64url(new Uint8Array(signature));
    const jwt = `${unsignedToken}.${signatureB64}`;

    return {
      authorization: `vapid t=${jwt}, k=${vapidPublicKey}`,
      cryptoKey: `p256ecdsa=${vapidPublicKey}`,
    };
  } catch (error) {
    console.warn('[Push] JWT signing failed, using unsigned token:', error);
    // Fallback to unsigned token format
    return {
      authorization: `vapid t=${unsignedToken}, k=${vapidPublicKey}`,
      cryptoKey: `p256ecdsa=${vapidPublicKey}`,
    };
  }
}

// Send push notification using simple unencrypted payload
// Many push services accept plain text payloads with VAPID auth
async function sendWebPush(
  endpoint: string,
  p256dh: string,
  auth: string,
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<{ success: boolean; status?: number; error?: string }> {
  try {
    const url = new URL(endpoint);
    const audience = url.origin;

    // Create VAPID headers
    const vapid = await createVapidJwt(
      audience,
      'mailto:btonot.in@gmail.com',
      vapidPublicKey,
      vapidPrivateKey
    );

    // Send with simple text payload (works with many services)
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
        'TTL': '86400',
        'Urgency': 'normal',
        'Authorization': vapid.authorization,
        'Crypto-Key': vapid.cryptoKey,
      },
      body: payload,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { 
        success: false, 
        status: response.status,
        error: `HTTP ${response.status}: ${errorText}` 
      };
    }

    return { success: true, status: response.status };
  } catch (error) {
    console.error('[Push] Fetch error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    console.log('[Push] Starting handler');
    console.log('[Push] VAPID public key present:', !!vapidPublicKey);
    console.log('[Push] VAPID private key present:', !!vapidPrivateKey);

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('[Push] VAPID keys not configured');
      return new Response(
        JSON.stringify({ error: 'Push notification keys not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[Push] No authorization header');
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('[Push] Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Push] User authenticated:', user.id);

    // Check if user has admin or team role
    const { data: roles, error: roleError } = await supabase
      .from('user_roles')
      .select('role, school_id')
      .eq('user_id', user.id);

    if (roleError) {
      console.error('[Push] Role check error:', roleError);
      return new Response(
        JSON.stringify({ error: 'Failed to check user roles' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!roles || roles.length === 0) {
      console.error('[Push] No roles found for user');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - admin or team role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isTeam = roles.some(r => r.role === 'team');
    const isAdmin = roles.some(r => r.role === 'admin');
    const adminSchoolId = roles.find(r => r.role === 'admin')?.school_id;

    console.log('[Push] User roles - isTeam:', isTeam, 'isAdmin:', isAdmin);

    if (!isTeam && !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - admin or team role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: PushNotificationRequest = await req.json();
    const { schoolId, userId, title, body: notificationBody, url, icon, badge, tag } = body;

    console.log('[Push] Request body:', { schoolId, userId, title, hasBody: !!notificationBody });

    if (!title || !notificationBody) {
      return new Response(
        JSON.stringify({ error: 'Title and body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build query for subscriptions
    let query = supabase.from('push_subscriptions').select('*');

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (schoolId) {
      query = query.eq('school_id', schoolId);
    } else if (isAdmin && adminSchoolId) {
      query = query.eq('school_id', adminSchoolId);
    }
    // Team can send to all if no filter specified

    const { data: subscriptions, error: subError } = await query;

    if (subError) {
      console.error('[Push] Error fetching subscriptions:', subError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subscriptions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('[Push] No subscriptions found');
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No subscriptions found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Push] Found ${subscriptions.length} subscriptions`);

    // Prepare notification payload
    const notificationPayload = JSON.stringify({
      title,
      body: notificationBody,
      icon: icon || '/favicon.ico',
      badge: badge || '/favicon.ico',
      tag: tag || 'edupay-notification',
      data: { url: url || '/' },
    });

    // Send notifications
    let sent = 0;
    let failed = 0;
    const failedEndpoints: string[] = [];

    for (const subscription of subscriptions) {
      const result = await sendWebPush(
        subscription.endpoint,
        subscription.p256dh,
        subscription.auth,
        notificationPayload,
        vapidPublicKey,
        vapidPrivateKey
      );

      if (result.success) {
        sent++;
        console.log(`[Push] Sent successfully`);
      } else {
        failed++;
        console.error(`[Push] Failed:`, result.error);
        // Only remove if it's a 404 or 410 (subscription expired/invalid)
        if (result.status === 404 || result.status === 410) {
          failedEndpoints.push(subscription.endpoint);
        }
      }
    }

    // Clean up expired subscriptions
    if (failedEndpoints.length > 0) {
      console.log(`[Push] Cleaning up ${failedEndpoints.length} expired subscriptions`);
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('endpoint', failedEndpoints);
    }

    console.log(`[Push] Complete - Sent: ${sent}, Failed: ${failed}`);

    return new Response(
      JSON.stringify({
        success: true,
        sent,
        failed,
        total: subscriptions.length,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Push] Handler error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
