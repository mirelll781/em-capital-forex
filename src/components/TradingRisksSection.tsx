import { AlertTriangle, TrendingDown, Scale, ShieldAlert, Clock, Brain } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const risks = [
  {
    icon: TrendingDown,
    title: "Rizik gubitka kapitala",
    description: "Forex trgovanje uključuje značajan rizik gubitka. Možete izgubiti dio ili čak cijeli uloženi kapital. Nikada ne ulažite novac koji si ne možete priuštiti izgubiti."
  },
  {
    icon: Scale,
    title: "Poluga (Leverage)",
    description: "Korištenje poluge može povećati i dobitke i gubitke. Visoka poluga može dovesti do velikih gubitaka koji prelaze vaš početni ulog."
  },
  {
    icon: Clock,
    title: "Volatilnost tržišta",
    description: "Forex tržište je izuzetno volatilno. Cijene se mogu brzo mijenjati zbog ekonomskih vijesti, geopolitičkih događaja i drugih faktora izvan vaše kontrole."
  },
  {
    icon: Brain,
    title: "Emocionalno trgovanje",
    description: "Strah i pohlepa mogu dovesti do loših odluka. Disciplina i strpljenje su ključni za dugoročan uspjeh u trgovanju."
  },
  {
    icon: ShieldAlert,
    title: "Nema garancije profita",
    description: "Prošli rezultati ne garantiraju buduće performanse. Čak ni najbolji traderi ne mogu garantirati profit na svakom tradeu."
  },
  {
    icon: AlertTriangle,
    title: "Edukacija je ključna",
    description: "Trgovanje bez adekvatnog znanja je kockanje. Uvijek se educirajte prije nego što uložite pravi novac u tržište."
  }
];

const TradingRisksSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="rizici" className="py-20 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-destructive/5 via-transparent to-transparent pointer-events-none" />
      
      <div 
        ref={ref}
        className={`container transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20 mb-6">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">Važno upozorenje</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Rizici <span className="text-destructive">Forex</span> Trgovanja
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Transparentnost je temelj našeg poslovanja. Prije nego što počnete trgovati, 
            važno je razumjeti sve rizike povezane s Forex tržištem.
          </p>
        </div>

        {/* Risk Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {risks.map((risk, index) => (
            <div 
              key={index}
              className="p-6 rounded-2xl bg-card border border-border hover:border-destructive/30 transition-all duration-300 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4 group-hover:bg-destructive/20 transition-colors">
                <risk.icon className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{risk.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{risk.description}</p>
            </div>
          ))}
        </div>

        {/* Disclaimer Box */}
        <div className="p-6 md:p-8 rounded-2xl bg-destructive/5 border border-destructive/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Pravna napomena</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Obsidian pruža edukativne materijale i signale za trgovanje, ali <strong>ne dajemo financijske savjete</strong>. 
                Sve informacije na ovoj stranici su isključivo informativne prirode i ne bi se trebale smatrati preporukom za kupnju ili prodaju bilo kojeg financijskog instrumenta.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                <strong>Statistike i rezultati</strong> prikazani na ovoj stranici temelje se na prošlim performansama i ne garantiraju buduće rezultate. 
                Svaki trader je odgovoran za vlastite odluke i upravljanje rizikom.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Prije početka trgovanja, savjetujemo vam da <strong>konzultirate licenciranog financijskog savjetnika</strong> i 
                da nikada ne ulažete više nego što si možete priuštiti izgubiti.
              </p>
            </div>
          </div>
        </div>

        {/* Statistics reminder */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground max-w-3xl mx-auto">
            Prema regulatornim podacima, između 70-80% malih investitora gubi novac pri trgovanju CFD-ovima i Forex-om. 
            Razmislite možete li si priuštiti preuzimanje visokog rizika gubitka novca.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TradingRisksSection;
