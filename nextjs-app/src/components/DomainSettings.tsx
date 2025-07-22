'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, X, Globe, CheckCircle, AlertCircle } from 'lucide-react';
import { useDomains, useAddDomain, useRemoveDomain } from '@/hooks/useDomains';

interface DomainSettingsProps {
  projectId: string;
}

export function DomainSettings({ projectId }: DomainSettingsProps) {
  const [newDomain, setNewDomain] = useState('');
  const { data: domains, isLoading } = useDomains(projectId);
  const addDomain = useAddDomain();
  const removeDomain = useRemoveDomain();

  const handleAddDomain = () => {
    if (!newDomain) return;
    
    addDomain.mutate({
      projectId,
      domain: newDomain.toLowerCase().trim(),
    });
    setNewDomain('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Globe className="w-5 h-5 mr-2" />
          Custom Domains
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add domain form */}
          <div className="flex space-x-2">
            <Input
              placeholder="yourdomain.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddDomain()}
            />
            <Button 
              onClick={handleAddDomain}
              disabled={!newDomain || addDomain.isPending}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Domain
            </Button>
          </div>

          {/* Domain list */}
          <div className="space-y-2">
            {isLoading ? (
              <p className="text-sm text-gray-500">Loading domains...</p>
            ) : domains?.length === 0 ? (
              <p className="text-sm text-gray-500">No custom domains yet</p>
            ) : (
              domains?.map((domain) => (
                <div 
                  key={domain.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span className="font-mono text-sm">{domain.domain}</span>
                    {domain.verified ? (
                      <span className="flex items-center text-xs text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center text-xs text-yellow-600">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Pending
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDomain.mutate(domain.id)}
                    disabled={removeDomain.isPending}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Instructions */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Setup Instructions:</h4>
            <ol className="text-sm space-y-1 text-gray-700">
              <li>1. Add your custom domain above</li>
              <li>2. Point your domain's DNS to our servers:</li>
              <li className="ml-4 font-mono text-xs">
                CNAME: {process.env.NEXT_PUBLIC_CUSTOM_CNAME || 'domains.wondrousdigital.com'}
              </li>
              <li>3. Domain will be automatically verified</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}