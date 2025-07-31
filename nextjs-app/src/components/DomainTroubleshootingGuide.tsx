'use client';

import { useState } from 'react';
import { 
  AlertCircle, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle, 
  XCircle,
  Terminal,
  Globe,
  Shield,
  Clock,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface TroubleshootingStep {
  id: string;
  title: string;
  description: string;
  solution: string | string[];
  command?: string;
}

const troubleshootingSteps: TroubleshootingStep[] = [
  {
    id: 'dns-not-propagated',
    title: 'DNS changes haven\'t propagated yet',
    description: 'DNS changes can take time to propagate globally. This is normal and depends on your DNS provider.',
    solution: [
      'Wait 5-30 minutes for subdomain records',
      'Wait 15-60 minutes for apex domain records',
      'Clear your browser\'s DNS cache',
      'Try accessing from a different network'
    ]
  },
  {
    id: 'wrong-cname',
    title: 'Incorrect CNAME record',
    description: 'The CNAME record must point exactly to sites.wondrousdigital.com',
    solution: 'Double-check that your CNAME record points to: sites.wondrousdigital.com (no https://, no trailing slash)',
    command: 'nslookup yourdomain.com'
  },
  {
    id: 'conflicting-records',
    title: 'Conflicting DNS records',
    description: 'Having multiple records for the same domain can cause conflicts.',
    solution: [
      'Remove any A, AAAA, or other CNAME records for the same subdomain',
      'For apex domains, check if your provider supports CNAME flattening',
      'Consider using www subdomain if apex domain isn\'t working'
    ]
  },
  {
    id: 'proxy-enabled',
    title: 'Cloudflare proxy is enabled',
    description: 'If using Cloudflare, the orange cloud (proxy) can interfere with verification.',
    solution: [
      'Temporarily disable Cloudflare proxy (gray cloud) during verification',
      'Re-enable proxy after domain is verified',
      'Ensure SSL/TLS mode is set to "Full" in Cloudflare'
    ]
  },
  {
    id: 'ttl-too-high',
    title: 'DNS TTL is too high',
    description: 'High TTL values mean changes take longer to propagate.',
    solution: [
      'Set TTL to 300 (5 minutes) or lower when making changes',
      'Wait for the old TTL to expire before checking again',
      'After verification, you can increase TTL to 3600 (1 hour)'
    ]
  },
  {
    id: 'ssl-pending',
    title: 'SSL certificate is still provisioning',
    description: 'SSL certificates are automatically provisioned after domain verification.',
    solution: [
      'Wait 5-10 minutes after domain verification',
      'SSL provisioning is automatic - no action needed',
      'Check back in a few minutes'
    ]
  }
];

interface DomainTroubleshootingGuideProps {
  domain?: string;
  isVerified?: boolean;
}

export function DomainTroubleshootingGuide({ domain, isVerified }: DomainTroubleshootingGuideProps) {
  const [expandedSteps, setExpandedSteps] = useState<string[]>([]);

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const checkDNS = () => {
    if (domain) {
      window.open(`https://www.whatsmydns.net/#CNAME/${domain}`, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">Troubleshooting Guide</h3>
      </div>

      {domain && !isVerified && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            <strong>Quick Actions:</strong>
            <div className="mt-2 space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={checkDNS}
                className="mr-2"
              >
                <Globe className="h-3 w-3 mr-1" />
                Check DNS Propagation
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
              <span className="text-sm text-muted-foreground">
                for {domain}
              </span>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        {troubleshootingSteps.map((step) => {
          const isExpanded = expandedSteps.includes(step.id);
          
          return (
            <Collapsible
              key={step.id}
              open={isExpanded}
              onOpenChange={() => toggleStep(step.id)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-3 h-auto font-normal hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2 text-left">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="font-medium">{step.title}</span>
                  </div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 pb-3">
                <div className="pl-6 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Solution:</p>
                    {Array.isArray(step.solution) ? (
                      <ul className="list-disc list-inside space-y-1">
                        {step.solution.map((sol, index) => (
                          <li key={index} className="text-sm text-muted-foreground">
                            {sol}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">{step.solution}</p>
                    )}
                  </div>
                  
                  {step.command && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-1">Check with command:</p>
                      <code className="block p-2 bg-muted rounded text-xs font-mono">
                        <Terminal className="inline h-3 w-3 mr-1" />
                        {step.command.replace('yourdomain.com', domain || 'yourdomain.com')}
                      </code>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Still having issues?</strong> DNS propagation can sometimes take up to 48 hours in rare cases. 
          If you've waited and followed all steps, the issue might be with your DNS provider's configuration.
        </AlertDescription>
      </Alert>
    </div>
  );
}