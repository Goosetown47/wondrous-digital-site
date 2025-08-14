'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Eye, EyeOff, Lock } from 'lucide-react';
import { LogoFull } from '@/components/ui/logo';
import { authService } from '@/lib/supabase/auth';
import { toast } from 'sonner';
import { z } from 'zod';

// Password validation schema
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-red-500' };
  if (score <= 4) return { score: 2, label: 'Fair', color: 'bg-yellow-500' };
  if (score <= 5) return { score: 3, label: 'Good', color: 'bg-blue-500' };
  return { score: 4, label: 'Strong', color: 'bg-green-500' };
}

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidSession, setIsValidSession] = useState(true);
  const [checkingSession, setCheckingSession] = useState(true);

  // Check if user has a valid recovery session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await authService.getUser();
        if (!user) {
          setIsValidSession(false);
        }
      } catch {
        setIsValidSession(false);
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  // Password validation
  useEffect(() => {
    if (!password) {
      setValidationErrors([]);
      return;
    }

    const errors: string[] = [];
    if (password.length < 8) {
      errors.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('One uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('One lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('One number');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('One special character');
    }

    setValidationErrors(errors);
  }, [password]);

  const passwordStrength = getPasswordStrength(password);

  // Form validation
  const isFormValid = () => {
    try {
      passwordSchema.parse(password);
      return password === confirmPassword;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    try {
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message);
        return;
      }
    }

    setIsLoading(true);

    try {
      await authService.updatePassword(password);
      
      // Log password change for security
      await fetch('/api/auth/log-password-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => {
        // Don't fail if logging fails
      });

      toast.success('Password updated successfully!');
      
      // Redirect to login after short delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="flex justify-center">
            <LogoFull size="xl" />
          </div>
          
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Invalid or Expired Link
              </CardTitle>
              <CardDescription className="text-center">
                This password reset link is invalid or has expired
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Password reset links expire after 1 hour for security reasons. 
                  Please request a new password reset link.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => router.push('/forgot-password')}
                className="w-full"
              >
                Request New Reset Link
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <LogoFull size="xl" />
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Create new password
            </CardTitle>
            <CardDescription className="text-center">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {password && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{passwordStrength.label}</span>
                    </div>
                    
                    {validationErrors.length > 0 && (
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li className="font-medium">Password must contain:</li>
                        {validationErrors.map((error, index) => (
                          <li key={index} className="ml-4">• {error}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500">Passwords do not match</p>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !isFormValid()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating password...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Update Password
                  </>
                )}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                After updating your password, you'll be redirected to the login page
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}