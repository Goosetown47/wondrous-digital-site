'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { useAccountRole } from '@/hooks/useRole';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, FolderOpen, Sparkles, Plus, CreditCard } from 'lucide-react';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';

export default function DashboardPage() {
  const router = useRouter();
  const { currentAccount, currentProject, user } = useAuth();
  const { data: accountRole } = useAccountRole();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [displayName, setDisplayName] = useState<string>('');

  // Check if user can create projects (account owner or admin)
  const canCreateProjects = accountRole === 'account_owner' || accountRole === 'admin';

  // Fetch user's display name from profile
  useEffect(() => {
    async function fetchUserProfile() {
      if (!user) return;
      
      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('display_name')
          .eq('user_id', user.id)
          .single();
        
        if (profile?.display_name) {
          setDisplayName(profile.display_name);
        } else {
          // Fallback to email prefix or user metadata
          setDisplayName(
            user.user_metadata?.display_name || 
            user.user_metadata?.full_name ||
            user.email?.split('@')[0] || 
            'there'
          );
        }
      } catch {
        // Fallback to email prefix if profile fetch fails
        setDisplayName(
          user.user_metadata?.display_name || 
          user.user_metadata?.full_name ||
          user.email?.split('@')[0] || 
          'there'
        );
      }
    }

    fetchUserProfile();
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome{displayName ? `, ${displayName}` : ' to Wondrous Digital'}
          </h1>
          <p className="text-muted-foreground mt-2">
            Build beautiful websites with our visual builder
          </p>
        </div>
        {currentAccount && canCreateProjects && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Project
          </Button>
        )}
      </div>

      {/* Current Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Account</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentAccount?.name || 'No account selected'}
            </div>
            {currentAccount && (
              <div className="flex items-center gap-2 mt-1">
                {currentAccount.tier && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                    ${currentAccount.tier === 'FREE' ? 'bg-gray-100 text-gray-800' :
                      currentAccount.tier === 'PRO' ? 'bg-blue-100 text-blue-800' :
                      currentAccount.tier === 'SCALE' ? 'bg-purple-100 text-purple-800' :
                      currentAccount.tier === 'MAX' ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-900' :
                      'bg-green-100 text-green-800'}`}>
                    {currentAccount.tier} {currentAccount.tier !== 'FREE' ? 'TIER' : 'PLAN'}
                  </span>
                )}
                {currentAccount.subscription_status && currentAccount.tier !== 'FREE' && (
                  <span className={`text-xs ${
                    currentAccount.subscription_status === 'active' ? 'text-green-600' :
                    currentAccount.subscription_status === 'trialing' ? 'text-blue-600' :
                    'text-amber-600'
                  }`}>
                    • {currentAccount.subscription_status}
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Project</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentProject?.name || 'No project selected'}
            </div>
            {currentProject && (
              <p className="text-xs text-muted-foreground">
                Ready to build
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Builder Status</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentProject ? 'Available' : 'Select a project'}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentProject ? 'Click Builder in the menu' : 'Use the dropdown above'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billing Status</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentAccount?.tier || 'FREE'}
            </div>
            <div className="space-y-1 mt-1">
              {currentAccount?.subscription_status && (
                <p className="text-xs text-muted-foreground">
                  Status: <span className={`font-medium ${
                    currentAccount.subscription_status === 'active' ? 'text-green-600' :
                    currentAccount.subscription_status === 'trialing' ? 'text-blue-600' :
                    'text-amber-600'
                  }`}>{currentAccount.subscription_status}</span>
                </p>
              )}
              {currentAccount?.setup_fee_paid && (
                <p className="text-xs text-green-600">
                  ✓ Setup fee paid
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {currentAccount && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with your projects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!currentProject ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No project selected. {canCreateProjects ? 'Create a new project or select an existing one from the dropdown above.' : 'Select a project from the dropdown above to get started.'}
                </p>
                {canCreateProjects && (
                  <Button onClick={() => setShowCreateDialog(true)} variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Project
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={() => router.push(`/builder/${currentProject.id}`)}
                >
                  Open Builder
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => router.push(`/project/${currentProject.id}/settings`)}
                >
                  Project Settings
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Project Dialog */}
      <CreateProjectDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}