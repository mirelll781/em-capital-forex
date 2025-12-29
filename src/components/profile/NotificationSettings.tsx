import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Mail, MessageCircle, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface NotificationSettingsProps {
  userId: string;
}

export default function NotificationSettings({ userId }: NotificationSettingsProps) {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [telegramNotifications, setTelegramNotifications] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [userId]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email_notifications, telegram_notifications')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setEmailNotifications(data.email_notifications ?? true);
        setTelegramNotifications(data.telegram_notifications ?? true);
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (field: 'email_notifications' | 'telegram_notifications', value: boolean) => {
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: value })
        .eq('user_id', userId);

      if (error) throw error;

      if (field === 'email_notifications') {
        setEmailNotifications(value);
      } else {
        setTelegramNotifications(value);
      }

      toast.success('Postavke spremljene');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error('Greška pri spremanju postavki');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-5 h-5 bg-muted rounded" />
          <div className="h-5 w-40 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Bell className="w-5 h-5 text-primary" />
        Postavke Notifikacija
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="font-medium">Email obavještenja</p>
              <p className="text-sm text-muted-foreground">
                Primajte obavještenja o isteku članarine
              </p>
            </div>
          </div>
          <Switch
            checked={emailNotifications}
            onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
            disabled={isSaving}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Telegram obavještenja</p>
              <p className="text-sm text-muted-foreground">
                Primajte podsjetnik 3 dana prije isteka
              </p>
            </div>
          </div>
          <Switch
            checked={telegramNotifications}
            onCheckedChange={(checked) => updateSetting('telegram_notifications', checked)}
            disabled={isSaving}
          />
        </div>
      </div>
    </div>
  );
}
