'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { Loader2, Mail, Lock, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SignupLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailConfirmed, setEmailConfirmed] = useState(false)

  useEffect(() => {
    // Get email from session storage
    const signupEmail = sessionStorage.getItem('signupEmail')
    if (signupEmail) {
      setEmail(signupEmail)
    }
    
    // Check if we came from a successful email confirmation
    const confirmed = searchParams.get('confirmed') === 'true'
    if (confirmed) {
      setEmailConfirmed(true)
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      
      // Sign in the user
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw signInError
      }

      if (data?.user) {
        // Check if user is in the unified signup flow
        if (data.user.user_metadata?.signup_flow === 'unified') {
          // Check if this is an invitation flow (user joining existing account)
          if (data.user.user_metadata?.invitation_token) {
            // For invited users, skip account creation and go to personal details
            router.push('/signup/profile')
          } else {
            // For cold signups, go to account details
            router.push('/signup/account')
          }
        } else {
          // Legacy user - go to dashboard
          router.push('/dashboard')
        }
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'Failed to sign in')
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Please Log in</h1>
            <p className="text-lg text-gray-600">
              Let's get you logged into the system so we can set you up.
            </p>
          </div>

        </div>

        {/* Right Side - Login Form */}
        <div>
          {/* Spacer to align with left side */}
          <div className="h-[52px]"></div>
          <Card className="p-8">
            {emailConfirmed && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900">Email confirmed!</p>
                  <p className="text-sm text-green-700">Your email has been verified. Please log in to continue.</p>
                </div>
              </div>
            )}
            
            <h2 className="text-2xl font-semibold mb-6">Login Form</h2>
            
            <form onSubmit={handleLogin} className="space-y-6">
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
                    disabled={loading}
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
                    placeholder="Enter your password"
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
                    Signing in...
                  </>
                ) : (
                  'Sign In & Continue'
                )}
              </Button>

              <p className="text-sm text-gray-500 text-center">
                Forgot your password?{' '}
                <a href="/auth/reset-password" className="text-primary hover:underline">
                  Reset it
                </a>
              </p>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}