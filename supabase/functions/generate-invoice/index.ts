import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function formatDate(date: Date): string {
  return date.toLocaleDateString('bs-BA', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
}

function generateInvoiceNumber(date: Date, index: number): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `EM-${year}${month}-${String(index).padStart(4, '0')}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with user's token
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Error getting user:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { paymentDate, membershipType, amount, validUntil } = await req.json();
    
    console.log('Generating invoice for:', { paymentDate, membershipType, amount, user: user.email });

    // Get user profile for additional info
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, telegram_username')
      .eq('user_id', user.id)
      .maybeSingle();

    // Generate PDF
    const doc = new jsPDF();
    
    const paymentDateObj = new Date(paymentDate);
    const validUntilObj = new Date(validUntil);
    const invoiceNumber = generateInvoiceNumber(paymentDateObj, Math.floor(Math.random() * 9999) + 1);
    
    // Colors
    const primaryColor = [212, 175, 55]; // Gold
    const darkColor = [30, 30, 30];
    const grayColor = [128, 128, 128];

    // Header background
    doc.setFillColor(20, 20, 25);
    doc.rect(0, 0, 210, 50, 'F');

    // Company name
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('EM CAPITAL', 20, 30);

    // Subtitle
    doc.setTextColor(180, 180, 180);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Forex Trading Signals & Mentorship', 20, 38);

    // Invoice title
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('FAKTURA', 20, 70);

    // Invoice details box
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.rect(130, 55, 60, 30);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text('Broj fakture:', 135, 65);
    doc.text('Datum izdavanja:', 135, 73);
    doc.text('Datum dospijeća:', 135, 81);

    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(invoiceNumber, 165, 65);
    doc.text(formatDate(paymentDateObj), 165, 73);
    doc.text(formatDate(paymentDateObj), 165, 81);

    // Divider line
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.line(20, 95, 190, 95);

    // Customer info
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('Kupac:', 20, 110);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(profile?.email || user.email || 'N/A', 20, 118);
    if (profile?.telegram_username) {
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text(`Telegram: @${profile.telegram_username}`, 20, 126);
    }

    // Table header
    const tableTop = 145;
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(20, tableTop, 170, 10, 'F');
    
    doc.setTextColor(20, 20, 25);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Opis', 25, tableTop + 7);
    doc.text('Period', 100, tableTop + 7);
    doc.text('Iznos', 165, tableTop + 7);

    // Table content
    const membershipLabel = membershipType === 'mentorship' ? 'Mentorship Program (3 mjeseca)' : 'Premium Trade Signali (1 mjesec)';
    const period = `${formatDate(paymentDateObj)} - ${formatDate(validUntilObj)}`;
    
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(membershipLabel, 25, tableTop + 20);
    doc.text(period, 100, tableTop + 20);
    doc.setFont('helvetica', 'bold');
    doc.text(`${amount}€`, 165, tableTop + 20);

    // Table border
    doc.setDrawColor(230, 230, 230);
    doc.rect(20, tableTop, 170, 30);
    doc.line(95, tableTop, 95, tableTop + 30);
    doc.line(155, tableTop, 155, tableTop + 30);

    // Total section
    doc.setFillColor(245, 245, 245);
    doc.rect(120, tableTop + 40, 70, 25, 'F');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text('Ukupno:', 125, tableTop + 50);
    
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`${amount}€`, 165, tableTop + 57);

    // Payment status
    doc.setFillColor(34, 197, 94);
    doc.roundedRect(20, tableTop + 45, 50, 15, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PLAĆENO', 30, tableTop + 55);

    // Footer
    doc.setDrawColor(230, 230, 230);
    doc.line(20, 260, 190, 260);
    
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('EM Capital | Forex Trading Signals & Mentorship', 105, 270, { align: 'center' });
    doc.text('Telegram: @emcapitalforexbot | Email: emcapital3@gmail.com', 105, 276, { align: 'center' });
    doc.text('Hvala vam na povjerenju!', 105, 285, { align: 'center' });

    // Generate PDF as base64
    const pdfBase64 = doc.output('datauristring');
    
    console.log('Invoice generated successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      pdf: pdfBase64,
      invoiceNumber 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error generating invoice:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
