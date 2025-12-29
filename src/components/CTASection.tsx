import { Button } from "@/components/ui/button";
import { ArrowRight, Send, Sparkles } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const CTASection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow" />
      
      {/* Floating decorative elements */}
      <div className="absolute top-1/4 left-20 w-20 h-20 border border-primary/20 rounded-full animate-float" />
      <div className="absolute bottom-1/4 right-20 w-32 h-32 border border-primary/10 rounded-full animate-float" style={{ animationDelay: "3s" }} />
      <div className="absolute top-1/3 right-1/4 w-16 h-16 border border-primary/15 rounded-full animate-rotate-slow opacity-50" />
      
      <div className="container relative z-10">
        <div 
          ref={ref}
          className={`max-w-4xl mx-auto text-center glass rounded-3xl border border-primary/20 p-12 md:p-16 shadow-elevated hover-glow transition-all duration-500 ${isVisible ? "animate-scale-in" : "opacity-0"}`}
        >
          {/* Decorative corner elements */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary/30 rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary/30 rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary/30 rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary/30 rounded-br-lg" />
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-gold border border-primary/30 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Limitirana Ponuda</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6">
            Spremni za{" "}
            <span className="text-gradient-gold">profit</span>?
          </h2>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Pridružite se već danas i počnite primati profesionalne signale direktno na svoj Telegram. 
            <span className="text-primary font-semibold"> Prvi tjedan je potpuno besplatan!</span>
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <a href="https://t.me/emcapitalforexbot" target="_blank" rel="noopener noreferrer">
              <Button variant="hero" size="xl" className="group animate-glow">
                <Send className="w-5 h-5 mr-2" />
                Pridruži se Sada
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              Bez kreditne kartice
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              Otkaži kad god želiš
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              Instant pristup
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
