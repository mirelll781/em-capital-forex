import { useEffect, useState } from "react";
import { Bot, Smartphone, Monitor, Clock, CheckCircle, Zap } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { Button } from "@/components/ui/button";

const LAUNCH_DATE = new Date("2026-01-01T00:00:00");
const PRICE = 1000;

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const EARobotsSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isLaunched, setIsLaunched] = useState(false);
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = LAUNCH_DATE.getTime() - now.getTime();
      
      if (difference <= 0) {
        setIsLaunched(true);
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
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-6 h-6 text-primary" />
                <h3 className="text-2xl font-heading font-bold">EA Robot Paket</h3>
              </div>
              <p className="text-muted-foreground mb-6">Mobile EA + Desktop EA</p>
              
              <div className="flex items-center justify-center mb-6">
                <span className="text-5xl font-bold text-primary">${PRICE}</span>
              </div>
              
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
              
              {isLaunched ? (
                <Button size="lg" className="w-full text-lg">
                  Kupi Sada - ${PRICE}
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

      </div>
    </section>
  );
};

export default EARobotsSection;
