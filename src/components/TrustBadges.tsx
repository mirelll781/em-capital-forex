import { Shield, Award, Clock, Headphones } from "lucide-react";

const badges = [
  { icon: Shield, label: "100% Sigurno" },
  { icon: Award, label: "Certificirani Analitičari" },
  { icon: Clock, label: "24/7 Aktivno" },
  { icon: Headphones, label: "Premium Podrška" },
];

const TrustBadges = () => {
  return (
    <section className="py-8 border-y border-border/50 bg-secondary/20 backdrop-blur-sm">
      <div className="container">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {badges.map((badge, index) => (
            <div
              key={badge.label}
              className="flex items-center gap-3 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <badge.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground/80">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
