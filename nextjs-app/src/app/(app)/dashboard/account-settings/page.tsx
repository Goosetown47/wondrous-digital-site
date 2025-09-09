'use client';

import { Settings } from 'lucide-react';
import { EmptyState } from '@/components/dashboard/empty-state';
import { useIsAccountOwner } from '@/hooks/useRole';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AccountSettingsPage() {
  const { data: isOwner, isLoading } = useIsAccountOwner();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isOwner) {
      router.push('/dashboard');
    }
  }, [isOwner, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isOwner) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500 mt-2">
          Manage your account preferences and configuration
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 min-h-[400px] flex items-center justify-center">
        <EmptyState
          icon={Settings}
          title="Account Settings"
          description="Account settings will be available here soon. You can manage billing and team members from their respective pages."
        />
      </div>
    </div>
  );
}