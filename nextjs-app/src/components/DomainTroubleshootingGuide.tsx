'use client';

import { useState } from 'react';
import { 
  AlertCircle, 
  ChevronDown, 
  ChevronRight, 
  Globe,
  Shield,
  Clock,
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
}

const troubleshootingSteps: TroubleshootingStep[] = [
  {
    id: 'dns-not-propagated',
    title: 'Your changes are still spreading across the internet',
    description: 'When you update your domain settings, it takes time for the changes to reach everywhere. Think of it like updating your address - it takes time for everyone to get the memo.',
    solution: [
      'This is completely normal! Here\'s what to expect:',
      '• Subdomains (like www.yourdomain.com): Usually ready in 5-30 minutes',
      '• Main domains (like yourdomain.com): Usually ready in 15-60 minutes',
      '• Try refreshing this page in a few minutes',
      '• The "Check DNS Propagation" button above shows your progress'
    ]
  },
  {
    id: 'wrong-cname',
    title: 'Your domain isn\'t pointing to the right place',
    description: 'Your domain needs to point to our servers so we can show your website. Right now, it might be pointing somewhere else or have a typo.',
    solution: [
      'In your domain provider\'s settings, make sure you have:',
      '• Type: CNAME',
      '• Points to: sites.wondrousdigital.com',
      '• Common mistakes to check:',
      '  - No "https://" at the beginning',
      '  - No "/" at the end',
      '  - Exactly as shown above'
    ]
  },
  {
    id: 'conflicting-records',
    title: 'You have multiple settings that are conflicting',
    description: 'It looks like your domain has multiple forwarding instructions, and they\'re contradicting each other. It\'s like giving someone two different addresses - they won\'t know which one to use.',
    solution: [
      'In your domain settings, look for any duplicate entries and:',
      '• Keep only one CNAME record pointing to sites.wondrousdigital.com',
      '• Remove any other records for the same domain name',
      '• If you\'re trying to use your main domain (without www), your provider might need a special setting',
      '• As a backup plan: Try using www.yourdomain.com instead - it usually works more reliably'
    ]
  },
  {
    id: 'proxy-enabled',
    title: 'Your security settings might be blocking verification (Cloudflare users)',
    description: 'If you use Cloudflare for your domain, their security features might be preventing us from verifying your domain ownership.',
    solution: [
      'In your Cloudflare dashboard:',
      '• Find your domain and look for the orange cloud icon',
      '• Click it to turn it gray (this temporarily disables the proxy)',
      '• Try verifying again',
      '• Once verified, you can turn the orange cloud back on',
      '• Also check: SSL/TLS settings should be set to "Full"'
    ]
  },
  {
    id: 'ttl-too-high',
    title: 'Your domain is set to update slowly',
    description: 'Your domain has a setting that controls how fast changes spread. Right now it\'s set to update slowly, which means waiting longer.',
    solution: [
      'This is a bit technical, but here\'s what to do:',
      '• In your domain settings, look for "TTL" or "Time to Live"',
      '• Change it to 300 or "5 minutes"',
      '• This makes future changes happen faster',
      '• After your domain is working, you can change it back to 3600 or "1 hour"'
    ]
  },
  {
    id: 'ssl-pending',
    title: 'Your security certificate is being set up',
    description: 'Great news! Your domain is verified. We\'re now setting up the security certificate (the padlock icon in browsers). This happens automatically.',
    solution: [
      'No action needed! Here\'s what\'s happening:',
      '• We\'re generating a security certificate for your domain',
      '• This usually takes 5-10 minutes',
      '• You\'ll see a padlock icon in browsers when it\'s ready',
      '• Just refresh this page in a few minutes'
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
                  
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Still need help?</strong> Sometimes domain setup can be tricky. If you've waited an hour and followed the steps above, 
          the issue might be specific to your domain provider. Most providers have support teams who can help you set up a CNAME record - 
          just tell them you need to point your domain to <span className="font-mono font-semibold">sites.wondrousdigital.com</span>
        </AlertDescription>
      </Alert>
    </div>
  );
}