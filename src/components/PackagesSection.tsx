import { Button } from "@/components/ui/button";
import { Check, Crown, Users, BarChart3, ArrowRight } from "lucide-react";

const packages = [
  {
    id: "mentorship",
    icon: Crown,
    badge: "Najkompletniji program",
    title: "Mentorship Program",
    subtitle: "Individualni pristup do uspjeha",
    price: "300€",
    priceNote: "jednokratno",
    intro:
      "Ovaj mentorship program je osmišljen za sve koji žele ozbiljno da pristupe trgovanju i izgrade vlastitu, profitabilnu strategiju. Program uključuje minimum 20 individualnih časova, uz mogućnost dodatnih sesija po potrebi – sve u skladu s tvojim napretkom i ciljevima.",
    bulletsTitle: "Tokom mentorstva ćeš:",
    bullets: [
      "Naučiti provjerenu trading strategiju korak po korak",
      "Razumjeti kako funkcioniše tržište i kako donositi pravilne odluke",
      "Dobiti pomoć pri kreiranju vlastitog trading plana i strategije",
      "Razviti disciplinu i mindset potreban za dugoročan uspjeh",
    ],
    outro:
      "Uz to, dobijaš punu podršku tokom cijelog procesa – nisam tu samo da te učim, već da te vodim dok ne postaneš samostalan i siguran trader. Ovo nije teorija – ovo je praktičan rad, prilagođen tebi.",
    ctaTopic: "mentorship",
    ctaLabel: "Prijavi se za Mentorship",
    accent: "from-primary to-primary-glow",
    highlighted: true,
  },
  {
    id: "vip",
    icon: Users,
    badge: "Live trading iskustvo",
    title: "VIP Trading Grupa",
    subtitle: "Live trading i realni rezultati",
    price: "70€",
    priceNote: "mjesečno",
    intro:
      "VIP grupa je namijenjena svima koji žele biti u direktnom kontaktu sa tržištem i učiti kroz real-time trading iskustvo.",
    bulletsTitle: "Unutar VIP grupe dobijaš:",
    bullets: [
      "Svakodnevne LIVE pozive gdje zajedno analiziramo tržište",
      "Traženje i objašnjavanje najboljih setupa u realnom vremenu",
      "Zajedničko otvaranje i vođenje trejdova",
      "Precizne analize + trading signale",
      "Jasna objašnjenja zašto ulazimo u određene pozicije",
    ],
    outro:
      "Ovo nije samo grupa za signale – ovo je mjesto gdje učiš kako razmišljati kao trader i donositi odluke zajedno sa mnom. Cilj je da ne pratiš slijepo, nego da razumiješ svaki potez i s vremenom postaneš samostalan. Uz sve to, imaš stalnu podršku i komunikaciju, kako bi maksimalno iskoristio svaku priliku na tržištu.",
    ctaTopic: "vip",
    ctaLabel: "Pridruži se VIP Grupi",
    accent: "from-amber-500 to-primary",
    highlighted: false,
  },
  {
    id: "standard",
    icon: BarChart3,
    badge: "Idealno za početnike",
    title: "Standard Trading Grupa",
    subtitle: "Analize i vođeni pristup tržištu",
    price: "20€",
    priceNote: "mjesečno",
    intro:
      "Standard grupa je idealna za sve koji žele pratiti tržište uz stručne smjernice, bez potrebe za stalnim aktivnim učešćem.",
    bulletsTitle: "Unutar grupe dobijaš:",
    bullets: [
      "Redovne analize tržišta sa jasno označenim nivoima i mogućim setupima",
      "Live pozive gdje zajedno prolazimo kroz tržište i objašnjavamo ključne prilike",
      "Jednostavno i jasno objašnjenje market strukture",
      "Smjernice koje ti pomažu da razumiješ kretanje cijene",
    ],
    bulletsTitle2: "Ova grupa je savršen izbor ako želiš:",
    bullets2: [
      "Biti u toku sa tržištem",
      "Učiti kroz analize bez preopterećenja",
      "Postepeno graditi svoje znanje i sigurnost",
    ],
    outro:
      "Fokus je na kvalitetnim analizama i razumijevanju tržišta, bez nepotrebnog komplikovanja.",
    ctaTopic: "standard",
    ctaLabel: "Pridruži se Standard Grupi",
    accent: "from-muted-foreground to-primary",
    highlighted: false,
  },
];

const TELEGRAM_URL = "https://t.me/obsidianowner";

const PackagesSection = () => {

  return (
    <section id="paketi" className="relative py-20 md:py-28">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />

      <div className="container px-4">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-gold border border-primary/30 mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-foreground/90">Tri jasna programa, jedan cilj</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4">
            Odaberi svoj <span className="text-gradient-gold">put</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            Bilo da tek počinješ ili želiš ozbiljno unaprijediti svoj trading – ovdje ćeš pronaći program koji ti odgovara.
          </p>
        </div>

        {/* Package cards stacked */}
        <div className="space-y-12 md:space-y-16 max-w-5xl mx-auto">
          {packages.map((pkg, index) => {
            const Icon = pkg.icon;
            return (
              <article
                key={pkg.id}
                id={pkg.id}
                className={`relative rounded-3xl border transition-all duration-500 overflow-hidden ${
                  pkg.highlighted
                    ? "border-primary/40 bg-gradient-to-br from-card via-card to-primary/5 shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.4)]"
                    : "border-border bg-card/50 hover:border-primary/30"
                }`}
              >
                {pkg.highlighted && (
                  <div className="absolute top-0 right-0 px-5 py-2 rounded-bl-2xl bg-gradient-to-r from-primary to-primary-glow text-primary-foreground text-xs font-bold tracking-wider uppercase">
                    Preporučeno
                  </div>
                )}

                <div className="grid md:grid-cols-[1fr_auto] gap-8 p-8 md:p-12">
                  {/* Content */}
                  <div>
                    <div className="flex items-start gap-4 mb-6">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pkg.accent} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <Icon className="w-7 h-7 text-primary-foreground" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold tracking-wider uppercase text-primary mb-1 block">
                          {pkg.badge}
                        </span>
                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold leading-tight">
                          {pkg.title}
                        </h3>
                        <p className="text-base md:text-lg text-muted-foreground mt-1">
                          {pkg.subtitle}
                        </p>
                      </div>
                    </div>

                    <p className="text-foreground/80 leading-relaxed mb-6 text-base md:text-lg">
                      {pkg.intro}
                    </p>

                    <div className="mb-6">
                      <p className="font-semibold text-foreground mb-3">{pkg.bulletsTitle}</p>
                      <ul className="space-y-3">
                        {pkg.bullets.map((bullet) => (
                          <li key={bullet} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-foreground/85">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {pkg.bullets2 && (
                      <div className="mb-6">
                        <p className="font-semibold text-foreground mb-3">{pkg.bulletsTitle2}</p>
                        <ul className="space-y-3">
                          {pkg.bullets2.map((bullet) => (
                            <li key={bullet} className="flex items-start gap-3">
                              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                              <span className="text-foreground/85">{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <p className="text-foreground/75 leading-relaxed italic border-l-2 border-primary/40 pl-4">
                      {pkg.outro}
                    </p>
                  </div>

                  {/* Price + CTA sidebar */}
                  <aside className="md:w-64 flex md:flex-col items-center md:items-stretch justify-between md:justify-center gap-6 md:border-l md:border-border md:pl-8">
                    <div className="text-center">
                      <div className="text-5xl md:text-6xl font-heading font-bold text-gradient-gold leading-none">
                        {pkg.price}
                      </div>
                      <div className="text-sm text-muted-foreground mt-2 uppercase tracking-wider">
                        {pkg.priceNote}
                      </div>
                    </div>

                    <Button
                      asChild
                      variant={pkg.highlighted ? "hero" : "outline"}
                      size="lg"
                      className="group w-full"
                    >
                      <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer">
                        {pkg.ctaLabel}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </Button>

                    <a
                      href={TELEGRAM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-center text-muted-foreground hover:text-primary transition-colors"
                    >
                      Telegram: @obsidianowner →
                    </a>
                  </aside>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PackagesSection;
