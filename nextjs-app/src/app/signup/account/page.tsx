'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { Loader2, Building2, Globe, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AccountDetailsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: Record<string, unknown> } | null>(null)
  
  // Form fields
  const [accountName, setAccountName] = useState('')
  const [website, setWebsite] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    checkAuth()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuth = async () => {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    console.log('Auth check:', { user, error })
    
    if (!user) {
      console.error('No user found, redirecting to signup')
      router.push('/signup/login')
      return
    }
    
    setUser(user)
    
    // Pre-fill account name from email if available
    const emailUsername = user.email?.split('@')[0] || ''
    setAccountName(emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!accountName.trim()) {
      setError('Please enter an account name')
      return
    }

    setLoading(true)

    try {
      // Call the API endpoint to create the account
      const response = await fetch('/api/signup/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountName,
          website,
          description,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account')
      }
      
      // Store account info in session for later steps
      sessionStorage.setItem('signupAccountId', data.account.id)
      sessionStorage.setItem('signupAccountName', accountName)
      
      // Move to Step 4: Personal Details
      router.push('/signup/profile')
    } catch (err: unknown) {
      const error = err as Error & { code?: string; details?: string; hint?: string }
      console.error('Account creation error:', error)
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      })
      setError(error?.message || error?.details || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    // For invited users or those who want to skip, go to profile
    router.push('/signup/profile')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid lg:grid-cols-2 gap-16 items-start">
        {/* Left Side - Heading and Steps */}
        <div>
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Tell us about<br />your business
            </h1>
            <p className="text-lg text-gray-600">
              Tell us a little about your business so we can get your account set up properly.
            </p>
          </div>

          {/* Step List - with Step 3 active */}
        </div>

        {/* Right Side - Form */}
        <div>
          {/* Spacer to align with left side */}
          <div className="h-[52px]"></div>
          <Card className="p-8">
            <h2 className="text-2xl font-semibold mb-6">Account Details Form</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="accountName">
                Account Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="accountName"
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="My Company"
                  className="pl-10"
                  disabled={loading}
                  required
                />
              </div>
              <p className="text-sm text-gray-500">
                This is your workspace name. It could be your company, team, or project name.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">
                Website (optional)
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                What will you use this for? (optional)
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="E.g., Building client websites, managing my portfolio, creating landing pages..."
                  className="pl-10 min-h-[100px]"
                  disabled={loading}
                />
              </div>
              <p className="text-sm text-gray-500">
                This helps us personalize your experience.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
              
              {/* Show skip option for invited users */}
              {Boolean(user?.user_metadata?.invitation_token) && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleSkip}
                  disabled={loading}
                >
                  Skip for now
                </Button>
              )}
            </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}