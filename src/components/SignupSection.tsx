import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

const TELEGRAM_CHANNEL_LINK = "https://t.me/+-pD5q3Y9GLhkMmFi";

const SignupSection = () => {
  const handleJoin = () => {
    window.open(TELEGRAM_CHANNEL_LINK, "_blank");
  };

  return (
    <section id="signup" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
      
      <div className="container relative">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Započni{" "}
            <span className="text-gradient-gold">Danas</span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8">
            Pridruži se našem Telegram kanalu i dobij pristup premium signalima.
          </p>

          <Button 
            onClick={handleJoin}
            variant="hero" 
            size="xl"
            className="group"
          >
            <Send className="w-5 h-5 mr-2" />
            Pridruži se na Telegram
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SignupSection;
