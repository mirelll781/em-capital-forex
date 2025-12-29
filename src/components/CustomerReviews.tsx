import { Star, CheckCircle2, ThumbsUp } from "lucide-react";
import { useState } from "react";

const reviews = [
  {
    name: "Luka M.",
    date: "12.12.2024.",
    verified: true,
    rating: 5,
    title: "Najbolji signali koje sam koristio",
    content: "Već 4 mjeseca pratim signale i rezultati su odlični. Entry i exit točke su precizne, a risk management je na razini. Definitivno vrijedi svake lipe!",
    helpful: 24,
    platform: "Telegram",
  },
  {
    name: "Tomislav R.",
    date: "08.12.2024.",
    verified: true,
    rating: 5,
    title: "Profesionalan pristup tradingu",
    content: "Odlična komunikacija, signali dolaze na vrijeme sa svim potrebnim informacijama. SL i TP su jasno definirani. Preporučujem svima koji žele ozbiljno tradati.",
    helpful: 18,
    platform: "Telegram",
  },
  {
    name: "Maja B.",
    date: "05.12.2024.",
    verified: true,
    rating: 5,
    title: "Savršeno za početnike",
    content: "Kao početnica u forexu bila sam nervozna, ali podrška u grupi je nevjerojatna. Svi su spremni pomoći i objasniti. Za mjesec dana naučila sam više nego sama u pola godine.",
    helpful: 31,
    platform: "Telegram",
  },
  {
    name: "Dario K.",
    date: "01.12.2024.",
    verified: true,
    rating: 4,
    title: "Solidni rezultati na XAU/USD",
    content: "Fokusiram se samo na gold signale i zadovoljan sam. Ima dana kad ne upalji, ali ukupno sam u plusu. Transparentnost rezultata je ono što me privuklo.",
    helpful: 15,
    platform: "Telegram",
  },
  {
    name: "Nikola P.",
    date: "28.11.2024.",
    verified: true,
    rating: 5,
    title: "VIP članstvo se isplati",
    content: "Upgradao sam na VIP nakon mjesec dana i ne žalim. Ekskluzivni signali i pristup adminu za pitanja su game changer. ROI je već pozitivan.",
    helpful: 22,
    platform: "Telegram",
  },
  {
    name: "Sara T.",
    date: "25.11.2024.",
    verified: true,
    rating: 5,
    title: "Konačno pouzdani signali",
    content: "Probala sam više grupa prije ove i ovo je jedina koja drži što obeća. Nema lažnih obećanja, realni ciljevi i iskrena komunikacija. Hvala timu!",
    helpful: 27,
    platform: "Telegram",
  },
];

const CustomerReviews = () => {
  const [visibleReviews, setVisibleReviews] = useState(4);
  const [helpfulClicked, setHelpfulClicked] = useState<Set<number>>(new Set());

  const handleHelpful = (index: number) => {
    setHelpfulClicked(prev => new Set(prev).add(index));
  };

  const showMore = () => {
    setVisibleReviews(reviews.length);
  };

  const averageRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <section id="reviews" className="py-24 relative overflow-hidden bg-secondary/30">
      <div className="container relative z-10">
        {/* Header with stats */}
        <div className="text-center mb-12 animate-fade-in">
          <span className="inline-block px-4 py-1.5 rounded-full glass-gold border border-primary/20 text-primary font-heading font-semibold text-sm uppercase tracking-wider mb-4">
            Recenzije
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mt-4 mb-6">
            Što kažu naši{" "}
            <span className="text-gradient-gold">klijenti</span>
          </h2>
          
          {/* Rating summary */}
          <div className="flex items-center justify-center gap-8 mt-8 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-5xl font-heading font-bold text-primary">{averageRating}</span>
              <div className="text-left">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm">od 5 zvjezdica</p>
              </div>
            </div>
            <div className="h-12 w-px bg-border hidden sm:block" />
            <div className="text-center">
              <p className="text-3xl font-heading font-bold">{reviews.length}+</p>
              <p className="text-muted-foreground text-sm">verificiranih recenzija</p>
            </div>
            <div className="h-12 w-px bg-border hidden sm:block" />
            <div className="text-center">
              <p className="text-3xl font-heading font-bold text-success">98%</p>
              <p className="text-muted-foreground text-sm">zadovoljnih klijenata</p>
            </div>
          </div>
        </div>

        {/* Reviews grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {reviews.slice(0, visibleReviews).map((review, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/80 to-gold-dark flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {review.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{review.name}</p>
                      {review.verified && (
                        <span className="flex items-center gap-1 text-xs text-success">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verificirano
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs">{review.date} • {review.platform}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < review.rating ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`} 
                    />
                  ))}
                </div>
              </div>

              {/* Content */}
              <h4 className="font-heading font-semibold mb-2">{review.title}</h4>
              <p className="text-foreground/80 text-sm leading-relaxed mb-4">
                {review.content}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <button
                  onClick={() => handleHelpful(index)}
                  disabled={helpfulClicked.has(index)}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    helpfulClicked.has(index) 
                      ? 'text-primary cursor-default' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${helpfulClicked.has(index) ? 'fill-primary' : ''}`} />
                  Korisno ({review.helpful + (helpfulClicked.has(index) ? 1 : 0)})
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Show more button */}
        {visibleReviews < reviews.length && (
          <div className="text-center mt-8">
            <button
              onClick={showMore}
              className="px-6 py-3 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors font-medium"
            >
              Prikaži više recenzija
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CustomerReviews;
