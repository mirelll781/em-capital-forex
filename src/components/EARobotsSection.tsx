import { useState, useEffect } from "react";
import { Bot, Smartphone, Monitor, Clock, Mail, CheckCircle, Loader2, Tag, Zap } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const LAUNCH_DATE = new Date("2026-01-01T00:00:00");
const REGULAR_PRICE = 1000;
const DISCOUNT_PRICE = 800;
const DISCOUNT_DAYS = 3;

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const EARobotsSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isLaunched, setIsLaunched] = useState(false);
  const [discountTimeLeft, setDiscountTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = LAUNCH_DATE.getTime() - now.getTime();
      
      if (difference <= 0) {
        setIsLaunched(true);
        
        // Calculate discount end time (3 days after launch)
        const discountEnd = new Date(LAUNCH_DATE.getTime() + DISCOUNT_DAYS * 24 * 60 * 60 * 1000);
        const discountDiff = discountEnd.getTime() - now.getTime();
        
        if (discountDiff > 0) {
          setDiscountTimeLeft({
            days: Math.floor(discountDiff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((discountDiff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((discountDiff / 1000 / 60) % 60),
            seconds: Math.floor((discountDiff / 1000) % 60),
          });
        } else {
          setDiscountTimeLeft(null);
        }
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast({
        title: "Greška",
        description: "Molimo unesite validnu email adresu.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const normalizedEmail = email.trim().toLowerCase();
      
      const { data, error } = await supabase
        .from("ea_robot_subscriptions")
        .insert({ email: normalizedEmail })
        .select("verification_token")
        .single();

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Već ste prijavljeni",
            description: "Ova email adresa je već na listi čekanja. Provjerite inbox za verifikacijski email.",
          });
        } else {
          throw error;
        }
      } else {
        // Send verification email
        const { error: emailError } = await supabase.functions.invoke("verify-ea-subscription", {
          body: { 
            email: normalizedEmail,
            verification_token: data.verification_token 
          },
        });

        if (emailError) {
          console.error("Failed to send verification email:", emailError);
        }

        setIsSubscribed(true);
        toast({
          title: "Provjerite email!",
          description: "Poslali smo vam verifikacijski link. Kliknite na njega da potvrdite prijavu.",
        });
        
        // Send notification to admins (fire and forget)
        supabase.functions.invoke("notify-ea-subscription", {
          body: { email: normalizedEmail },
        }).catch(console.error);
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast({
        title: "Greška",
        description: "Došlo je do greške. Pokušajte ponovo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-2">
        <span className="text-2xl md:text-3xl font-bold text-primary">{value.toString().padStart(2, '0')}</span>
      </div>
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );

  return (
    <section id="ea-robots" className="py-24 relative overflow-hidden">
      <style>{`
        @keyframes pulseGlow {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 20px hsl(var(--primary) / 0.3), 0 0 40px hsl(var(--primary) / 0.2);
          }
          50% {
            transform: scale(1.1);
            box-shadow: 0 0 30px hsl(var(--primary) / 0.5), 0 0 60px hsl(var(--primary) / 0.3), 0 0 80px hsl(var(--primary) / 0.2);
          }
        }
        .pulse-glow-badge {
          animation: pulseGlow 2s ease-in-out infinite;
        }
      `}</style>
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5" />
      
      <div 
        ref={ref}
        className={`container relative transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/20 border-2 border-primary/40 mb-6 pulse-glow-badge">
            <Clock className="w-5 h-5 text-primary" />
            <span className="text-base font-bold text-primary uppercase tracking-wider">
              {isLaunched ? "Sada Dostupno" : "Dostupno od 01.01.2026"}
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            EA <span className="text-gradient-gold">Roboti</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Automatizirano trgovanje na dohvat ruke. Naši Expert Advisor roboti za mobilne i desktop platforme.
          </p>
        </div>

        {/* Countdown Timer */}
        {!isLaunched && (
          <div className="max-w-lg mx-auto mb-12">
            <div className="p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
              <h3 className="text-lg font-heading font-bold text-center mb-4">Do lansiranja:</h3>
              <div className="flex justify-center items-center gap-2 md:gap-4">
                <TimeBlock value={timeLeft.days} label="Dana" />
                <span className="text-2xl text-primary font-bold mt-[-1.5rem]">:</span>
                <TimeBlock value={timeLeft.hours} label="Sati" />
                <span className="text-2xl text-primary font-bold mt-[-1.5rem]">:</span>
                <TimeBlock value={timeLeft.minutes} label="Min" />
                <span className="text-2xl text-primary font-bold mt-[-1.5rem]">:</span>
                <TimeBlock value={timeLeft.seconds} label="Sek" />
              </div>
            </div>
          </div>
        )}

        {/* Pricing Section */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 backdrop-blur-sm relative overflow-hidden">
            {/* Discount Badge */}
            {(discountTimeLeft || !isLaunched) && (
              <div className="absolute -top-1 -right-1">
                <div className="bg-green-500 text-white px-4 py-2 rounded-bl-xl rounded-tr-xl font-bold text-sm flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  -20% POPUST
                </div>
              </div>
            )}
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-6 h-6 text-primary" />
                <h3 className="text-2xl font-heading font-bold">EA Robot Paket</h3>
              </div>
              <p className="text-muted-foreground mb-6">Mobile EA + Desktop EA</p>
              
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="text-2xl text-muted-foreground line-through">${REGULAR_PRICE}</span>
                <span className="text-5xl font-bold text-primary">${DISCOUNT_PRICE}</span>
              </div>
              
              {discountTimeLeft ? (
                <div className="bg-primary/20 rounded-lg p-3 mb-6">
                  <p className="text-sm text-primary font-medium mb-2">⏰ Popust završava za:</p>
                  <div className="flex justify-center gap-2 text-sm font-bold text-primary">
                    <span>{discountTimeLeft.days}d</span>
                    <span>{discountTimeLeft.hours}h</span>
                    <span>{discountTimeLeft.minutes}m</span>
                    <span>{discountTimeLeft.seconds}s</span>
                  </div>
                </div>
              ) : !isLaunched ? (
                <div className="bg-primary/20 rounded-lg p-3 mb-6">
                  <p className="text-sm text-primary font-medium">
                    🎁 Prva 3 dana po promotivnoj cijeni od ${DISCOUNT_PRICE}!
                  </p>
                </div>
              ) : null}
              
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Mobile EA za Android (iOS uskoro)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Desktop EA za MetaTrader</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Doživotne nadogradnje</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Premium podrška</span>
                </li>
              </ul>
              
              {/* Mentorship Discount Banner */}
              <div className="bg-gradient-to-r from-gold/20 to-gold-dark/20 border border-gold/30 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                    <Tag className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gold mb-1">🎓 Mentorship Popust -50%</h4>
                    <p className="text-sm text-muted-foreground">
                      Članovi koji uzmu <span className="text-foreground font-medium">Mentorship paket</span> na minimalno 3 mjeseca i završe edukaciju ostvaruju <span className="text-gold font-bold">50% popusta</span> na kupovinu EA robota!
                    </p>
                  </div>
                </div>
              </div>
              
              {isLaunched ? (
                <Button size="lg" className="w-full text-lg">
                  Kupi Sada - ${discountTimeLeft ? DISCOUNT_PRICE : REGULAR_PRICE}
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Kupovina dostupna od 01.01.2026.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Mobile EA */}
          <div className="group relative p-8 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
              
              <h3 className="text-2xl font-heading font-bold mb-3">Mobile EA</h3>
              <p className="text-muted-foreground mb-4">
                Automatsko trgovanje direktno s vašeg mobitela. Pratite i kontrolirajte robota bilo gdje, bilo kada.
              </p>
              
              <div className="flex items-center gap-2 text-sm text-primary/80">
                <Bot className="w-4 h-4" />
                <span>Android (iOS uskoro)</span>
              </div>
            </div>
          </div>

          {/* Desktop EA */}
          <div className="group relative p-8 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Monitor className="w-8 h-8 text-primary" />
              </div>
              
              <h3 className="text-2xl font-heading font-bold mb-3">Desktop EA</h3>
              <p className="text-muted-foreground mb-4">
                Profesionalni EA robot za MetaTrader platformu. Napredne strategije i potpuna kontrola.
              </p>
              
              <div className="flex items-center gap-2 text-sm text-primary/80">
                <Bot className="w-4 h-4" />
                <span>Windows & Mac</span>
              </div>
            </div>
          </div>
        </div>

        {/* Email Subscription Form */}
        <div className="mt-16 max-w-md mx-auto">
          <div className="p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
            {isSubscribed ? (
              <div className="text-center py-4">
                <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
                <h4 className="text-lg font-heading font-bold mb-2">Provjerite email!</h4>
                <p className="text-muted-foreground text-sm">
                  Poslali smo vam verifikacijski link. Kliknite na njega da potvrdite prijavu.
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-4">
                  <h4 className="text-lg font-heading font-bold mb-2">Budi prvi koji će saznati</h4>
                  <p className="text-muted-foreground text-sm">
                    Ostavi email i obavijestit ćemo te kada EA roboti budu dostupni.
                  </p>
                </div>
                
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="tvoj@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Prijavi se"
                    )}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EARobotsSection;
