import { Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import certificate1 from "@/assets/certificate-1.png";
import certificate2 from "@/assets/certificate-2.png";
import certificate3 from "@/assets/certificate-3.png";
import certificate4 from "@/assets/certificate-4.png";
import certificate5 from "@/assets/certificate-5.png";
import certificate6 from "@/assets/certificate-6.png";
import certificate7 from "@/assets/certificate-7.png";

const certificates = [
  {
    image: certificate1,
    title: "FundedNext Elite Trader",
    description: "Stellar 2-Step Challenge P1 | 6K",
  },
  {
    image: certificate2,
    title: "XPIPS Certificate of Achievement",
    description: "Uspješno položena evaluacija",
  },
  {
    image: certificate3,
    title: "FundedNext Elite Trader",
    description: "Profesionalni trader certifikat",
  },
  {
    image: certificate4,
    title: "TopOne Funded Trader",
    description: "Uspješno završen Top One Trader challenge",
  },
  {
    image: certificate5,
    title: "FUNDEDX Funded Trader",
    description: "$100,000 Challenge Passed",
  },
  {
    image: certificate6,
    title: "FundedX Achievement",
    description: "10K - 2 Phase - Phase 1 Passed",
  },
  {
    image: certificate7,
    title: "FundedX Achievement",
    description: "50K - 2 Phase - Phase 1 Passed",
  },
];

const CertificatesSection = () => {
  return (
    <section id="certifikati" className="py-20 px-4 bg-gradient-to-b from-secondary/50 to-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Award className="w-6 h-6 text-primary" />
            <span className="text-primary font-medium uppercase tracking-wider text-sm">
              Dokaz Profesionalnosti
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Profesionalni Certifikati
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Verifikovani certifikati od vodećih prop trading firmi koji potvrđuju 
            moje sposobnosti i profesionalnost u tradingu.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert, index) => (
            <Card
              key={index}
              variant="elevated"
              className="overflow-hidden group hover:border-primary/50 transition-all duration-300"
            >
              <div className="relative">
                <img
                  src={cert.image}
                  alt={cert.title}
                  className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-heading font-semibold text-foreground mb-1">
                  {cert.title}
                </h3>
                <p className="text-sm text-muted-foreground">{cert.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CertificatesSection;
