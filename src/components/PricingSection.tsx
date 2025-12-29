import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

const plans = [
  {
    name: "Basic",
    price: "49",
    period: "mjesečno",
    description: "Savršeno za početnike koji žele testirati naše signale",
    features: [
      "5-10 signala tjedno",
      "Telegram grupa",
      "Stop Loss & Take Profit",
      "Email podrška",
    ],
    popular: false,
  },
  {
    name: "Pro",
    price: "99",
    period: "mjesečno",
    description: "Najpopularniji izbor za ozbiljne tradere",
    features: [
      "15-20 signala tjedno",
      "VIP Telegram grupa",
      "Detaljna analiza uz svaki signal",
      "Dnevni pregled tržišta",
      "Live chat podrška",
      "Edukativni materijali",
    ],
    popular: true,
  },
  {
    name: "Elite",
    price: "199",
    period: "mjesečno",
    description: "Za profesionalce koji žele maksimalne rezultate",
    features: [
      "Neograničeni signali",
      "1-na-1 mentorstvo",
      "Pristup svim parovima",
      "Prioritetna podrška 24/7",
      "Ekskluzivne strategije",
      "Mjesečni video pozivi",
      "Personalizirani plan trgovanja",
    ],
    popular: false,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 relative">
      <div className="container relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <span className="text-primary font-heading font-semibold text-sm uppercase tracking-wider">
            Cjenik
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mt-4 mb-6">
            Odaberite svoj{" "}
            <span className="text-gradient-gold">plan</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Fleksibilni planovi prilagođeni vašim potrebama. Bez skrivenih troškova, otkažite kad god želite.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              variant={plan.popular ? "premium" : "pricing"}
              className={`relative animate-slide-up ${plan.popular ? "scale-105 z-10" : ""}`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-gold to-gold-dark text-primary-foreground px-4 py-1.5 rounded-full text-sm font-heading font-semibold shadow-gold">
                    Najpopularnije
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-2 pt-8">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="text-center pt-4">
                <div className="mb-6">
                  <span className="text-5xl font-heading font-bold text-gradient-gold">€{plan.price}</span>
                  <span className="text-muted-foreground ml-2">/{plan.period}</span>
                </div>
                
                <ul className="space-y-4 text-left">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-foreground/90">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter className="pt-6">
                <a 
                  href="https://revolut.me/emiir_bcvc" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button
                    variant={plan.popular ? "hero" : "outline"}
                    size="lg"
                    className="w-full"
                  >
                    Započni Odmah
                  </Button>
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
