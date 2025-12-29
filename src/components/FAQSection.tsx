import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Kako primam signale?",
    answer: "Signale primite instant putem naše privatne Telegram grupe. Čim naš tim identificira priliku, signal se automatski šalje svim članovima s detaljnim uputama za ulazak, Stop Loss i Take Profit razinama.",
  },
  {
    question: "Trebam li iskustvo u trgovanju?",
    answer: "Ne! Naši signali su dizajnirani da budu jednostavni za praćenje čak i za potpune početnike. Uz to, nudimo edukativne materijale i podršku koja će vam pomoći razumjeti osnove Forex trgovanja.",
  },
  {
    question: "Kolika je prosječna profitabilnost signala?",
    answer: "Naši signali imaju prosječnu stopu uspješnosti od 85%+. Naravno, prošli rezultati ne garantiraju buduće, ali naš tim kontinuirano radi na optimizaciji strategija.",
  },
  {
    question: "Mogu li otkazati pretplatu?",
    answer: "Da, možete otkazati svoju pretplatu u bilo kojem trenutku bez ikakvih penala. Nema dugih ugovora ili skrivenih uvjeta.",
  },
  {
    question: "Koji parovi valuta su pokriveni?",
    answer: "Pokrivamo sve glavne parove (EUR/USD, GBP/USD, USD/JPY, itd.) kao i popularne kripto parove i indekse ovisno o vašem planu.",
  },
  {
    question: "Koliko kapitala trebam za početak?",
    answer: "Možete početi s bilo kojim iznosom. Preporučujemo minimalno €100-500 za početak, ali naši signali uključuju postotke rizika tako da ih možete prilagoditi svom kapitalu.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-24 relative">
      <div className="container relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <span className="text-primary font-heading font-semibold text-sm uppercase tracking-wider">
            FAQ
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mt-4 mb-6">
            Često postavljana{" "}
            <span className="text-gradient-gold">pitanja</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Pronađite odgovore na najčešća pitanja o našem servisu.
          </p>
        </div>

        <div className="max-w-3xl mx-auto animate-slide-up">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-primary/30 transition-colors duration-300"
              >
                <AccordionTrigger className="text-left font-heading font-semibold hover:text-primary transition-colors py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
