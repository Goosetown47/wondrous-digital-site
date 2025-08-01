'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/supabase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { LogoFull } from '@/components/ui/logo';
import { PasswordStrength } from '@/components/ui/password-strength';
import { signupSchema, type SignupFormData } from '@/schemas/auth';
import { validatePassword, isValidEmail } from '@/lib/validation/password';
import { ZodError } from 'zod';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof SignupFormData, string>>>({});
  
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  
  // Debounce email for availability check
  const debouncedEmail = useDebounce(email, 500);
  
  // Keep a ref to current email to avoid dependency issues
  const emailRef = useRef(email);
  emailRef.current = email;


  // Check email availability when debounced email changes
  useEffect(() => {
    // Skip if current email is empty (user cleared the field)
    if (!emailRef.current) {
      return;
    }
    
    // Skip if not touched or invalid format
    if (!emailTouched || !debouncedEmail || !isValidEmail(debouncedEmail)) {
      return;
    }

    const checkEmailAvailability = async () => {
      setCheckingEmail(true);
      
      try {
        const response = await fetch('/api/auth/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: debouncedEmail }),
        });

        const data = await response.json();
        
        if (!data.available) {
          // Only set error if the email field still contains this email
          if (emailRef.current === debouncedEmail) {
            setFieldErrors(prev => ({ ...prev, email: 'This email is already registered' }));
          }
        } else {
          // Clear email error if it was a duplicate error
          if (fieldErrors.email === 'This email is already registered') {
            setFieldErrors(prev => ({ ...prev, email: undefined }));
          }
        }
      } catch (error) {
        console.error('Error checking email:', error);
      } finally {
        setCheckingEmail(false);
      }
    };

    checkEmailAvailability();
  }, [debouncedEmail, emailTouched]); // Removed problematic dependencies

  // Clear field errors when user types or clears the field
  const handleEmailChange = (value: string) => {
    setEmail(value);
    
    // Clear errors when field is empty or user is typing
    if (!value || (fieldErrors.email && emailTouched)) {
      setFieldErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  useEffect(() => {
    if (fieldErrors.password && password) {
      setFieldErrors(prev => ({ ...prev, password: undefined }));
    }
  }, [password, fieldErrors.password]);

  useEffect(() => {
    if (fieldErrors.confirmPassword && confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
  }, [confirmPassword, fieldErrors.confirmPassword]);

  // Validate email format
  const validateEmailFormat = () => {
    if (!email) return;
    
    if (!isValidEmail(email)) {
      setFieldErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
    } else {
      // Clear format error if email is valid
      if (fieldErrors.email === 'Please enter a valid email address') {
        setFieldErrors(prev => ({ ...prev, email: undefined }));
      }
    }
  };

  // Form validation
  const isFormValid = () => {
    try {
      signupSchema.parse({ email, password, confirmPassword });
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    
    // Validate form with Zod
    try {
      const formData = { email, password, confirmPassword };
      signupSchema.parse(formData);
    } catch (err) {
      if (err instanceof ZodError) {
        const errors: Partial<Record<keyof SignupFormData, string>> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            errors[error.path[0] as keyof SignupFormData] = error.message;
          }
        });
        setFieldErrors(errors);
        // Set the first error as the main error
        const firstError = err.errors[0]?.message;
        if (firstError) {
          setError(firstError);
        }
        return;
      }
    }

    setIsLoading(true);

    try {
      await authService.signUp({ email, password });
      
      // Redirect to verify email page
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      console.error('Signup error:', err);
      // Check for specific error types
      const errorMessage = err instanceof Error ? err.message : '';
      if (errorMessage.includes('email rate limit exceeded')) {
        setError('Too many signup attempts. Please try again in an hour or use a different email address.');
      } else if (errorMessage.includes('profiles') || errorMessage.includes('trigger')) {
        setError('Database configuration error. Please contact support.');
      } else if (errorMessage.includes('User already registered')) {
        setError('An account with this email already exists.');
        setFieldErrors({ email: 'This email is already registered' });
      } else {
        setError(err instanceof Error ? err.message : 'Failed to sign up');
      }
    } finally {
      setIsLoading(false);
    }
  };


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
              Create an account
            </CardTitle>
            <CardDescription className="text-center">
              Get started with Wondrous Digital
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
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="text"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={() => {
                    setEmailTouched(true);
                    validateEmailFormat();
                  }}
                  required
                  disabled={isLoading}
                  className={cn(
                    fieldErrors.email && 'border-destructive focus-visible:ring-destructive',
                    checkingEmail && 'pr-10'
                  )}
                />
                {checkingEmail && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
              {fieldErrors.email && (
                <p className="text-sm text-red-500" style={{ color: 'red' }}>
                  {fieldErrors.email}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter a strong password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setShowPasswordStrength(true);
                }}
                onFocus={() => setShowPasswordStrength(true)}
                required
                disabled={isLoading}
                className={cn(
                  fieldErrors.password && 'border-destructive focus-visible:ring-destructive'
                )}
              />
              {fieldErrors.password && (
                <p className="text-sm text-destructive">{fieldErrors.password}</p>
              )}
              {showPasswordStrength && password && (
                <PasswordStrength password={password} className="mt-2" />
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className={cn(
                  fieldErrors.confirmPassword && 'border-destructive focus-visible:ring-destructive'
                )}
              />
              {fieldErrors.confirmPassword && (
                <p className="text-sm text-destructive">{fieldErrors.confirmPassword}</p>
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
                  Creating account...
                </>
              ) : (
                'Sign up'
              )}
            </Button>
            
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
      </div>
    </div>
  );
}