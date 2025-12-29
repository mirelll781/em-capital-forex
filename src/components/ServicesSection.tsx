import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, TrendingUp, Check, X, Video } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import CountdownTimer from "./CountdownTimer";

const ServicesSection = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: card1Ref, isVisible: card1Visible } = useScrollAnimation();
  const { ref: card2Ref, isVisible: card2Visible } = useScrollAnimation();

  return (
    <section className="py-24 md:py-28 relative" id="services">
      <div className="container">
        {/* Header */}
        <div 
          ref={headerRef}
          className={`text-center mb-16 ${headerVisible ? "animate-slide-up" : "opacity-0"}`}
        >
          <span className="inline-block px-4 py-1.5 rounded-full glass-gold border border-primary/20 text-primary font-heading font-semibold text-sm uppercase tracking-wider mb-4">
            🔹 USLUGE
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mt-4 mb-6">
            Odaberi svoju{" "}
            <span className="text-gradient-gold">opciju</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Profesionalni mentorship ili premium signali - izaberi što ti najbolje odgovara.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Mentorship Card */}
          <div 
            ref={card1Ref}
            className={`glass rounded-2xl border border-success/20 p-8 relative overflow-hidden hover-lift hover-glow ${card1Visible ? "animate-slide-right" : "opacity-0"}`}
          >
            {/* Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-success/50 via-success to-success/50" />
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-success" />
              </div>
              <h3 className="text-xl font-heading font-bold text-success">
                Beginner Trading Mentorship
              </h3>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold text-foreground">200 €</span>
              <span className="text-muted-foreground"> / mjesečno</span>
              <p className="text-sm text-muted-foreground mt-1">(3-mjesečni program)</p>
            </div>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              Strukturisan mentorship program namijenjen potpunim početnicima i onima koji žele izgraditi stabilne osnove tradinga.
            </p>

            {/* Highlighted Zoom Feature */}
            <div className="mb-6 p-4 rounded-xl bg-success/10 border border-success/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                  <Video className="w-4 h-4 text-success" />
                </div>
                <p className="font-semibold text-success">Sedmični Zoom Pozivi</p>
              </div>
              <p className="text-sm text-muted-foreground pl-11">
                Svake sedmice live analize tržišta, Q&A sesije i direktna podrška u realnom vremenu.
              </p>
            </div>

            <div className="mb-6">
              <p className="font-semibold text-foreground mb-3">Program uključuje:</p>
              <ul className="space-y-2">
                {[
                  "Jasan plan učenja (od osnova do samostalnog tradinga)",
                  "Jednostavnu trading strategiju (bez preopterećenja)",
                  "Upravljanje rizikom (0.5–1.5% po trejdu)",
                  "Psihologiju tradinga za početnike",
                  "Analizu tvojih trejdova",
                  "Premium signale kao edukativnu podršku",
                  "Direktnu komunikaciju i podršku"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <p className="font-semibold text-foreground mb-3">Program NIJE za:</p>
              <ul className="space-y-2">
                {[
                  "one koji traže brzu zaradu",
                  "one koji ne poštuju stop loss",
                  "one koji nisu spremni učiti"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <X className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <CountdownTimer />

            <a href="https://t.me/emcapitalforexbot" target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full bg-success hover:bg-success/90 text-success-foreground group">
                Prijava za Mentorship
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
          </div>

          {/* Premium Signals Card */}
          <div 
            ref={card2Ref}
            className={`glass rounded-2xl border border-primary/20 p-8 relative overflow-hidden hover-lift hover-glow ${card2Visible ? "animate-slide-left" : "opacity-0"}`}
            style={{ animationDelay: "0.2s" }}
          >
            {/* Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-bold text-primary">
                Premium Trade Setupi
              </h3>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold text-foreground">49 €</span>
              <span className="text-muted-foreground"> / mjesečno</span>
            </div>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              Premium trade setupi za one koji žele jasne i strukturirane trade ideje, uz striktan risk management.
            </p>

            <div className="mb-6">
              <p className="font-semibold text-foreground mb-3">Šta dobijaš:</p>
              <ul className="space-y-2">
                {[
                  "Intraday i scalp setupi",
                  "Jasno definisan entry, SL i TP",
                  "Fokus na kvalitet, ne kvantitet",
                  "Bez dnevnog limita, bez prekomjernog trejdanja"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-muted-foreground mb-6 italic">
              Signali nisu finansijski savjet i ne garantuju profit.
            </p>

            <a href="https://t.me/emcapitalforexbot" target="_blank" rel="noopener noreferrer" className="block">
              <Button variant="hero" className="w-full group">
                Pristup Signalima
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
