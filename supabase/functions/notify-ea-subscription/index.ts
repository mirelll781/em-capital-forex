import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const ADMIN_CHAT_IDS = [933210834, 7173078604]; // @EMforexadmin and @emirbcvc

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscriptionRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: SubscriptionRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`New EA robot subscription: ${email}`);

    // Send Telegram notification to admins
    const message = `🤖 *Nova EA Robot Pretplata!*\n\n📧 Email: \`${email}\`\n📅 Vrijeme: ${new Date().toLocaleString("hr-HR", { timeZone: "Europe/Zagreb" })}`;

    for (const chatId of ADMIN_CHAT_IDS) {
      try {
        const telegramResponse = await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: message,
              parse_mode: "Markdown",
            }),
          }
        );

        if (!telegramResponse.ok) {
          const errorText = await telegramResponse.text();
          console.error(`Failed to send Telegram notification to ${chatId}:`, errorText);
        } else {
          console.log(`Notification sent to admin ${chatId}`);
        }
      } catch (error) {
        console.error(`Error sending to ${chatId}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in notify-ea-subscription:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
