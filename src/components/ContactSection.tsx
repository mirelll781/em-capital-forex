import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Send, CheckCircle, Clock, MessageSquare, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Ime je obavezno").max(100, "Ime je predugačko"),
  email: z.string().trim().email("Unesite ispravnu email adresu").max(255, "Email je predugačak"),
  phone: z.string().trim().max(20, "Broj telefona je predugačak").optional().or(z.literal("")),
  topic: z.string().min(1, "Odaberite temu upita"),
  message: z.string().trim().min(1, "Poruka je obavezna").max(2000, "Poruka je predugačka (max 2000 znakova)"),
});

const topicOptions = [
  { value: "mentorship", label: "🟢 Mentorship Program" },
  { value: "signals", label: "🔵 Premium Signali" },
  { value: "general", label: "💬 Opće pitanje" },
  { value: "partnership", label: "🤝 Suradnja / Partnerstvo" },
];

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    topic: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedTopic, setSubmittedTopic] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleTopicChange = (value: string) => {
    setFormData(prev => ({ ...prev, topic: value }));
    if (errors.topic) {
      setErrors(prev => ({ ...prev, topic: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const topicLabel = topicOptions.find(t => t.value === formData.topic)?.label || formData.topic;
      
      const { data, error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          ...formData,
          topicLabel,
        },
      });

      if (error) throw error;

      setSubmittedTopic(formData.topic);
      setIsSubmitted(true);
      toast.success("Poruka uspješno poslana!");
      setFormData({ name: "", email: "", phone: "", topic: "", message: "" });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Greška pri slanju poruke. Pokušajte ponovo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    const isMentorship = submittedTopic === "mentorship";
    const isSignals = submittedTopic === "signals";
    
    return (
      <section id="contact" className="py-24 bg-secondary/30">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center animate-pulse">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-3xl font-heading font-bold mb-4">Hvala vam na poruci!</h2>
            
            <div className="bg-card p-6 rounded-xl border border-border mb-8 text-left">
              <h3 className="font-semibold text-lg mb-4 text-center">Što slijedi?</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Očekivano vrijeme odgovora</p>
                    <p className="text-muted-foreground text-sm">
                      {isMentorship || isSignals 
                        ? "Do 12 sati - prioritetni odgovor za zainteresirane klijente"
                        : "Do 24 sata radnim danima"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Kako ćemo vas kontaktirati?</p>
                    <p className="text-muted-foreground text-sm">
                      Odgovorit ćemo putem emaila koji ste naveli.
                    </p>
                  </div>
                </div>
                
                {(isMentorship || isSignals) && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Send className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <p className="font-medium">Brži odgovor?</p>
                      <p className="text-muted-foreground text-sm">
                        Za trenutni odgovor, pišite nam na{" "}
                        <a 
                          href="https://t.me/emcapitalforexbot" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Telegram
                        </a>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <Button
              onClick={() => {
                setIsSubmitted(false);
                setSubmittedTopic("");
              }}
              variant="outline"
            >
              Pošalji novu poruku
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-24 bg-secondary/30">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Mail className="w-4 h-4" />
              <span className="text-sm font-medium">Kontaktirajte nas</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Pošaljite nam poruku
            </h2>
            <p className="text-muted-foreground">
              Imate pitanje? Pošaljite nam poruku i odgovorit ćemo u roku 24 sata.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-2xl border border-border">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Ime i prezime *
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Vaše ime"
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-destructive text-sm mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email adresa *
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="vas@email.com"
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-destructive text-sm mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Broj telefona <span className="text-muted-foreground">(opciono)</span>
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+387 61 234 567"
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && (
                  <p className="text-destructive text-sm mt-1">{errors.phone}</p>
                )}
              </div>
              <div>
                <label htmlFor="topic" className="block text-sm font-medium mb-2">
                  Tema upita *
                </label>
                <Select value={formData.topic} onValueChange={handleTopicChange}>
                  <SelectTrigger className={errors.topic ? "border-destructive" : ""}>
                    <SelectValue placeholder="Odaberite temu..." />
                  </SelectTrigger>
                  <SelectContent>
                    {topicOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.topic && (
                  <p className="text-destructive text-sm mt-1">{errors.topic}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Vaša poruka *
              </label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Napišite vašu poruku ovdje..."
                rows={5}
                className={errors.message ? "border-destructive" : ""}
              />
              {errors.message && (
                <p className="text-destructive text-sm mt-1">{errors.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Slanje..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Pošalji poruku
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Ili nas kontaktirajte direktno na{" "}
              <a href="mailto:emcapital3@gmail.com" className="text-primary hover:underline">
                emcapital3@gmail.com
              </a>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
