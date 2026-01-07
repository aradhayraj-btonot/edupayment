// deno-lint-ignore-file
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

// Convert base64url to Uint8Array
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

// Convert Uint8Array to base64url
function uint8ArrayToBase64url(arr: Uint8Array): string {
  const binary = Array.from(arr).map(b => String.fromCharCode(b)).join('');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Get underlying ArrayBuffer properly
function toArrayBuffer(arr: Uint8Array): ArrayBuffer {
  return arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength) as ArrayBuffer;
}

// Concatenate Uint8Arrays
function concatUint8Arrays(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

// Create VAPID JWT
async function createVapidJwt(
  audience: string,
  subject: string,
  privateKeyBytes: Uint8Array,
  publicKeyBytes: Uint8Array
): Promise<string> {
  const header = { typ: 'JWT', alg: 'ES256' };
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
    sub: subject,
  };

  const encoder = new TextEncoder();
  const headerB64 = uint8ArrayToBase64url(encoder.encode(JSON.stringify(header)));
  const payloadB64 = uint8ArrayToBase64url(encoder.encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import private key for signing
  const jwk = {
    kty: 'EC',
    crv: 'P-256',
    x: uint8ArrayToBase64url(publicKeyBytes.slice(1, 33)),
    y: uint8ArrayToBase64url(publicKeyBytes.slice(33, 65)),
    d: uint8ArrayToBase64url(privateKeyBytes),
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
    encoder.encode(unsignedToken)
  );

  // Convert signature to raw format (64 bytes)
  const sigArray = new Uint8Array(signature);
  let r: Uint8Array;
  let s: Uint8Array;
  
  if (sigArray.length === 64) {
    r = sigArray.slice(0, 32);
    s = sigArray.slice(32, 64);
  } else {
    r = sigArray.slice(0, 32);
    s = sigArray.slice(32);
  }

  const rawSig = concatUint8Arrays(r, s);
  const signatureB64 = uint8ArrayToBase64url(rawSig);

  return `${unsignedToken}.${signatureB64}`;
}

// HKDF implementation
async function hkdf(
  salt: Uint8Array,
  ikm: Uint8Array,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> {
  // Extract
  const saltBuffer = salt.length > 0 ? toArrayBuffer(salt) : new ArrayBuffer(32);
  const saltKey = await crypto.subtle.importKey(
    'raw',
    saltBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const prk = new Uint8Array(await crypto.subtle.sign('HMAC', saltKey, toArrayBuffer(ikm)));

  // Expand
  const prkKey = await crypto.subtle.importKey(
    'raw',
    toArrayBuffer(prk),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const output = new Uint8Array(length);
  let t = new Uint8Array(0);
  let offset = 0;
  let counter = 1;

  while (offset < length) {
    const data = concatUint8Arrays(t, info, new Uint8Array([counter]));
    t = new Uint8Array(await crypto.subtle.sign('HMAC', prkKey, toArrayBuffer(data)));
    const remaining = Math.min(t.length, length - offset);
    output.set(t.slice(0, remaining), offset);
    offset += remaining;
    counter++;
  }

  return output;
}

// Create info for HKDF
function createInfo(type: string, context: Uint8Array): Uint8Array {
  const encoder = new TextEncoder();
  const typeBytes = encoder.encode(type);
  const result = new Uint8Array(18 + type.length + 1 + 5 + context.length);
  
  result.set(encoder.encode('Content-Encoding: '), 0);
  result.set(typeBytes, 18);
  result[18 + type.length] = 0;
  result.set(encoder.encode('P-256'), 18 + type.length + 1);
  result.set(context, 18 + type.length + 1 + 5);
  
  return result;
}

// Encrypt payload using aes128gcm
async function encryptPayload(
  payload: string,
  p256dh: string,
  auth: string
): Promise<{ encrypted: Uint8Array; salt: Uint8Array; publicKey: Uint8Array }> {
  const encoder = new TextEncoder();
  const payloadBytes = encoder.encode(payload);
  
  // Decode subscriber keys
  const subscriberPublicKey = base64urlToUint8Array(p256dh);
  const subscriberAuth = base64urlToUint8Array(auth);

  // Generate ephemeral key pair
  const keyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  );

  // Export public key
  const publicKeyBuffer = await crypto.subtle.exportKey('raw', keyPair.publicKey);
  const localPublicKey = new Uint8Array(publicKeyBuffer);

  // Import subscriber public key
  const subscriberKey = await crypto.subtle.importKey(
    'raw',
    toArrayBuffer(subscriberPublicKey),
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );

  // Derive shared secret
  const sharedSecretBuffer = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: subscriberKey },
    keyPair.privateKey,
    256
  );
  const sharedSecret = new Uint8Array(sharedSecretBuffer);

  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Create context for key derivation
  const context = concatUint8Arrays(
    new Uint8Array([0, 65]),
    subscriberPublicKey,
    new Uint8Array([0, 65]),
    localPublicKey
  );

  // Derive PRK using HKDF
  const authInfo = encoder.encode('Content-Encoding: auth\0');
  const prk = await hkdf(subscriberAuth, sharedSecret, authInfo, 32);

  // Derive CEK and nonce
  const cekInfo = createInfo('aesgcm', context);
  const nonceInfo = createInfo('nonce', context);
  
  const cek = await hkdf(salt, prk, cekInfo, 16);
  const nonce = await hkdf(salt, prk, nonceInfo, 12);

  // Pad payload (2 bytes padding length + padding + payload)
  const paddingLength = 0;
  const paddedPayload = concatUint8Arrays(
    new Uint8Array([0, paddingLength]),
    payloadBytes
  );

  // Encrypt with AES-GCM
  const aesKey = await crypto.subtle.importKey(
    'raw',
    toArrayBuffer(cek),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: toArrayBuffer(nonce) },
    aesKey,
    toArrayBuffer(paddedPayload)
  );

  return {
    encrypted: new Uint8Array(encrypted),
    salt,
    publicKey: localPublicKey
  };
}

// Send encrypted web push notification
async function sendWebPush(
  endpoint: string,
  p256dh: string,
  auth: string,
  payload: string,
  vapidPublicKeyB64: string,
  vapidPrivateKeyB64: string
): Promise<{ success: boolean; status?: number; error?: string }> {
  try {
    const url = new URL(endpoint);
    const audience = url.origin;

    // Decode VAPID keys
    const vapidPublicKey = base64urlToUint8Array(vapidPublicKeyB64);
    const vapidPrivateKey = base64urlToUint8Array(vapidPrivateKeyB64);

    // Create VAPID JWT
    const jwt = await createVapidJwt(
      audience,
      'mailto:support@edupay.app',
      vapidPrivateKey,
      vapidPublicKey
    );

    // Encrypt payload
    const { encrypted, salt, publicKey } = await encryptPayload(payload, p256dh, auth);

    // Build request headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aesgcm',
      'TTL': '86400',
      'Urgency': 'normal',
      'Authorization': `vapid t=${jwt}, k=${vapidPublicKeyB64}`,
      'Crypto-Key': `dh=${uint8ArrayToBase64url(publicKey)};p256ecdsa=${vapidPublicKeyB64}`,
      'Encryption': `salt=${uint8ArrayToBase64url(salt)}`,
    };

    console.log('[Push] Sending to:', endpoint.substring(0, 50) + '...');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: toArrayBuffer(encrypted),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Push] Response error:', response.status, errorText);
      return {
        success: false,
        status: response.status,
        error: `HTTP ${response.status}: ${errorText}`
      };
    }

    console.log('[Push] Success! Status:', response.status);
    return { success: true, status: response.status };
  } catch (error) {
    console.error('[Push] Error:', error);
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
    console.log('[Push] VAPID keys present:', !!vapidPublicKey, !!vapidPrivateKey);

    if (!vapidPublicKey || !vapidPrivateKey) {
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
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Push] User authenticated:', user.id);

    // Check if user has admin or team role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role, school_id')
      .eq('user_id', user.id);

    const isTeam = roles?.some(r => r.role === 'team');
    const isAdmin = roles?.some(r => r.role === 'admin');
    const adminSchoolId = roles?.find(r => r.role === 'admin')?.school_id;

    if (!isTeam && !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - admin or team role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: PushNotificationRequest = await req.json();
    const { schoolId, userId, title, body: notificationBody, url, icon, badge, tag } = body;

    console.log('[Push] Request:', { schoolId, userId, title });

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
      console.error('[Push] Subscription query error:', subError);
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
    const expiredEndpoints: string[] = [];

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
      } else {
        failed++;
        if (result.status === 404 || result.status === 410) {
          expiredEndpoints.push(subscription.endpoint);
        }
      }
    }

    // Clean up expired subscriptions
    if (expiredEndpoints.length > 0) {
      console.log(`[Push] Cleaning up ${expiredEndpoints.length} expired subscriptions`);
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('endpoint', expiredEndpoints);
    }

    console.log(`[Push] Complete - Sent: ${sent}, Failed: ${failed}`);

    return new Response(
      JSON.stringify({ success: true, sent, failed, total: subscriptions.length }),
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