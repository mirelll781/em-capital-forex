import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const token = url.searchParams.get("token");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle verification callback (GET request with token)
    if (req.method === "GET" && action === "verify" && token) {
      console.log(`Verifying token: ${token}`);

      const { data: subscription, error: fetchError } = await supabase
        .from("ea_robot_subscriptions")
        .select("*")
        .eq("verification_token", token)
        .maybeSingle();

      if (fetchError || !subscription) {
        console.error("Token not found:", fetchError);
        // Redirect to error page or show error
        return new Response(
          `<!DOCTYPE html>
          <html>
          <head>
            <title>Greška</title>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #1a1a1a; color: #fff; }
              .container { text-align: center; padding: 40px; background: #2a2a2a; border-radius: 16px; max-width: 400px; }
              h1 { color: #ef4444; }
              a { color: #f59e0b; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>❌ Neispravan Link</h1>
              <p>Verifikacijski link nije validan ili je istekao.</p>
              <p><a href="https://em-capital-forex.lovable.app">← Povratak na stranicu</a></p>
            </div>
          </body>
          </html>`,
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
          }
        );
      }

      if (subscription.verified) {
        console.log("Already verified:", subscription.email);
        return new Response(
          `<!DOCTYPE html>
          <html>
          <head>
            <title>Već Verificirano</title>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #1a1a1a; color: #fff; }
              .container { text-align: center; padding: 40px; background: #2a2a2a; border-radius: 16px; max-width: 400px; }
              h1 { color: #22c55e; }
              a { color: #f59e0b; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>✓ Već Verificirano</h1>
              <p>Vaš email je već verificiran. Obavijestit ćemo vas kada EA roboti budu dostupni.</p>
              <p><a href="https://em-capital-forex.lovable.app">← Povratak na stranicu</a></p>
            </div>
          </body>
          </html>`,
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
          }
        );
      }

      // Update subscription as verified
      const { error: updateError } = await supabase
        .from("ea_robot_subscriptions")
        .update({
          verified: true,
          verified_at: new Date().toISOString(),
        })
        .eq("verification_token", token);

      if (updateError) {
        console.error("Error updating subscription:", updateError);
        throw updateError;
      }

      console.log("Successfully verified:", subscription.email);

      return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>Uspješna Verifikacija</title>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #1a1a1a; color: #fff; }
            .container { text-align: center; padding: 40px; background: #2a2a2a; border-radius: 16px; max-width: 400px; }
            h1 { color: #22c55e; }
            .icon { font-size: 64px; margin-bottom: 20px; }
            a { color: #f59e0b; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">🎉</div>
            <h1>Email Verificiran!</h1>
            <p>Hvala! Uspješno ste se prijavili za obavijesti o EA robotima.</p>
            <p>Obavijestit ćemo vas čim budu dostupni.</p>
            <p style="margin-top: 30px;"><a href="https://em-capital-forex.lovable.app">← Povratak na stranicu</a></p>
          </div>
        </body>
        </html>`,
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    // Handle sending verification email (POST request)
    if (req.method === "POST") {
      const { email, verification_token } = await req.json();

      if (!email || !verification_token) {
        return new Response(
          JSON.stringify({ error: "Email and verification_token are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Sending verification email to: ${email}`);

      const verificationUrl = `${supabaseUrl}/functions/v1/verify-ea-subscription?action=verify&token=${verification_token}`;

      const emailResponse = await resend.emails.send({
        from: "Obsidian <onboarding@resend.dev>",
        to: [email],
        subject: "Potvrdi svoju prijavu za EA Robot obavijesti",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #1a1a1a;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a;">
              <tr>
                <td style="padding: 40px 20px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #2a2a2a; border-radius: 16px; overflow: hidden;">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 30px; text-align: center; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                        <h1 style="margin: 0; color: #000; font-size: 24px; font-weight: bold;">🤖 Obsidian EA Roboti</h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="color: #ffffff; margin: 0 0 20px 0; font-size: 22px;">Potvrdi svoju prijavu</h2>
                        
                        <p style="color: #a3a3a3; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                          Hvala što si se prijavio za obavijesti o našim EA robotima! 
                        </p>
                        
                        <p style="color: #a3a3a3; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                          Molimo te da potvrdis svoju email adresu klikom na gumb ispod:
                        </p>
                        
                        <!-- CTA Button -->
                        <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                          <tr>
                            <td style="border-radius: 8px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                              <a href="${verificationUrl}" target="_blank" style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: bold; color: #000000; text-decoration: none;">
                                ✓ Potvrdi Email
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="color: #737373; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                          Ako nisi zatražio ovu prijavu, možeš ignorirati ovaj email.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 20px 30px; background-color: #232323; text-align: center;">
                        <p style="color: #737373; font-size: 12px; margin: 0;">
                          © 2024 Obsidian. Sva prava zadržana.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      });

      console.log("Verification email sent:", emailResponse);

      return new Response(
        JSON.stringify({ success: true, message: "Verification email sent" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid request" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in verify-ea-subscription:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
