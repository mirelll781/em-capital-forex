import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Admin chat IDs to receive notifications
const ADMIN_CHAT_IDS = [933210834, 7173078604]; // @EMforexadmin and @emirbcvc

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Store users waiting to send inquiry (in-memory, resets on function restart)
const usersWaitingForInquiry = new Map<number, { firstName: string; username?: string }>();

// Escape special Markdown characters to prevent parsing errors
function escapeMarkdown(text: string): string {
  if (!text) return '';
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

// Main menu keyboard (for regular users)
const mainMenuKeyboard = {
  inline_keyboard: [
    [
      { text: '🟢 Mentorship', callback_data: 'mentorship' },
      { text: '🔵 Premium Signali', callback_data: 'signals' }
    ],
    [
      { text: '🔗 Pristupi Grupi', url: 'https://t.me/+H86SSZlp-lU2M2Uy' }
    ],
    [
      { text: '📊 Moj Status', callback_data: 'my_status' },
      { text: '📩 Pošalji Upit', callback_data: 'send_inquiry' }
    ],
    [
      { text: '📞 Kontakt', callback_data: 'contact' },
      { text: 'ℹ️ Pomoć', callback_data: 'help' }
    ]
  ]
};

// Get menu keyboard with admin button if user is admin
function getMenuKeyboard(chatId: number) {
  const keyboard = {
    inline_keyboard: [
      [
        { text: '🟢 Mentorship', callback_data: 'mentorship' },
        { text: '🔵 Premium Signali', callback_data: 'signals' }
      ],
      [
        { text: '🔗 Pristupi Grupi', url: 'https://t.me/+H86SSZlp-lU2M2Uy' }
      ],
      [
        { text: '📊 Moj Status', callback_data: 'my_status' },
        { text: '📩 Pošalji Upit', callback_data: 'send_inquiry' }
      ],
      [
        { text: '📞 Kontakt', callback_data: 'contact' },
        { text: 'ℹ️ Pomoć', callback_data: 'help' }
      ]
    ]
  };
  
  // Add admin button for admins
  if (ADMIN_CHAT_IDS.includes(chatId)) {
    keyboard.inline_keyboard.push([
      { text: '👑 Admin Panel', callback_data: 'admin_menu' }
    ]);
  }
  
  return keyboard;
}

// Admin menu keyboard
const adminMenuKeyboard = {
  inline_keyboard: [
    [
      { text: '📝 Aktiviraj članarinu', callback_data: 'admin_platio_help' },
      { text: '🔄 Produži članarinu', callback_data: 'admin_produzi_help' }
    ],
    [
      { text: '📊 Status korisnika', callback_data: 'admin_status_help' },
      { text: '👥 Lista članova', callback_data: 'admin_clanovi' }
    ],
    [
      { text: '📢 Poruka članovima', callback_data: 'admin_poruka_help' },
      { text: '📣 Post u grupu', callback_data: 'admin_grupapost_help' }
    ],
    [
      { text: '📈 Dodaj signal', callback_data: 'admin_signal_help' },
      { text: '📊 Statistika signala', callback_data: 'admin_signali' }
    ],
    [
      { text: '📱 Telegram Status', callback_data: 'admin_telegram_status' }
    ],
    [
      { text: '🤖 EA Lansiranje', callback_data: 'admin_ealansiranje' }
    ],
    [
      { text: '⬅️ Nazad', callback_data: 'back_to_menu' }
    ]
  ]
};

// Welcome message for new group members
const getGroupWelcomeMessage = (firstName: string) => `🎉 *Dobrodošli u EM Capital, ${firstName}!*

Drago nam je što ste se pridružili našoj trading zajednici!

🤖 *Za pristup svim opcijama* (provjera statusa, upit, itd.) kliknite na dugme ispod i pokrenite privatni chat sa botom.

👇 *Kliknite "Otvori Bota":*`;

// Keyboard for group welcome - link to bot
const groupWelcomeKeyboard = {
  inline_keyboard: [
    [
      { text: '🤖 Otvori Bota', url: 'https://t.me/emcapitalforexbot?start=welcome' }
    ],
    [
      { text: '🟢 Mentorship Info', callback_data: 'mentorship' },
      { text: '🔵 Premium Signali', callback_data: 'signals' }
    ],
    [
      { text: '📞 Kontakt', callback_data: 'contact' }
    ]
  ]
};

// Welcome message for private chat
const getPrivateWelcomeMessage = (firstName: string) => `🎯 *Dobrodošli u EM Capital, ${firstName}!*

EM Capital je trading mentorship i signal servis namijenjen početnicima koji žele naučiti kako pravilno upravljati rizikom.

👇 *Odaberite uslugu:*`;

// Response messages for each button
const responses: Record<string, string> = {
  mentorship: `🟢 *Beginner Trading Mentorship*

💰 *200 € / mjesečno* (3-mjesečni program)

Strukturisan mentorship program namijenjen potpunim početnicima i onima koji žele izgraditi stabilne osnove tradinga.

✅ *Program uključuje:*
• Jasan plan učenja (od osnova do samostalnog tradinga)
• Jednostavnu trading strategiju (bez preopterećenja)
• Upravljanje rizikom (0.5–1.5% po trejdu)
• Psihologiju tradinga za početnike
• Analizu tvojih trejdova
• Premium signale kao edukativnu podršku
• Sedmični Zoom pozivi (live analize i Q&A)
• Direktnu komunikaciju i podršku

❌ *Program NIJE za:*
• one koji traže brzu zaradu
• one koji ne poštuju stop loss
• one koji nisu spremni učiti

💳 *Uplata:* [Klikni ovdje za Revolut](https://revolut.me/emiir_bcvc)
👉 Za prijavu kontaktiraj: @EMforexadmin ili @emirbcvc`,

  signals: `🔵 *Premium Trade Setupi*

💰 *49 € / mjesečno*

Premium trade setupi za one koji žele jasne i strukturirane trade ideje, uz striktan risk management.

✅ *Šta dobijaš:*
• Intraday i scalp setupi
• Jasno definisan entry, SL i TP
• Fokus na kvalitet, ne kvantitet
• Bez dnevnog limita, bez prekomjernog trejdanja

⚠️ Signali nisu finansijski savjet i ne garantuju profit.

💳 *Uplata:* [Klikni ovdje za Revolut](https://revolut.me/emiir_bcvc)
👉 Za pristup kontaktiraj: @EMforexadmin ili @emirbcvc`,

  contact: `📞 *Kontakt*

Za sva pitanja možete nas kontaktirati:

👤 *Admin:* @EMforexadmin
👤 *Telegram:* @emirbcvc
📧 *Email:* emcapital3@gmail.com
📸 *Instagram:* [emiir.bcvc](https://www.instagram.com/emiir.bcvc) | [mirel.sinanovic](https://www.instagram.com/mirel.sinanovic)
🌐 *Web:* em-capital-forex.dynu.net

Odgovaramo u roku 24 sata!`,

  send_inquiry: `📩 *Pošaljite upit*

Napišite vašu poruku i mi ćemo vam odgovoriti u najkraćem mogućem roku.

✍️ *Samo napišite vašu poruku ispod i pošaljite je:*`,

  // Admin help messages
  admin_platio_help: `📝 *Aktivacija članarine*

Korištenje:
\`/platio @username mentorship\`
\`/platio @username signals\`
\`/platio email@example.com mentorship 15.12.2024\`

*Parametri:*
• \`@username\` ili \`email\` - identifikacija korisnika
• \`mentorship\` ili \`signals\` - tip članarine
• Datum (opciono) - DD.MM.YYYY format

_Mentorship = 3 mjeseca, Signals = 1 mjesec_`,

  admin_produzi_help: `🔄 *Produženje članarine*

Korištenje:
\`/produzi @username\`
\`/produzi @username 15.12.2024\`
\`/produzi email@example.com\`

*Parametri:*
• \`@username\` ili \`email\` - identifikacija korisnika
• Datum (opciono) - od kojeg datuma produžiti

_Produžuje za još jedan period (3mj mentorship, 1mj signals)_`,

  admin_status_help: `📊 *Provjera statusa korisnika*

Korištenje:
\`/status @username\`
\`/status email@example.com\`

Prikazuje sve informacije o korisniku uključujući:
• Email i Telegram
• Tip članarine
• Datum uplate i isteka
• Status (aktivan/istekao)`,

  admin_poruka_help: `📢 *Poruka aktivnim članovima*

Korištenje:
\`/poruka Vaša poruka ovdje\`

Šalje privatnu poruku svim aktivnim članovima koji imaju Telegram chat ID.

_Korisno za obavijesti, nadolazeće Zoom pozive, itd._`,

  admin_grupapost_help: `📣 *Post u grupu*

Korištenje:
\`/grupapost Vaša poruka ovdje\`

Šalje poruku direktno u EM FOREX grupu.

_Korisno za signale, obavijesti, itd._`,

  admin_signal_help: `📈 *Dodavanje signala*

Korištenje:
\`/signal PAIR DIRECTION RESULT [PIPS] [%]\`

Primjeri:
\`/signal XAUUSD BUY WIN +50 1.5\`
\`/signal BTCUSD SELL LOSS -30 -0.8\`
\`/signal EURUSD BUY PENDING\`

*Parametri:*
• PAIR: XAUUSD, BTCUSD, EURUSD...
• DIRECTION: BUY ili SELL
• RESULT: WIN, LOSS, BREAKEVEN, PENDING
• PIPS i %: opciono`
};

// Create Supabase client with service role
function getSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

async function sendMessage(chatId: number, text: string, replyMarkup?: object) {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text: text,
    parse_mode: 'Markdown',
    disable_web_page_preview: true,
  };
  
  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }

  const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const result = await response.json();
  console.log('sendMessage result:', JSON.stringify(result, null, 2));
  return result;
}

async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  await fetch(`${TELEGRAM_API_URL}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text: text,
    }),
  });
}

async function notifyAdmins(userInfo: { firstName: string; username?: string; chatId: number }, message: string) {
  const userLink = userInfo.username 
    ? `[@${userInfo.username}](https://t.me/${userInfo.username})` 
    : `[${userInfo.firstName}](tg://user?id=${userInfo.chatId})`;
  
  const notificationText = `🔔 *Nova poruka!*

👤 *Od:* ${userInfo.firstName} ${userInfo.username ? `(@${userInfo.username})` : ''}
💬 *Odgovori:* ${userLink}

📝 *Poruka:*
${message}

_Klikni na link iznad da odgovoriš direktno._`;

  for (const adminId of ADMIN_CHAT_IDS) {
    await sendMessage(adminId, notificationText);
  }
}

// Check if user is admin
function isAdmin(chatId: number): boolean {
  return ADMIN_CHAT_IDS.includes(chatId);
}

// Format date for display
function formatDate(date: Date | null): string {
  if (!date) return 'Nije plaćeno';
  return date.toLocaleDateString('bs-BA', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Get membership status emoji and text
function getMembershipStatus(paidUntil: string | null): { emoji: string; text: string } {
  if (!paidUntil) {
    return { emoji: '⚪', text: 'Neaktivan' };
  }
  
  const paidUntilDate = new Date(paidUntil);
  const now = new Date();
  
  if (paidUntilDate > now) {
    return { emoji: '🟢', text: 'Aktivan' };
  } else {
    return { emoji: '🔴', text: 'Istekao' };
  }
}

// Handle /pomoc command - show available commands
function handlePomocCommand(chatId: number): string {
  const isUserAdmin = isAdmin(chatId);
  
  let message = `📖 *Dostupne komande*

👤 *Za sve korisnike:*
• \`/start\` - Pokreni bota i prikaži glavni meni
• \`/mojstatus\` - Provjeri status svoje članarine
• \`/pomoc\` - Prikaži ovu poruku pomoći

Možeš koristiti i dugmad u meniju za brži pristup.`;

  if (isUserAdmin) {
    message += `

👑 *Admin komande:*

📝 *Aktivacija članarine:*
• \`/platio @username mentorship\` - Aktiviraj mentorship
• \`/platio @username signals\` - Aktiviraj signals
• \`/platio @username signals 15.12.2024\` - Sa datumom uplate

🔄 *Produženje članarine:*
• \`/produzi @username\` - Produži za još jedan period
• \`/produzi @username 15.12.2024\` - Od specifičnog datuma

📊 *Pregled:*
• \`/status @username\` - Provjeri status korisnika
• \`/status email@example.com\` - Provjeri po emailu
• \`/clanovi\` - Lista svih članova
• \`/telegramstatus\` - Ko ima/nema Telegram Chat ID

📈 *Signali:*
• \`/signal XAUUSD BUY WIN +50 1.5\` - Dodaj rezultat signala
• \`/signali\` - Pregled statistike signala

📢 *Komunikacija:*
• \`/poruka Tekst poruke\` - Pošalji poruku svim aktivnim članovima (privatno)
• \`/grupapost Tekst poruke\` - Pošalji poruku u grupu EM FOREX

💡 *Napomene:*
• Mentorship = 3 mjeseca
• Signals = 1 mjesec
• Datum format: DD.MM.YYYY`;
  }

  return message;
}

// Handle /platio command - mark user as paid
async function handlePlatioCommand(chatId: number, args: string): Promise<string> {
  if (!isAdmin(chatId)) {
    return '❌ Nemate ovlaštenja za ovu komandu.';
  }

  const parts = args.trim().split(/\s+/);
  if (parts.length < 2) {
    return `❌ *Pogrešan format!*

Korištenje:
\`/platio email@example.com mentorship\`
\`/platio email@example.com signals\`
\`/platio @username mentorship\`
\`/platio @username signals\`
\`/platio @username signals 15.12.2024\`

Tip članarine: \`mentorship\` ili \`signals\`
Datum (opciono): DD.MM.YYYY format`;
  }

  const identifier = parts[0];
  const membershipType = parts[1].toLowerCase();

  if (membershipType !== 'mentorship' && membershipType !== 'signals') {
    return '❌ Tip članarine mora biti `mentorship` ili `signals`';
  }

  const supabase = getSupabaseClient();
  
  // Parse custom date if provided, otherwise use today
  let paidAt = new Date();
  if (parts.length >= 3) {
    const dateStr = parts[2];
    const dateParts = dateStr.split('.');
    if (dateParts.length === 3) {
      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1; // Months are 0-indexed
      const year = parseInt(dateParts[2], 10);
      const parsedDate = new Date(year, month, day);
      if (!isNaN(parsedDate.getTime())) {
        paidAt = parsedDate;
      } else {
        return '❌ Neispravan format datuma. Koristi DD.MM.YYYY (npr. 15.12.2024)';
      }
    } else {
      return '❌ Neispravan format datuma. Koristi DD.MM.YYYY (npr. 15.12.2024)';
    }
  }
  
  // Calculate paid_until from paidAt date
  const paidUntil = new Date(paidAt);
  const months = membershipType === 'mentorship' ? 3 : 1;
  paidUntil.setMonth(paidUntil.getMonth() + months);

  let query;
  if (identifier.startsWith('@')) {
    // Search by telegram username
    const username = identifier.slice(1);
    query = supabase
      .from('profiles')
      .update({ 
        membership_type: membershipType,
        paid_at: paidAt.toISOString(),
        paid_until: paidUntil.toISOString()
      })
      .ilike('telegram_username', username)
      .select();
  } else {
    // Search by email
    query = supabase
      .from('profiles')
      .update({ 
        membership_type: membershipType,
        paid_at: paidAt.toISOString(),
        paid_until: paidUntil.toISOString()
      })
      .ilike('email', identifier)
      .select();
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error updating membership:', error);
    return `❌ Greška: ${error.message}`;
  }

  if (!data || data.length === 0) {
    return `❌ Korisnik nije pronađen: \`${identifier}\``;
  }

  const user = data[0];
  const typeLabel = membershipType === 'mentorship' ? 'Mentorship' : 'Premium Signali';
  
  // Send welcome notification to user if we have their chat ID
  if (user.telegram_chat_id) {
    let welcomeMessage = '';
    
    if (membershipType === 'mentorship') {
      welcomeMessage = `🎉 *Dobrodošli u EM Capital Mentorship!*

Čestitamo na prvom koraku ka uspješnom tradingu!

🏷️ *Vaš paket:* ${typeLabel}
📅 *Važi do:* ${formatDate(paidUntil)}

━━━━━━━━━━━━━━━━━

📚 *Šta vas očekuje:*

✅ Strukturirani plan učenja za 3 mjeseca
✅ Jednostavna i efikasna trading strategija
✅ Upravljanje rizikom (0.5-1.5% po trejdu)
✅ Psihologija tradinga
✅ Analiza vaših trejdova
✅ Premium signali kao edukativna podrška
✅ Sedmični Zoom pozivi (live analize i Q&A)

━━━━━━━━━━━━━━━━━

📅 *Sljedeći koraci:*
1. Očekujte poruku sa rasporedom Zoom poziva
2. Pridružite se grupi za signale
3. Pripremite pitanja za prvi sastanak

🔗 *Pristup grupi:* https://t.me/+H86SSZlp-lU2M2Uy

Za sva pitanja: @EMforexadmin ili @emirbcvc

💪 *Sretno i vidimo se na prvom Zoom pozivu!*`;
    } else {
      welcomeMessage = `🎉 *Dobrodošli u Premium Signale!*

Hvala vam na povjerenju!

🏷️ *Vaš paket:* ${typeLabel}
📅 *Važi do:* ${formatDate(paidUntil)}

━━━━━━━━━━━━━━━━━

📊 *Šta dobijate:*

✅ Intraday i scalp trade setupi
✅ Jasno definisan entry, SL i TP
✅ Fokus na kvalitet, ne kvantitet
✅ Striktan risk management

━━━━━━━━━━━━━━━━━

⚠️ *Važne napomene:*
• Uvijek koristite Stop Loss
• Rizikujte max 1-2% kapitala po trejdu
• Signali nisu finansijski savjet
• Prošli rezultati ne garantuju buduće

🔗 *Pristup grupi:* https://t.me/+H86SSZlp-lU2M2Uy

Za sva pitanja: @EMforexadmin ili @emirbcvc

📈 *Sretno sa tradingom!*`;
    }

    await sendMessage(user.telegram_chat_id, welcomeMessage);
    console.log(`Sent welcome notification to user ${user.email} (chat_id: ${user.telegram_chat_id})`);
  }
  
  return `✅ *Članarina ažurirana!*

👤 *Email:* ${escapeMarkdown(user.email)}
📱 *Telegram:* ${user.telegram_username ? '@' + escapeMarkdown(user.telegram_username) : 'N/A'}
🏷️ *Tip:* ${typeLabel}
💰 *Uplaćeno:* ${formatDate(paidAt)}
📅 *Važi do:* ${formatDate(paidUntil)}
${user.telegram_chat_id ? '✉️ _Korisnik obaviješten_' : '⚠️ _Korisnik nije obaviješten (nema chat ID)_'}`;
}

// Handle /status command - check user status
async function handleStatusCommand(chatId: number, args: string): Promise<string> {
  if (!isAdmin(chatId)) {
    return '❌ Nemate ovlaštenja za ovu komandu.';
  }

  const identifier = args.trim();
  if (!identifier) {
    return `❌ *Pogrešan format!*

Korištenje:
\`/status email@example.com\`
\`/status @username\``;
  }

  const supabase = getSupabaseClient();
  
  let query;
  if (identifier.startsWith('@')) {
    const username = identifier.slice(1);
    query = supabase
      .from('profiles')
      .select('*')
      .ilike('telegram_username', username);
  } else {
    query = supabase
      .from('profiles')
      .select('*')
      .ilike('email', identifier);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching user:', error);
    return `❌ Greška: ${error.message}`;
  }

  if (!data || data.length === 0) {
    return `❌ Korisnik nije pronađen: \`${identifier}\``;
  }

  const user = data[0];
  const status = getMembershipStatus(user.paid_until);
  const typeLabel = user.membership_type === 'mentorship' ? 'Mentorship' : 
                   user.membership_type === 'signals' ? 'Premium Signali' : 'Nema';
  
  return `📊 *Status korisnika*

👤 *Email:* ${escapeMarkdown(user.email)}
📱 *Telegram:* ${user.telegram_username ? '@' + escapeMarkdown(user.telegram_username) : 'N/A'}
🏷️ *Tip članarine:* ${typeLabel}
${status.emoji} *Status:* ${status.text}
💰 *Uplaćeno:* ${formatDate(user.paid_at ? new Date(user.paid_at) : null)}
📅 *Važi do:* ${formatDate(user.paid_until ? new Date(user.paid_until) : null)}
📆 *Registrovan:* ${formatDate(new Date(user.created_at))}`;
}

// Handle /produzi command - extend membership
async function handleProduziCommand(chatId: number, args: string): Promise<string> {
  if (!isAdmin(chatId)) {
    return '❌ Nemate ovlaštenja za ovu komandu.';
  }

  const parts = args.trim().split(/\s+/);
  if (parts.length < 1 || !parts[0]) {
    return `❌ *Pogrešan format!*

Korištenje:
\`/produzi email@example.com\`
\`/produzi @username\`
\`/produzi @username 15.12.2024\`

Datum (opciono): DD.MM.YYYY format
Produžuje članarinu za još jedan period (1 mjesec za signals, 3 mjeseca za mentorship).`;
  }

  const identifier = parts[0];
  
  // Parse custom date if provided
  let customStartDate: Date | null = null;
  if (parts.length >= 2) {
    const dateStr = parts[1];
    const dateParts = dateStr.split('.');
    if (dateParts.length === 3) {
      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const year = parseInt(dateParts[2], 10);
      const parsedDate = new Date(year, month, day);
      if (!isNaN(parsedDate.getTime())) {
        customStartDate = parsedDate;
      } else {
        return '❌ Neispravan format datuma. Koristi DD.MM.YYYY (npr. 15.12.2024)';
      }
    } else {
      return '❌ Neispravan format datuma. Koristi DD.MM.YYYY (npr. 15.12.2024)';
    }
  }

  const supabase = getSupabaseClient();
  
  // First, fetch the user to get their membership type
  let fetchQuery;
  if (identifier.startsWith('@')) {
    const username = identifier.slice(1);
    fetchQuery = supabase
      .from('profiles')
      .select('*')
      .ilike('telegram_username', username);
  } else {
    fetchQuery = supabase
      .from('profiles')
      .select('*')
      .ilike('email', identifier);
  }

  const { data: users, error: fetchError } = await fetchQuery;

  if (fetchError) {
    console.error('Error fetching user:', fetchError);
    return `❌ Greška: ${fetchError.message}`;
  }

  if (!users || users.length === 0) {
    return `❌ Korisnik nije pronađen: \`${identifier}\``;
  }

  const user = users[0];
  
  if (!user.membership_type) {
    return `❌ Korisnik nema aktivnu članarinu. Koristi \`/platio\` za prvu uplatu.`;
  }

  // Calculate new expiry date
  const now = new Date();
  let startDate: Date;
  
  if (customStartDate) {
    // Use custom date as the start for extension
    startDate = customStartDate;
  } else {
    // If current membership is still active, extend from paid_until
    // If expired, extend from today
    const currentExpiry = user.paid_until ? new Date(user.paid_until) : now;
    startDate = currentExpiry > now ? currentExpiry : now;
  }
  
  const newExpiry = new Date(startDate);
  const months = user.membership_type === 'mentorship' ? 3 : 1;
  newExpiry.setMonth(newExpiry.getMonth() + months);

  // Update the user's paid_until
  let updateQuery;
  if (identifier.startsWith('@')) {
    const username = identifier.slice(1);
    updateQuery = supabase
      .from('profiles')
      .update({ 
        paid_at: now.toISOString(),
        paid_until: newExpiry.toISOString()
      })
      .ilike('telegram_username', username)
      .select();
  } else {
    updateQuery = supabase
      .from('profiles')
      .update({ 
        paid_at: now.toISOString(),
        paid_until: newExpiry.toISOString()
      })
      .ilike('email', identifier)
      .select();
  }

  const { data, error } = await updateQuery;

  if (error) {
    console.error('Error extending membership:', error);
    return `❌ Greška: ${error.message}`;
  }

  if (!data || data.length === 0) {
    return `❌ Greška prilikom produženja članarine.`;
  }

  const updatedUser = data[0];
  const typeLabel = updatedUser.membership_type === 'mentorship' ? 'Mentorship' : 'Premium Signali';
  const periodLabel = months === 3 ? '3 mjeseca' : '1 mjesec';
  
  // Send notification to user if we have their chat ID
  if (updatedUser.telegram_chat_id) {
    const userNotification = `🔄 *Vaša članarina je produžena!*

Hvala vam na produženoj uplati!

🏷️ *Tip članarine:* ${typeLabel}
⏱️ *Produženo za:* ${periodLabel}
📅 *Novi rok:* ${formatDate(newExpiry)}

Za sva pitanja kontaktirajte @EMforexadmin`;

    await sendMessage(updatedUser.telegram_chat_id, userNotification);
    console.log(`Sent extension notification to user ${updatedUser.email} (chat_id: ${updatedUser.telegram_chat_id})`);
  }
  
  return `✅ *Članarina produžena!*

👤 *Email:* ${escapeMarkdown(updatedUser.email)}
📱 *Telegram:* ${updatedUser.telegram_username ? '@' + escapeMarkdown(updatedUser.telegram_username) : 'N/A'}
🏷️ *Tip:* ${typeLabel}
⏱️ *Produženo za:* ${periodLabel}
💰 *Uplaćeno:* ${formatDate(now)}
📅 *Novi rok:* ${formatDate(newExpiry)}
${updatedUser.telegram_chat_id ? '✉️ _Korisnik obaviješten_' : '⚠️ _Korisnik nije obaviješten (nema chat ID)_'}`;
}

// Auto-link user and update telegram username/chat_id on any interaction
async function autoLinkTelegramUser(chatId: number, currentUsername: string | undefined): Promise<{ linked: boolean; profile?: { email: string; telegram_username: string | null } }> {
  const supabase = getSupabaseClient();
  
  // First, check if this chat_id is already linked to a profile
  const { data: existingByChatId } = await supabase
    .from('profiles')
    .select('id, email, telegram_username')
    .eq('telegram_chat_id', chatId)
    .single();
  
  if (existingByChatId) {
    // User is already linked! Update username if it changed
    if (currentUsername && existingByChatId.telegram_username?.toLowerCase() !== currentUsername.toLowerCase()) {
      const { error } = await supabase
        .from('profiles')
        .update({ telegram_username: currentUsername })
        .eq('telegram_chat_id', chatId);
      
      if (!error) {
        console.log(`Auto-updated telegram username for chat ${chatId}: ${existingByChatId.telegram_username} -> ${currentUsername}`);
      }
    }
    return { linked: true, profile: { email: existingByChatId.email, telegram_username: existingByChatId.telegram_username } };
  }
  
  // Not linked by chat_id - try to find by username and link
  if (currentUsername) {
    const { data: profileByUsername, error: searchError } = await supabase
      .from('profiles')
      .select('id, email, telegram_username, telegram_chat_id')
      .ilike('telegram_username', currentUsername)
      .single();
    
    if (profileByUsername && !searchError) {
      // Found profile by username! Link it with chat_id
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          telegram_chat_id: chatId,
          telegram_username: currentUsername // Update to exact case
        })
        .eq('id', profileByUsername.id);
      
      if (!updateError) {
        console.log(`Auto-linked telegram chat ${chatId} to profile ${profileByUsername.email} via username @${currentUsername}`);
        return { linked: true, profile: { email: profileByUsername.email, telegram_username: currentUsername } };
      }
    }
  }
  
  return { linked: false };
}

// Backward compatibility wrapper
async function autoUpdateTelegramUsername(chatId: number, currentUsername: string | undefined): Promise<void> {
  await autoLinkTelegramUser(chatId, currentUsername);
}

// Handle /mojstatus command - user checks their own membership status
async function handleMojStatusCommand(chatId: number, username: string | undefined): Promise<string> {
  if (!username) {
    return `❌ *Nemate Telegram username!*

Da biste provjerili status članarine, morate imati postavljen Telegram username.

Postavite username u Telegram podešavanjima i pokušajte ponovo.`;
  }

  const supabase = getSupabaseClient();
  
  // Auto-update username if it changed
  await autoUpdateTelegramUsername(chatId, username);
  
  // First, try to update the user's chat ID for future notifications (by username)
  await supabase
    .from('profiles')
    .update({ telegram_chat_id: chatId })
    .ilike('telegram_username', username);
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('telegram_username', username);

  if (error) {
    console.error('Error fetching user status:', error);
    return `❌ Greška prilikom provjere statusa.`;
  }

  if (!data || data.length === 0) {
    return `❌ *Niste registrovani!*

Vaš Telegram username (@${escapeMarkdown(username)}) nije pronađen u sistemu.

👉 Registrujte se na: em-capital-forex.dynu.net/auth

Unesite isti Telegram username prilikom registracije.`;
  }

  const user = data[0];
  const status = getMembershipStatus(user.paid_until);
  const typeLabel = user.membership_type === 'mentorship' ? 'Mentorship' : 
                   user.membership_type === 'signals' ? 'Premium Signali' : 'Nema';
  
  if (!user.membership_type || !user.paid_until) {
    return `📊 *Vaš status*

👤 *Email:* ${escapeMarkdown(user.email)}
📱 *Telegram:* @${escapeMarkdown(username)}
⚪ *Status:* Čeka uplatu

💳 Za aktivaciju članarine kontaktirajte:
👉 @EMforexadmin ili @emirbcvc`;
  }

  const daysLeft = user.paid_until ? Math.ceil((new Date(user.paid_until).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const daysText = daysLeft > 0 ? `(još ${daysLeft} dana)` : '(isteklo)';
  
  return `📊 *Vaš status članarine*

👤 *Email:* ${escapeMarkdown(user.email)}
📱 *Telegram:* @${escapeMarkdown(username)}
🏷️ *Tip članarine:* ${typeLabel}
${status.emoji} *Status:* ${status.text} ${daysText}
💰 *Uplaćeno:* ${formatDate(user.paid_at ? new Date(user.paid_at) : null)}
📅 *Važi do:* ${formatDate(user.paid_until ? new Date(user.paid_until) : null)}

${status.text === 'Aktivan' ? '✅ Vaša članarina je aktivna!' : '⚠️ Za produženje članarine kontaktirajte @EMforexadmin'}`;
}

// Handle /clanovi command - list all members
async function handleClanoviCommand(chatId: number): Promise<string> {
  if (!isAdmin(chatId)) {
    return '❌ Nemate ovlaštenja za ovu komandu.';
  }

  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching members:', error);
    return `❌ Greška: ${error.message}`;
  }

  if (!data || data.length === 0) {
    return '📋 Nema registrovanih članova.';
  }

  const now = new Date();
  const activeMembers = data.filter(m => m.paid_until && new Date(m.paid_until) > now);
  const expiredMembers = data.filter(m => m.paid_until && new Date(m.paid_until) <= now);
  const pendingMembers = data.filter(m => !m.paid_until);

  let message = `📋 *Lista članova* (${data.length} ukupno)

🟢 *Aktivni:* ${activeMembers.length}
🔴 *Istekli:* ${expiredMembers.length}
⚪ *Čekaju uplatu:* ${pendingMembers.length}

`;

  // Show active members
  if (activeMembers.length > 0) {
    message += `\n*Aktivni članovi:*\n`;
    activeMembers.slice(0, 10).forEach(m => {
      const type = m.membership_type === 'mentorship' ? 'M' : 'S';
      const tg = m.telegram_username ? `@${escapeMarkdown(m.telegram_username)}` : escapeMarkdown(m.email);
      message += `🟢 ${tg} (${type}) - do ${formatDate(new Date(m.paid_until))}\n`;
    });
    if (activeMembers.length > 10) {
      message += `... i još ${activeMembers.length - 10}\n`;
    }
  }

  // Show expired members
  if (expiredMembers.length > 0) {
    message += `\n*Istekle članarine:*\n`;
    expiredMembers.slice(0, 5).forEach(m => {
      const tg = m.telegram_username ? `@${escapeMarkdown(m.telegram_username)}` : escapeMarkdown(m.email);
      message += `🔴 ${tg} - isteklo ${formatDate(new Date(m.paid_until))}\n`;
    });
    if (expiredMembers.length > 5) {
      message += `... i još ${expiredMembers.length - 5}\n`;
    }
  }

  // Show pending members
  if (pendingMembers.length > 0) {
    message += `\n*Čekaju uplatu:*\n`;
    pendingMembers.slice(0, 5).forEach(m => {
      const tg = m.telegram_username ? `@${escapeMarkdown(m.telegram_username)}` : escapeMarkdown(m.email);
      message += `⚪ ${tg}\n`;
    });
    if (pendingMembers.length > 5) {
      message += `... i još ${pendingMembers.length - 5}\n`;
    }
  }

  return message;
}

// Handle Telegram Status command - check who has/doesn't have chat ID
async function handleTelegramStatusCommand(chatId: number): Promise<string> {
  if (!isAdmin(chatId)) {
    return '❌ Nemate ovlaštenja za ovu komandu.';
  }

  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('email, telegram_username, telegram_chat_id, membership_type, paid_until')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching profiles:', error);
    return `❌ Greška: ${error.message}`;
  }

  if (!data || data.length === 0) {
    return '📋 Nema registrovanih članova.';
  }

  const withChatId = data.filter(m => m.telegram_chat_id);
  const withoutChatId = data.filter(m => !m.telegram_chat_id);
  
  const percentage = Math.round((withChatId.length / data.length) * 100);

  let message = `📱 *Telegram Status*

📊 *Statistika:*
✅ Sa Chat ID: ${withChatId.length}
❌ Bez Chat ID: ${withoutChatId.length}
📈 Povezano: ${percentage}%

`;

  // Show users WITHOUT chat ID
  if (withoutChatId.length > 0) {
    message += `\n❌ *Bez Telegram Chat ID:*\n`;
    message += `_Ovi korisnici nisu pokrenuli bota_\n\n`;
    
    withoutChatId.slice(0, 15).forEach(m => {
      const tg = m.telegram_username ? `@${escapeMarkdown(m.telegram_username)}` : '-';
      const email = escapeMarkdown(m.email.split('@')[0]) + '...';
      message += `• ${tg} (${email})\n`;
    });
    
    if (withoutChatId.length > 15) {
      message += `\n... i još ${withoutChatId.length - 15} korisnika\n`;
    }
  }

  // Show summary for users WITH chat ID
  if (withChatId.length > 0) {
    message += `\n✅ *Sa Chat ID:* ${withChatId.length} korisnika mogu primati notifikacije`;
  }

  return message;
}

// Group ID for EM FOREX
const EM_FOREX_GROUP_ID = -1003241249431;

// Handle /grupapost command - send message to the group
async function handleGrupapostCommand(chatId: number, messageText: string): Promise<string> {
  if (!isAdmin(chatId)) {
    return '❌ Nemate ovlaštenja za ovu komandu.';
  }

  if (!messageText || messageText.trim().length === 0) {
    return `❌ *Pogrešan format!*

Korištenje:
\`/grupapost Vaša poruka ovdje\`

Primjer:
\`/grupapost 📢 Novi signali dostupni!\`

Ova komanda šalje poruku direktno u EM FOREX grupu.`;
  }

  try {
    const result = await sendMessage(EM_FOREX_GROUP_ID, messageText.trim());
    
    if (result?.ok) {
      return `✅ *Poruka poslana u grupu!*

📝 *Poruka:*
"${messageText.trim().substring(0, 100)}${messageText.trim().length > 100 ? '...' : ''}"`;
    } else {
      console.error('Failed to send to group:', result);
      return `❌ Greška pri slanju: ${result?.description || 'Nepoznata greška'}`;
    }
  } catch (err: unknown) {
    console.error('Error sending to group:', err);
    const errorMessage = err instanceof Error ? err.message : 'Nepoznata greška';
    return `❌ Greška: ${errorMessage}`;
  }
}

// Handle /poruka command - send message to all active members
async function handlePorukaCommand(chatId: number, messageText: string): Promise<string> {
  if (!isAdmin(chatId)) {
    return '❌ Nemate ovlaštenja za ovu komandu.';
  }

  if (!messageText || messageText.trim().length === 0) {
    return `❌ *Pogrešan format!*

Korištenje:
\`/poruka Vaša poruka ovdje\`

Primjer:
\`/poruka 📢 Novi signali dostupni! Provjerite grupu.\``;
  }

  const supabase = getSupabaseClient();
  const now = new Date().toISOString();
  
  // Fetch all active members with chat IDs
  const { data: activeMembers, error } = await supabase
    .from('profiles')
    .select('*')
    .not('telegram_chat_id', 'is', null)
    .not('paid_until', 'is', null)
    .gte('paid_until', now);

  if (error) {
    console.error('Error fetching active members:', error);
    return `❌ Greška: ${error.message}`;
  }

  if (!activeMembers || activeMembers.length === 0) {
    return '⚠️ Nema aktivnih članova sa Telegram chat ID-om.';
  }

  // Send message to each active member
  let successCount = 0;
  let failCount = 0;

  const formattedMessage = `📢 *Poruka od EM Capital*

${messageText.trim()}

━━━━━━━━━━━━━━━━━
_Za pitanja: @EMforexadmin_`;

  for (const member of activeMembers) {
    try {
      await sendMessage(member.telegram_chat_id, formattedMessage);
      successCount++;
      console.log(`Message sent to ${member.email} (chat_id: ${member.telegram_chat_id})`);
    } catch (err) {
      failCount++;
      console.error(`Failed to send to ${member.email}:`, err);
    }
  }

  return `✅ *Poruka poslana!*

📤 *Uspješno:* ${successCount} član(ova)
${failCount > 0 ? `❌ *Neuspješno:* ${failCount}` : ''}
📝 *Poruka:*
"${messageText.trim().substring(0, 100)}${messageText.trim().length > 100 ? '...' : ''}"`;
}

// Handle /signal command - add signal result
async function handleSignalCommand(chatId: number, args: string): Promise<string> {
  if (!isAdmin(chatId)) {
    return '❌ Nemate ovlaštenja za ovu komandu.';
  }

  const parts = args.trim().split(/\s+/);
  if (parts.length < 3) {
    return `❌ *Pogrešan format!*

Korištenje:
\`/signal PAIR DIRECTION RESULT [PIPS] [PERCENT]\`

Primjeri:
\`/signal XAUUSD BUY WIN +50 1.5\`
\`/signal BTCUSD SELL LOSS -30 -0.8\`
\`/signal EURUSD BUY BREAKEVEN 0 0\`
\`/signal XAUUSD BUY PENDING\`

*PAIR:* XAUUSD, BTCUSD, EURUSD, itd.
*DIRECTION:* BUY ili SELL
*RESULT:* WIN, LOSS, BREAKEVEN, PENDING
*PIPS:* (opciono) broj pipsa
*PERCENT:* (opciono) procenat profita`;
  }

  const pair = parts[0].toUpperCase();
  const direction = parts[1].toUpperCase();
  const result = parts[2].toUpperCase();
  const pips = parts[3] ? parseFloat(parts[3]) : null;
  const percent = parts[4] ? parseFloat(parts[4]) : null;

  if (direction !== 'BUY' && direction !== 'SELL') {
    return '❌ Direction mora biti BUY ili SELL';
  }

  if (!['WIN', 'LOSS', 'BREAKEVEN', 'PENDING'].includes(result)) {
    return '❌ Result mora biti WIN, LOSS, BREAKEVEN ili PENDING';
  }

  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('signal_results')
    .insert({
      pair,
      direction,
      result,
      profit_pips: pips,
      profit_percent: percent,
      entry_price: 0, // Will be updated later if needed
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding signal:', error);
    return `❌ Greška: ${error.message}`;
  }

  const resultEmoji = result === 'WIN' ? '🟢' : result === 'LOSS' ? '🔴' : result === 'BREAKEVEN' ? '🟡' : '⚪';
  const dirEmoji = direction === 'BUY' ? '📈' : '📉';
  
  return `✅ *Signal dodan!*

${resultEmoji} *${pair}* ${dirEmoji} ${direction}
📊 *Rezultat:* ${result}
${pips !== null ? `📍 *Pips:* ${pips >= 0 ? '+' : ''}${pips}` : ''}
${percent !== null ? `💰 *Profit:* ${percent >= 0 ? '+' : ''}${percent}%` : ''}`;
}

// Handle /signali command - show signal statistics
async function handleSignaliCommand(chatId: number): Promise<string> {
  if (!isAdmin(chatId)) {
    return '❌ Nemate ovlaštenja za ovu komandu.';
  }

  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('signal_results')
    .select('*')
    .order('signal_date', { ascending: false });

  if (error) {
    console.error('Error fetching signals:', error);
    return `❌ Greška: ${error.message}`;
  }

  if (!data || data.length === 0) {
    return '📊 Nema zabilježenih signala.';
  }

  const completed = data.filter(s => s.result && s.result !== 'PENDING');
  const wins = completed.filter(s => s.result === 'WIN').length;
  const losses = completed.filter(s => s.result === 'LOSS').length;
  const breakeven = completed.filter(s => s.result === 'BREAKEVEN').length;
  const pending = data.filter(s => s.result === 'PENDING' || !s.result).length;
  
  const winRate = completed.length > 0 ? ((wins / completed.length) * 100).toFixed(1) : '0';
  const totalPips = completed.reduce((sum, s) => sum + (s.profit_pips || 0), 0);
  const totalPercent = completed.reduce((sum, s) => sum + (s.profit_percent || 0), 0);

  let message = `📊 *Statistika Signala*

📈 *Ukupno:* ${data.length} signala
🟢 *Pobjeda:* ${wins}
🔴 *Gubitak:* ${losses}
🟡 *Breakeven:* ${breakeven}
⚪ *Pending:* ${pending}

🎯 *Win Rate:* ${winRate}%
📍 *Ukupno Pips:* ${totalPips >= 0 ? '+' : ''}${totalPips.toFixed(1)}
💰 *Ukupno Profit:* ${totalPercent >= 0 ? '+' : ''}${totalPercent.toFixed(2)}%

*Zadnjih 5 signala:*`;

  data.slice(0, 5).forEach(s => {
    const emoji = s.result === 'WIN' ? '🟢' : s.result === 'LOSS' ? '🔴' : s.result === 'BREAKEVEN' ? '🟡' : '⚪';
    const pipsText = s.profit_pips !== null ? ` (${s.profit_pips >= 0 ? '+' : ''}${s.profit_pips}p)` : '';
    message += `\n${emoji} ${s.pair} ${s.direction}${pipsText}`;
  });

  return message;
}

// EA Launch message content
function getEaLaunchMessage(): string {
  const REGULAR_PRICE = 1000;
  const DISCOUNT_PRICE = 800;
  const DISCOUNT_DAYS = 3;

  return `🤖 *EA ROBOTI - SADA DOSTUPNI!*

━━━━━━━━━━━━━━━━━

🎉 *LANSIRANJE JE DANAS!*

💰 *Cijena:* ~$${REGULAR_PRICE}~ *$${DISCOUNT_PRICE}*
🎁 *Popust -20%* vrijedi prvih ${DISCOUNT_DAYS} dana!

━━━━━━━━━━━━━━━━━

📦 *Šta dobijate u paketu:*

✅ Mobile EA za Android (iOS uskoro)
✅ Desktop EA za MetaTrader
✅ Doživotne nadogradnje
✅ Premium podrška

━━━━━━━━━━━━━━━━━

🔥 *Ne propustite specijalnu ponudu!*

🛒 *Kupite sada:* em-capital-forex.dynu.net/#ea-robots

Za pitanja: @EMforexadmin ili @emirbcvc`;
}

// Handle EA Robot launch announcement to group
async function handleEaLansiranjeCommand(chatId: number): Promise<string> {
  if (!isAdmin(chatId)) {
    return '❌ Nemate ovlaštenja za ovu komandu.';
  }

  const launchMessage = getEaLaunchMessage();
  const supabase = getSupabaseClient();
  
  let groupSent = false;
  let membersSent = 0;
  let membersFailed = 0;
  let emailsTriggered = false;

  // 1. Send to group
  try {
    const result = await sendMessage(EM_FOREX_GROUP_ID, launchMessage);
    if (result?.ok) {
      groupSent = true;
      console.log('EA launch sent to group successfully');
    } else {
      console.error('Failed to send EA launch to group:', result);
    }
  } catch (err) {
    console.error('Error sending EA launch to group:', err);
  }

  // 2. Send to all members with telegram_chat_id
  try {
    const { data: members, error } = await supabase
      .from('profiles')
      .select('telegram_chat_id, email, telegram_username')
      .not('telegram_chat_id', 'is', null)
      .eq('telegram_notifications', true);

    if (error) {
      console.error('Error fetching members:', error);
    } else if (members && members.length > 0) {
      console.log(`Sending EA launch to ${members.length} members`);
      
      for (const member of members) {
        if (member.telegram_chat_id) {
          try {
            const result = await sendMessage(member.telegram_chat_id, launchMessage);
            if (result?.ok) {
              membersSent++;
            } else {
              membersFailed++;
              console.error(`Failed to send to ${member.telegram_chat_id}:`, result);
            }
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (err) {
            membersFailed++;
            console.error(`Error sending to ${member.telegram_chat_id}:`, err);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error sending to members:', err);
  }

  // 3. Trigger email notifications (fire and forget)
  try {
    const emailResponse = await fetch(`${SUPABASE_URL}/functions/v1/notify-ea-launch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });
    if (emailResponse.ok) {
      emailsTriggered = true;
      console.log('Email notifications triggered');
    }
  } catch (err) {
    console.error('Error triggering email notifications:', err);
  }

  return `✅ *EA Lansiranje Objavljeno!*

📣 *Grupa:* ${groupSent ? '✅ Poslano' : '❌ Greška'}
👥 *Članovi:* ${membersSent} poslano${membersFailed > 0 ? `, ${membersFailed} neuspješno` : ''}
📧 *Email:* ${emailsTriggered ? '✅ Pokrenuto' : '❌ Greška'}

_Obavijest o lansiranju EA robota je poslana._`;
}

// Handle EA launch broadcast from web admin panel
async function handleEaLaunchBroadcast(): Promise<{ groupSent: boolean; membersSent: number; membersFailed: number; emailsTriggered: boolean }> {
  const launchMessage = getEaLaunchMessage();
  const supabase = getSupabaseClient();
  
  let groupSent = false;
  let membersSent = 0;
  let membersFailed = 0;
  let emailsTriggered = false;

  // 1. Send to group
  try {
    const result = await sendMessage(EM_FOREX_GROUP_ID, launchMessage);
    if (result?.ok) {
      groupSent = true;
      console.log('EA launch sent to group successfully');
    } else {
      console.error('Failed to send EA launch to group:', result);
    }
  } catch (err) {
    console.error('Error sending EA launch to group:', err);
  }

  // 2. Send to all members with telegram_chat_id
  try {
    const { data: members, error } = await supabase
      .from('profiles')
      .select('telegram_chat_id, email, telegram_username')
      .not('telegram_chat_id', 'is', null)
      .eq('telegram_notifications', true);

    if (error) {
      console.error('Error fetching members:', error);
    } else if (members && members.length > 0) {
      console.log(`Sending EA launch to ${members.length} members`);
      
      for (const member of members) {
        if (member.telegram_chat_id) {
          try {
            const result = await sendMessage(member.telegram_chat_id, launchMessage);
            if (result?.ok) {
              membersSent++;
            } else {
              membersFailed++;
              console.error(`Failed to send to ${member.telegram_chat_id}:`, result);
            }
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (err) {
            membersFailed++;
            console.error(`Error sending to ${member.telegram_chat_id}:`, err);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error sending to members:', err);
  }

  // 3. Trigger email notifications
  try {
    const emailResponse = await fetch(`${SUPABASE_URL}/functions/v1/notify-ea-launch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });
    if (emailResponse.ok) {
      emailsTriggered = true;
      console.log('Email notifications triggered');
    }
  } catch (err) {
    console.error('Error triggering email notifications:', err);
  }

  return { groupSent, membersSent, membersFailed, emailsTriggered };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Handle new registration notification from website
    if (body.type === 'new_registration') {
      console.log('New registration notification:', body);
      
      const { email, telegram_username } = body;
      const escapedEmail = escapeMarkdown(email || '');
      const tgHandle = telegram_username ? `@${escapeMarkdown(telegram_username)}` : 'N/A';
      
      const notificationText = `🆕 *Nova registracija!*

📧 *Email:* ${escapedEmail}
📱 *Telegram:* ${tgHandle}
📆 *Vrijeme:* ${new Date().toLocaleString('bs-BA')}

_Korisnik čeka uplatu. Koristi /platio da aktiviraš članarinu._`;

      for (const adminId of ADMIN_CHAT_IDS) {
        await sendMessage(adminId, notificationText);
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle EA launch broadcast from web admin panel
    if (body.type === 'ea_launch_broadcast') {
      console.log('EA launch broadcast request from web');

      const result = await handleEaLaunchBroadcast();

      return new Response(JSON.stringify({
        ok: true,
        groupSent: result.groupSent,
        membersSent: result.membersSent,
        membersFailed: result.membersFailed,
        emailsTriggered: result.emailsTriggered,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle group broadcast message (admin-initiated from website)
    // NOTE: This function endpoint is public for Telegram webhooks, so we restrict broadcasts to the known group ID.
    if (body.type === 'group_broadcast') {
      console.log('Group broadcast request:', body);

      const { group_id, message } = body as { group_id?: number; message?: string };

      if (typeof group_id !== 'number' || !message || typeof message !== 'string') {
        return new Response(JSON.stringify({ ok: false, error: 'Invalid payload' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Only allow posting to the EM FOREX group
      const ALLOWED_GROUP_ID = -1003241249431;
      if (group_id !== ALLOWED_GROUP_ID) {
        return new Response(JSON.stringify({ ok: false, error: 'Group not allowed' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const result = await sendMessage(group_id, message);

      if (!result?.ok) {
        console.error('Failed to broadcast to group:', result);
        return new Response(JSON.stringify({ ok: false, error: 'Telegram sendMessage failed', result }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle Telegram webhook updates
    const update = body;
    console.log('Received Telegram update:', JSON.stringify(update, null, 2));

    // Handle admin commands
    if (update.message?.text?.startsWith('/platio')) {
      const chatId = update.message.chat.id;
      const args = update.message.text.replace('/platio', '').trim();
      const response = await handlePlatioCommand(chatId, args);
      await sendMessage(chatId, response);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (update.message?.text?.startsWith('/status')) {
      const chatId = update.message.chat.id;
      const args = update.message.text.replace('/status', '').trim();
      const response = await handleStatusCommand(chatId, args);
      await sendMessage(chatId, response);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (update.message?.text?.startsWith('/clanovi')) {
      const chatId = update.message.chat.id;
      const response = await handleClanoviCommand(chatId);
      await sendMessage(chatId, response);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (update.message?.text?.startsWith('/produzi')) {
      const chatId = update.message.chat.id;
      const args = update.message.text.replace('/produzi', '').trim();
      const response = await handleProduziCommand(chatId, args);
      await sendMessage(chatId, response);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (update.message?.text?.startsWith('/poruka')) {
      const chatId = update.message.chat.id;
      const messageText = update.message.text.replace('/poruka', '').trim();
      const response = await handlePorukaCommand(chatId, messageText);
      await sendMessage(chatId, response);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (update.message?.text?.startsWith('/grupapost')) {
      const chatId = update.message.chat.id;
      const messageText = update.message.text.replace('/grupapost', '').trim();
      const response = await handleGrupapostCommand(chatId, messageText);
      await sendMessage(chatId, response);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (update.message?.text?.startsWith('/signal ')) {
      const chatId = update.message.chat.id;
      const args = update.message.text.replace('/signal', '').trim();
      const response = await handleSignalCommand(chatId, args);
      await sendMessage(chatId, response);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (update.message?.text?.startsWith('/signali')) {
      const chatId = update.message.chat.id;
      const response = await handleSignaliCommand(chatId);
      await sendMessage(chatId, response);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (update.message?.text?.startsWith('/mojstatus')) {
      const chatId = update.message.chat.id;
      const username = update.message.from?.username;
      const response = await handleMojStatusCommand(chatId, username);
      await sendMessage(chatId, response);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (update.message?.text?.startsWith('/pomoc') || update.message?.text?.startsWith('/help')) {
      const chatId = update.message.chat.id;
      const response = handlePomocCommand(chatId);
      await sendMessage(chatId, response);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle /telegramstatus command (admin only)
    if (update.message?.text?.startsWith('/telegramstatus')) {
      const chatId = update.message.chat.id;
      if (isAdmin(chatId)) {
        const response = await handleTelegramStatusCommand(chatId);
        await sendMessage(chatId, response);
      } else {
        await sendMessage(chatId, '❌ Nemate ovlaštenja za ovu komandu.');
      }
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle /start command in private chat
    if (update.message?.text === '/start') {
      const chatId = update.message.chat.id;
      const firstName = update.message.from?.first_name || 'člane';
      const username = update.message.from?.username;

      console.log(`Received /start from: ${firstName} (${chatId}), username: ${username || 'none'}`);

      // Clear any pending inquiry state
      usersWaitingForInquiry.delete(chatId);

      // Auto-link user with profile (saves chat_id and updates username)
      const linkResult = await autoLinkTelegramUser(chatId, username);
      
      if (linkResult.linked) {
        console.log(`User ${chatId} successfully linked to profile ${linkResult.profile?.email}`);
      } else if (username) {
        console.log(`User ${chatId} with username @${username} not found in profiles`);
      } else {
        console.log(`User ${chatId} has no username set`);
      }

      await sendMessage(
        chatId,
        getPrivateWelcomeMessage(firstName),
        getMenuKeyboard(chatId)
      );
    }
    // Handle regular messages (potential inquiry) - ONLY in private chats
    else if (update.message?.text && !update.message.text.startsWith('/')) {
      const chatId = update.message.chat.id;
      const chatType = update.message.chat.type;
      const firstName = update.message.from?.first_name || 'Korisnik';
      const username = update.message.from?.username;
      const messageText = update.message.text;

      console.log(`Received message from ${firstName} (${chatId}) in ${chatType}: ${messageText}`);

      // Only respond to messages in private chats, ignore group messages
      if (chatType === 'private') {
        // Auto-link user with profile on any message
        const linkResult = await autoLinkTelegramUser(chatId, username);
        if (linkResult.linked) {
          console.log(`Auto-linked user ${chatId} to ${linkResult.profile?.email} on message`);
        }

        // Forward message to admins
        await notifyAdmins(
          { firstName, username, chatId },
          messageText
        );

        // Send confirmation to user
        await sendMessage(
          chatId,
          `✅ *Hvala vam, ${firstName}!*

Vaša poruka je uspješno primljena. Javićemo vam se u najkraćem mogućem roku!

🕐 Uobičajeno vrijeme odgovora: do 24 sata.

Hvala na strpljenju! 🙏`
        );

        // Send menu again
        await sendMessage(chatId, '👇 *Odaberite drugu opciju:*', getMenuKeyboard(chatId));
      }
    }

    // Handle callback queries (button presses)
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const chatId = callbackQuery.message.chat.id;
      const data = callbackQuery.data;
      const firstName = callbackQuery.from?.first_name || 'Korisnik';
      const username = callbackQuery.from?.username;

      console.log(`Callback query: ${data} from chat ${chatId}, username: ${username || 'none'}`);

      // Auto-link user with profile on any callback interaction
      const linkResult = await autoLinkTelegramUser(chatId, username);
      if (linkResult.linked && !linkResult.profile?.telegram_username) {
        console.log(`Auto-linked user ${chatId} to ${linkResult.profile?.email} on callback`);
      }

      // Answer the callback to remove loading state
      await answerCallbackQuery(callbackQuery.id);

      // Handle admin menu button
      if (data === 'admin_menu') {
        if (isAdmin(chatId)) {
          await sendMessage(chatId, '👑 *Admin Panel*\n\nOdaberite opciju:', adminMenuKeyboard);
        } else {
          await sendMessage(chatId, '❌ Nemate ovlaštenja za admin panel.');
        }
      }
      // Handle back to menu button
      else if (data === 'back_to_menu') {
        await sendMessage(chatId, '👇 *Glavni meni:*', getMenuKeyboard(chatId));
      }
      // Handle admin clanovi button (execute directly)
      else if (data === 'admin_clanovi') {
        if (isAdmin(chatId)) {
          const response = await handleClanoviCommand(chatId);
          await sendMessage(chatId, response);
          await sendMessage(chatId, '👇 *Admin opcije:*', adminMenuKeyboard);
        }
      }
      // Handle admin signali button (execute directly)
      else if (data === 'admin_signali') {
        if (isAdmin(chatId)) {
          const response = await handleSignaliCommand(chatId);
          await sendMessage(chatId, response);
          await sendMessage(chatId, '👇 *Admin opcije:*', adminMenuKeyboard);
        }
      }
      // Handle admin EA lansiranje button (execute directly)
      else if (data === 'admin_ealansiranje') {
        if (isAdmin(chatId)) {
          const response = await handleEaLansiranjeCommand(chatId);
          await sendMessage(chatId, response);
          await sendMessage(chatId, '👇 *Admin opcije:*', adminMenuKeyboard);
        }
      }
      // Handle admin telegram status button (execute directly)
      else if (data === 'admin_telegram_status') {
        if (isAdmin(chatId)) {
          const response = await handleTelegramStatusCommand(chatId);
          await sendMessage(chatId, response);
          await sendMessage(chatId, '👇 *Admin opcije:*', adminMenuKeyboard);
        }
      }
      // Handle my_status button
      else if (data === 'my_status') {
        const response = await handleMojStatusCommand(chatId, username);
        await sendMessage(chatId, response);
        await sendMessage(chatId, '👇 *Odaberite drugu opciju:*', getMenuKeyboard(chatId));
      }
      // Handle help button
      else if (data === 'help') {
        const response = handlePomocCommand(chatId);
        await sendMessage(chatId, response);
        await sendMessage(chatId, '👇 *Odaberite drugu opciju:*', getMenuKeyboard(chatId));
      }
      // Handle admin help buttons (show instructions then back to admin menu)
      else if (data.startsWith('admin_') && data.endsWith('_help') && responses[data]) {
        if (isAdmin(chatId)) {
          await sendMessage(chatId, responses[data]);
          await sendMessage(chatId, '👇 *Admin opcije:*', adminMenuKeyboard);
        }
      }
      // Send appropriate response for other buttons
      else if (responses[data]) {
        await sendMessage(chatId, responses[data]);

        // If user clicked send_inquiry, mark them as waiting for message
        if (data === 'send_inquiry') {
          usersWaitingForInquiry.set(chatId, { firstName, username });
          console.log(`User ${chatId} is now waiting to send inquiry`);
        } else {
          // Send menu again for other options
          await sendMessage(chatId, '👇 *Odaberite drugu opciju:*', getMenuKeyboard(chatId));
        }
      }
    }

    // Handle new chat members in groups - ONLY welcome message
    if (update.message?.new_chat_members) {
      const chatId = update.message.chat.id;
      const newMembers = update.message.new_chat_members;

      console.log(`New members detected in chat ${chatId}:`, newMembers.length);

      for (const member of newMembers) {
        if (member.is_bot) {
          console.log('Skipping bot:', member.username);
          continue;
        }

        const firstName = member.first_name || 'člane';
        console.log(`Sending welcome to: ${firstName} (${member.id})`);

        // Send welcome message with group-specific keyboard (link to bot)
        await sendMessage(
          chatId,
          getGroupWelcomeMessage(firstName),
          groupWelcomeKeyboard
        );
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in telegram-welcome function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(JSON.stringify({ ok: false, error: errorMessage }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
