'use client'

import React from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { SignupStepper } from '@/components/ui/signup-stepper'

const SIGNUP_STEPS = [
  { number: 1, title: 'Create login credentials', description: 'Create your private login.' },
  { number: 2, title: 'Confirm email address', description: 'Confirm your email address and login for the 1st time.' },
  { number: 3, title: 'Fill in account details', description: 'Fill in some information about your account.' },
  { number: 4, title: 'Fill in personal details', description: 'Fill in some information about yourself!' },
  { number: 5, title: 'Select your plan & Pay', description: 'Pay' },
]

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Determine current step based on pathname
  const getCurrentStep = () => {
    if (pathname === '/signup') return 0
    if (pathname === '/signup/confirm' || pathname === '/signup/login') return 1
    if (pathname === '/signup/account') return 2
    if (pathname === '/signup/profile') return 3
    if (pathname === '/signup/pricing') return 4
    if (pathname === '/signup/success') return 5
    return 0
  }

  const currentStep = getCurrentStep()
  // const isSuccessPage = pathname === '/signup/success'

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Logo and Stepper */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex items-center gap-12">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Image
                src="/images/Branding/Logo-W180x180-DigitalAgency.png"
                alt="Wondrous Digital"
                width={60}
                height={60}
                className="h-14 w-14"
              />
            </div>
            
            {/* Stepper - Show on all pages including success */}
            <div className="flex-1">
              <SignupStepper 
                currentStep={currentStep} 
                steps={SIGNUP_STEPS}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}