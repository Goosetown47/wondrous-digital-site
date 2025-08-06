'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, X, Globe, AlertCircle, Copy, ExternalLink, RefreshCw, 
  Loader2, Info, ChevronDown, ChevronUp, Shield, ShieldOff,
  CheckCircle, Clock, XCircle, Crown
} from 'lucide-react';
import { useDomains, useAddDomain, useRemoveDomain, useVerifyDomain, useVercelStatus, useDomainStatus, useDomainDNSConfig, useToggleWWW, useMakePrimary } from '@/hooks/useDomains';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DNS_PROVIDERS } from '@/lib/dns-providers';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DomainSettingsProps {
  projectId: string;
  projectSlug: string;
}

// Domain validation regex - matches valid domain names
const DOMAIN_REGEX = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

// Check if domain is an apex domain
function isApexDomain(domain: string): boolean {
  const parts = domain.split('.');
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
  const { data: domains, isLoading } = useDomains(projectId);
  const { data: vercelStatus } = useVercelStatus();
  const addDomain = useAddDomain();
  const removeDomain = useRemoveDomain(projectId);
  const verifyDomain = useVerifyDomain();

  const handleDomainChange = (value: string) => {
    setNewDomain(value);
    // Validate on change for real-time feedback
    if (value) {
      const error = validateDomain(value);
      setDomainError(error);
    } else {
      setDomainError(null);
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
      },
      onError: (error: Error & { code?: string }) => {
        if (error.code === '23505') {
          setDomainError('This domain is already configured for another project. Please use a different domain.');
        } else {
          // Show other errors inline as well
          setDomainError(error.message || 'Failed to add domain');
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
            href={`https://${projectSlug}.wondrousdigital.com`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm flex-1 text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
          >
            {projectSlug}.wondrousdigital.com
            <ExternalLink className="h-3 w-3" />
          </a>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              const previewDomain = `${projectSlug}.wondrousdigital.com`;
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
              <DomainCard
                key={domain.id}
                domain={domain}
                projectId={projectId}
                onVerify={() => verifyDomain.mutate(domain.id)}
                onRemove={() => removeDomain.mutate(domain.id)}
                isVerifying={verifyDomain.isPending}
                isRemoving={removeDomain.isPending}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Domain Card Component
interface DomainCardProps {
  domain: {
    id: string;
    domain: string;
    verified: boolean;
    ssl_state?: string;
    verification_details?: unknown;
    include_www?: boolean;
    is_primary?: boolean;
  };
  projectId: string;
  onVerify: () => void;
  onRemove: () => void;
  isVerifying: boolean;
  isRemoving: boolean;
}

function DomainCard({ 
  domain, 
  projectId,
  onVerify, 
  onRemove, 
  isVerifying, 
  isRemoving 
}: DomainCardProps) {
  const [isExpanded, setIsExpanded] = useState(!domain.verified);
  const [selectedProvider, setSelectedProvider] = useState('godaddy');
  const [showWWWConfirmation, setShowWWWConfirmation] = useState(false);
  const [pendingWWWState, setPendingWWWState] = useState(false);
  
  const { data: domainStatus } = useDomainStatus(domain.id);
  const { data: dnsConfig } = useDomainDNSConfig(domain.id);
  const toggleWWW = useToggleWWW(projectId);
  const makePrimary = useMakePrimary(projectId);
  
  // Check if this is an apex domain that can have www
  const canHaveWWW = isApexDomain(domain.domain);
  const includeWWW = domain.include_www ?? true; // Default to true if not set
  
  // Determine status icon and color based on both ownership and configuration
  const getStatusIcon = () => {
    if (domain.verified && domain.ssl_state === 'READY') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (domain.verified && domain.ssl_state !== 'READY') {
      return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
    }
    if (domainStatus?.error || dnsConfig?.status?.configuration === 'invalid') {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
  };
  
  const getStatusText = () => {
    // Check if we have invalid configuration even if "verified"
    if (dnsConfig?.status?.configuration === 'invalid') {
      return <span className="text-orange-600 text-sm">Invalid DNS Configuration</span>;
    }
    if (domain.verified && dnsConfig?.status?.configuration === 'valid') {
      if (domain.ssl_state === 'READY') {
        return <span className="text-green-600 text-sm font-medium">Active</span>;
      }
      return <span className="text-blue-600 text-sm">SSL Provisioning</span>;
    }
    if (domain.verified && !dnsConfig?.status?.configuration) {
      return <span className="text-blue-600 text-sm">Checking Configuration</span>;
    }
    if (domainStatus?.error || dnsConfig?.status?.error) {
      return <span className="text-red-600 text-sm">DNS Setup Required</span>;
    }
    return <span className="text-yellow-600 text-sm">DNS Setup Required</span>;
  };
  
  const getSslIcon = () => {
    if (domain.ssl_state === 'READY') {
      return <Shield className="h-3 w-3 text-green-500" />;
    }
    return <ShieldOff className="h-3 w-3 text-gray-400" />;
  };
  
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };
  
  const handleWWWToggle = (checked: boolean) => {
    // If turning off www on a verified domain, show confirmation
    if (!checked && domain.verified && includeWWW) {
      setPendingWWWState(false);
      setShowWWWConfirmation(true);
    } else {
      // Otherwise toggle immediately
      toggleWWW.mutate({
        domainId: domain.id,
        domain: domain.domain,
        includeWWW: checked
      });
    }
  };
  
  const confirmWWWToggle = () => {
    toggleWWW.mutate({
      domainId: domain.id,
      domain: domain.domain,
      includeWWW: pendingWWWState
    });
    setShowWWWConfirmation(false);
  };
  
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Collapsed Header */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-sm">{domain.domain}</span>
            {domain.is_primary && (
              <Badge variant="default" className="flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Primary
              </Badge>
            )}
            {getStatusIcon()}
            {getStatusText()}
            {domain.verified && getSslIcon()}
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onVerify}
              disabled={isVerifying}
              className="h-8 w-8"
              title="Check domain status"
            >
              {isVerifying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              disabled={isRemoving}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t px-3 pb-3">
          <div className="mt-3 space-y-3">
            {/* Status Details */}
            <div className="text-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">DNS Status:</span>
                <span className={
                  dnsConfig?.status?.configuration === 'valid' ? 'text-green-600' : 
                  dnsConfig?.status?.configuration === 'invalid' ? 'text-red-600' : 
                  'text-yellow-600'
                }>
                  {dnsConfig?.status?.configuration === 'valid' ? 'Configured' : 
                   dnsConfig?.status?.configuration === 'invalid' ? 'Not Configured' : 
                   'Awaiting Setup'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">SSL Certificate:</span>
                <span className={
                  dnsConfig?.status?.ssl === 'READY' ? 'text-green-600' : 
                  dnsConfig?.status?.ssl === 'ERROR' ? 'text-red-600' :
                  'text-yellow-600'
                }>
                  {dnsConfig?.status?.ssl || domain.ssl_state || 'Pending'}
                </span>
              </div>
              
              {/* Issues Section - only show if there are errors */}
              {(domainStatus?.error || dnsConfig?.status?.error || dnsConfig?.message) && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">Issues:</span>
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="space-y-1">
                    {domainStatus?.error && (
                      <div className="flex items-start gap-2 text-sm text-red-600">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>{domainStatus.error}</span>
                      </div>
                    )}
                    {dnsConfig?.status?.error && (
                      <div className="flex items-start gap-2 text-sm text-red-600">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>{dnsConfig.status.error}</span>
                      </div>
                    )}
                    {dnsConfig?.message && (
                      <div className="flex items-start gap-2 text-sm text-amber-600">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{dnsConfig.message}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Settings Section */}
            <div className="p-3 bg-muted/50 rounded-lg space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Settings</h4>
              
              {/* WWW Toggle for apex domains */}
              {canHaveWWW && (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Include www subdomain</span>
                    <span className="text-xs text-muted-foreground block">Recommended for better accessibility</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {toggleWWW.isPending && (
                      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                    )}
                    <Switch
                      id={`www-toggle-${domain.id}`}
                      checked={includeWWW}
                      onCheckedChange={handleWWWToggle}
                      disabled={toggleWWW.isPending}
                    />
                  </div>
                </div>
              )}
              
              {/* Primary Domain Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">Primary domain</span>
                  <span className="text-xs text-muted-foreground block">
                    {domain.is_primary ? 'This is your main domain' : 'Set as your main domain'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {makePrimary.isPending && (
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                  )}
                  <Switch
                    id={`primary-toggle-${domain.id}`}
                    checked={domain.is_primary || false}
                    onCheckedChange={(checked) => {
                      if (checked && !domain.is_primary) {
                        makePrimary.mutate(domain.id);
                      }
                    }}
                    disabled={makePrimary.isPending || domain.is_primary}
                  />
                </div>
              </div>
            </div>
            
            {/* DNS Configuration Section - Always Show */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">DNS Configuration</h4>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger className="w-[180px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DNS_PROVIDERS).map(([key, provider]) => (
                      <SelectItem key={key} value={key}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
                
                {/* Provider-specific instructions */}
                <div className="space-y-3 text-sm">
                  {/* Dynamic DNS Records from Vercel */}
                  {dnsConfig?.records?.map((record: {
                    type: string;
                    name: string;
                    value: string;
                    ttl?: number;
                    purpose?: string;
                    optional?: boolean;
                    required?: boolean;
                    note?: string;
                  }, index: number) => {
                    // Don't skip any records - both A and CNAME are required for apex domains
                    // Skip verification records if already verified
                    if (record.purpose === 'ownership_verification' && domain.verified) return null;
                    
                    const stepNumber = index + 1;
                    const recordTitle = record.purpose === 'ownership_verification' 
                      ? 'Verification Record' 
                      : record.type === 'CNAME' && !dnsConfig.isApex
                      ? 'Subdomain Configuration'
                      : record.type === 'A' 
                      ? 'Domain Configuration'
                      : `${record.type} Record`;
                    
                    return (
                      <div key={index} className="rounded-lg bg-muted/50 p-3 space-y-2">
                        <div className="font-medium">
                          Step {stepNumber}: Add {recordTitle}
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          {DNS_PROVIDERS[selectedProvider].instructions.a_record.location.map((step, i) => (
                            <div key={i}>• {step}</div>
                          ))}
                        </div>
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center justify-between p-2 bg-background rounded">
                            <span className="text-xs text-muted-foreground">Type:</span>
                            <code className="font-mono text-xs">{record.type}</code>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-background rounded">
                            <span className="text-xs text-muted-foreground">Name:</span>
                            <code className="font-mono text-xs">{record.name}</code>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-background rounded">
                            <span className="text-xs text-muted-foreground">Value:</span>
                            <div className="flex items-center gap-2">
                              <code className="font-mono text-xs text-wrap break-all">{record.value}</code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 flex-shrink-0"
                                onClick={() => copyToClipboard(record.value, `${record.type} value`)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-background rounded">
                            <span className="text-xs text-muted-foreground">TTL:</span>
                            <code className="font-mono text-xs">{record.ttl || '300'} seconds</code>
                          </div>
                          {record.note && (
                            <div className="flex items-start p-2 bg-blue-50 dark:bg-blue-950 rounded mt-2">
                              <Info className="h-3 w-3 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span className="text-xs text-blue-700 dark:text-blue-300">{record.note}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* TXT Record Instructions if needed */}
                  {domainStatus?.verification && domainStatus.verification.length > 0 && (
                    <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                      <div className="font-medium">Step 2: Add Verification Record</div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        {DNS_PROVIDERS[selectedProvider].instructions.txt_record?.location.map((step, i) => (
                          <div key={i}>• {step}</div>
                        ))}
                      </div>
                      <div className="space-y-2 mt-2">
                        {domainStatus.verification.map((v: {
                          type: string;
                          domain: string;
                          value: string;
                        }, i: number) => (
                          <div key={i} className="space-y-2">
                            <div className="flex items-center justify-between p-2 bg-background rounded">
                              <span className="text-xs text-muted-foreground">Type:</span>
                              <code className="font-mono text-xs">{v.type}</code>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-background rounded">
                              <span className="text-xs text-muted-foreground">Name:</span>
                              <code className="font-mono text-xs">{v.domain}</code>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-background rounded">
                              <span className="text-xs text-muted-foreground">Value:</span>
                              <div className="flex items-center gap-2">
                                <code className="font-mono text-xs text-wrap break-all">{v.value}</code>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 flex-shrink-0"
                                  onClick={() => copyToClipboard(v.value, 'Verification value')}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    <p>• DNS changes typically take 5-30 minutes to propagate</p>
                    <p>• Click the refresh button above to check verification status</p>
                  </div>
                </div>
            </div>
            
            {/* Error Messages */}
            {domainStatus?.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {domainStatus.error}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )}
      
      {/* WWW Confirmation Dialog */}
      <AlertDialog open={showWWWConfirmation} onOpenChange={setShowWWWConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable www.{domain.domain}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove www.{domain.domain} from your site. 
              Visitors trying to reach www.{domain.domain} will see an error.
              <br /><br />
              Are you sure you want to disable the www subdomain?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmWWWToggle} className="bg-destructive text-destructive-foreground">
              Disable www
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
