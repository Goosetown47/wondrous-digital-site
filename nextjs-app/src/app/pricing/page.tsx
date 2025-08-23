'use client';

import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  Check,
  Clock,
  Lock,
  Mail,
  Palette,
  ShieldCheck,
  Star,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  Loader2,
  Zap,
  Globe,
  BarChart,
  Layers,
} from 'lucide-react';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatCurrency } from '@/lib/stripe/client-utils';
import { PricingAddons } from '@/components/pricing/pricing-addons';
import type { TierName } from '@/types/database';

// Interface for Pricing Package Data
interface PricingPackage {
  tier: TierName;
  title: string;
  monthlyPrice: number; // in cents
  annualPrice: number; // in cents (total for year)
  setupFee: number; // in cents
  description: string;
  features: {
    title: string;
    items: { icon: LucideIcon; text: string }[];
  }[];
  isPopular?: boolean;
}

function PricingContent() {
  const searchParams = useSearchParams();
  const [isAnnually, setIsAnnually] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<TierName | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [pendingTier, setPendingTier] = useState<TierName | null>(null);

  // Get flow type from URL params
  const flow = searchParams.get('flow') as 'invitation' | 'upgrade' | null;
  const invitationToken = searchParams.get('token');

  // Pricing packages data matching our actual tiers
  const packages: PricingPackage[] = [
    {
      tier: 'PRO',
      title: 'PRO',
      monthlyPrice: 39700, // $397
      annualPrice: 428700, // $4,287 (10% discount)
      setupFee: 150000, // $1,500
      description: 'Perfect for growing businesses',
      features: [
        {
          title: 'Projects & Team',
          items: [
            { icon: Layers, text: '5 Projects' },
            { icon: Users, text: '3 Team Members' },
            { icon: UserPlus, text: 'Basic team collaboration' },
          ],
        },
        {
          title: 'Platform Features',
          items: [
            { icon: Globe, text: 'Custom Domains' },
            { icon: Zap, text: 'Marketing Platform Access' },
            { icon: Palette, text: 'Smart Sections' },
            { icon: Check, text: 'Remove Watermark' },
          ],
        },
        {
          title: 'Support',
          items: [
            { icon: Mail, text: 'Priority Support' },
            { icon: Clock, text: 'Business hours support' },
          ],
        },
      ],
    },
    {
      tier: 'SCALE',
      title: 'SCALE',
      monthlyPrice: 69700, // $697
      annualPrice: 752700, // $7,527 (10% discount)
      setupFee: 150000, // $1,500
      description: 'Built for expanding teams',
      features: [
        {
          title: 'Projects & Team',
          items: [
            { icon: Layers, text: '10 Projects' },
            { icon: Users, text: '5 Team Members' },
            { icon: UserCheck, text: 'Advanced team collaboration' },
          ],
        },
        {
          title: 'Platform Features',
          items: [
            { icon: Globe, text: 'Custom Domains' },
            { icon: Zap, text: 'Marketing Platform Access' },
            { icon: Palette, text: 'Smart Sections' },
            { icon: BarChart, text: 'Advanced Analytics' },
            { icon: Check, text: 'Remove Watermark' },
          ],
        },
        {
          title: 'Support',
          items: [
            { icon: Mail, text: 'Priority Support' },
            { icon: Clock, text: '24/7 support' },
            { icon: Bell, text: 'Dedicated success manager' },
          ],
        },
      ],
      isPopular: true,
    },
    {
      tier: 'MAX',
      title: 'MAX',
      monthlyPrice: 99700, // $997
      annualPrice: 1076700, // $10,767 (10% discount)
      setupFee: 150000, // $1,500
      description: 'Enterprise-ready solution',
      features: [
        {
          title: 'Projects & Team',
          items: [
            { icon: Layers, text: '25 Projects' },
            { icon: Users, text: '10 Team Members' },
            { icon: UserCog, text: 'Role-based access control' },
            { icon: UserCheck, text: 'Advanced team collaboration' },
          ],
        },
        {
          title: 'Platform Features',
          items: [
            { icon: Globe, text: 'Custom Domains' },
            { icon: Zap, text: 'Marketing Platform Access' },
            { icon: Palette, text: 'Smart Sections' },
            { icon: BarChart, text: 'Advanced Analytics' },
            { icon: Star, text: 'White Label Options' },
            { icon: Check, text: 'Remove Watermark' },
          ],
        },
        {
          title: 'Security & Support',
          items: [
            { icon: ShieldCheck, text: 'Enterprise security' },
            { icon: Mail, text: 'Dedicated Support' },
            { icon: Clock, text: '24/7 premium support' },
            { icon: Star, text: 'Custom SLA agreements' },
          ],
        },
      ],
    },
  ];

  const handleSelectTier = async (tier: TierName) => {
    // For cold visitors without invitation, show email dialog first
    if (!flow || flow !== 'invitation') {
      setPendingTier(tier);
      setShowEmailDialog(true);
      return;
    }

    // For invitation flow, proceed directly
    proceedToCheckout(tier);
  };

  const proceedToCheckout = async (tier: TierName, userEmail?: string) => {
    try {
      setLoading(true);
      setSelectedTier(tier);

      // Determine flow type
      const flowType = flow === 'invitation' && invitationToken ? 'invitation' : 'cold';

      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier,
          flow: flowType,
          billingPeriod: isAnnually ? 'yearly' : 'monthly',
          invitationToken: flowType === 'invitation' ? invitationToken : undefined,
          email: userEmail, // Include email for cold flow
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Failed to start checkout process. Please try again.'
      );
      setLoading(false);
      setSelectedTier(null);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Close dialog and proceed with checkout
    setShowEmailDialog(false);
    if (pendingTier) {
      proceedToCheckout(pendingTier, email);
    }
  };

  return (
    <section className="min-h-screen bg-background py-16">
      <div className="container mx-auto">
        {/* Logo */}
        <div className="mx-auto mb-12 flex justify-center">
          <img 
            src="/images/branding/logo-full.png" 
            alt="Wondrous Digital" 
            className="h-12 w-auto"
          />
        </div>

        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-center text-4xl font-semibold lg:text-5xl">
            Choose the right plan for you
          </h2>
        </div>

        {/* Cancel anytime info */}
        <div className="mx-auto mb-8 flex max-w-3xl items-center justify-center">
          <span className="text-center text-sm font-medium">
            Cancel any time, without any hassle
          </span>
        </div>

        {flow === 'invitation' && (
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <Badge className="px-4 py-2 text-sm">
              Complete your account setup by selecting a plan
            </Badge>
          </div>
        )}

        {/* Billing Cycle Toggle */}
        <div className="flex flex-col items-center gap-2">
          <div className="bg-muted flex h-12 items-center rounded-full p-1">
            <RadioGroup
              defaultValue="monthly"
              className="h-full grid-cols-2"
              onValueChange={(value) => {
                setIsAnnually(value === 'annually');
              }}
            >
              <div className='has-[button[data-state="checked"]]:bg-background h-full rounded-full transition-all'>
                <RadioGroupItem
                  value="monthly"
                  id="monthly"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="monthly"
                  className="text-muted-foreground peer-data-[state=checked]:text-primary flex h-full cursor-pointer items-center justify-center px-7 text-xl font-semibold"
                >
                  Monthly
                </Label>
              </div>
              <div className='has-[button[data-state="checked"]]:bg-background h-full rounded-full transition-all'>
                <RadioGroupItem
                  value="annually"
                  id="annually"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="annually"
                  className="text-muted-foreground peer-data-[state=checked]:text-primary flex h-full cursor-pointer items-center justify-center gap-1 px-7 text-xl font-semibold"
                >
                  Yearly
                  <Badge
                    variant="outline"
                    className="bg-primary text-secondary ml-2 px-1.5"
                  >
                    Save 10%
                  </Badge>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Pricing Packages */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <div key={pkg.tier} className="rounded-2xl border p-6">
              <div className="flex h-full flex-col justify-between gap-5">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl">{pkg.title}</h3>
                    {pkg.isPopular && <Badge>Most Popular</Badge>}
                  </div>
                  <div className="mb-2 flex items-baseline gap-2">
                    <span className="text-5xl font-semibold">
                      {isAnnually 
                        ? formatCurrency(Math.round(pkg.annualPrice / 12))
                        : formatCurrency(pkg.monthlyPrice)}
                    </span>
                    <span className="text-muted-foreground">
                      {isAnnually ? "/mo, billed annually" : "/mo"}
                    </span>
                  </div>
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="mb-2">
                          <span className="text-sm text-muted-foreground">
                            + {formatCurrency(pkg.setupFee)} one-time setup fee
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        One-time setup fee includes onboarding, training, and initial configuration.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <p className="text-sm text-muted-foreground mb-4">
                    {pkg.description}
                  </p>
                  <Button 
                    className="mt-6 w-full rounded-full" 
                    onClick={() => handleSelectTier(pkg.tier)}
                    disabled={loading}
                  >
                    {loading && selectedTier === pkg.tier ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Preparing checkout...
                      </>
                    ) : (
                      `Get ${pkg.tier}`
                    )}
                  </Button>
                  <div className="mt-6">
                    {pkg.features.map((feature, i) => (
                      <div key={i} className="mb-6">
                        <h4 className="text-muted-foreground mb-3 text-sm font-medium">
                          {feature.title}
                        </h4>
                        <ul className="flex flex-col gap-3">
                          {feature.items.map((item, j) => (
                            <li key={j} className="flex gap-2 text-sm">
                              <item.icon className="text-primary mt-0.5 size-4 shrink-0" />
                              {item.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
      
      {/* Add-ons Section */}
      <PricingAddons isAnnually={isAnnually} />

      {/* Footer sections moved below add-ons */}
      <div className="container mx-auto">
        {/* Security note */}
        <div className="text-muted-foreground mt-8 flex items-center justify-center">
          <Lock className="size-4" />
          <span className="ml-2 text-sm">
            Secure payment powered by Stripe
          </span>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>All prices are in USD. {isAnnually ? 'Billed annually.' : 'Billed monthly.'}</p>
          <p className="mt-2">
            Questions? Contact us at{' '}
            <a href="mailto:hello@wondrousdigital.com" className="text-primary hover:underline">
              hello@wondrousdigital.com
            </a>
          </p>
        </div>
      </div>

      {/* Email Collection Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Get Started with {pendingTier}</DialogTitle>
            <DialogDescription>
              Enter your email to continue to checkout. You'll create your account after payment.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEmailDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Continue to Checkout
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default function PricingPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  );
}