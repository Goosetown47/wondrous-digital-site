'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, TrendingUp, Search, Zap, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatCurrency } from '@/lib/stripe/client-utils';

interface PricingAddonsProps {
  isAnnually?: boolean;
}

export function PricingAddons({ isAnnually = false }: PricingAddonsProps) {
  const [loading, setLoading] = useState(false);

  const handleAddPerform = async () => {
    try {
      setLoading(true);
      
      // For now, just show a message. This will create a checkout session for the add-on
      toast.info('Adding PERFORM to your subscription. This feature is coming soon!');
      
      // In future: Create checkout session for PERFORM add-on
      // This would add PERFORM to the existing Stripe subscription
      // const response = await fetch('/api/stripe/add-addon', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     addon: 'PERFORM',
      //     billingPeriod: isAnnually ? 'yearly' : 'monthly',
      //   }),
      // });
      
    } catch (error) {
      console.error('Error adding PERFORM:', error);
      toast.error('Failed to add PERFORM. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const performMonthlyPrice = 45900; // $459
  const performAnnualPrice = 495700; // $4,957 (10% discount)
  const performSetupFee = 75000; // $750

  return (
    <section className="py-16">
      <div className="container mx-auto">
        <div className="mb-8">
          <div className="mx-auto text-center">
            <h2 className="mb-4 text-2xl font-medium md:text-3xl lg:text-4xl">
              Power up with add-ons
            </h2>
            <p className="text-xs text-muted-foreground md:text-sm lg:text-base">
              Enhance your website builder experience with powerful add-ons designed to boost 
              your marketing performance and SEO rankings.
            </p>
          </div>
        </div>
        
        {/* PERFORM Add-on Card - styled like main pricing cards */}
        <div className="mx-auto max-w-sm">
          <div className="rounded-2xl border p-6">
            <div className="flex h-full flex-col justify-between gap-5">
              <div>
                <div className="mb-4">
                  <h3 className="text-xl">PERFORM</h3>
                </div>
                <div className="mb-2 flex items-baseline gap-2">
                  <span className="text-5xl font-semibold">
                    {isAnnually 
                      ? formatCurrency(Math.round(performAnnualPrice / 12))
                      : formatCurrency(performMonthlyPrice)}
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
                          + {formatCurrency(performSetupFee)} one-time setup fee
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      One-time setup fee includes SEO audit, initial configuration, and training.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <p className="text-sm text-muted-foreground mb-4">
                  Advanced SEO optimization platform
                </p>
                <Button 
                  className="mt-6 w-full rounded-full" 
                  onClick={handleAddPerform}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Add PERFORM'
                  )}
                </Button>
                <div className="mt-6">
                  <div className="mb-6">
                    <h4 className="text-muted-foreground mb-3 text-sm font-medium">
                      SEO Features
                    </h4>
                    <ul className="flex flex-col gap-3">
                      <li className="flex gap-2 text-sm">
                        <Search className="text-primary mt-0.5 size-4 shrink-0" />
                        AI-powered SEO recommendations
                      </li>
                      <li className="flex gap-2 text-sm">
                        <TrendingUp className="text-primary mt-0.5 size-4 shrink-0" />
                        Real-time ranking tracking
                      </li>
                      <li className="flex gap-2 text-sm">
                        <BarChart className="text-primary mt-0.5 size-4 shrink-0" />
                        Competitor analysis tools
                      </li>
                    </ul>
                  </div>
                  <div className="mb-6">
                    <h4 className="text-muted-foreground mb-3 text-sm font-medium">
                      Marketing Tools
                    </h4>
                    <ul className="flex flex-col gap-3">
                      <li className="flex gap-2 text-sm">
                        <Zap className="text-primary mt-0.5 size-4 shrink-0" />
                        Content optimization
                      </li>
                      <li className="flex gap-2 text-sm">
                        <TrendingUp className="text-primary mt-0.5 size-4 shrink-0" />
                        Performance monitoring
                      </li>
                      <li className="flex gap-2 text-sm">
                        <Search className="text-primary mt-0.5 size-4 shrink-0" />
                        Keyword research tools
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}