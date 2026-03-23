import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  telegramUsername: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, telegramUsername }: WelcomeEmailRequest = await req.json();

    console.log(`Sending welcome email to: ${email} (Telegram: @${telegramUsername})`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "EM Capital <onboarding@resend.dev>",
        to: [email],
        subject: "Dobrodošli u EM Capital! 🎉",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: #0f172a; padding: 30px; border-radius: 16px; color: #ffffff;">
              
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #fbbf24; margin: 0; font-size: 28px;">EM Capital</h1>
                <p style="color: #94a3b8; margin: 10px 0 0;">Trading Mentorship & Signals</p>
              </div>
              
              <!-- Welcome Message -->
              <div style="background-color: #1e293b; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
                <h2 style="color: #22c55e; margin: 0 0 15px; font-size: 22px;">✅ Registracija uspješna!</h2>
                <p style="color: #e2e8f0; margin: 0; line-height: 1.6;">
                  Hvala vam što ste se registrovali na EM Capital platformu. 
                  Vaš račun je uspješno kreiran!
                </p>
              </div>
              
              <!-- Account Info -->
              <div style="background-color: #1e293b; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
                <h3 style="color: #fbbf24; margin: 0 0 15px; font-size: 16px;">📋 Vaši podaci:</h3>
                <p style="color: #e2e8f0; margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                <p style="color: #e2e8f0; margin: 5px 0;"><strong>Telegram:</strong> @${telegramUsername}</p>
              </div>
              
              <!-- Next Steps -->
              <div style="background-color: #1e293b; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
                <h3 style="color: #fbbf24; margin: 0 0 15px; font-size: 16px;">🚀 Sljedeći koraci:</h3>
                <ol style="color: #e2e8f0; margin: 0; padding-left: 20px; line-height: 1.8;">
                  <li>Kontaktirajte <strong>@EMforexadmin</strong> na Telegramu za informacije o plaćanju</li>
                  <li>Odaberite paket: <strong>Mentorship</strong> (200€/mj) ili <strong>Premium Signali</strong> (49€/mj)</li>
                  <li>Nakon uplate, admin aktivira vašu članarinu</li>
                  <li>Dobijate pristup grupi i ekskluzivnom sadržaju</li>
                </ol>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 25px;">
                <a href="https://t.me/emcapitalforexbot" 
                   style="display: inline-block; background-color: #0088cc; color: #ffffff; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                  🤖 Otvori Telegram Bota
                </a>
              </div>
              
              <!-- Contact -->
              <div style="background-color: #1e293b; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <h3 style="color: #fbbf24; margin: 0 0 10px; font-size: 16px;">📞 Kontakt:</h3>
                <p style="color: #e2e8f0; margin: 5px 0;">Telegram: <a href="https://t.me/EMforexadmin" style="color: #60a5fa;">@EMforexadmin</a></p>
                <p style="color: #e2e8f0; margin: 5px 0;">Email: <a href="mailto:emcapital3@gmail.com" style="color: #60a5fa;">emcapital3@gmail.com</a></p>
                <p style="color: #e2e8f0; margin: 5px 0;">Web: <a href="https://em-capital-forex.dynu.net" style="color: #60a5fa;">em-capital-forex.dynu.net</a></p>
              </div>
              
              <!-- Footer -->
              <div style="text-align: center; padding-top: 20px; border-top: 1px solid #334155;">
                <p style="color: #64748b; margin: 0; font-size: 12px;">
                  © 2024 EM Capital. Sva prava zadržana.
                </p>
                <p style="color: #64748b; margin: 10px 0 0; font-size: 12px;">
                  Ova poruka je poslata jer ste se registrovali na em-capital-forex.dynu.net
                </p>
              </div>
              
            </div>
          </body>
          </html>
        `,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("Welcome email sent:", emailResult);

    if (!emailResponse.ok) {
      throw new Error(emailResult.message || "Failed to send welcome email");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error in send-welcome-email function:", error);
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
