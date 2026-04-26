import { Button } from "@/components/ui/button";
import { Send, MessageCircle } from "lucide-react";

const TELEGRAM_USERNAME = "obsidianowner";
const TELEGRAM_URL = `https://t.me/${TELEGRAM_USERNAME}`;

const ContactSection = () => {
  return (
    <section id="contact" className="py-24 bg-secondary/30">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Kontakt</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Kontaktiraj nas na Telegramu
          </h2>
          <p className="text-muted-foreground mb-10">
            Za sva pitanja o paketima, mentorstvu i pristupu grupi — pišite nam direktno na Telegram.
          </p>

          <div className="bg-card p-8 rounded-2xl border border-border">
            <p className="text-sm text-muted-foreground mb-2">Telegram</p>
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl md:text-3xl font-heading font-bold text-primary hover:underline break-all"
            >
              @{TELEGRAM_USERNAME}
            </a>

            <div className="mt-8">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer">
                  <Send className="w-4 h-4 mr-2" />
                  Otvori Telegram
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
