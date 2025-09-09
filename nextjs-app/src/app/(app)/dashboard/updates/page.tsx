'use client';

import { Bell } from 'lucide-react';
import { EmptyState } from '@/components/dashboard/empty-state';

export default function UpdatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Updates</h1>
        <p className="text-gray-500 mt-2">
          Stay informed about your projects and account activity
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 min-h-[400px] flex items-center justify-center">
        <EmptyState
          icon={Bell}
          title="No Updates"
          description="You're all caught up! Check back later for new updates about your projects and account."
        />
      </div>
    </div>
  );
}