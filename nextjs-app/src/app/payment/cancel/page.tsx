'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image 
            src="/images/branding/logo-full.png" 
            alt="Wondrous Digital" 
            width={200}
            height={48}
            className="h-12 w-auto"
          />
        </div>
        <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
          <X className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Payment Cancelled</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Your payment was cancelled and no charges were made. You can return to the pricing page to select a plan when you're ready.
        </p>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground mb-6">
            Have questions? Email us at{' '}
            <a href="mailto:hello@wondrousdigital.com" className="text-primary hover:underline">
              hello@wondrousdigital.com
            </a>
          </p>
          <div className="flex justify-center">
            <Button asChild>
              <Link href="/pricing">
                Return to Pricing
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}