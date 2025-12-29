import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, CreditCard, MessageCircle, Shield, Clock, CheckCircle, XCircle, AlertCircle, Bot, ExternalLink, Users, Settings, LogOut } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from 'sonner';
import logo from '@/assets/logo.jpg';
import AvatarUpload from '@/components/profile/AvatarUpload';
import ChangePassword from '@/components/profile/ChangePassword';
import PaymentHistory from '@/components/profile/PaymentHistory';
import NotificationSettings from '@/components/profile/NotificationSettings';
import DownloadAppsSection from '@/components/profile/DownloadAppsSection';

interface Profile {
  id: string;
  email: string;
  telegram_username: string | null;
  telegram_chat_id: number | null;
  membership_type: 'mentorship' | 'signals' | null;
  paid_at: string | null;
  paid_until: string | null;
  created_at: string;
  avatar_url: string | null;
}

export default function Profile() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session?.user) {
          navigate('/auth');
        } else {
          setUser(session.user);
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate('/auth');
      } else {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setProfile(data);
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Uspješno ste se odjavili');
    navigate('/');
  };

  const handleAvatarUpdate = (url: string) => {
    setProfile(prev => prev ? { ...prev, avatar_url: url } : null);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('bs-BA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getMembershipStatus = () => {
    if (!profile?.paid_until) {
      return { status: 'pending', label: 'Čeka uplatu', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', icon: AlertCircle };
    }
    
    const now = new Date();
    const paidUntil = new Date(profile.paid_until);
    const daysLeft = Math.ceil((paidUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft > 7) {
      return { status: 'active', label: 'Aktivna', color: 'text-green-500', bgColor: 'bg-green-500/10', icon: CheckCircle, daysLeft };
    } else if (daysLeft > 0) {
      return { status: 'expiring', label: `Ističe za ${daysLeft} dana`, color: 'text-orange-500', bgColor: 'bg-orange-500/10', icon: Clock, daysLeft };
    } else {
      return { status: 'expired', label: 'Istekla', color: 'text-red-500', bgColor: 'bg-red-500/10', icon: XCircle, daysLeft };
    }
  };

  const getMembershipTypeLabel = () => {
    if (!profile?.membership_type) return 'Nije odabrano';
    return profile.membership_type === 'mentorship' ? 'Mentorship Program' : 'Premium Signali';
  };

  const membershipStatus = profile ? getMembershipStatus() : null;
  const StatusIcon = membershipStatus?.icon || AlertCircle;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Nazad
            </Button>
            <a href="/" className="flex items-center gap-2">
              <img src={logo} alt="EM Capital" className="w-8 h-8 rounded-lg" />
              <span className="font-heading font-bold">EM Capital</span>
            </a>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="gap-2 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Odjava</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Moj Profil</h1>

        {/* User Info Card */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <AvatarUpload 
              userId={user?.id || ''} 
              currentAvatarUrl={profile?.avatar_url || null}
              onAvatarUpdate={handleAvatarUpdate}
            />
            <div>
              <h2 className="text-xl font-semibold">{user?.email?.split('@')[0]}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <MessageCircle className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Telegram</p>
                <p className="font-medium">
                  {profile?.telegram_username ? `@${profile.telegram_username}` : 'Nije postavljeno'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Član od</p>
                <p className="font-medium">{formatDate(profile?.created_at || null)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings Card */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Postavke Računa
          </h3>
          
          <ChangePassword />
        </div>

        {/* Membership Status Card */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Status Članarine
          </h3>

          {/* Status Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${membershipStatus?.bgColor} mb-6`}>
            <StatusIcon className={`w-5 h-5 ${membershipStatus?.color}`} />
            <span className={`font-medium ${membershipStatus?.color}`}>
              {membershipStatus?.label}
            </span>
          </div>

          <div className="grid gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Tip članarine</p>
                <p className="font-medium">{getMembershipTypeLabel()}</p>
              </div>
            </div>

            {profile?.paid_at && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Datum uplate</p>
                  <p className="font-medium">{formatDate(profile.paid_at)}</p>
                </div>
              </div>
            )}

            {profile?.paid_until && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Važi do</p>
                  <p className="font-medium">{formatDate(profile.paid_until)}</p>
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Payment History */}
        <div className="mb-6">
          <PaymentHistory 
            userId={user?.id || ''} 
            currentMembershipType={profile?.membership_type || null}
            paidAt={profile?.paid_at || null}
            paidUntil={profile?.paid_until || null}
          />
        </div>

        {/* Notification Settings */}
        <div className="mb-6">
          <NotificationSettings userId={user?.id || ''} />
        </div>

        {/* Download Apps Section */}
        <div className="mb-6">
          <DownloadAppsSection />
        </div>

        {/* Telegram Bot & Group Card */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            Telegram Pristup
          </h3>
          
          {/* Warning for users who haven't started the bot */}
          {!profile?.telegram_chat_id && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-500 text-sm">Telegram bot nije povezan</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Da biste primali obavještenja putem Telegrama (podsjetnici o članarini, poruke od admina), 
                    morate pokrenuti bota klikom na <strong>Start</strong> u Telegram aplikaciji.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <p className="text-muted-foreground text-sm mb-4">
            Koristite naš Telegram bot za provjeru statusa, slanje upita i pristup grupi sa signalima.
          </p>

          <div className="grid gap-3">
            <a 
              href="https://t.me/emcapitalforexbot" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/20 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">EM Capital Bot</p>
                  <p className="text-sm text-muted-foreground">@emcapitalforexbot</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </a>

            <a 
              href="https://t.me/+H86SSZlp-lU2M2Uy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-muted/50 border border-border rounded-xl hover:bg-muted transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Users className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Pristupi Grupi</p>
                  <p className="text-sm text-muted-foreground">Telegram grupa sa signalima</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </a>
          </div>

          <div className="mt-4 p-4 bg-muted/30 rounded-xl">
            <h4 className="font-medium text-sm mb-2">📱 Kako koristiti bot?</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Kliknite na link iznad da otvorite bot</li>
              <li>Pritisnite <strong>Start</strong> u Telegramu</li>
              <li>Koristite meni za provjeru statusa ili slanje upita</li>
              <li>Za pristup grupi, admin će vas odobriti nakon uplate</li>
            </ol>
          </div>
        </div>

        {/* Actions */}
        {membershipStatus?.status !== 'active' && (
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6">
            <h3 className="font-semibold mb-2">
              {membershipStatus?.status === 'pending' 
                ? '💳 Aktivirajte članarinu' 
                : '🔄 Produžite članarinu'}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {membershipStatus?.status === 'pending'
                ? 'Kontaktirajte admina za informacije o uplati i aktivaciju članarine.'
                : 'Vaša članarina je istekla. Kontaktirajte admina za produženje.'}
            </p>
            <div className="flex flex-wrap gap-3">
              <a 
                href="https://t.me/EMforexadmin" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Kontakt Admin
                </Button>
              </a>
              <a 
                href="https://t.me/emcapitalforexbot" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button size="sm" className="gap-2">
                  Otvori Telegram Bot
                </Button>
              </a>
            </div>
          </div>
        )}

        {membershipStatus?.status === 'active' && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
            <h3 className="font-semibold text-green-500 mb-2">✅ Članarina aktivna</h3>
            <p className="text-muted-foreground text-sm">
              Vaša članarina je aktivna još {membershipStatus.daysLeft} dana. 
              Uživajte u svim benefitima!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
