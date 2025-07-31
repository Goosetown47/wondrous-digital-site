'use client';

import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { passwordRequirements } from '@/lib/validation/password';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-sm font-medium text-muted-foreground">
        Password must contain:
      </p>
      <ul className="space-y-1">
        {passwordRequirements.map((requirement) => {
          const isMet = password ? requirement.test(password) : false;
          return (
            <li
              key={requirement.id}
              className={cn(
                'flex items-center gap-2 text-sm',
                isMet ? 'text-green-600' : 'text-muted-foreground'
              )}
            >
              {isMet ? (
                <Check className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
              {requirement.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}