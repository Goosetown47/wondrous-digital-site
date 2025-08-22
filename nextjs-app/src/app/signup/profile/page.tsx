'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, User, Phone, MapPin, Briefcase, Globe, FileText, Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// Phone number formatter for US numbers
function formatPhoneNumber(value: string): string {
  // Remove all non-digits
  const phoneNumber = value.replace(/\D/g, '')
  
  // Limit to 10 digits
  const limitedNumber = phoneNumber.slice(0, 10)
  
  // Format as (xxx) xxx-xxxx
  if (limitedNumber.length === 0) return ''
  if (limitedNumber.length <= 3) return `(${limitedNumber}`
  if (limitedNumber.length <= 6) return `(${limitedNumber.slice(0, 3)}) ${limitedNumber.slice(3)}`
  return `(${limitedNumber.slice(0, 3)}) ${limitedNumber.slice(3, 6)}-${limitedNumber.slice(6, 10)}`
}

// Common US timezones
const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Phoenix', label: 'Mountain Time - Arizona (MST)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'America/Puerto_Rico', label: 'Atlantic Time (AT)' },
]

export default function PersonalDetailsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  
  // Form fields
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [userHandle, setUserHandle] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [timezone, setTimezone] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    checkAuth()
    // Try to detect user's timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const matchingTimezone = TIMEZONES.find(tz => tz.value === userTimezone)
    if (matchingTimezone) {
      setTimezone(userTimezone)
    } else {
      setTimezone('America/New_York') // Default to ET
    }
    
    // Restore form data from sessionStorage if user abandoned and came back
    const savedFormData = sessionStorage.getItem('signupProfileData')
    if (savedFormData) {
      try {
        const data = JSON.parse(savedFormData)
        if (data.firstName) setFirstName(data.firstName)
        if (data.lastName) setLastName(data.lastName)
        if (data.userHandle) setUserHandle(data.userHandle)
        if (data.phoneNumber) setPhoneNumber(data.phoneNumber)
        if (data.jobTitle) setJobTitle(data.jobTitle)
        if (data.timezone) setTimezone(data.timezone)
        if (data.location) setLocation(data.location)
        if (data.notes) setNotes(data.notes)
        console.log('[Profile] Restored form data from abandoned session')
      } catch (err) {
        console.error('[Profile] Failed to restore form data:', err)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuth = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/signup/login')
      return
    }
    
    setUser(user)
    
    // Restore invitation token to sessionStorage if it exists in user metadata
    // This ensures the stepper shows correctly for warm prospects
    if (user.user_metadata?.invitation_token && !sessionStorage.getItem('invitationToken')) {
      sessionStorage.setItem('invitationToken', user.user_metadata.invitation_token)
    }
    
    // Safety net: Check if warm prospect needs to be linked to account
    if (user.user_metadata?.invitation_token) {
      const invitationToken = user.user_metadata.invitation_token
      
      // Check if user is already linked to an account
      const { data: accountUser } = await supabase
        .from('account_users')
        .select('account_id')
        .eq('user_id', user.id)
        .single()
      
      if (!accountUser) {
        console.log('[Profile] Warm prospect not linked to account, attempting to link...')
        
        // Try to accept the invitation
        try {
          const response = await fetch(`/api/invitations/by-token/${invitationToken}/accept-after-signup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
            }),
          })
          
          if (response.ok) {
            const result = await response.json()
            if (result.account_id) {
              console.log('[Profile] Successfully linked to account:', result.account_id)
              sessionStorage.setItem('signupAccountId', result.account_id)
              if (result.account_name) {
                sessionStorage.setItem('signupAccountName', result.account_name)
              }
            }
          } else {
            console.error('[Profile] Failed to accept invitation:', await response.text())
          }
        } catch (err) {
          console.error('[Profile] Error accepting invitation:', err)
        }
      } else {
        // User is already linked, ensure account ID is in sessionStorage
        if (!sessionStorage.getItem('signupAccountId')) {
          sessionStorage.setItem('signupAccountId', accountUser.account_id)
        }
      }
    }
    
    // Pre-fill name from email or metadata
    const emailUsername = user.email?.split('@')[0] || ''
    if (user.user_metadata?.full_name) {
      const names = user.user_metadata.full_name.split(' ')
      setFirstName(names[0] || '')
      setLastName(names.slice(1).join(' ') || '')
    } else {
      setFirstName(emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1))
    }
    
    // Check for existing profile data
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (profile) {
      setAvatarUrl(profile.avatar_url)
      setFirstName(profile.first_name || firstName)
      setLastName(profile.last_name || lastName)
      setUserHandle(profile.user_handle || '')
      setPhoneNumber(formatPhoneNumber(profile.phone_number || ''))
      setJobTitle(profile.job_title || '')
      setTimezone(profile.timezone || timezone)
      setLocation(profile.location || '')
      setNotes(profile.notes || '')
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumber(formatted)
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      
      if (!event.target.files || event.target.files.length === 0) {
        return
      }

      const file = event.target.files[0]
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB')
        return
      }

      const supabase = createClient()
      
      // Use folder structure: {user_id}/avatar.{ext}
      const fileExt = file.name.split('.').pop()
      const filePath = `${user?.id}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true  // Overwrite existing avatar
        })

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Add timestamp to force refresh
      const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`
      setAvatarUrl(urlWithTimestamp)
      
      toast.success('Avatar uploaded successfully!')
    } catch (error) {
      console.error('Avatar upload error:', error)
      toast.error('Failed to upload avatar')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!firstName || !lastName) {
      setError('Please enter your first and last name')
      return
    }

    setLoading(true)

    try {
      // Call the API endpoint to update profile
      const response = await fetch('/api/signup/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          avatarUrl,
          firstName,
          lastName,
          userHandle: userHandle || null,
          phoneNumber: phoneNumber.replace(/\D/g, ''), // Store just digits
          jobTitle: jobTitle || null,
          timezone,
          location: location || null,
          notes: notes || null,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }
      
      // Move to Step 5: Payment (Step 4 for warm prospects)
      const flow = searchParams.get('flow')
      const pricingUrl = flow ? `/signup/pricing?flow=${flow}` : '/signup/pricing'
      router.push(pricingUrl)
    } catch (err) {
      console.error('Profile update error:', err)
      setError((err as Error)?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    // Allow skipping to payment page
    const flow = searchParams.get('flow')
    const pricingUrl = flow ? `/signup/pricing?flow=${flow}` : '/signup/pricing'
    router.push(pricingUrl)
  }

  // Get user initials for avatar fallback
  const getInitials = () => {
    const f = firstName?.charAt(0) || ''
    const l = lastName?.charAt(0) || ''
    return (f + l).toUpperCase() || 'U'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid lg:grid-cols-2 gap-16 items-start">
        {/* Left Side - Heading and Steps */}
        <div>
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Tell us about<br />yourself
            </h1>
            <p className="text-lg text-gray-600">
              Help us personalize your experience by sharing a bit about yourself.
            </p>
          </div>

          {/* Step List - with Step 4 active */}
        </div>

        {/* Right Side - Form */}
        <div>
          {/* Spacer to align with left side */}
          <div className="h-[52px]"></div>
          <Card className="p-8">
            <h2 className="text-2xl font-semibold mb-6">Personal Details Form</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Avatar Upload */}
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarUrl || undefined} alt={getInitials()} />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-4 w-4" />
                        Upload Photo
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG or GIF (max 5MB)
                  </p>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    disabled={loading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* User Handle */}
              <div className="space-y-2">
                <Label htmlFor="userHandle">User Handle (optional)</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="userHandle"
                    type="text"
                    value={userHandle}
                    onChange={(e) => setUserHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="@johndoe"
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Optional username for your profile
                </p>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="(555) 123-4567"
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Job Title */}
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Role/Title</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="jobTitle"
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="CEO, Designer, Developer..."
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Timezone */}
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone} disabled={loading}>
                  <SelectTrigger id="timezone">
                    <Globe className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Select your timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="San Francisco, CA"
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">About You (optional)</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tell us a bit about yourself, your work, or your goals..."
                    className="pl-10 min-h-[100px]"
                    disabled={loading}
                  />
                </div>
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
                      Saving...
                    </>
                  ) : (
                    'Continue'
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleSkip}
                  disabled={loading}
                >
                  Skip for now
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}