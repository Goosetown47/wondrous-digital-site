'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { Loader2, Mail, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PasswordStrength } from '@/components/ui/password-strength'
import { validatePassword } from '@/lib/validation/password'

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check for invitation token and pre-fill email
  useEffect(() => {
    const token = searchParams.get('token')
    const inviteEmail = searchParams.get('email')
    
    if (token && inviteEmail) {
      setEmail(inviteEmail)
      // Store token in session storage for later use
      sessionStorage.setItem('invitationToken', token)
    }
  }, [searchParams])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      setError('Password does not meet all requirements')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      
      // Create auth user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm?flow=unified`,
          data: {
            signup_flow: 'unified',
            invitation_token: sessionStorage.getItem('invitationToken'),
          }
        }
      })

      if (signUpError) {
        throw signUpError
      }

      if (data?.user) {
        // Store email in session storage for the next step
        sessionStorage.setItem('signupEmail', email)
        
        // Redirect to email confirmation page
        router.push('/signup/confirm')
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid lg:grid-cols-2 gap-16 items-start">
        {/* Left Side - Welcome Message */}
        <div>
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome.</h1>
            <p className="text-lg text-gray-600 mb-2">Thanks for joining us.</p>
            <p className="text-lg text-gray-600 mb-2">
              You're on your way to building a better experience for your customers.
            </p>
            <p className="text-lg text-gray-600">
              We need a little information to get started.
            </p>
          </div>

        </div>

        {/* Right Side - Signup Form */}
        <div>
          {/* Spacer to align form with "Thanks for joining us" text */}
          <div className="h-[52px]"></div>
          <Card className="p-8">
            <h2 className="text-2xl font-semibold mb-6">Login Creation Form</h2>
            
            <form onSubmit={handleSignup} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-10"
                    disabled={loading || !!searchParams.get('token')}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="pl-10"
                    disabled={loading}
                    required
                  />
                </div>
                {password && (
                  <PasswordStrength password={password} className="mt-2" />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="pl-10"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account & Continue'
                )}
              </Button>

              <p className="text-sm text-gray-500 text-center">
                Already have an account?{' '}
                <a href="/login" className="text-primary hover:underline">
                  Sign in
                </a>
              </p>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}