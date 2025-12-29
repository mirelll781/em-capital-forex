import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { z } from 'zod';
import logo from '@/assets/logo.jpg';
import PasswordStrengthIndicator, { isPasswordStrong } from '@/components/PasswordStrengthIndicator';

const signupSchema = z.object({
  email: z.string().email('Unesite validnu email adresu'),
  password: z.string()
    .min(8, 'Lozinka mora imati najmanje 8 karaktera')
    .refine((val) => /[A-Z]/.test(val), 'Lozinka mora sadržavati veliko slovo')
    .refine((val) => /[a-z]/.test(val), 'Lozinka mora sadržavati malo slovo')
    .refine((val) => /[0-9]/.test(val), 'Lozinka mora sadržavati broj'),
  telegramUsername: z.string()
    .min(1, 'Telegram username je obavezan')
    .regex(/^@?[a-zA-Z0-9_]{5,32}$/, 'Unesite validan Telegram username')
});

const loginSchema = z.object({
  email: z.string().email('Unesite validnu email adresu'),
  password: z.string().min(1, 'Unesite lozinku')
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          navigate('/');
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateForm = () => {
    try {
      if (isLogin) {
        loginSchema.parse({ email, password });
      } else {
        signupSchema.parse({ email, password, telegramUsername });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: 'Greška',
              description: 'Pogrešan email ili lozinka',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Greška',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Uspješna prijava!',
            description: 'Dobrodošli nazad.',
          });
          // Navigate will happen automatically via onAuthStateChange
        }
      } else {
        // Clean telegram username (remove @ if present)
        const cleanUsername = telegramUsername.startsWith('@') 
          ? telegramUsername.slice(1) 
          : telegramUsername;

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              telegram_username: cleanUsername,
            },
          },
        });

        if (error) {
          if (error.message.includes('User already registered')) {
            toast({
              title: 'Greška',
              description: 'Korisnik s ovim emailom već postoji',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Greška',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          // Notify admin about new registration
          try {
            await supabase.functions.invoke('telegram-welcome', {
              body: {
                type: 'new_registration',
                email: email,
                telegram_username: cleanUsername
              }
            });
          } catch (notifyError) {
            console.error('Failed to notify admin:', notifyError);
          }

          // Send welcome email to user
          try {
            await supabase.functions.invoke('send-welcome-email', {
              body: {
                email: email,
                telegramUsername: cleanUsername
              }
            });
          } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
          }

          // Show success screen
          setRegisteredEmail(email);
          setRegistrationSuccess(true);
        }
      }
    } catch (error) {
      toast({
        title: 'Greška',
        description: 'Došlo je do greške. Pokušajte ponovo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setErrors({ email: 'Unesite validnu email adresu' });
      return;
    }
    
    setIsLoading(true);
    setErrors({});

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        toast({
          title: 'Greška',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setResetEmailSent(true);
      }
    } catch (error) {
      toast({
        title: 'Greška',
        description: 'Došlo je do greške. Pokušajte ponovo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Success screen after password reset email sent
  if (resetEmailSent) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg text-center">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-primary" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-2">
              Email poslan! 📧
            </h1>
            
            <p className="text-muted-foreground mb-6">
              Poslali smo link za resetovanje lozinke na <strong className="text-foreground">{email}</strong>
            </p>

            <div className="bg-muted/50 border border-border rounded-xl p-4 mb-6 text-left">
              <h3 className="font-semibold text-foreground mb-2">📋 Sljedeći koraci:</h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>1. Provjerite vaš email inbox</li>
                <li>2. Kliknite na link u emailu</li>
                <li>3. Postavite novu lozinku</li>
              </ol>
              <p className="text-xs text-muted-foreground mt-3">
                Ako ne vidite email, provjerite spam folder.
              </p>
            </div>

            <Button 
              className="w-full"
              onClick={() => {
                setResetEmailSent(false);
                setIsForgotPassword(false);
                setIsLogin(true);
              }}
            >
              Nazad na prijavu
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success screen after registration
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-2">
              Registracija uspješna! 🎉
            </h1>
            
            <p className="text-muted-foreground mb-6">
              Vaš račun je kreiran za <strong className="text-foreground">{registeredEmail}</strong>
            </p>

            {/* Next Steps */}
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-semibold text-foreground mb-3">📋 Sljedeći koraci:</h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  <span>Kontaktirajte <strong>@EMforexadmin</strong> za uplatu</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <span>Nakon uplate, admin aktivira vašu članarinu</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <span>Dobijate pristup grupi i signalima</span>
                </li>
              </ol>
            </div>

            {/* Telegram Bot Info */}
            <div className="bg-card border border-border rounded-xl p-4 mb-4 text-left">
              <h3 className="font-semibold text-foreground mb-2">🤖 Telegram Bot</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Pokrenite našeg bota za provjeru statusa i informacije:
              </p>
              <a 
                href="https://t.me/emcapitalforexbot" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#0088cc] hover:bg-[#0088cc]/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Otvori @emcapitalforexbot
              </a>
            </div>

            {/* Important Warning about Telegram Bot */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-semibold text-yellow-500 text-sm mb-2">⚠️ Važno!</h3>
              <p className="text-sm text-muted-foreground">
                Da biste primali obavještenja putem Telegrama (podsjetnici o članarini, poruke od admina), 
                <strong className="text-foreground"> morate pokrenuti bota</strong> klikom na <strong>Start</strong> u Telegram aplikaciji.
              </p>
            </div>

            {/* Login Button */}
            <Button 
              className="w-full"
              onClick={() => {
                setRegistrationSuccess(false);
                setIsLogin(true);
                setPassword('');
              }}
            >
              Prijavi se
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Forgot password form
  if (isForgotPassword) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Button 
            variant="ghost" 
            className="mb-6 text-muted-foreground hover:text-foreground"
            onClick={() => {
              setIsForgotPassword(false);
              setErrors({});
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Nazad na prijavu
          </Button>

          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
            <div className="flex justify-center mb-6">
              <img src={logo} alt="EM Capital" className="h-16 w-16 rounded-full" />
            </div>

            <h1 className="text-2xl font-bold text-center text-foreground mb-2">
              Zaboravljena lozinka
            </h1>
            <p className="text-muted-foreground text-center mb-6">
              Unesite email adresu i poslaćemo vam link za resetovanje lozinke
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="vas@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Slanje...' : 'Pošalji link za reset'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Button 
          variant="ghost" 
          className="mb-6 text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Nazad na početnu
        </Button>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={logo} alt="EM Capital" className="h-16 w-16 rounded-full" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-foreground mb-2">
            {isLogin ? 'Prijava' : 'Registracija'}
          </h1>
          <p className="text-muted-foreground text-center mb-6">
            {isLogin 
              ? 'Prijavite se na svoj EM Capital račun' 
              : 'Kreirajte svoj EM Capital račun'}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vas@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Lozinka</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
              {!isLogin && <PasswordStrengthIndicator password={password} />}
              {isLogin && (
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setErrors({});
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Zaboravili ste lozinku?
                </button>
              )}
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="telegram">Telegram Username</Label>
                <Input
                  id="telegram"
                  type="text"
                  placeholder="@vaš_username"
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value)}
                  className={errors.telegramUsername ? 'border-destructive' : ''}
                />
                {errors.telegramUsername && (
                  <p className="text-sm text-destructive">{errors.telegramUsername}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Vaš Telegram username za praćenje članarine
                </p>
              </div>
            )}


            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? 'Učitavanje...' : (isLogin ? 'Prijavi se' : 'Registruj se')}
            </Button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              {isLogin ? 'Nemate račun?' : 'Već imate račun?'}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                }}
                className="ml-2 text-primary hover:underline font-medium"
              >
                {isLogin ? 'Registrujte se' : 'Prijavite se'}
              </button>
            </p>
          </div>
        </div>

        {/* Benefits */}
        {!isLogin && (
          <div className="mt-6 bg-card/50 border border-border rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-3">Zašto se registrovati?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                Pratite status vaše članarine
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                Pristup ekskluzivnom sadržaju
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                Direktna komunikacija s timom
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
