import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import logo from "@/assets/obsidian-logo.png";

const HeroSection = () => {
  const scrollToPackages = () => {
    document.getElementById("paketi")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[140px] animate-pulse-slow -z-10" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] -z-10" />

      <div className="container px-4 relative z-10 pt-20 pb-12">
        <div className="text-center max-w-3xl mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full" />
              <img
                src={logo}
                alt="Obsidian Logo"
                className="relative w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-[0_0_30px_hsl(var(--primary)/0.4)]"
              />
            </div>
          </div>

          {/* Status badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-gold border border-primary/30 mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium text-foreground/90">Trading · Signali · Mentorstvo</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 animate-slide-up">
            <span className="text-gradient-gold">OBSIDIAN</span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up"
            style={{ animationDelay: "100ms" }}
          >
            Tri jasna programa prilagođena tvom nivou – od prvih koraka u tradingu
            do izgradnje vlastite, profitabilne strategije.
          </p>

          {/* CTA */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up"
            style={{ animationDelay: "200ms" }}
          >
            <Button variant="hero" size="xl" onClick={scrollToPackages} className="group">
              Pogledaj programe
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <a href="https://t.me/emcapitalforexbot" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="xl">
                Kontaktiraj na Telegramu
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;
