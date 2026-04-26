import { Send } from "lucide-react";
import logo from "@/assets/obsidian-logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Obsidian Logo" className="w-10 h-10 rounded-lg object-cover" />
              <span className="text-2xl font-heading font-bold">Obsidian</span>
            </div>
            <p className="text-muted-foreground max-w-md mb-6">
              Vaš partner u uspješnom Forex trgovanju. Premium signali, edukacija i podrška za postizanje vaših financijskih ciljeva.
            </p>
            <a
              href="https://t.me/obsidianowner"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-colors"
            >
              <Send className="w-5 h-5 text-primary" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Telegram</span>
                <span className="text-sm font-medium text-primary">@obsidianowner</span>
              </div>
            </a>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Brzi Linkovi</h4>
            <ul className="space-y-3">
              <li><a href="#mentorship" className="text-muted-foreground hover:text-primary transition-colors">Mentorship Program</a></li>
              <li><a href="#vip" className="text-muted-foreground hover:text-primary transition-colors">VIP Trading Grupa</a></li>
              <li><a href="#standard" className="text-muted-foreground hover:text-primary transition-colors">Standard Grupa</a></li>
              <li><a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">Kontakt</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Pravne Informacije</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Uvjeti korištenja</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privatnost</a></li>
              <li>
                <a
                  href="https://t.me/obsidianowner"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Telegram Kontakt
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © {currentYear} Obsidian. Sva prava pridržana.
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
