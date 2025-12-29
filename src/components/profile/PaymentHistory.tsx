import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Receipt, Calendar, CreditCard, ChevronDown, ChevronUp, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Payment {
  id: string;
  membership_type: string;
  amount: number;
  payment_date: string;
  valid_until: string;
}

interface PaymentHistoryProps {
  userId: string;
  currentMembershipType: string | null;
  paidAt: string | null;
  paidUntil: string | null;
}

export default function PaymentHistory({ userId, currentMembershipType, paidAt, paidUntil }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentHistory();
  }, [userId]);

  const fetchPaymentHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', userId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bs-BA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getMembershipLabel = (type: string) => {
    return type === 'mentorship' ? 'Mentorship' : 'Premium Signali';
  };

  const downloadInvoice = async (payment: Payment) => {
    setDownloadingId(payment.id);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Morate biti prijavljeni');
        return;
      }

      const response = await supabase.functions.invoke('generate-invoice', {
        body: {
          paymentDate: payment.payment_date,
          membershipType: payment.membership_type,
          amount: payment.amount,
          validUntil: payment.valid_until
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { pdf, invoiceNumber } = response.data;

      // Create download link
      const link = document.createElement('a');
      link.href = pdf;
      link.download = `EM-Capital-Faktura-${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Faktura preuzeta');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Greška pri preuzimanju fakture');
    } finally {
      setDownloadingId(null);
    }
  };

  // Create a display list that includes current membership if exists
  const displayPayments = paidAt && currentMembershipType ? [
    {
      id: 'current',
      membership_type: currentMembershipType,
      amount: currentMembershipType === 'mentorship' ? 200 : 49,
      payment_date: paidAt,
      valid_until: paidUntil || ''
    },
    ...payments.filter(p => p.payment_date !== paidAt)
  ] : payments;

  const hasHistory = displayPayments.length > 0;

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Receipt className="w-5 h-5 text-primary" />
          Historija Plaćanja
        </h3>
        {hasHistory && (
          isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )
        )}
      </button>

      {!hasHistory && !isLoading && (
        <p className="text-muted-foreground text-sm mt-4">
          Još nemate zabilježenih uplata.
        </p>
      )}

      {isExpanded && hasHistory && (
        <div className="mt-4 space-y-3">
          {displayPayments.map((payment, index) => (
            <div 
              key={payment.id}
              className={`p-4 rounded-xl border ${
                index === 0 
                  ? 'bg-primary/5 border-primary/20' 
                  : 'bg-muted/30 border-border'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">
                  {getMembershipLabel(payment.membership_type)}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${index === 0 ? 'text-primary' : ''}`}>
                    {payment.amount}€
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadInvoice(payment);
                    }}
                    disabled={downloadingId === payment.id}
                  >
                    {downloadingId === payment.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CreditCard className="w-3 h-3" />
                  <span>Uplata: {formatDate(payment.payment_date)}</span>
                </div>
                {payment.valid_until && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Do: {formatDate(payment.valid_until)}</span>
                  </div>
                )}
              </div>

              {index === 0 && (
                <span className="inline-block mt-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  Trenutna
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {!isExpanded && hasHistory && (
        <p className="text-muted-foreground text-sm mt-2">
          Kliknite za pregled {displayPayments.length} {displayPayments.length === 1 ? 'uplate' : 'uplata'}
        </p>
      )}
    </div>
  );
}
