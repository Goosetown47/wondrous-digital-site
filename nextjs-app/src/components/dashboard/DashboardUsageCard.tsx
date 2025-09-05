'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { TierBadge } from '@/components/ui/tier-badge';
import { Users, FolderOpen, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import type { TierName } from '@/types/database';

interface DashboardUsageCardProps {
  tier: TierName;
  projectCount: number;
  projectLimit: number;
  userCount: number;
  userLimit: number;
  isUnlocked?: boolean;
}

export function DashboardUsageCard({
  tier,
  projectCount,
  projectLimit,
  userCount,
  userLimit,
  isUnlocked = false,
}: DashboardUsageCardProps) {
  const projectPercentage = isUnlocked ? 0 : (projectCount / projectLimit) * 100;
  const userPercentage = isUnlocked ? 0 : (userCount / userLimit) * 100;


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Usage & Limits</CardTitle>
          <div className="flex items-center gap-2">
            <TierBadge tier={tier} size="sm" />
            {isUnlocked && (
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-900">
                UNLOCKED
              </span>
            )}
          </div>
        </div>
        <CardDescription>
          {isUnlocked ? 'Unlimited access to all features' : 'Your current usage across resources'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Projects Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Projects</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {isUnlocked ? `${projectCount} projects (unlimited)` : `${projectCount}/${projectLimit} projects used`}
            </span>
          </div>
          {!isUnlocked && <Progress value={projectPercentage} className="h-2" />}
          {!isUnlocked && projectCount >= projectLimit && tier !== 'MAX' && (
            <p className="text-xs text-amber-600">
              You've reached your project limit. 
              <Link href="/billing" className="ml-1 underline">
                Upgrade to create more
              </Link>
            </p>
          )}
        </div>

        {/* Users Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Team Members</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {isUnlocked ? `${userCount} users (unlimited)` : `${userCount}/${userLimit} users`}
            </span>
          </div>
          {!isUnlocked && <Progress value={userPercentage} className="h-2" />}
          {!isUnlocked && userCount >= userLimit && tier !== 'MAX' && (
            <p className="text-xs text-amber-600">
              You've reached your user limit.
              <Link href="/billing" className="ml-1 underline">
                Upgrade to add more users
              </Link>
            </p>
          )}
        </div>

        {/* Upgrade CTA if not on MAX tier and not unlocked */}
        {!isUnlocked && tier !== 'MAX' && (projectCount >= projectLimit || userCount >= userLimit) && (
          <div className="pt-4 border-t">
            <Button asChild className="w-full" variant="outline">
              <Link href="/billing">
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Upgrade Plan
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}