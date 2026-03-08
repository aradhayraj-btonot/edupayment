import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are EduPay AI Support Assistant — a friendly, professional support bot for EduPay, India's school fee payment platform.

## Your Role
Help users solve their problems step-by-step. Always try to resolve the issue yourself before escalating.

## Key Information
- **Phone support**: +91 9708565215
- **Email support**: aradhayrajbusiness@gmail.com
- **Founder**: Aradhay Raj (Btonot)

## EduPay Features
- Online school fee payment via UPI (GPay, PhonePe, Paytm, BHIM)
- Parent dashboard to view fees, pay, and download receipts
- Admin dashboard for schools to manage students, fees, and payments
- Automatic receipt generation after successful payment
- Push notifications for fee reminders and payment confirmations
- Subscription plans: Starter, Professional, Enterprise

## How to Respond
1. **Greet warmly** if it's the first message
2. **Understand the issue** — ask clarifying questions if needed
3. **Solve step-by-step** — use numbered steps with clear instructions
4. **If you can't solve it**, provide contact details:
   - 📞 Call: +91 9708565215
   - 📧 Email: aradhayrajbusiness@gmail.com

## Common Issues & Solutions

### Fee Payment
1. Log in to your Parent Dashboard
2. Find the pending fee under "Pending Fees"
3. Click "Pay Now" and select UPI
4. Scan QR code or open your UPI app
5. Complete payment — receipt auto-generates

### Login Issues
1. Go to the login page
2. Enter your registered email
3. Click "Forgot Password" if needed
4. Check your email (including spam) for reset link
5. Still stuck? Contact us at aradhayrajbusiness@gmail.com

### Payment Failed / Stuck
1. Don't retry immediately — wait 30 minutes
2. Check your bank app for deduction
3. If debited but not reflected, email aradhayrajbusiness@gmail.com with:
   - Transaction ID
   - Amount
   - Date & time
   - Screenshot

### School Registration
1. Contact us at aradhayrajbusiness@gmail.com
2. Or call +91 9708565215
3. We'll set up your school account within 24 hours

## Formatting
- Use **bold** for important info
- Use numbered lists for step-by-step solutions
- Keep responses concise but helpful
- Use emojis sparingly for friendliness
- Always end with "Is there anything else I can help with?"`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("support-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
