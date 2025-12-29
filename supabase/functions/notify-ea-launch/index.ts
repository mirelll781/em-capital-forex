import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const REGULAR_PRICE = 1000;
const DISCOUNT_PRICE = 800;

const generateEmailHtml = (discountEndDate: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EA Roboti su Dostupni!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td align="center" style="padding-bottom: 30px;">
        <h1 style="color: #d4af37; font-size: 32px; margin: 0;">🤖 EA Roboti su Konačno Dostupni!</h1>
      </td>
    </tr>
    <tr>
      <td style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05)); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 16px; padding: 30px;">
        <p style="font-size: 18px; line-height: 1.6; margin: 0 0 20px;">
          Pozdrav! 👋
        </p>
        <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
          Uzbudljive vijesti! Naši <strong>EA Roboti</strong> su konačno spremni i možete ih nabaviti već danas.
        </p>
        
        <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(212, 175, 55, 0.1); border-radius: 12px; padding: 20px; margin: 20px 0;">
          <tr>
            <td align="center">
              <p style="color: #22c55e; font-weight: bold; font-size: 14px; margin: 0 0 10px;">🎁 SPECIJALNA PONUDA - PRVA 3 DANA</p>
              <p style="margin: 0;">
                <span style="color: #888; text-decoration: line-through; font-size: 24px;">$${REGULAR_PRICE}</span>
                <span style="color: #d4af37; font-size: 36px; font-weight: bold; margin-left: 10px;">$${DISCOUNT_PRICE}</span>
              </p>
              <p style="color: #888; font-size: 14px; margin: 10px 0 0;">Popust vrijedi do: ${discountEndDate}</p>
            </td>
          </tr>
        </table>

        <p style="font-size: 16px; line-height: 1.6; margin: 20px 0;">
          <strong>Što dobivate:</strong>
        </p>
        <ul style="font-size: 15px; line-height: 1.8; margin: 0 0 20px; padding-left: 20px;">
          <li>✅ Mobile EA za Android & iOS</li>
          <li>✅ Desktop EA za MetaTrader</li>
          <li>✅ Doživotne nadogradnje</li>
          <li>✅ Premium podrška</li>
        </ul>

        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <a href="https://mirelfx.com/#ea-robots" style="display: inline-block; background: linear-gradient(135deg, #d4af37, #b8960c); color: #000; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 18px;">
                Kupi Sada - $${DISCOUNT_PRICE}
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding-top: 30px;">
        <p style="color: #666; font-size: 14px; margin: 0;">
          Mirel FX Trading | Automatizirano trgovanje
        </p>
        <p style="color: #444; font-size: 12px; margin: 10px 0 0;">
          Primili ste ovaj email jer ste se prijavili za obavijesti o EA robotima.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const handler = async (req: Request): Promise<Response> => {
  console.log("notify-ea-launch function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all subscribers who haven't been notified yet
    const { data: subscribers, error: fetchError } = await supabase
      .from("ea_robot_subscriptions")
      .select("id, email")
      .eq("notified", false);

    if (fetchError) {
      console.error("Error fetching subscribers:", fetchError);
      throw fetchError;
    }

    if (!subscribers || subscribers.length === 0) {
      console.log("No subscribers to notify");
      return new Response(
        JSON.stringify({ message: "No subscribers to notify", count: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${subscribers.length} subscribers to notify`);

    // Calculate discount end date (3 days from launch)
    const launchDate = new Date("2026-01-01T00:00:00");
    const discountEndDate = new Date(launchDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    const discountEndFormatted = discountEndDate.toLocaleDateString("hr-HR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const emailHtml = generateEmailHtml(discountEndFormatted);
    
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    // Send emails in batches of 10
    const batchSize = 10;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      const emailPromises = batch.map(async (subscriber) => {
        try {
          const { error: emailError } = await resend.emails.send({
            from: "Mirel FX <noreply@mirelfx.com>",
            to: [subscriber.email],
            subject: "🤖 EA Roboti su Dostupni! Specijalna Ponuda -20%",
            html: emailHtml,
          });

          if (emailError) {
            console.error(`Failed to send email to ${subscriber.email}:`, emailError);
            errors.push(`${subscriber.email}: ${emailError.message}`);
            failCount++;
            return;
          }

          // Mark as notified
          const { error: updateError } = await supabase
            .from("ea_robot_subscriptions")
            .update({ notified: true })
            .eq("id", subscriber.id);

          if (updateError) {
            console.error(`Failed to update notified status for ${subscriber.email}:`, updateError);
          }

          successCount++;
          console.log(`Email sent successfully to ${subscriber.email}`);
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          console.error(`Error sending to ${subscriber.email}:`, err);
          errors.push(`${subscriber.email}: ${errorMessage}`);
          failCount++;
        }
      });

      await Promise.all(emailPromises);
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Notification complete: ${successCount} sent, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        message: "EA launch notifications sent",
        success: successCount,
        failed: failCount,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in notify-ea-launch function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
