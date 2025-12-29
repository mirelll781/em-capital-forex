import { TrendingUp, Shield, Zap, Users, BarChart3, Clock } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const features = [
  {
    icon: TrendingUp,
    title: "Precizni Signali",
    description: "Naši signali imaju prosječnu točnost od 85%+ temeljenu na tehničkoj i fundamentalnoj analizi.",
  },
  {
    icon: Shield,
    title: "Upravljanje Rizikom",
    description: "Svaki signal dolazi s jasnim Stop Loss i Take Profit razinama za zaštitu vašeg kapitala.",
  },
  {
    icon: Zap,
    title: "Instant Obavijesti",
    description: "Primajte signale u realnom vremenu putem Telegrama čim se pojavi prilika na tržištu.",
  },
  {
    icon: Users,
    title: "VIP Zajednica",
    description: "Pristup ekskluzivnoj grupi tradera s edukativnim sadržajem i dnevnim analizama.",
  },
  {
    icon: BarChart3,
    title: "Dnevna Analiza",
    description: "Svakodnevni pregled tržišta i potencijalnih prilika od naših iskusnih analitičara.",
  },
  {
    icon: Clock,
    title: "24/7 Podrška",
    description: "Naš tim je uvijek dostupan za odgovoriti na vaša pitanja i pomoći vam u trgovanju.",
  },
];

const FeaturesSection = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();

  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      
      <div className="container relative z-10">
        <div 
          ref={headerRef}
          className={`text-center mb-16 ${headerVisible ? "animate-fade-in" : "opacity-0"}`}
        >
          <span className="text-primary font-heading font-semibold text-sm uppercase tracking-wider">
            Zašto Mi
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mt-4 mb-6">
            Sve što trebate za{" "}
            <span className="text-gradient-gold">uspješno trgovanje</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Naš premium servis pruža sve alate i podršku potrebnu za maksimiziranje vaših profita na Forex tržištu.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface FeatureCardProps {
  feature: typeof features[0];
  index: number;
}

const FeatureCard = ({ feature, index }: FeatureCardProps) => {
  const { ref, isVisible } = useScrollAnimation();
  
  return (
    <div
      ref={ref}
      className={`group p-8 rounded-2xl bg-gradient-to-b from-card to-background border border-border hover:border-primary/30 transition-all duration-500 hover-lift ${isVisible ? "animate-scale-in" : "opacity-0"}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
        <feature.icon className="w-7 h-7 text-primary" />
      </div>
      <h3 className="text-xl font-heading font-semibold mb-3">{feature.title}</h3>
      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
    </div>
  );
};

export default FeaturesSection;
