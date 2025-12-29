import { Send, Mail, Instagram } from "lucide-react";
import logo from "@/assets/logo.jpg";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="EM Capital Logo" className="w-10 h-10 rounded-lg object-cover" />
              <span className="text-2xl font-heading font-bold">EM Capital</span>
            </div>
            <p className="text-muted-foreground max-w-md mb-6">
              Vaš partner u uspješnom Forex trgovanju. Premium signali, edukacija i podrška za postizanje vaših financijskih ciljeva.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://t.me/emcapitalforexbot" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors" title="Telegram Bot">
                <Send className="w-5 h-5" />
              </a>
              <div className="flex flex-col items-center">
                <a href="https://www.instagram.com/emiir.bcvc" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <span className="text-xs text-muted-foreground mt-1">@emiir.bcvc</span>
              </div>
              <div className="flex flex-col items-center">
                <a href="https://www.instagram.com/mirel.sinanovic" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <span className="text-xs text-muted-foreground mt-1">@mirel.sinanovic</span>
              </div>
              <a href="mailto:emcapital3@gmail.com" className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors" title="Email">
                <Mail className="w-5 h-5" />
              </a>
            </div>
            <p className="text-muted-foreground text-sm mt-4">
              📧 emcapital3@gmail.com
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Brzi Linkovi</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Značajke</a></li>
              <li><a href="#services" className="text-muted-foreground hover:text-primary transition-colors">Usluge</a></li>
              <li><a href="#reviews" className="text-muted-foreground hover:text-primary transition-colors">Iskustva</a></li>
              <li><a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">Kontakt</a></li>
              <li><a href="#faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Pravne Informacije</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Uvjeti korištenja</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privatnost</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Rizici trgovanja</a></li>
              <li><a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">Kontakt</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © {currentYear} EM Capital. Sva prava pridržana.
          </p>
          <p className="text-muted-foreground text-xs text-center md:text-right whitespace-nowrap">
            Upozorenje: Trgovanje na Forex tržištu nosi visok stupanj rizika. Prošli rezultati ne garantiraju buduće performanse.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
