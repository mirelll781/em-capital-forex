import { Button } from "@/components/ui/button";
import { GraduationCap, Download, BookOpen, CheckCircle } from "lucide-react";

const benefits = [
  "Osnove forex tradinga",
  "Kako čitati grafove",
  "Upravljanje rizikom",
  "Praktični primjeri",
];

const EducationSection = () => {
  return (
    <section id="edukacija" className="py-24">
      <div className="container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <GraduationCap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Besplatna Edukacija</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Početnički{" "}
            <span className="text-gradient-gold">Kurs</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Preuzmi besplatan PDF kurs i nauči osnove forex tradinga od nule.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-b from-secondary/50 to-card/50 backdrop-blur-xl rounded-3xl border border-primary/20 p-8 md:p-12 animate-scale-in">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-32 h-40 bg-primary/10 rounded-xl border border-primary/20 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-primary" />
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-heading font-bold mb-4">
                  Mirel FX Početnički Kurs
                </h3>
                <p className="text-muted-foreground mb-6">
                  Kompletni vodič za početnike koji žele naučiti trgovati na forex tržištu. 
                  Naučit ćeš sve što ti treba da počneš zarađivati.
                </p>
                
                <ul className="grid grid-cols-2 gap-3 mb-8">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                
                <a href="/Mirel_FX_Pocetni_Kurs.pdf" download>
                  <Button variant="hero" size="lg" className="group">
                    <Download className="w-5 h-5 mr-2" />
                    Preuzmi Besplatno
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EducationSection;
