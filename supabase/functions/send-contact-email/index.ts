import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactFormRequest {
  name: string;
  email: string;
  phone?: string;
  topic: string;
  topicLabel: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, topic, topicLabel, message }: ContactFormRequest = await req.json();

    console.log(`Received contact form submission from: ${name} (${email}) - Topic: ${topicLabel}`);

    const phoneInfo = phone ? `<p><strong>Telefon:</strong> <a href="tel:${phone}">${phone}</a></p>` : '';

    // Send email to admin
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "EM Capital <onboarding@resend.dev>",
        to: ["emcapital3@gmail.com"],
        subject: `[${topicLabel}] Nova poruka od ${name} - EM Capital`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Nova kontakt poruka</h2>
            <hr style="border: 1px solid #e5e7eb;" />
            
            <div style="background-color: #f0fdf4; padding: 10px 15px; border-radius: 8px; margin-bottom: 15px;">
              <p style="margin: 0;"><strong>📋 Tema:</strong> ${topicLabel}</p>
            </div>
            
            <p><strong>Ime:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            ${phoneInfo}
            
            <h3 style="color: #374151;">Poruka:</h3>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px;">
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
            
            <hr style="border: 1px solid #e5e7eb; margin-top: 20px;" />
            <p style="color: #6b7280; font-size: 12px;">
              Ova poruka je poslana putem kontakt forme na em-capital-forex.dynu.net
            </p>
          </div>
        `,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("Admin email sent:", emailResult);

    if (!emailResponse.ok) {
      throw new Error(emailResult.message || "Failed to send email");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error in send-contact-email function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
