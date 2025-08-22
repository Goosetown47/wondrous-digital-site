'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, CheckCircle, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ConfirmEmailPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isWarmProspect, setIsWarmProspect] = useState(false)

  useEffect(() => {
    // Get email from session storage
    const signupEmail = sessionStorage.getItem('signupEmail')
    if (signupEmail) {
      setEmail(signupEmail)
    } else {
      // If no email in session, redirect back to signup
      // Preserve flow parameter if it exists
      const flow = sessionStorage.getItem('signupFlow')
      router.push(flow === 'invitation' ? '/signup?flow=invitation' : '/signup')
      return
    }

    // Check if this is a warm prospect (has invitation token)
    const token = sessionStorage.getItem('invitationToken')
    if (token) {
      setIsWarmProspect(true)
      // Fetch invitation details to get account_id
      fetchInvitationDetails(token)
    }
  }, [router])

  const fetchInvitationDetails = async (token: string) => {
    try {
      const response = await fetch(`/api/invitations/by-token/${token}`)
      if (response.ok) {
        const invitation = await response.json()
        // Store account_id for warm prospects to use in pricing step
        if (invitation.account_id) {
          sessionStorage.setItem('signupAccountId', invitation.account_id)
          sessionStorage.setItem('signupAccountName', invitation.accounts?.name || '')
        }
      }
    } catch (err) {
      console.error('Error fetching invitation details:', err)
    }
  }

  const handleResendEmail = async () => {
    setResending(true)
    setError(null)
    setResendSuccess(false)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) throw error

      setResendSuccess(true)
      // Reset success message after 5 seconds
      setTimeout(() => setResendSuccess(false), 5000)
    } catch (err) {
      console.error('Resend error:', err)
      setError(err instanceof Error ? err.message : 'Failed to resend email')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid lg:grid-cols-2 gap-16 items-start">
        {/* Left Side - Heading and Instructions */}
        <div>
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Check your email</h1>
            <p className="text-lg text-gray-600 mb-2">
              We've sent a confirmation email to:
            </p>
            <p className="text-lg font-semibold text-gray-900 mb-4">
              {email}
            </p>
            <p className="text-lg text-gray-600">
              Click the link in the email to verify your account and continue {isWarmProspect ? 'completing your profile' : 'setting up your workspace'}.
            </p>
          </div>

          {/* What to do next - Outside the card */}
          <div className="pl-2">
            <h2 className="font-semibold text-gray-900 mb-4">What to do next:</h2>
            <ol className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="font-semibold mr-3 text-gray-900">1.</span>
                <span>Open your email inbox and look for our message</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-3 text-gray-900">2.</span>
                <span>Click the confirmation link in the email</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-3 text-gray-900">3.</span>
                <span>You'll be redirected back here to {isWarmProspect ? 'complete your profile' : 'continue setup'}</span>
              </li>
            </ol>
          </div>
        </div>

        {/* Right Side - Email Status Card */}
        <div>
          {/* Spacer to align with left side */}
          <div className="h-[52px]"></div>
          <Card className="p-8">
            {/* Icon */}
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>

            <h2 className="text-2xl font-semibold mb-4">Email Sent!</h2>
            
            <p className="text-gray-600 mb-6">
              We've sent a verification email to <strong>{email}</strong>. 
              It should arrive within a few minutes.
            </p>

            {/* Success message */}
            {resendSuccess && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Confirmation email has been resent successfully!
                </AlertDescription>
              </Alert>
            )}

            {/* Error message */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="space-y-4">
              <Button
                onClick={handleResendEmail}
                variant="outline"
                className="w-full"
                size="lg"
                disabled={resending}
              >
                {resending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend confirmation email
                  </>
                )}
              </Button>

              <div className="text-sm text-gray-500 space-y-2">
                <p>
                  <strong>Can't find the email?</strong> Check your spam folder.
                </p>
                <p>
                  <strong>Wrong email?</strong>{' '}
                  <button
                    onClick={() => router.push('/signup')}
                    className="text-primary hover:underline"
                  >
                    Go back and correct it
                  </button>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}