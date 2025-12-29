import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { Play } from "lucide-react";

const VideoSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-24 md:py-28 relative" id="video">
      <div className="container">
        <div 
          ref={ref}
          className={`text-center mb-12 ${isVisible ? "animate-slide-up" : "opacity-0"}`}
        >
          <span className="inline-block px-4 py-1.5 rounded-full glass-gold border border-primary/20 text-primary font-heading font-semibold text-sm uppercase tracking-wider mb-4">
            <Play className="w-4 h-4 inline mr-2" />
            VIDEO DEMO
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mt-4 mb-6">
            Kako Funkcionišu{" "}
            <span className="text-gradient-gold">Naši Signali</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Pogledajte kratak video koji demonstrira kako koristimo naše signale za profitabilno trejdanje.
          </p>
        </div>

        {/* Shorts Videos */}
        <div 
          className={`grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8 ${isVisible ? "animate-scale-in" : "opacity-0"}`}
          style={{ animationDelay: "0.2s" }}
        >
          {[
            { id: "th-8rdDqjVI", title: "Signal Demo 1" },
            { id: "Cuf811lkLmU", title: "Signal Demo 2" },
            { id: "tLJdCQli8y0", title: "Signal Demo 3" },
          ].map((video, index) => (
            <div 
              key={video.id}
              className="relative rounded-2xl overflow-hidden glass border border-primary/20 p-2 hover-lift hover-glow"
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-gold-light/20 to-primary/20 rounded-2xl blur-xl opacity-50" />
              
              <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-background/50">
                <iframe
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Regular Video */}
        <div 
          className={`max-w-3xl mx-auto ${isVisible ? "animate-scale-in" : "opacity-0"}`}
          style={{ animationDelay: "0.5s" }}
        >
          <div className="relative rounded-2xl overflow-hidden glass border border-primary/20 p-2 hover-lift hover-glow">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-gold-light/20 to-primary/20 rounded-2xl blur-xl opacity-50" />
            
            <div className="relative aspect-video rounded-xl overflow-hidden bg-background/50">
              <iframe
                src="https://www.youtube.com/embed/KzP-m-pNHhY"
                title="EM Capital Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
