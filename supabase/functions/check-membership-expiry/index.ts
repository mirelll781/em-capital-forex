import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Admin chat IDs to receive notifications
const ADMIN_CHAT_IDS = [933210834, 7173078604];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

async function sendMessage(chatId: number, text: string) {
  const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    }),
  });

  const result = await response.json();
  console.log('sendMessage result:', JSON.stringify(result, null, 2));
  return result;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('bs-BA', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (Deno.env.get("BOT_PAUSED") === "true") {
      console.log("BOT_PAUSED=true — skipping membership expiry check");
      return new Response(JSON.stringify({ success: true, paused: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('Checking for expiring memberships...');
    
    const supabase = getSupabaseClient();
    const now = new Date();
    
    // Helper function to send user reminder
    async function sendUserReminder(member: any, daysRemaining: number) {
      const telegramNotificationsEnabled = member.telegram_notifications !== false;
      
      if (member.telegram_chat_id && telegramNotificationsEnabled) {
        const typeLabel = member.membership_type === 'mentorship' ? 'Mentorship' : 'Premium Signali';
        const tgHandle = member.telegram_username ? `@${member.telegram_username}` : 'člane';
        const statusEmoji = new Date(member.paid_until) > now ? '🟢 Aktivna' : '🔴 Istekla';
        
        let urgencyText = '';
        if (daysRemaining === 1) {
          urgencyText = '⚠️ *HITNO: Ističe SUTRA!*\n\n';
        } else if (daysRemaining === 3) {
          urgencyText = '⏰ *Podsjetnik: Ističe za 3 dana!*\n\n';
        } else {
          urgencyText = '';
        }
        
        const userReminderText = `🤖 *Automatska obavijest*

${urgencyText}👋 Pozdrav ${tgHandle}, tvoja ${typeLabel} pretplata ${daysRemaining === 1 ? 'ističe sutra' : `ističe za ${daysRemaining} dana`}.

📊 *Status članarine:* ${statusEmoji}
📅 *Važi do:* ${formatDate(new Date(member.paid_until))}

Kako bi zadržao neprekidan pristup mentorstvu, signalima i podršci, preporučujemo da na vrijeme produžiš pretplatu.

📩 Za produženje ili dodatne informacije, odgovori na ovu poruku ili se javi administratoru.

_Hvala ti što si dio našeg tima 🙌_`;

        console.log(`Sending ${daysRemaining}-day reminder to user: ${member.email}`);
        await sendMessage(member.telegram_chat_id, userReminderText);
        return true;
      } else if (!telegramNotificationsEnabled) {
        console.log(`Skipping ${daysRemaining}-day reminder for ${member.email} - notifications disabled`);
      }
      return false;
    }
    
    // Helper to get date range for a specific day offset
    function getDateRange(daysFromNow: number) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + daysFromNow);
      
      const start = new Date(targetDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(targetDate);
      end.setHours(23, 59, 59, 999);
      
      return { start, end };
    }
    
    let userReminders10Days = 0;
    let userReminders3Days = 0;
    let userReminders1Day = 0;
    
    // 10 days reminder
    const range10 = getDateRange(10);
    const { data: expiring10Days, error: error10 } = await supabase
      .from('profiles')
      .select('*')
      .gte('paid_until', range10.start.toISOString())
      .lte('paid_until', range10.end.toISOString());

    if (!error10 && expiring10Days) {
      console.log(`Found ${expiring10Days.length} memberships expiring in 10 days`);
      for (const member of expiring10Days) {
        if (await sendUserReminder(member, 10)) userReminders10Days++;
      }
    }
    
    // 3 days reminder
    const range3 = getDateRange(3);
    const { data: expiring3Days, error: error3 } = await supabase
      .from('profiles')
      .select('*')
      .gte('paid_until', range3.start.toISOString())
      .lte('paid_until', range3.end.toISOString());

    if (!error3 && expiring3Days) {
      console.log(`Found ${expiring3Days.length} memberships expiring in 3 days`);
      for (const member of expiring3Days) {
        if (await sendUserReminder(member, 3)) userReminders3Days++;
      }
    }
    
    // 1 day reminder (tomorrow)
    const range1 = getDateRange(1);
    const { data: expiring1Day, error: error1 } = await supabase
      .from('profiles')
      .select('*')
      .gte('paid_until', range1.start.toISOString())
      .lte('paid_until', range1.end.toISOString());

    if (!error1 && expiring1Day) {
      console.log(`Found ${expiring1Day.length} memberships expiring tomorrow`);
      for (const member of expiring1Day) {
        if (await sendUserReminder(member, 1)) userReminders1Day++;
      }
    }

    // Send admin notifications for memberships expiring tomorrow (reuse expiring1Day data)
    if (expiring1Day && expiring1Day.length > 0) {
      for (const member of expiring1Day) {
        const typeLabel = member.membership_type === 'mentorship' ? 'Mentorship' : 'Premium Signali';
        const tgHandle = member.telegram_username ? `@${member.telegram_username}` : 'N/A';
        
        const notificationText = `⚠️ *Članarina ističe sutra!*

👤 *Email:* ${member.email}
📱 *Telegram:* ${tgHandle}
🏷️ *Tip:* ${typeLabel}
📅 *Ističe:* ${formatDate(new Date(member.paid_until))}

_Kontaktiraj korisnika za produženje članarine._`;

        console.log(`Sending admin expiry notification for: ${member.email}`);
        
        for (const adminId of ADMIN_CHAT_IDS) {
          await sendMessage(adminId, notificationText);
        }
      }
    }

    // Also check for already expired memberships (expired today)
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const { data: expiredToday, error: expiredError } = await supabase
      .from('profiles')
      .select('*')
      .gte('paid_until', todayStart.toISOString())
      .lte('paid_until', todayEnd.toISOString());

    if (!expiredError && expiredToday && expiredToday.length > 0) {
      console.log(`Found ${expiredToday.length} memberships expired today`);
      
      for (const member of expiredToday) {
        const typeLabel = member.membership_type === 'mentorship' ? 'Mentorship' : 'Premium Signali';
        const tgHandle = member.telegram_username ? `@${member.telegram_username}` : 'N/A';
        
        const notificationText = `🔴 *Članarina istekla danas!*

👤 *Email:* ${member.email}
📱 *Telegram:* ${tgHandle}
🏷️ *Tip:* ${typeLabel}
📅 *Isteklo:* ${formatDate(new Date(member.paid_until))}

_Korisnik više nema aktivnu članarinu._`;

        for (const adminId of ADMIN_CHAT_IDS) {
          await sendMessage(adminId, notificationText);
        }
      }
    }

    return new Response(JSON.stringify({ 
      ok: true, 
      userReminders10Days,
      userReminders3Days,
      userReminders1Day,
      expiringTomorrow: expiring1Day?.length || 0,
      expiredToday: expiredToday?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in check-membership-expiry:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(JSON.stringify({ ok: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
