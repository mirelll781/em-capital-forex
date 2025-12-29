import { Bitcoin, TrendingUp, BarChart3, Gem } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const markets = [
  {
    icon: Gem,
    name: "XAUUSD",
    label: "Zlato",
    description: "Premium signali za trgovanje zlatom",
    color: "from-yellow-500 to-amber-600",
    stats: "15+ signala/tjedan",
  },
  {
    icon: Bitcoin,
    name: "Crypto",
    label: "Kriptovalute",
    description: "BTC, ETH i ostale kriptovalute",
    color: "from-orange-500 to-yellow-500",
    stats: "24/7 praćenje",
  },
  {
    icon: TrendingUp,
    name: "Forex",
    label: "Valutni parovi",
    description: "EUR/USD, GBP/USD i svi glavni parovi",
    color: "from-emerald-500 to-teal-500",
    stats: "20+ parova",
  },
  {
    icon: BarChart3,
    name: "Indices",
    label: "Indeksi",
    description: "US30, NAS100, SPX500 i drugi",
    color: "from-blue-500 to-indigo-500",
    stats: "Sve sesije",
  },
];

const MarketsSection = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background" />
      
      <div className="container relative z-10">
        <div 
          ref={headerRef}
          className={`text-center mb-12 ${headerVisible ? "animate-fade-in" : "opacity-0"}`}
        >
          <span className="inline-block px-4 py-1.5 rounded-full glass-gold border border-primary/20 text-primary font-heading font-semibold text-sm uppercase tracking-wider mb-4">
            Naša Tržišta
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mt-4 mb-4">
            Signali za <span className="text-gradient-gold">sva tržišta</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Pokrivamo najpopularnija tržišta s profesionalnim analizama i signalima
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {markets.map((market, index) => (
            <MarketCard key={market.name} market={market} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface MarketCardProps {
  market: typeof markets[0];
  index: number;
}

const MarketCard = ({ market, index }: MarketCardProps) => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`group relative p-6 rounded-2xl glass border border-border hover:border-primary/30 transition-all duration-500 hover-lift ${isVisible ? "animate-scale-in" : "opacity-0"}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Glow effect on hover */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${market.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      
      <div className="relative z-10">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${market.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
          <market.icon className="w-8 h-8 text-white" />
        </div>
        
        <h3 className="text-xl font-heading font-bold mb-1">{market.name}</h3>
        <p className="text-primary text-sm font-semibold mb-2">{market.label}</p>
        <p className="text-muted-foreground text-sm leading-relaxed mb-3">{market.description}</p>
        
        {/* Stats badge */}
        <span className="inline-block px-3 py-1 rounded-full bg-secondary/50 text-xs font-medium text-foreground/70">
          {market.stats}
        </span>
      </div>
    </div>
  );
};

export default MarketsSection;
