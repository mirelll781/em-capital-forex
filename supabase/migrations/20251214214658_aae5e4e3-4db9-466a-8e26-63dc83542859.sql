-- Create table for storing signal results
CREATE TABLE IF NOT EXISTS public.signal_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  signal_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  pair TEXT NOT NULL, -- e.g., XAUUSD, BTCUSD, EURUSD
  direction TEXT NOT NULL CHECK (direction IN ('BUY', 'SELL')),
  entry_price DECIMAL(20,5) NOT NULL,
  stop_loss DECIMAL(20,5),
  take_profit DECIMAL(20,5),
  exit_price DECIMAL(20,5),
  result TEXT CHECK (result IN ('WIN', 'LOSS', 'BREAKEVEN', 'PENDING')),
  profit_pips DECIMAL(10,2),
  profit_percent DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.signal_results ENABLE ROW LEVEL SECURITY;

-- Everyone can view signal results (public data for transparency)
CREATE POLICY "Signal results are publicly viewable"
ON public.signal_results FOR SELECT
USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_signal_results_updated_at
BEFORE UPDATE ON public.signal_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_signal_results_date ON public.signal_results(signal_date DESC);
CREATE INDEX idx_signal_results_result ON public.signal_results(result);