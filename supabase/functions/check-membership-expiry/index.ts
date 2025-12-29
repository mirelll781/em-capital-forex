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
    console.log('Checking for expiring memberships...');
    
    const supabase = getSupabaseClient();
    
    // Get current date and dates for reminders
    const now = new Date();
    
    // 3 days from now - user reminder
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const threeDaysStart = new Date(threeDaysFromNow);
    threeDaysStart.setHours(0, 0, 0, 0);
    
    const threeDaysEnd = new Date(threeDaysFromNow);
    threeDaysEnd.setHours(23, 59, 59, 999);

    // Find memberships expiring in 3 days and notify USERS
    const { data: expiringIn3Days, error: error3Days } = await supabase
      .from('profiles')
      .select('*')
      .gte('paid_until', threeDaysStart.toISOString())
      .lte('paid_until', threeDaysEnd.toISOString());

    if (!error3Days && expiringIn3Days && expiringIn3Days.length > 0) {
      console.log(`Found ${expiringIn3Days.length} memberships expiring in 3 days`);
      
      for (const member of expiringIn3Days) {
        // Check if user has telegram notifications enabled (default true if not set)
        const telegramNotificationsEnabled = member.telegram_notifications !== false;
        
        if (member.telegram_chat_id && telegramNotificationsEnabled) {
          const typeLabel = member.membership_type === 'mentorship' ? 'Mentorship' : 'Premium Signali';
          
          const userReminderText = `⏰ *Podsjetnik: Vaša članarina ističe za 3 dana!*

🏷️ *Tip:* ${typeLabel}
📅 *Datum isteka:* ${formatDate(new Date(member.paid_until))}

Za produženje članarine, kontaktirajte nas putem @emirbcvc ili koristite opciju "📩 Pošalji Upit" u meniju.

_Hvala vam na povjerenju! 🙏_`;

          console.log(`Sending 3-day reminder to user: ${member.email}`);
          await sendMessage(member.telegram_chat_id, userReminderText);
        } else if (!telegramNotificationsEnabled) {
          console.log(`Skipping 3-day reminder for ${member.email} - notifications disabled`);
        }
      }
    }

    // Tomorrow's date - admin notification
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Set time to start and end of tomorrow
    const tomorrowStart = new Date(tomorrow);
    tomorrowStart.setHours(0, 0, 0, 0);
    
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    // Find memberships expiring tomorrow
    const { data: expiringMembers, error } = await supabase
      .from('profiles')
      .select('*')
      .gte('paid_until', tomorrowStart.toISOString())
      .lte('paid_until', tomorrowEnd.toISOString());

    if (error) {
      console.error('Error fetching expiring members:', error);
      throw error;
    }

    console.log(`Found ${expiringMembers?.length || 0} memberships expiring tomorrow`);

    if (expiringMembers && expiringMembers.length > 0) {
      for (const member of expiringMembers) {
        const typeLabel = member.membership_type === 'mentorship' ? 'Mentorship' : 'Premium Signali';
        const tgHandle = member.telegram_username ? `@${member.telegram_username}` : 'N/A';
        
        const notificationText = `⚠️ *Članarina ističe sutra!*

👤 *Email:* ${member.email}
📱 *Telegram:* ${tgHandle}
🏷️ *Tip:* ${typeLabel}
📅 *Ističe:* ${formatDate(new Date(member.paid_until))}

_Kontaktiraj korisnika za produženje članarine._`;

        console.log(`Sending expiry notification for: ${member.email}`);
        
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
      userReminders3Days: expiringIn3Days?.length || 0,
      expiringTomorrow: expiringMembers?.length || 0,
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
