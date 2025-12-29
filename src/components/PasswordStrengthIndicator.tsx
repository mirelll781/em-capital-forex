import { useMemo } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  { label: 'Najmanje 8 karaktera', test: (p) => p.length >= 8 },
  { label: 'Jedno veliko slovo', test: (p) => /[A-Z]/.test(p) },
  { label: 'Jedno malo slovo', test: (p) => /[a-z]/.test(p) },
  { label: 'Jedan broj', test: (p) => /[0-9]/.test(p) },
  { label: 'Jedan specijalni znak (!@#$%^&*)', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export function getPasswordStrength(password: string): number {
  return requirements.filter((req) => req.test(password)).length;
}

export function isPasswordStrong(password: string): boolean {
  return getPasswordStrength(password) >= 4;
}

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => getPasswordStrength(password), [password]);
  
  const strengthLabel = useMemo(() => {
    if (strength === 0) return '';
    if (strength <= 2) return 'Slaba';
    if (strength <= 3) return 'Srednja';
    if (strength <= 4) return 'Jaka';
    return 'Vrlo jaka';
  }, [strength]);

  const strengthColor = useMemo(() => {
    if (strength <= 2) return 'bg-destructive';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-green-500';
    return 'bg-green-600';
  }, [strength]);

  if (!password) return null;

  return (
    <div className="space-y-3 mt-2">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Snaga lozinke</span>
          <span className={strength <= 2 ? 'text-destructive' : strength <= 3 ? 'text-yellow-500' : 'text-green-500'}>
            {strengthLabel}
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${strengthColor}`}
            style={{ width: `${(strength / requirements.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      <div className="space-y-1.5">
        {requirements.map((req, index) => {
          const passed = req.test(password);
          return (
            <div 
              key={index} 
              className={`flex items-center gap-2 text-xs transition-colors ${
                passed ? 'text-green-500' : 'text-muted-foreground'
              }`}
            >
              {passed ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <X className="w-3.5 h-3.5" />
              )}
              <span>{req.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
