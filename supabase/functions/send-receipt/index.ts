import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

function normalizeFrom(raw: string | null | undefined) {
  const fallback = "Btonot <onboarding@resend.dev>";
  const v = (raw ?? "").trim();
  if (!v) return fallback;

  // Valid formats per Resend: email@example.com OR Name <email@example.com>
  const emailOnly = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const nameEmail = /^.+<[^\s@]+@[^\s@]+\.[^\s@]+>$/;

  if (emailOnly.test(v) || nameEmail.test(v)) return v;

  console.log(`Invalid RESEND_FROM value "${v}", using fallback: ${fallback}`);
  return fallback;
}

const RESEND_FROM = normalizeFrom(Deno.env.get("RESEND_FROM"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReceiptRequest {
  payment_id: string;
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    console.log(`Attempting to send email to ${to} from ${RESEND_FROM}`);
    
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [to],
        subject,
        html,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error(`Failed to send email to ${to}:`, error);
      return false;
    }
    
    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    return false;
  }
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

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Verify the user is an admin
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      throw new Error("Only admins can send receipts");
    }

    const { payment_id }: ReceiptRequest = await req.json();

    if (!payment_id) {
      throw new Error("Missing required field: payment_id");
    }

    console.log(`Processing receipt for payment: ${payment_id}`);

    // Get payment details with student and fee info
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select(`
        id,
        amount,
        payment_method,
        payment_date,
        transaction_id,
        status,
        students (
          id,
          first_name,
          last_name,
          parent_email,
          class,
          section,
          school_id
        ),
        student_fees (
          id,
          due_date,
          fee_structures (
            name,
            fee_type
          )
        )
      `)
      .eq("id", payment_id)
      .single();

    if (paymentError || !payment) {
      console.error("Error fetching payment:", paymentError);
      throw new Error("Payment not found");
    }

    console.log("Payment data:", JSON.stringify(payment, null, 2));

    const student = payment.students as any;
    const studentFee = payment.student_fees as any;
    const feeStructure = studentFee?.fee_structures;

    if (!student?.parent_email) {
      console.log("No parent email found for student");
      return new Response(
        JSON.stringify({ success: false, message: "No parent email found" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get school info
    const { data: school } = await supabase
      .from("schools")
      .select("name, address, phone, email")
      .eq("id", student.school_id)
      .single();

    const schoolName = school?.name || "School";
    const studentName = `${student.first_name} ${student.last_name}`;
    const studentClass = student.section ? `${student.class} - ${student.section}` : student.class;
    const feeName = feeStructure?.name || "Fee Payment";
    const paymentDate = new Date(payment.payment_date || new Date()).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">✅ Payment Receipt</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">
            ${schoolName}
          </p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="margin: 0 0 20px 0; color: #666;">
            Dear Parent,
          </p>
          
          <p style="margin: 0 0 20px 0;">
            Your payment has been <strong style="color: #10b981;">verified and confirmed</strong>. Below are the details of your transaction:
          </p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 40%;">Student Name:</td>
                <td style="padding: 8px 0; font-weight: 600;">${studentName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Class:</td>
                <td style="padding: 8px 0; font-weight: 600;">${studentClass}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Fee Type:</td>
                <td style="padding: 8px 0; font-weight: 600;">${feeName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Amount Paid:</td>
                <td style="padding: 8px 0; font-weight: 600; color: #10b981; font-size: 18px;">₹${Number(payment.amount).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Payment Method:</td>
                <td style="padding: 8px 0; font-weight: 600;">${payment.payment_method}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Payment Date:</td>
                <td style="padding: 8px 0; font-weight: 600;">${paymentDate}</td>
              </tr>
              ${payment.transaction_id ? `
              <tr>
                <td style="padding: 8px 0; color: #666;">Transaction ID:</td>
                <td style="padding: 8px 0; font-weight: 600; font-family: monospace;">${payment.transaction_id}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #666;">Receipt ID:</td>
                <td style="padding: 8px 0; font-weight: 600; font-family: monospace; font-size: 12px;">${payment.id}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 20px;">
            <p style="margin: 0; color: #065f46; font-weight: 500;">
              ✓ This receipt confirms that your payment has been successfully processed and verified.
            </p>
          </div>
          
          <p style="margin: 0; color: #666;">
            Thank you for your timely payment. If you have any questions, please contact the school administration.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="margin: 0; color: #999; font-size: 12px;">
            This is an automated receipt from ${schoolName}. 
            Please keep this email for your records.
          </p>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
          ${school?.address ? `<p style="margin: 0 0 5px 0; color: #666; font-size: 12px;">${school.address}</p>` : ''}
          ${school?.phone ? `<p style="margin: 0 0 5px 0; color: #666; font-size: 12px;">Phone: ${school.phone}</p>` : ''}
          ${school?.email ? `<p style="margin: 0 0 10px 0; color: #666; font-size: 12px;">Email: ${school.email}</p>` : ''}
          <p style="margin: 0; color: #999; font-size: 11px;">
            Powered by EduPay
          </p>
        </div>
      </body>
      </html>
    `;

    const emailSent = await sendEmail(
      student.parent_email,
      `✅ Payment Receipt - ${feeName} for ${studentName}`,
      html
    );

    console.log(`Receipt email sent: ${emailSent}`);

    return new Response(
      JSON.stringify({
        success: true,
        email_sent: emailSent,
        parent_email: student.parent_email,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-receipt function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
