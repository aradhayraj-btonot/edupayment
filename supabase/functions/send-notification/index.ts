import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM = Deno.env.get("RESEND_FROM") || "EduPay <onboarding@resend.dev>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  school_id: string;
  title: string;
  message: string;
  type?: string;
}

async function sendEmail(to: string, subject: string, html: string, from: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
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
    
    console.log(`Email sent to ${to}`);
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
      throw new Error("Only admins can send notifications");
    }

    const { school_id, title, message, type = "info" }: NotificationRequest = await req.json();

    if (!school_id || !title || !message) {
      throw new Error("Missing required fields: school_id, title, message");
    }

    // 1. Save notification to database
    const { data: notification, error: notifError } = await supabase
      .from("notifications")
      .insert({
        school_id,
        title,
        message,
        type,
        created_by: user.id,
      })
      .select()
      .single();

    if (notifError) {
      console.error("Error saving notification:", notifError);
      throw notifError;
    }

    console.log("Notification saved:", notification.id);

    // 2. Get all students from this school with linked parents
    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select(`
        id,
        first_name,
        last_name,
        parent_id,
        parent_email
      `)
      .eq("school_id", school_id)
      .not("parent_id", "is", null);

    if (studentsError) {
      console.error("Error fetching students:", studentsError);
      throw studentsError;
    }

    console.log(`Found ${students?.length || 0} students with linked parents`);

    // 3. Get unique parent emails
    const parentEmails = new Set<string>();
    const parentStudentMap = new Map<string, string[]>();

    for (const student of students || []) {
      if (student.parent_email) {
        parentEmails.add(student.parent_email);
        const studentName = `${student.first_name} ${student.last_name}`;
        if (!parentStudentMap.has(student.parent_email)) {
          parentStudentMap.set(student.parent_email, []);
        }
        parentStudentMap.get(student.parent_email)!.push(studentName);
      }
    }

    console.log(`Sending emails to ${parentEmails.size} unique parents`);

    // 4. Get school name
    const { data: school } = await supabase
      .from("schools")
      .select("name")
      .eq("id", school_id)
      .single();

    // 5. Send email to each parent
    const emailPromises = Array.from(parentEmails).map(async (email) => {
      const childrenNames = parentStudentMap.get(email)?.join(", ") || "your child";
      const schoolName = school?.name || "School";
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📢 ${title}</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">
              From ${schoolName}
            </p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="margin: 0 0 20px 0; color: #666;">
              Dear Parent of <strong>${childrenNames}</strong>,
            </p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
              <p style="margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="margin: 0; color: #999; font-size: 12px;">
              This is an automated notification from ${schoolName}. 
              Please log in to the parent portal for more details.
            </p>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
            <p style="margin: 0; color: #666; font-size: 12px;">
              Powered by EduPay
            </p>
          </div>
        </body>
        </html>
      `;

      const success = await sendEmail(
        email,
        `📢 ${title}`,
        html,
        RESEND_FROM
      );
      
      return { email, success };
    });

    const emailResults = await Promise.all(emailPromises);
    const successCount = emailResults.filter(r => r.success).length;

    console.log(`Successfully sent ${successCount}/${parentEmails.size} emails`);

    return new Response(
      JSON.stringify({
        success: true,
        notification_id: notification.id,
        emails_sent: successCount,
        total_parents: parentEmails.size,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-notification function:", error);
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
