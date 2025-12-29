import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Marko P.",
    role: "Profesionalni Trader",
    content: "Signali su nevjerojatno precizni. U prva 3 mjeseca udvostručio sam svoj račun prateći njihove preporuke. Topla preporuka svima!",
    rating: 5,
    profit: "+127%",
    avatar: "MP",
  },
  {
    name: "Ana K.",
    role: "Početnica u Tradingu",
    content: "Kao početnica, bila sam skeptična, ali edukativni sadržaj i jasni signali pomogli su mi da naučim i zaradim istovremeno.",
    rating: 5,
    profit: "+45%",
    avatar: "AK",
  },
  {
    name: "Ivan S.",
    role: "Part-time Trader",
    content: "Odličan servis! Signali dolaze na vrijeme, a podrška je uvijek tu kad zatrebam. Najbolja investicija koju sam napravio.",
    rating: 5,
    profit: "+89%",
    avatar: "IS",
  },
  {
    name: "Petra M.",
    role: "Full-time Traderica",
    content: "Koristim njihove signale već godinu dana. Konzistentni rezultati i profesionalan pristup. VIP grupa je fantastična zajednica.",
    rating: 5,
    profit: "+156%",
    avatar: "PM",
  },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 text-primary/10">
        <Quote className="w-32 h-32" />
      </div>
      <div className="absolute bottom-20 right-10 text-primary/10 rotate-180">
        <Quote className="w-32 h-32" />
      </div>
      
      <div className="container relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <span className="inline-block px-4 py-1.5 rounded-full glass-gold border border-primary/20 text-primary font-heading font-semibold text-sm uppercase tracking-wider mb-4">
            Iskustva
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mt-4 mb-6">
            Što kažu naši{" "}
            <span className="text-gradient-gold">članovi</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Pridružite se tisućama zadovoljnih tradera koji već profitiraju s našim signalima.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="group p-8 rounded-2xl glass border border-border hover:border-primary/30 transition-all duration-500 hover:shadow-gold/10 hover:shadow-2xl animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-primary/30 mb-4" />
              
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>
              
              <p className="text-foreground/90 text-lg leading-relaxed mb-6">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-gold-dark flex items-center justify-center text-primary-foreground font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-heading font-semibold">{testimonial.name}</p>
                    <p className="text-muted-foreground text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-success font-heading font-bold text-2xl">{testimonial.profit}</p>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">profit</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
