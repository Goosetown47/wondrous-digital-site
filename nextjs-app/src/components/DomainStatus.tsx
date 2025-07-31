'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Shield, ShieldOff, Loader2, Clock } from 'lucide-react';
import { useDomainStatus } from '@/hooks/useDomains';

interface DomainStatusProps {
  domainId: string;
  domain: string;
  verified: boolean;
}

export function DomainStatus({ domainId, domain, verified }: DomainStatusProps) {
  const { data: status, isLoading, error } = useDomainStatus(verified ? null : domainId);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Use database status if no real-time status available
  const isVerified = status?.verified ?? verified;
  const sslState = status?.ssl?.state;

  // Handle errors gracefully
  if (error) {
    console.error('Error fetching domain status:', error);
  }

  // Track elapsed time for unverified domains
  useEffect(() => {
    if (!isVerified) {
      const interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [isVerified]);

  // Estimate propagation time based on domain type
  const isApexDomain = domain.split('.').length === 2;
  const estimatedMinutes = isApexDomain ? '15-60' : '5-30';
  
  // Format elapsed time
  const formatElapsedTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} hour${hours !== 1 ? 's' : ''} ${mins > 0 ? `${mins} min` : ''}`;
  };

  if (isLoading) {
    return (
      <span className="flex items-center text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        Checking...
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        {/* Verification Status */}
        {isVerified ? (
          <span className="flex items-center text-xs text-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </span>
        ) : (
          <span className="flex items-center text-xs text-yellow-600">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending Verification
          </span>
        )}
        
        {/* SSL Status */}
        {isVerified && sslState && (
          <span className={`flex items-center text-xs ${
            sslState === 'READY' ? 'text-green-600' : 
            sslState === 'ERROR' ? 'text-red-600' : 
            'text-yellow-600'
          }`}>
            {sslState === 'READY' ? (
              <>
                <Shield className="h-3 w-3 mr-1" />
                SSL Active
              </>
            ) : sslState === 'ERROR' ? (
              <>
                <ShieldOff className="h-3 w-3 mr-1" />
                SSL Error
              </>
            ) : (
              <>
                <Shield className="h-3 w-3 mr-1" />
                SSL {sslState === 'INITIALIZING' ? 'Initializing' : 'Pending'}
              </>
            )}
          </span>
        )}
      </div>
      
      {/* Time Estimation for Pending Domains */}
      {!isVerified && (
        <span className="flex items-center text-xs text-muted-foreground ml-4">
          <Clock className="h-3 w-3 mr-1" />
          {elapsedTime > 0 ? (
            <span>
              Waiting {formatElapsedTime(elapsedTime)} 
              <span className="text-muted-foreground/70"> (usually {estimatedMinutes} min)</span>
            </span>
          ) : (
            <span>Usually {estimatedMinutes} minutes</span>
          )}
        </span>
      )}
    </div>
  );
}