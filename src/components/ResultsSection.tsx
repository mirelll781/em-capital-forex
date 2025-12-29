import { useState } from "react";
import result1 from "@/assets/real-result-1.png";
import result2 from "@/assets/real-result-2.png";
import result3 from "@/assets/real-result-3.png";
import result4 from "@/assets/real-result-4.png";
import result5 from "@/assets/real-result-5.png";
import result6 from "@/assets/real-result-6.png";
import result7 from "@/assets/real-result-7.png";
import result8 from "@/assets/real-result-8.png";
import result9 from "@/assets/real-result-9.png";
import result10 from "@/assets/real-result-10.png";
import result11 from "@/assets/real-result-11.png";
import result12 from "@/assets/real-result-12.png";
import result13 from "@/assets/real-result-13.png";
import result14 from "@/assets/real-result-14.png";
import result15 from "@/assets/real-result-15.png";
import result16 from "@/assets/real-result-16.png";
import result17 from "@/assets/real-result-17.png";
import result18 from "@/assets/real-result-18.png";
import result19 from "@/assets/real-result-19.png";
import result20 from "@/assets/real-result-20.png";
import result21 from "@/assets/real-result-21.png";
import result22 from "@/assets/real-result-22.png";
import result23 from "@/assets/real-result-23.png";
import { TrendingUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const results = [
  {
    image: result10,
    title: "XAUUSD Buy",
    description: "+3,254.00$ profit",
  },
  {
    image: result11,
    title: "CADJPY Buy",
    description: "+4,033.68$ profit",
  },
  {
    image: result12,
    title: "XAUUSD Sell",
    description: "+2,976.00$ profit",
  },
  {
    image: result13,
    title: "XAUUSD Buy",
    description: "+4,219.50$ profit",
  },
  {
    image: result14,
    title: "XAUUSD Buy",
    description: "+7,896.00$ profit",
  },
  {
    image: result15,
    title: "XAUUSD Buy",
    description: "+936.30$ profit",
  },
  {
    image: result16,
    title: "XAUUSD Buy",
    description: "+936.30$ profit",
  },
  {
    image: result1,
    title: "XAUUSD Buy",
    description: "+117.52$ profit",
  },
  {
    image: result2,
    title: "XAUUSD Sell",
    description: "+444.08$ profit",
  },
  {
    image: result3,
    title: "XAUUSD Sell",
    description: "+18.57$ profit",
  },
  {
    image: result4,
    title: "XAUUSD Buy",
    description: "Profitabilan trade",
  },
  {
    image: result5,
    title: "Buy Limit Nalozi",
    description: "Postavljeni signali",
  },
  {
    image: result6,
    title: "BTCUSD Buy",
    description: "+17.87$ profit",
  },
  {
    image: result7,
    title: "BTCUSD Sell",
    description: "+42.61$ profit",
  },
  {
    image: result8,
    title: "GOLD Sell",
    description: "+320.60$ profit",
  },
  {
    image: result9,
    title: "BTCUSD Sell",
    description: "+76.13$ profit",
  },
  {
    image: result17,
    title: "XAUUSD Buy",
    description: "+4,231.98$ profit",
  },
  {
    image: result18,
    title: "XAUUSD Sell",
    description: "+801.00$ profit",
  },
  {
    image: result19,
    title: "USDJPY & XAUUSD Sell",
    description: "+3,007.14$ profit",
  },
  {
    image: result20,
    title: "XAUUSD Buy",
    description: "+13,097.80$ profit",
  },
  {
    image: result21,
    title: "BTCUSD Buy",
    description: "+9,925.00$ profit",
  },
  {
    image: result22,
    title: "XAUUSD Buy",
    description: "+4,159.34$ profit",
  },
  {
    image: result23,
    title: "XAUUSD Buy",
    description: "+3,047.87$ profit",
  },
];

const INITIAL_DISPLAY_COUNT = 9;

const ResultsSection = () => {
  const [showAll, setShowAll] = useState(false);
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  
  const displayedResults = showAll ? results : results.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMore = results.length > INITIAL_DISPLAY_COUNT;

  return (
    <section id="rezultati" className="py-24 bg-gradient-to-b from-background via-secondary/30 to-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>
      
      <div className="container relative z-10">
        <div 
          ref={headerRef}
          className={`text-center mb-16 ${headerVisible ? "animate-slide-up" : "opacity-0"}`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-pulse-subtle">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Dokazani Rezultati</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Pogledaj{" "}
            <span className="text-gradient-gold">Rezultate</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Naši članovi ostvaruju konstantne profite. Evo dokaza naših uspješnih signala.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedResults.map((result, index) => (
            <ResultCard key={index} result={result} index={index} />
          ))}
        </div>

        {hasMore && !showAll && (
          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowAll(true)}
              className="gap-2 group border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-300"
            >
              Prikaži više rezultata
              <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform duration-300" />
            </Button>
          </div>
        )}
        
        {showAll && (
          <div className="text-center mt-12">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setShowAll(false)}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              Prikaži manje
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

interface ResultCardProps {
  result: typeof results[0];
  index: number;
}

const ResultCard = ({ result, index }: ResultCardProps) => {
  const { ref, isVisible } = useScrollAnimation();
  
  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden rounded-2xl border border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 hover-lift ${isVisible ? "animate-scale-in" : "opacity-0"}`}
      style={{ animationDelay: `${(index % 3) * 0.1}s` }}
    >
      <div className="overflow-hidden">
        <img
          src={result.image}
          alt={result.title}
          className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-heading font-semibold mb-1">
          {result.title}
        </h3>
        <p className="text-primary font-medium">{result.description}</p>
      </div>
    </div>
  );
};

export default ResultsSection;
