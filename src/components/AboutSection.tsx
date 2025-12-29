const AboutSection = () => {
  return (
    <section className="py-12 md:py-16 relative">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-primary mb-3">
              O EM CAPITAL
            </h2>
            <p className="text-xl md:text-2xl font-medium text-foreground">
              Ko stoji iza EM Capital?
            </p>
          </div>
          
          {/* Content */}
          <div className="glass rounded-2xl border border-primary/10 p-8 md:p-10 space-y-4">
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              EM Capital je nezavisni trading projekat fokusiran na disciplinski pristup trgovanju, upravljanje rizikom i realna očekivanja.
            </p>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              Cilj projekta nije brzo bogaćenje, već izgradnja znanja i procesa koji omogućava dugoročno napredovanje u tradingu.
            </p>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              Rad se zasniva na iskustvu iz prop-firm okruženja i primjeni jednostavnih, ponovljivih pravila u realnim tržišnim uslovima.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
