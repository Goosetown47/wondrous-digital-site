'use client';

import { CheckSquare } from 'lucide-react';
import { EmptyState } from '@/components/dashboard/empty-state';

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
        <p className="text-gray-500 mt-2">
          Manage your to-dos and track progress
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 min-h-[400px] flex items-center justify-center">
        <EmptyState
          icon={CheckSquare}
          title="No Tasks"
          description="You have no pending tasks. Great job staying on top of things!"
        />
      </div>
    </div>
  );
}