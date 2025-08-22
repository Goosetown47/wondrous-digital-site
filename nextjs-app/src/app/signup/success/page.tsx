'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SignupSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear all signup session data after successful completion
    sessionStorage.removeItem('invitationToken');
    sessionStorage.removeItem('signupFlow');
    sessionStorage.removeItem('signupEmail');
    sessionStorage.removeItem('signupAccountId');
    sessionStorage.removeItem('signupAccountName');
    sessionStorage.removeItem('signupProfileData');
    
    // Trigger multiple confetti animations for a celebratory effect
    const timer = setTimeout(() => {
      // Fire confetti from the left
      confetti({
        particleCount: 100,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 }
      });
      
      // Fire confetti from the right
      confetti({
        particleCount: 100,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 }
      });

      // Center explosion
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { x: 0.5, y: 0.5 }
      });

      // Top corners
      confetti({
        particleCount: 75,
        angle: 135,
        spread: 70,
        origin: { x: 0, y: 0 }
      });

      confetti({
        particleCount: 75,
        angle: 45,
        spread: 70,
        origin: { x: 1, y: 0 }
      });

      // Additional bursts for more celebration
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 90,
          spread: 45,
          origin: { x: 0.5, y: 0.7 }
        });
      }, 200);

      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 60,
          origin: { x: 0.5, y: 0.6 }
        });
      }, 400);
    }, 500);

    // Clear session storage
    sessionStorage.removeItem('signupAccountId');
    sessionStorage.removeItem('signupAccountName');
    sessionStorage.removeItem('signup_email');
    sessionStorage.removeItem('signup_token');

    return () => clearTimeout(timer);
  }, []);

  const handleGoToDashboard = () => {
    // Force a hard refresh to ensure fresh data
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center bg-white">
      {/* Success Message - No card, just centered content */}
      <div className="max-w-lg mx-auto text-center px-6">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-10 h-10 text-white" strokeWidth={3} />
          </div>
        </div>

        {/* Success Text */}
        <h1 className="text-4xl font-bold mb-4">Way to go!</h1>
        
        <p className="text-xl text-gray-600 mb-8">
          You're all set.
        </p>

        <p className="text-gray-500 mb-8">
          Your account has been successfully created and your payment has been processed. 
          You're ready to start building amazing experiences for your customers!
        </p>

        {/* CTA Button */}
        <Button
          size="lg"
          onClick={handleGoToDashboard}
          className="min-w-[200px]"
        >
          To the Dashboard!
        </Button>

        {/* Additional Info */}
        <p className="text-sm text-gray-400 mt-8">
          You'll receive a confirmation email shortly with your receipt and account details.
        </p>
      </div>
    </div>
  );
}