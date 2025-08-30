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
import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatCurrency } from '@/lib/stripe/client-utils';
import { Button } from '@/components/ui/button';
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

export default function SignupPricingPage() {
  // const router = useRouter();
  const supabase = createClient();
  const [isAnnually, setIsAnnually] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<TierName | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);

  useEffect(() => {
    // Get account ID from session storage or user's account
    const getAccountInfo = async () => {
      const storedAccountId = sessionStorage.getItem('signupAccountId');
      if (storedAccountId) {
        setAccountId(storedAccountId);
        console.log('[SignupPricing] Using stored account ID:', storedAccountId);
        return;
      }

      // If no stored account ID, try to get from user's account
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Restore invitation token to sessionStorage if it exists in user metadata
        // This ensures the stepper shows correctly for warm prospects
        if (user.user_metadata?.invitation_token && !sessionStorage.getItem('invitationToken')) {
          sessionStorage.setItem('invitationToken', user.user_metadata.invitation_token);
        }
        
        const { data: accountUser } = await supabase
          .from('account_users')
          .select('account_id')
          .eq('user_id', user.id)
          .single();
        
        if (accountUser) {
          setAccountId(accountUser.account_id);
          console.log('[SignupPricing] Found account ID from account_users:', accountUser.account_id);
          // Also store it for future use
          sessionStorage.setItem('signupAccountId', accountUser.account_id);
        } else {
          console.log('[SignupPricing] No account found for user');
          
          // Last resort: If warm prospect, try to get account from invitation
          if (user.user_metadata?.invitation_token) {
            console.log('[SignupPricing] Checking invitation for account...');
            const { data: invitation } = await supabase
              .from('account_invitations')
              .select('account_id, accounts!inner(name)')
              .eq('token', user.user_metadata.invitation_token)
              .eq('email', user.email?.toLowerCase())
              .single();
            
            if (invitation) {
              console.log('[SignupPricing] Found account from invitation:', invitation.account_id);
              setAccountId(invitation.account_id);
              sessionStorage.setItem('signupAccountId', invitation.account_id);
              if ('accounts' in invitation && invitation.accounts && !Array.isArray(invitation.accounts)) {
                sessionStorage.setItem('signupAccountName', (invitation.accounts as { name: string }).name);
              }
            }
          }
        }
      }
    };

    getAccountInfo();
  }, [supabase]);

  // Pricing packages data matching our actual tiers
  const packages: PricingPackage[] = [
    {
      tier: 'PRO',
      title: 'PRO',
      monthlyPrice: 39700, // $397
      annualPrice: 428700, // $4,287 (10% discount)
      setupFee: 150000, // $1,500
      description: '',
      features: [
        {
          title: 'Smart Marketing Platform',
          items: [
            { icon: Mail, text: '10,000 emails' },
            { icon: Bell, text: '250 SMS/calls' },
            { icon: Zap, text: '1,000 AI words' },
            { icon: Star, text: '100 premium automation executions' },
            { icon: Layers, text: '25 workflow AI executions' },
            { icon: Check, text: 'Unlimited forms/calendar bookings' },
          ],
        },
        {
          title: 'Platform Features',
          items: [
            { icon: Users, text: '3 user accounts' },
            { icon: Layers, text: '5 projects' },
            { icon: Globe, text: 'Custom domains' },
            { icon: ShieldCheck, text: 'Premium support' },
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
      description: '',
      features: [
        {
          title: 'Smart Marketing Platform',
          items: [
            { icon: Mail, text: '20,000 emails' },
            { icon: Bell, text: '750 SMS/calls' },
            { icon: Zap, text: '5,000 AI words' },
            { icon: Star, text: '500 premium automation executions' },
            { icon: Layers, text: '150 workflow AI executions' },
            { icon: Check, text: 'Unlimited forms/calendar bookings' },
          ],
        },
        {
          title: 'Platform Features',
          items: [
            { icon: Users, text: '5 user accounts' },
            { icon: Layers, text: '10 projects' },
            { icon: Globe, text: 'Custom domains' },
            { icon: ShieldCheck, text: 'Premium support' },
          ],
        },
      ],
    },
    {
      tier: 'MAX',
      title: 'MAX',
      monthlyPrice: 99700, // $997
      annualPrice: 1076700, // $10,767 (10% discount)
      setupFee: 150000, // $1,500
      description: '',
      features: [
        {
          title: 'Smart Marketing Platform',
          items: [
            { icon: Mail, text: '45,000 emails' },
            { icon: Bell, text: '1,500 SMS/calls' },
            { icon: Zap, text: '10,000 AI words' },
            { icon: Star, text: '1,000 premium automation executions' },
            { icon: Layers, text: '300 workflow AI executions' },
            { icon: Check, text: 'Unlimited forms/calendar bookings' },
          ],
        },
        {
          title: 'Platform Features',
          items: [
            { icon: Users, text: '10 user accounts' },
            { icon: Layers, text: '25 projects' },
            { icon: Globe, text: 'Custom domains' },
            { icon: ShieldCheck, text: 'Premium support' },
          ],
        },
      ],
    },
  ];

  const handleSelectTier = async (tier: TierName) => {
    try {
      setLoading(true);
      setSelectedTier(tier);

      // Check if this is a warm prospect (has invitation token)
      const invitationToken = sessionStorage.getItem('invitationToken');
      const isWarmProspect = !!invitationToken;

      // Create checkout session with the selected tier
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier,
          flow: 'signup',
          billingPeriod: isAnnually ? 'yearly' : 'monthly',
          accountId,
          isWarmProspect, // Pass this to help with success URL
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

  return (
    <section className="min-h-[calc(100vh-140px)] bg-background py-16">
      <div className="container mx-auto">
        {/* Heading */}
        <div className="mx-auto max-w-4xl text-center mb-8">
          <h1 className="mb-4 text-4xl font-bold lg:text-5xl">
            Pick a plan that works for you.
          </h1>
          <p className="text-lg text-muted-foreground">
            Every plan gets all the smart marketing features. Our plans are usage based. You pay for what you use. Cancel any time, without any hassle.
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex flex-col items-center gap-2 mb-10">
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {packages.map((pkg) => (
            <div key={pkg.tier} className="rounded-2xl border p-6">
              <div className="flex h-full flex-col justify-between gap-5">
                <div>
                  <div className="mb-4">
                    <h3 className="text-xl">{pkg.title}</h3>
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
                            + {formatCurrency(pkg.setupFee)} one-time Marketing Platform setup fee
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        One-time setup fee includes onboarding, training, and initial configuration.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {pkg.description && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {pkg.description}
                    </p>
                  )}
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
                      `Select ${pkg.tier}`
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

        {/* Security note */}
        <div className="text-muted-foreground mt-12 flex items-center justify-center">
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
    </section>
  );
}