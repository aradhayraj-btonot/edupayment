import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

const PLAN_PRICES = {
  starter: 99900, // ₹999 in paise
  professional: 699900, // ₹6999 in paise
  enterprise: 0, // Custom pricing
};

interface CreateOrderRequest {
  school_id: string;
  plan: "starter" | "professional" | "enterprise";
}

interface VerifyPaymentRequest {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  school_id: string;
  plan: "starter" | "professional" | "enterprise";
}

// Create Razorpay order
async function createRazorpayOrder(amount: number, schoolId: string, plan: string) {
  const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
  
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amount,
      currency: "INR",
      receipt: `sub_${schoolId}_${Date.now()}`,
      notes: {
        school_id: schoolId,
        plan: plan,
        type: "subscription",
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Razorpay order creation failed:", error);
    throw new Error("Failed to create Razorpay order");
  }

  return await response.json();
}

// Verify Razorpay payment signature
async function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<boolean> {
  const crypto = await import("https://deno.land/std@0.190.0/crypto/mod.ts");
  
  const body = orderId + "|" + paymentId;
  const key = new TextEncoder().encode(RAZORPAY_KEY_SECRET);
  const message = new TextEncoder().encode(body);
  
  const hmacKey = await crypto.crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signatureBuffer = await crypto.crypto.subtle.sign("HMAC", hmacKey, message);
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return expectedSignature === signature;
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

    const url = new URL(req.url);
    const action = url.pathname.split("/").pop();

    if (action === "create-order") {
      const { school_id, plan }: CreateOrderRequest = await req.json();
      
      console.log(`Creating order for school ${school_id}, plan: ${plan}`);
      
      if (plan === "enterprise") {
        return new Response(
          JSON.stringify({ error: "Enterprise plan requires custom pricing. Please contact sales." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const amount = PLAN_PRICES[plan];
      const order = await createRazorpayOrder(amount, school_id, plan);
      
      console.log("Razorpay order created:", order.id);

      return new Response(
        JSON.stringify({
          order_id: order.id,
          amount: order.amount,
          currency: order.currency,
          key_id: RAZORPAY_KEY_ID,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "verify-payment") {
      const { 
        razorpay_payment_id, 
        razorpay_order_id, 
        razorpay_signature,
        school_id,
        plan,
      }: VerifyPaymentRequest = await req.json();

      console.log(`Verifying payment for school ${school_id}`);

      // Verify signature
      const isValid = await verifyPaymentSignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );

      if (!isValid) {
        console.error("Invalid payment signature");
        return new Response(
          JSON.stringify({ error: "Invalid payment signature" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const amount = PLAN_PRICES[plan as keyof typeof PLAN_PRICES] / 100; // Convert from paise to rupees
      const startsAt = new Date();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days subscription

      // Check if subscription exists
      const { data: existingSub } = await supabase
        .from("school_subscriptions")
        .select("*")
        .eq("school_id", school_id)
        .maybeSingle();

      if (existingSub) {
        // Update existing subscription
        const newExpiresAt = existingSub.status === 'active' && new Date(existingSub.expires_at) > new Date()
          ? new Date(new Date(existingSub.expires_at).getTime() + 30 * 24 * 60 * 60 * 1000) // Extend by 30 days
          : expiresAt;

        const { error: updateError } = await supabase
          .from("school_subscriptions")
          .update({
            plan: plan,
            status: "active",
            amount: amount,
            razorpay_payment_id: razorpay_payment_id,
            starts_at: existingSub.status === 'active' ? existingSub.starts_at : startsAt.toISOString(),
            expires_at: newExpiresAt.toISOString(),
          })
          .eq("id", existingSub.id);

        if (updateError) {
          console.error("Failed to update subscription:", updateError);
          throw updateError;
        }

        // Record payment
        await supabase.from("subscription_payments").insert({
          subscription_id: existingSub.id,
          razorpay_payment_id: razorpay_payment_id,
          razorpay_order_id: razorpay_order_id,
          amount: amount,
          status: "completed",
        });
      } else {
        // Create new subscription
        const { data: newSub, error: insertError } = await supabase
          .from("school_subscriptions")
          .insert({
            school_id: school_id,
            plan: plan,
            status: "active",
            amount: amount,
            razorpay_payment_id: razorpay_payment_id,
            starts_at: startsAt.toISOString(),
            expires_at: expiresAt.toISOString(),
          })
          .select()
          .single();

        if (insertError) {
          console.error("Failed to create subscription:", insertError);
          throw insertError;
        }

        // Record payment
        await supabase.from("subscription_payments").insert({
          subscription_id: newSub.id,
          razorpay_payment_id: razorpay_payment_id,
          razorpay_order_id: razorpay_order_id,
          amount: amount,
          status: "completed",
        });
      }

      // Update school subscription_active status
      await supabase
        .from("schools")
        .update({ subscription_active: true })
        .eq("id", school_id);

      console.log("Payment verified and subscription activated");

      return new Response(
        JSON.stringify({ success: true, message: "Subscription activated successfully" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in razorpay-subscription function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
