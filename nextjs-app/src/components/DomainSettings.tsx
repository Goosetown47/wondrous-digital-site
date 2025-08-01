'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Globe, AlertCircle, Copy, ExternalLink, RefreshCw, Loader2, Info, ChevronDown } from 'lucide-react';
import { useDomains, useAddDomain, useRemoveDomain, useVerifyDomain, useVercelStatus } from '@/hooks/useDomains';
import { toast } from 'sonner';
import { DomainStatus } from '@/components/DomainStatus';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DomainTroubleshootingGuide } from '@/components/DomainTroubleshootingGuide';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface DomainSettingsProps {
  projectId: string;
  projectSlug: string;
}

// Domain validation regex - matches valid domain names
const DOMAIN_REGEX = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

// Check if domain is apex (root) domain like example.com vs subdomain like www.example.com
function isApexDomain(domain: string): boolean {
  const parts = domain.split('.');
  // Apex domains have 2 parts (example.com)
  // Exception for country-code TLDs (example.co.uk)
  const isCountryCodeTLD = /\.(co|com|net|org|gov|edu|ac)\.[a-z]{2}$/.test(domain);
  
  if (isCountryCodeTLD) {
    return parts.length === 3;
  }
  return parts.length === 2;
}

function validateDomain(domain: string): string | null {
  if (!domain) return null;
  
  // Remove whitespace
  const trimmed = domain.trim();
  
  // Check for protocol
  if (trimmed.includes('://')) {
    return 'Remove http:// or https:// from the domain';
  }
  
  // Check for paths
  if (trimmed.includes('/')) {
    return 'Domain should not include paths';
  }
  
  // Check for query strings
  if (trimmed.includes('?') || trimmed.includes('#')) {
    return 'Domain should not include query parameters';
  }
  
  // Check for spaces
  if (trimmed.includes(' ')) {
    return 'Domain cannot contain spaces';
  }
  
  // Check domain format
  if (!DOMAIN_REGEX.test(trimmed)) {
    return 'Please enter a valid domain (e.g., example.com or subdomain.example.com)';
  }
  
  return null; // Valid
}

export function DomainSettings({ projectId, projectSlug }: DomainSettingsProps) {
  const [newDomain, setNewDomain] = useState('');
  const [domainError, setDomainError] = useState<string | null>(null);
  const [selectedDomainType, setSelectedDomainType] = useState<'apex' | 'subdomain' | null>(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const { data: domains, isLoading } = useDomains(projectId);
  const { data: vercelStatus } = useVercelStatus();
  const addDomain = useAddDomain();
  const removeDomain = useRemoveDomain();
  const verifyDomain = useVerifyDomain();

  const handleDomainChange = (value: string) => {
    setNewDomain(value);
    // Validate on change for real-time feedback
    if (value) {
      const error = validateDomain(value);
      setDomainError(error);
      
      // Detect domain type if valid
      if (!error && value.includes('.')) {
        setSelectedDomainType(isApexDomain(value) ? 'apex' : 'subdomain');
      }
    } else {
      setDomainError(null);
      setSelectedDomainType(null);
    }
  };

  const handleAddDomain = () => {
    if (!newDomain) return;
    
    const error = validateDomain(newDomain);
    if (error) {
      setDomainError(error);
      return;
    }
    
    addDomain.mutate({
      projectId,
      domain: newDomain.toLowerCase().trim(),
    }, {
      onSuccess: () => {
        setNewDomain('');
        setDomainError(null);
        setSelectedDomainType(null);
      },
      onError: (error: Error & { code?: string }) => {
        if (error.code === '23505') {
          setDomainError('This domain is already configured for another project. Please use a different domain.');
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
          <Globe className="h-6 w-6" />
          Custom Domains
        </h2>
        <p className="text-muted-foreground">
          Add custom domains to make your site accessible at your own web address
        </p>
      </div>

      {/* Vercel Configuration Status */}
      {vercelStatus && !vercelStatus.configured && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Domain verification running in demo mode.</strong> To enable automatic SSL certificates and real domain verification, configure Vercel integration in your environment variables.
          </AlertDescription>
        </Alert>
      )}

      {/* Preview Domain Section */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <h3 className="font-semibold text-sm mb-2">Preview Domain</h3>
        <div className="flex items-center gap-2">
          <a
            href={`https://${projectSlug}.sites.wondrousdigital.com`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm flex-1 text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
          >
            {projectSlug}.sites.wondrousdigital.com
            <ExternalLink className="h-3 w-3" />
          </a>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              const previewDomain = `${projectSlug}.sites.wondrousdigital.com`;
              navigator.clipboard.writeText(previewDomain);
              toast.success('Preview domain copied to clipboard');
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Your site is automatically available at this preview domain
        </p>
      </div>
      
      <div className="space-y-4">
        {/* Add domain form */}
        <div className="space-y-2">
          <div className="flex space-x-2">
            <Input
              placeholder="yourdomain.com"
              value={newDomain}
              onChange={(e) => handleDomainChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !domainError && handleAddDomain()}
              className={domainError ? 'border-red-500' : ''}
            />
            <Button 
              onClick={handleAddDomain}
              disabled={!newDomain || !!domainError || addDomain.isPending}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Domain
            </Button>
          </div>
          {domainError && (
            <p className="text-sm text-red-500">{domainError}</p>
          )}
        </div>

        {/* Domain list */}
        <div className="space-y-2">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading domains...</p>
          ) : domains?.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No custom domains yet</p>
              <p className="text-xs mt-1">Add a domain to get started</p>
            </div>
          ) : (
            domains?.map((domain) => (
              <div 
                key={domain.id} 
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center space-x-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-sm">{domain.domain}</span>
                  <DomainStatus 
                    domainId={domain.id} 
                    domain={domain.domain} 
                    verified={domain.verified} 
                  />
                </div>
                <div className="flex items-center gap-1">
                  {!domain.verified && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => verifyDomain.mutate(domain.id)}
                      disabled={verifyDomain.isPending}
                      className="h-8 w-8"
                      title="Check verification status"
                    >
                      {verifyDomain.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDomain.mutate(domain.id)}
                    disabled={removeDomain.isPending}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 space-y-4">
          {/* What's This About? */}
          <div className="rounded-lg border bg-blue-50/50 p-4">
            <h4 className="font-semibold text-sm mb-2">What's happening here?</h4>
            <p className="text-sm text-muted-foreground">
              When someone types your domain name, we need to tell their browser where to find your website. 
              Think of it like setting up mail forwarding - the CNAME record tells browsers to come to our 
              servers to see your site. This lets us handle all the technical stuff (SSL certificates, security, 
              and performance) while you keep full ownership of your domain.
            </p>
          </div>

          {/* DNS Configuration */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Setup Instructions
            </h4>
            <ol className="text-sm space-y-1.5 text-muted-foreground">
              <li>1. Add your custom domain above</li>
              <li>2. Go to your domain provider's DNS settings</li>
              <li>3. Add this DNS record:</li>
              <li className="ml-4 mt-2">
                {selectedDomainType === 'apex' ? (
                  <div className="space-y-3">
                    <div className="bg-background rounded p-3 border">
                      <p className="text-xs font-medium mb-2">📌 Your domain: {newDomain || 'example.com'}</p>
                      <div className="space-y-2">
                        <p className="text-xs">Add a CNAME record:</p>
                        <div className="flex items-center gap-2 p-2 bg-muted rounded">
                          <code className="font-mono text-xs flex-1">CNAME → sites.wondrousdigital.com</code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              navigator.clipboard.writeText('sites.wondrousdigital.com');
                              toast.success('CNAME copied to clipboard');
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs space-y-1">
                      <p className="text-green-600 font-medium">✅ Works great with: Cloudflare, Netlify DNS, Vercel DNS</p>
                      <p className="text-yellow-600">⚠️ Having issues? Some providers need a different approach:</p>
                      <ul className="ml-4 space-y-0.5 text-muted-foreground">
                        <li>• Option 1: Set up forwarding from {newDomain || 'example.com'} → www.{newDomain || 'example.com'}</li>
                        <li>• Option 2: Use your provider's "domain forwarding" or "domain redirect" feature</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-background rounded p-3 border">
                      <p className="text-xs font-medium mb-2">📌 Your domain: {newDomain || 'www.example.com'}</p>
                      <div className="space-y-2">
                        <p className="text-xs">Add a CNAME record:</p>
                        <div className="flex items-center gap-2 p-2 bg-muted rounded">
                          <code className="font-mono text-xs flex-1">CNAME → sites.wondrousdigital.com</code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              navigator.clipboard.writeText('sites.wondrousdigital.com');
                              toast.success('CNAME copied to clipboard');
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-green-600">✅ This works with all DNS providers!</p>
                  </div>
                )}
              </li>
              <li className="mt-2">4. Wait for verification (usually 5-30 minutes)</li>
              <li>5. Your site will be live with automatic SSL! 🎉</li>
            </ol>
          </div>

          {/* DNS Provider Links */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="font-semibold text-sm mb-2">DNS Provider Guides</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <a 
                href="https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline"
              >
                Cloudflare <ExternalLink className="h-3 w-3" />
              </a>
              <a 
                href="https://www.godaddy.com/help/add-a-cname-record-19236" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline"
              >
                GoDaddy <ExternalLink className="h-3 w-3" />
              </a>
              <a 
                href="https://www.namecheap.com/support/knowledgebase/article.aspx/9646/2237/how-to-create-a-cname-record-for-your-domain" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline"
              >
                Namecheap <ExternalLink className="h-3 w-3" />
              </a>
              <a 
                href="https://support.google.com/domains/answer/9211383" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline"
              >
                Google Domains <ExternalLink className="h-3 w-3" />
              </a>
              <a 
                href="https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-creating.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline"
              >
                AWS Route 53 <ExternalLink className="h-3 w-3" />
              </a>
              <a 
                href="https://www.hover.com/help/how-to-edit-dns-records-a-aaaa-cname-mx-txt-srv" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline"
              >
                Hover <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Troubleshooting Guide */}
          {domains && domains.some(d => !d.verified) && (
            <Collapsible open={showTroubleshooting} onOpenChange={setShowTroubleshooting}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between p-4 rounded-lg border bg-muted/50"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <AlertCircle className="h-4 w-4" />
                    Having trouble with domain verification?
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showTroubleshooting ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="rounded-lg border bg-background p-4">
                  <DomainTroubleshootingGuide 
                    domain={domains.find(d => !d.verified)?.domain}
                    isVerified={false}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </div>
    </div>
  );
}