'use client';

import LabClient from '../../lab/lab-client';
import { useHasPermission } from '@/hooks/usePermissions';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminLabPage() {
  const router = useRouter();
  const { data: isAdminOrStaff, isLoading } = useHasPermission('system:admin');
  
  useEffect(() => {
    // If user is not admin or staff, redirect to dashboard
    if (!isLoading && !isAdminOrStaff) {
      router.replace('/dashboard');
    }
  }, [isAdminOrStaff, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading Lab...</p>
        </div>
      </div>
    );
  }

  if (!isAdminOrStaff) {
    return null; // Will redirect
  }
  
  // Render the Lab component directly within the admin path
  return <LabClient />;
}