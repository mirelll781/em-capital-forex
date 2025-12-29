import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen } from "lucide-react";

const IntroSection = () => {
  return (
    <section className="pt-0 pb-8 md:pb-12 relative">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-primary mb-3">
            UVOD
          </h2>
          
          <p className="text-xl md:text-2xl font-medium text-foreground mb-4">
            Forex trading - jednostavno, strukturirano i bez lažnih obećanja
          </p>
          
          <p className="text-muted-foreground text-base md:text-lg mb-6 max-w-3xl mx-auto leading-relaxed">
            EM Capital je trading mentorship i signal servis namijenjen početnicima koji žele naučiti kako pravilno upravljati rizikom i razviti disciplinu potrebnu za dugoročnu konzistentnost na forex tržištu.
          </p>
          
          {/* Features */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
            <div className="flex items-center gap-2 text-foreground">
              <span className="w-3 h-3 rounded-full bg-success" />
              <span className="font-medium">Beginner Trading Mentorship</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <span className="w-3 h-3 rounded-full bg-primary" />
              <span className="font-medium">Premium Trade Setupi</span>
            </div>
          </div>
          
          {/* Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="https://t.me/emcapitalforexbot" target="_blank" rel="noopener noreferrer">
              <Button variant="hero" size="lg" className="group">
                <BookOpen className="w-4 h-4 mr-2" />
                Prijava za Mentorship
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
            <a href="#results">
              <Button variant="hero-outline" size="lg">
                Pregled Signala
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntroSection;
