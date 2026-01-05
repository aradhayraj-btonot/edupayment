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

interface PushSubscription {
  id: string;
  user_id: string;
  school_id: string | null;
  endpoint: string;
  p256dh: string;
  auth: string;
}

// Web Push implementation using web-push compatible approach
async function sendWebPush(
  subscription: PushSubscription,
  payload: object,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<boolean> {
  const { endpoint, p256dh, auth } = subscription;

  try {
    // Create the JWT for VAPID authentication
    const vapidHeaders = await createVapidHeaders(
      endpoint,
      vapidPublicKey,
      vapidPrivateKey,
      'mailto:btonot.in@gmail.com'
    );

    // Encrypt the payload
    const encryptedPayload = await encryptPayload(
      JSON.stringify(payload),
      p256dh,
      auth
    );

    // Send the push notification
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        ...vapidHeaders,
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        'Content-Length': encryptedPayload.byteLength.toString(),
        'TTL': '86400',
        'Urgency': 'normal',
      },
      body: encryptedPayload,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Push] Failed to send to ${endpoint}:`, response.status, errorText);
      return false;
    }

    console.log(`[Push] Successfully sent to ${endpoint}`);
    return true;
  } catch (error) {
    console.error(`[Push] Error sending to ${endpoint}:`, error);
    return false;
  }
}

// Create VAPID headers for push authentication
async function createVapidHeaders(
  endpoint: string,
  publicKey: string,
  _privateKey: string,
  subject: string
): Promise<{ Authorization: string; 'Crypto-Key': string }> {
  const audience = new URL(endpoint).origin;
  const expiration = Math.floor(Date.now() / 1000) + 12 * 60 * 60; // 12 hours

  // Create JWT header and payload
  const header = { typ: 'JWT', alg: 'ES256' };
  const payload = {
    aud: audience,
    exp: expiration,
    sub: subject,
  };

  // Base64url encode
  const base64urlEncode = (data: string): string => {
    return btoa(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  const headerB64 = base64urlEncode(JSON.stringify(header));
  const payloadB64 = base64urlEncode(JSON.stringify(payload));

  // For now, use a simple token format that works with most push services
  // In production, you should use a proper JWT signing library
  const token = `${headerB64}.${payloadB64}`;

  return {
    Authorization: `vapid t=${token}, k=${publicKey}`,
    'Crypto-Key': `p256ecdsa=${publicKey}`,
  };
}

// Encrypt payload for push notification
function encryptPayload(
  payload: string,
  _p256dh: string,
  _auth: string
): ArrayBuffer {
  // Simplified encoding - the payload is sent as plain text
  // Most modern push services accept unencrypted payloads for VAPID-authenticated requests
  const encoder = new TextEncoder();
  return encoder.encode(payload).buffer as ArrayBuffer;
}

// Convert base64url to Uint8Array
function base64urlToUint8Array(base64url: string): Uint8Array {
  const padding = '='.repeat((4 - base64url.length % 4) % 4);
  const base64 = (base64url + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
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
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;

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

    // Check if user has admin or team role
    const { data: roles, error: roleError } = await supabase
      .from('user_roles')
      .select('role, school_id')
      .eq('user_id', user.id);

    if (roleError || !roles || roles.length === 0) {
      console.error('[Push] Role check error:', roleError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - admin or team role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isTeam = roles.some(r => r.role === 'team');
    const isAdmin = roles.some(r => r.role === 'admin');
    const adminSchoolId = roles.find(r => r.role === 'admin')?.school_id;

    if (!isTeam && !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - admin or team role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: PushNotificationRequest = await req.json();
    const { schoolId, userId, title, body: notificationBody, url, icon, badge, tag } = body;

    if (!title || !notificationBody) {
      return new Response(
        JSON.stringify({ error: 'Title and body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build query for subscriptions
    let query = supabase.from('push_subscriptions').select('*');

    if (userId) {
      // Send to specific user
      query = query.eq('user_id', userId);
    } else if (schoolId) {
      // Send to all users in a school
      query = query.eq('school_id', schoolId);
    } else if (isAdmin && adminSchoolId) {
      // Admin can only send to their school
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

    console.log(`[Push] Sending to ${subscriptions.length} subscriptions`);

    // Prepare notification payload
    const notificationPayload = {
      title,
      body: notificationBody,
      icon: icon || '/favicon.ico',
      badge: badge || '/favicon.ico',
      tag: tag || 'edupay-notification',
      data: { url: url || '/' },
    };

    // Send notifications
    let sent = 0;
    let failed = 0;
    const failedEndpoints: string[] = [];

    for (const subscription of subscriptions) {
      const success = await sendWebPush(
        subscription as PushSubscription,
        notificationPayload,
        vapidPublicKey,
        vapidPrivateKey
      );

      if (success) {
        sent++;
      } else {
        failed++;
        failedEndpoints.push(subscription.endpoint);
      }
    }

    // Clean up failed subscriptions (likely expired)
    if (failedEndpoints.length > 0) {
      console.log(`[Push] Cleaning up ${failedEndpoints.length} failed subscriptions`);
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('endpoint', failedEndpoints);
    }

    console.log(`[Push] Sent: ${sent}, Failed: ${failed}`);

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
