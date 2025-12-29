import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useEffect, useState } from "react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax */}
      <div 
        className="absolute inset-0 z-0 will-change-transform"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background z-10" />
      
      {/* Animated Glow Effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[120px] z-10 animate-pulse-slow" />
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-gold-light/10 rounded-full blur-[100px] z-10 animate-float" />

      <div className="container relative z-20 pt-20 pb-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-gold border border-primary/30 mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium text-foreground/90">Aktivno 24/7 • Live Signali</span>
            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-semibold ml-2">NOVO</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight mb-4 animate-slide-up">
            Profesionalni{" "}
            <span className="text-gradient-gold relative">
              Forex Signali
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                <path d="M2 10C50 4 100 2 150 6C200 10 250 4 298 8" stroke="url(#gold-gradient)" strokeWidth="3" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="gold-gradient" x1="0" y1="0" x2="300" y2="0">
                    <stop offset="0%" stopColor="hsl(43, 96%, 56%)" />
                    <stop offset="100%" stopColor="hsl(35, 100%, 50%)" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
            <br />
            <span className="text-foreground/90">za Maksimalnu Zaradu</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "100ms" }}>
            Pridružite se tisućama tradera koji svakodnevno profitiraju s našim premium signalima. 
            <span className="text-primary font-semibold"> 85%+ točnost</span> potvrđena rezultatima.
          </p>

          {/* CTA Button - Single */}
          <div className="flex items-center justify-center mb-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <a href="https://t.me/emcapitalforexbot" target="_blank" rel="noopener noreferrer">
              <Button variant="hero" size="xl" className="group animate-glow">
                Započni Sada
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
          </div>

        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent z-20" />
    </section>
  );
};

export default HeroSection;
