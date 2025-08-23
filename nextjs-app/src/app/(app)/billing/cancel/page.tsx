'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AlertTriangle,
  CheckCircle,
  Gift,
  HelpCircle,
  MessageSquare,
  Zap,
  ChevronLeft,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';

const cancellationReasons = [
  { id: 'too_expensive', label: 'Too expensive', icon: '💰' },
  { id: 'not_using', label: 'Not using it enough', icon: '📉' },
  { id: 'missing_features', label: 'Missing features I need', icon: '🔧' },
  { id: 'found_alternative', label: 'Found an alternative', icon: '🔄' },
  { id: 'technical_issues', label: 'Technical issues', icon: '⚠️' },
  { id: 'other', label: 'Other reason', icon: '💭' },
];

const retentionOffers = {
  too_expensive: {
    title: 'Get 30% off for 3 months',
    description: 'We value your business. Stay with us and save 30% on your next 3 months.',
    icon: Gift,
    color: 'text-green-600',
  },
  not_using: {
    title: 'Free consultation to maximize value',
    description: 'Let our experts show you how to get the most from your subscription.',
    icon: MessageSquare,
    color: 'text-blue-600',
  },
  missing_features: {
    title: 'Priority feature development',
    description: 'Tell us what you need and we\'ll prioritize it in our roadmap.',
    icon: Zap,
    color: 'text-purple-600',
  },
  found_alternative: {
    title: 'Exclusive features coming soon',
    description: 'Stay for our upcoming releases that will blow the competition away.',
    icon: CheckCircle,
    color: 'text-indigo-600',
  },
  technical_issues: {
    title: 'Priority support access',
    description: 'Get direct access to our engineering team to resolve any issues.',
    icon: HelpCircle,
    color: 'text-orange-600',
  },
  other: {
    title: 'Let\'s talk',
    description: 'We\'d love to understand how we can better serve you.',
    icon: MessageSquare,
    color: 'text-gray-600',
  },
};

export default function CancelSubscriptionPage() {
  const router = useRouter();
  const { currentAccount: selectedAccount } = useAuth();
  const [selectedReason, setSelectedReason] = useState('');
  const [additionalFeedback, setAdditionalFeedback] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRetentionOffer, setShowRetentionOffer] = useState(false);
  const [processingCancellation, setProcessingCancellation] = useState(false);
  const [acceptingOffer, setAcceptingOffer] = useState(false);

  const handleReasonSelect = (reason: string) => {
    setSelectedReason(reason);
    // Show retention offer immediately when reason is selected
    if (reason && retentionOffers[reason as keyof typeof retentionOffers]) {
      setShowRetentionOffer(true);
    }
  };

  const handleAcceptOffer = async () => {
    setAcceptingOffer(true);
    try {
      // Here we would apply the retention offer
      // For now, just simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Great choice! Your special offer has been applied.');
      router.push('/billing');
    } catch (error) {
      console.error('Error applying offer:', error);
      toast.error('Failed to apply offer. Please contact support.');
      setAcceptingOffer(false);
    }
  };

  const handleProceedToCancellation = () => {
    setShowRetentionOffer(false);
    setShowConfirmDialog(true);
  };

  const handleConfirmCancellation = async () => {
    setProcessingCancellation(true);
    try {
      // Create Stripe portal session for cancellation
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: selectedAccount?.id,
          returnUrl: '/billing',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      
      // Track cancellation reason
      await fetch('/api/analytics/cancellation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: selectedAccount?.id,
          reason: selectedReason,
          feedback: additionalFeedback,
        }),
      }).catch(console.error); // Don't block on analytics
      
      // Redirect to Stripe portal
      window.location.href = url;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription. Please try again.');
      setProcessingCancellation(false);
    }
  };

  const currentOffer = selectedReason ? retentionOffers[selectedReason as keyof typeof retentionOffers] : null;
  const OfferIcon = currentOffer?.icon;

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Button 
        onClick={() => router.push('/billing')}
        variant="ghost"
        className="mb-6"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Billing
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Cancel Subscription</h1>
        <p className="text-muted-foreground mt-2">
          We\'re sorry to see you go. Please help us improve by telling us why.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Before you go...</CardTitle>
          <CardDescription>
            Your subscription includes valuable features that help grow your business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 mb-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Unlimited website updates</p>
                <p className="text-sm text-muted-foreground">Keep your site fresh with no restrictions</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Premium templates & themes</p>
                <p className="text-sm text-muted-foreground">Access to our entire library of designs</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Priority support</p>
                <p className="text-sm text-muted-foreground">Get help when you need it most</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Why are you cancelling?</CardTitle>
          <CardDescription>
            Your feedback helps us improve our service
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={selectedReason} 
            onValueChange={handleReasonSelect}
            className="grid gap-4"
          >
            {cancellationReasons.map((reason) => (
              <div key={reason.id} className="flex items-center space-x-3">
                <RadioGroupItem value={reason.id} id={reason.id} />
                <Label htmlFor={reason.id} className="flex items-center cursor-pointer">
                  <span className="mr-2 text-xl">{reason.icon}</span>
                  {reason.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="mt-6">
            <Label htmlFor="feedback">Additional feedback (optional)</Label>
            <Textarea
              id="feedback"
              value={additionalFeedback}
              onChange={(e) => setAdditionalFeedback(e.target.value)}
              placeholder="Tell us more about your experience..."
              className="mt-2"
              rows={4}
            />
          </div>

          <Alert className="mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>What happens when you cancel</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Your subscription will remain active until the end of your billing period</li>
                <li>You\'ll lose access to premium features after expiration</li>
                <li>Your data will be retained for 30 days</li>
                <li>You can reactivate anytime to restore full access</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="flex justify-end mt-6 gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/billing')}
            >
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleProceedToCancellation}
              disabled={!selectedReason}
            >
              Continue with Cancellation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Retention Offer Dialog */}
      <Dialog open={showRetentionOffer} onOpenChange={setShowRetentionOffer}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              {OfferIcon && <OfferIcon className={`h-8 w-8 ${currentOffer?.color}`} />}
              <DialogTitle className="text-xl">{currentOffer?.title}</DialogTitle>
            </div>
            <DialogDescription className="text-base">
              {currentOffer?.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={handleProceedToCancellation}
              disabled={acceptingOffer}
            >
              No thanks, cancel anyway
            </Button>
            <Button
              onClick={handleAcceptOffer}
              disabled={acceptingOffer}
              className="bg-green-600 hover:bg-green-700"
            >
              {acceptingOffer ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Applying offer...
                </>
              ) : (
                'Accept offer & stay'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Final Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Cancellation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? This action cannot be undone immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={processingCancellation}
            >
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancellation}
              disabled={processingCancellation}
            >
              {processingCancellation ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Yes, Cancel Subscription'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}