'use client';

import { useEffect, useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import { AlertTriangle, CreditCard } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface GracePeriodAlertProps {
  gracePeriodEndsAt: string | null;
  subscriptionState?: string;
  currentTier: string;
  onUpdatePayment?: () => void;
}

export function GracePeriodAlert({
  gracePeriodEndsAt,
  subscriptionState,
  currentTier,
  onUpdatePayment
}: GracePeriodAlertProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (!gracePeriodEndsAt || subscriptionState !== 'past_due') return;

    const updateTimer = () => {
      const now = new Date();
      const endDate = new Date(gracePeriodEndsAt);
      const totalGracePeriod = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds
      
      const remainingMs = endDate.getTime() - now.getTime();
      const elapsedMs = totalGracePeriod - remainingMs;
      const progressPercent = Math.min(100, Math.max(0, (elapsedMs / totalGracePeriod) * 100));
      
      setProgress(progressPercent);
      
      if (remainingMs <= 0) {
        setTimeRemaining('Grace period expired');
        return;
      }
      
      const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        setTimeRemaining(`${days} day${days !== 1 ? 's' : ''} and ${hours} hour${hours !== 1 ? 's' : ''}`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours} hour${hours !== 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}`);
      } else {
        setTimeRemaining(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [gracePeriodEndsAt, subscriptionState]);

  if (!gracePeriodEndsAt || subscriptionState !== 'past_due') {
    return null;
  }

  const endDate = new Date(gracePeriodEndsAt);
  const daysRemaining = differenceInDays(endDate, new Date());
  
  // Determine urgency level
  const isUrgent = daysRemaining <= 1;
  const isWarning = daysRemaining <= 7;
  
  const iconColor = isUrgent ? 'text-red-600' : isWarning ? 'text-orange-600' : 'text-yellow-600';

  return (
    <Alert className={`
      ${isUrgent ? 'border-red-600 bg-red-50' : ''}
      ${isWarning && !isUrgent ? 'border-orange-600 bg-orange-50' : ''}
      ${!isWarning && !isUrgent ? 'border-yellow-600 bg-yellow-50' : ''}
      mb-6
    `}>
      <AlertTriangle className={`h-5 w-5 ${iconColor}`} />
      <AlertTitle className="text-lg font-semibold">
        {isUrgent ? '🚨 URGENT: ' : isWarning ? '⚠️ Warning: ' : '⏰ '}
        Payment Required - {timeRemaining} Remaining
      </AlertTitle>
      <AlertDescription className="mt-3 space-y-3">
        <p className="text-sm">
          Your payment failed and your account is in a grace period. 
          {isUrgent 
            ? ` Your account will be downgraded to FREE tomorrow if payment is not updated!`
            : ` You have ${timeRemaining} to update your payment method before your account is downgraded to FREE.`
          }
        </p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Grace Period Progress</span>
            <span className="font-medium">{Math.round(progress)}% elapsed</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Started: {format(new Date(endDate.getTime() - 14 * 24 * 60 * 60 * 1000), 'MMM d')}</span>
            <span>Ends: {format(endDate, 'MMM d, yyyy at h:mm a')}</span>
          </div>
        </div>

        <div className="pt-2 space-y-3">
          <div className="p-3 bg-white rounded-md border">
            <p className="text-sm font-medium mb-2">What happens if you don't update payment?</p>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>Your {currentTier} subscription will be cancelled</li>
              <li>Account will be downgraded to FREE tier</li>
              <li>Access to premium features will be removed</li>
              <li>Projects may be limited or paused</li>
            </ul>
          </div>

          <Button 
            onClick={onUpdatePayment}
            className="w-full"
            size="lg"
            variant={isUrgent ? "destructive" : "default"}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Update Payment Method Now
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}