import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ChangePassword() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error('Nova lozinka mora imati najmanje 6 karaktera');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Lozinke se ne podudaraju');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setSuccess(true);
      toast.success('Lozinka uspješno promijenjena');
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setIsOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSuccess(false);
      }, 2000);
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Greška pri promjeni lozinke');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(true)}
        className="w-full justify-start gap-2"
      >
        <Lock className="w-4 h-4" />
        Promijeni lozinku
      </Button>
    );
  }

  if (success) {
    return (
      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-green-500" />
        <span className="text-green-500 font-medium">Lozinka uspješno promijenjena!</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-muted/50 rounded-xl space-y-4">
      <h4 className="font-medium flex items-center gap-2">
        <Lock className="w-4 h-4" />
        Promjena lozinke
      </h4>

      <div className="space-y-3">
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Nova lozinka"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder="Potvrdi novu lozinku"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>

      <div className="flex gap-2">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={() => setIsOpen(false)}
          disabled={isLoading}
        >
          Odustani
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Spremanje...
            </>
          ) : (
            'Spremi'
          )}
        </Button>
      </div>
    </form>
  );
}
