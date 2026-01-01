import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { password, action, data } = await req.json();

    if (password !== ADMIN_PASSWORD) {
      console.log("Invalid admin password attempt");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Admin action: ${action}`);

    switch (action) {
      case "get_profiles": {
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        console.log(`Fetched ${profiles?.length || 0} profiles`);
        return new Response(
          JSON.stringify({ profiles }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_payment_stats": {
        const { data: payments, error } = await supabase
          .from("payment_history")
          .select("*")
          .order("payment_date", { ascending: false });

        if (error) throw error;

        // Calculate stats
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        
        const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
        const thisMonthRevenue = payments?.filter(p => new Date(p.payment_date) >= thisMonth)
          .reduce((sum, p) => sum + Number(p.amount), 0) || 0;
        const lastMonthRevenue = payments?.filter(p => {
          const date = new Date(p.payment_date);
          return date >= lastMonth && date < thisMonth;
        }).reduce((sum, p) => sum + Number(p.amount), 0) || 0;

        // Monthly breakdown for chart (last 6 months)
        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
          const monthName = monthStart.toLocaleDateString('bs-BA', { month: 'short', year: '2-digit' });
          
          const monthRevenue = payments?.filter(p => {
            const date = new Date(p.payment_date);
            return date >= monthStart && date <= monthEnd;
          }).reduce((sum, p) => sum + Number(p.amount), 0) || 0;

          monthlyData.push({ month: monthName, revenue: monthRevenue });
        }

        // Count by membership type
        const mentorshipCount = payments?.filter(p => p.membership_type === 'mentorship').length || 0;
        const signalsCount = payments?.filter(p => p.membership_type === 'signals').length || 0;

        return new Response(
          JSON.stringify({ 
            stats: {
              totalRevenue,
              thisMonthRevenue,
              lastMonthRevenue,
              totalPayments: payments?.length || 0,
              mentorshipCount,
              signalsCount,
              monthlyData
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "activate_membership": {
        const { user_id, membership_type, paid_at, paid_until, amount } = data;

        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            membership_type,
            paid_at,
            paid_until,
            is_blocked: false,
            blocked_at: null
          })
          .eq("user_id", user_id);

        if (profileError) throw profileError;

        const { error: paymentError } = await supabase
          .from("payment_history")
          .insert({
            user_id,
            membership_type,
            amount,
            payment_date: paid_at,
            valid_until: paid_until
          });

        if (paymentError) throw paymentError;

        console.log(`Activated membership for user: ${user_id}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "extend_membership": {
        const { user_id, membership_type, paid_until, amount } = data;

        const { error: profileError } = await supabase
          .from("profiles")
          .update({ membership_type, paid_until })
          .eq("user_id", user_id);

        if (profileError) throw profileError;

        const { error: paymentError } = await supabase
          .from("payment_history")
          .insert({
            user_id,
            membership_type,
            amount,
            payment_date: new Date().toISOString(),
            valid_until: paid_until
          });

        if (paymentError) throw paymentError;

        console.log(`Extended membership for user: ${user_id}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "block_user": {
        const { user_id } = data;

        const { error } = await supabase
          .from("profiles")
          .update({
            is_blocked: true,
            blocked_at: new Date().toISOString()
          })
          .eq("user_id", user_id);

        if (error) throw error;

        console.log(`Blocked user: ${user_id}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "unblock_user": {
        const { user_id } = data;

        const { error } = await supabase
          .from("profiles")
          .update({
            is_blocked: false,
            blocked_at: null
          })
          .eq("user_id", user_id);

        if (error) throw error;

        console.log(`Unblocked user: ${user_id}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "delete_user": {
        const { user_id } = data;

        await supabase.from("payment_history").delete().eq("user_id", user_id);
        await supabase.from("profiles").delete().eq("user_id", user_id);
        await supabase.auth.admin.deleteUser(user_id);

        console.log(`Deleted user: ${user_id}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "save_notes": {
        const { user_id, notes } = data;

        const { error } = await supabase
          .from("profiles")
          .update({ admin_notes: notes })
          .eq("user_id", user_id);

        if (error) throw error;

        console.log(`Saved notes for user: ${user_id}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "send_telegram": {
        const { telegram_chat_id, message } = data;

        if (!telegram_chat_id) {
          throw new Error("User doesn't have Telegram chat ID");
        }

        const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
        if (!botToken) throw new Error("Telegram bot token not configured");

        const response = await fetch(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: telegram_chat_id,
              text: message,
              parse_mode: "HTML"
            })
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`Telegram error: ${error.description}`);
        }

        console.log(`Sent Telegram message to chat: ${telegram_chat_id}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "send_email": {
        const { email, subject, message } = data;

        const resendApiKey = Deno.env.get("RESEND_API_KEY");
        if (!resendApiKey) throw new Error("Resend API key not configured");

        const resend = new Resend(resendApiKey);

        const { error } = await resend.emails.send({
          from: "EM Capital <onboarding@resend.dev>",
          to: [email],
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #d4af37;">EM Capital</h2>
              <div style="padding: 20px 0;">
                ${message.replace(/\n/g, '<br>')}
              </div>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #888; font-size: 12px;">
                EM Capital - Forex Trading Signals & Mentorship
              </p>
            </div>
          `
        });

        if (error) throw error;

        console.log(`Sent email to: ${email}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "send_telegram_reminder_bulk": {
        // Get all users without telegram_chat_id
        const { data: usersWithoutChatId, error: fetchError } = await supabase
          .from("profiles")
          .select("email, telegram_username")
          .is("telegram_chat_id", null);

        if (fetchError) throw fetchError;

        if (!usersWithoutChatId || usersWithoutChatId.length === 0) {
          return new Response(
            JSON.stringify({ success: true, sent: 0, message: "No users without Telegram Chat ID" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const resendApiKey = Deno.env.get("RESEND_API_KEY");
        if (!resendApiKey) throw new Error("Resend API key not configured");

        const resend = new Resend(resendApiKey);

        let sent = 0;
        let failed = 0;

        for (const user of usersWithoutChatId) {
          try {
            await resend.emails.send({
              from: "EM Capital <onboarding@resend.dev>",
              to: [user.email],
              subject: "📱 Povežite svoj Telegram za signal obavijesti!",
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a1a; color: #fff; padding: 30px; border-radius: 10px;">
                  <h2 style="color: #d4af37; margin-bottom: 20px;">📱 Povežite svoj Telegram!</h2>
                  
                  <p style="font-size: 16px; line-height: 1.6;">
                    Dragi člane,
                  </p>
                  
                  <p style="font-size: 16px; line-height: 1.6;">
                    Primijetili smo da još niste povezali svoj Telegram account s našim botom. 
                    Bez toga <strong style="color: #d4af37;">ne možete primati signal obavijesti</strong> na Telegram!
                  </p>
                  
                  <div style="background: #2a2a2a; border-left: 4px solid #d4af37; padding: 15px; margin: 25px 0; border-radius: 5px;">
                    <p style="margin: 0 0 10px 0; font-weight: bold;">Kako povezati Telegram:</p>
                    <ol style="margin: 0; padding-left: 20px;">
                      <li style="margin-bottom: 8px;">Otvorite Telegram i pronađite bota: <strong>@emcapitalforexbot</strong></li>
                      <li style="margin-bottom: 8px;">Kliknite "Start" ili pošaljite <code>/start</code></li>
                      <li style="margin-bottom: 8px;">Slijedite upute za povezivanje s vašim računom</li>
                    </ol>
                  </div>
                  
                  <a href="https://t.me/emcapitalforexbot" style="display: inline-block; background: #d4af37; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 15px 0;">
                    🤖 Otvori @emcapitalforexbot
                  </a>
                  
                  <p style="font-size: 14px; color: #888; margin-top: 25px;">
                    Ako imate bilo kakvih pitanja, slobodno nas kontaktirajte.
                  </p>
                  
                  <hr style="border: none; border-top: 1px solid #333; margin: 25px 0;">
                  <p style="color: #666; font-size: 12px;">
                    EM Capital - Forex Trading Signals & Mentorship
                  </p>
                </div>
              `
            });
            sent++;
            console.log(`Telegram reminder sent to: ${user.email}`);
          } catch (err) {
            console.error(`Failed to send to ${user.email}:`, err);
            failed++;
          }
        }

        console.log(`Bulk telegram reminder: ${sent} sent, ${failed} failed`);
        return new Response(
          JSON.stringify({ success: true, sent, failed, total: usersWithoutChatId.length }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_ea_subscriptions": {
        const { data: subscriptions, error } = await supabase
          .from("ea_robot_subscriptions")
          .select("*")
          .order("subscribed_at", { ascending: false });

        if (error) throw error;

        const verified = subscriptions?.filter(s => s.verified) || [];
        const unverified = subscriptions?.filter(s => !s.verified) || [];

        console.log(`Fetched EA subscriptions: ${verified.length} verified, ${unverified.length} unverified`);
        return new Response(
          JSON.stringify({ 
            subscriptions,
            stats: {
              total: subscriptions?.length || 0,
              verified: verified.length,
              unverified: unverified.length
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "resend_ea_verification": {
        const { email, verification_token } = data;

        if (!email || !verification_token) {
          throw new Error("Email and verification_token are required");
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const resendApiKey = Deno.env.get("RESEND_API_KEY");
        if (!resendApiKey) throw new Error("Resend API key not configured");

        const resend = new Resend(resendApiKey);
        const verificationUrl = `${supabaseUrl}/functions/v1/verify-ea-subscription?action=verify&token=${verification_token}`;

        await resend.emails.send({
          from: "EM Capital <onboarding@resend.dev>",
          to: [email],
          subject: "Potvrdi svoju prijavu za EA Robot obavijesti",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a1a; color: #fff; padding: 30px; border-radius: 10px;">
              <h2 style="color: #d4af37; margin-bottom: 20px;">🤖 Potvrdi svoju prijavu</h2>
              <p>Molimo te da potvrdis svoju email adresu klikom na gumb ispod:</p>
              <a href="${verificationUrl}" style="display: inline-block; background: #d4af37; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 15px 0;">
                ✓ Potvrdi Email
              </a>
              <p style="color: #888; font-size: 14px; margin-top: 20px;">
                Ako nisi zatražio ovu prijavu, možeš ignorirati ovaj email.
              </p>
            </div>
          `
        });

        console.log(`Resent verification email to: ${email}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "delete_ea_subscription": {
        const { id } = data;

        const { error } = await supabase
          .from("ea_robot_subscriptions")
          .delete()
          .eq("id", id);

        if (error) throw error;

        console.log(`Deleted EA subscription: ${id}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "reset_user_password": {
        const { user_id, new_password, email } = data;

        if (!user_id || !new_password) {
          return new Response(
            JSON.stringify({ error: "User ID and new password are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Update user password using admin API
        const { error } = await supabase.auth.admin.updateUserById(user_id, {
          password: new_password
        });

        if (error) throw error;

        console.log(`Password reset for user: ${email || user_id}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "send_password_reset_email": {
        const { email } = data;

        if (!email) {
          return new Response(
            JSON.stringify({ error: "Email is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Generate password reset link
        const { data: linkData, error } = await supabase.auth.admin.generateLink({
          type: 'recovery',
          email: email,
          options: {
            redirectTo: 'https://em-capital-forex.dynu.net/auth'
          }
        });

        if (error) throw error;

        // Send email with Resend
        const resendApiKey = Deno.env.get("RESEND_API_KEY");
        if (!resendApiKey) throw new Error("Resend API key not configured");

        const resend = new Resend(resendApiKey);

        await resend.emails.send({
          from: "EM Capital <onboarding@resend.dev>",
          to: [email],
          subject: "🔐 Resetujte svoju lozinku - EM Capital",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a1a; color: #fff; padding: 30px; border-radius: 10px;">
              <h2 style="color: #d4af37; margin-bottom: 20px;">🔐 Zahtjev za Reset Lozinke</h2>
              
              <p style="font-size: 16px; line-height: 1.6;">
                Primili smo zahtjev za resetovanje vaše lozinke na EM Capital platformi.
              </p>
              
              <a href="${linkData?.properties?.action_link}" style="display: inline-block; background: #d4af37; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">
                🔑 Resetuj Lozinku
              </a>
              
              <p style="font-size: 14px; color: #888; margin-top: 20px;">
                Ovaj link vrijedi 24 sata. Ako niste zatražili reset lozinke, možete ignorirati ovaj email.
              </p>
              
              <hr style="border: none; border-top: 1px solid #333; margin: 25px 0;">
              <p style="color: #666; font-size: 12px;">
                EM Capital - Forex Trading Signals & Mentorship
              </p>
            </div>
          `
        });

        console.log(`Password reset email sent to: ${email}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "link_telegram_chat_id": {
        const { user_id, telegram_chat_id } = data;

        if (!user_id || !telegram_chat_id) {
          return new Response(
            JSON.stringify({ error: "User ID and Telegram Chat ID are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Validate chat_id is a number
        const chatIdNumber = parseInt(telegram_chat_id, 10);
        if (isNaN(chatIdNumber)) {
          return new Response(
            JSON.stringify({ error: "Telegram Chat ID must be a number" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: updateError } = await supabase
          .from("profiles")
          .update({ telegram_chat_id: chatIdNumber })
          .eq("user_id", user_id);

        if (updateError) throw updateError;

        console.log(`Linked Telegram Chat ID ${chatIdNumber} to user: ${user_id}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "update_telegram_username": {
        const { user_id, telegram_username } = data;

        if (!user_id) {
          return new Response(
            JSON.stringify({ error: "User ID is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Clean up username - remove @ if present
        const cleanUsername = telegram_username ? telegram_username.replace(/^@/, '').trim() : null;

        const { error: updateError } = await supabase
          .from("profiles")
          .update({ telegram_username: cleanUsername || null })
          .eq("user_id", user_id);

        if (updateError) throw updateError;

        console.log(`Updated Telegram username to "${cleanUsername}" for user: ${user_id}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "edit_paid_until": {
        const { user_id, paid_until } = data;

        if (!user_id || !paid_until) {
          return new Response(
            JSON.stringify({ error: "User ID and paid_until date are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: updateError } = await supabase
          .from("profiles")
          .update({ paid_until })
          .eq("user_id", user_id);

        if (updateError) throw updateError;

        console.log(`Updated paid_until to "${paid_until}" for user: ${user_id}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "send_membership_reminder": {
        const { user_id, telegram_chat_id, telegram_username, membership_type, paid_until, user_email } = data;

        if (!telegram_chat_id) {
          return new Response(
            JSON.stringify({ error: "Korisnik nema povezan Telegram" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
        if (!botToken) throw new Error("Telegram bot token not configured");

        const typeLabel = membership_type === 'mentorship' ? 'Mentorship' : 'Premium Signali';
        const tgHandle = telegram_username ? `@${telegram_username}` : 'člane';
        const paidUntilDate = new Date(paid_until);
        const now = new Date();
        const statusEmoji = paidUntilDate > now ? '🟢 Aktivna' : '🔴 Istekla';
        const formattedDate = paidUntilDate.toLocaleDateString('bs-BA', { day: '2-digit', month: '2-digit', year: 'numeric' });

        const reminderText = `🤖 *Automatska obavijest*

👋 Pozdrav ${tgHandle}, tvoja ${typeLabel} pretplata uskoro ističe.

📊 *Status članarine:* ${statusEmoji}
📅 *Važi do:* ${formattedDate}

Kako bi zadržao neprekidan pristup mentorstvu, signalima i podršci, preporučujemo da na vrijeme produžiš pretplatu.

📩 Za produženje ili dodatne informacije, odgovori na ovu poruku ili se javi administratoru.

_Hvala ti što si dio našeg tima 🙌_`;

        // Send reminder to user
        const response = await fetch(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: telegram_chat_id,
              text: reminderText,
              parse_mode: "Markdown"
            })
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`Telegram error: ${error.description}`);
        }

        // Send confirmation to admin(s)
        const ADMIN_CHAT_IDS = [933210834, 7173078604];
        const adminNotification = `✅ *Podsjetnik poslan!*

👤 *Korisnik:* ${user_email || 'N/A'}
📱 *Telegram:* ${tgHandle}
🏷️ *Tip:* ${typeLabel}
📅 *Ističe:* ${formattedDate}

_Ručno poslan podsjetnik za članarinu._`;

        for (const adminId of ADMIN_CHAT_IDS) {
          try {
            await fetch(
              `https://api.telegram.org/bot${botToken}/sendMessage`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: adminId,
                  text: adminNotification,
                  parse_mode: "Markdown"
                })
              }
            );
          } catch (err) {
            console.error(`Failed to notify admin ${adminId}:`, err);
          }
        }

        console.log(`Sent membership reminder to user: ${user_id}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error: unknown) {
    console.error("Admin API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});