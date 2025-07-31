'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useStaffAssignments } from '@/hooks/useStaffAssignments';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Building2,
  ExternalLink,
  Search,
  Clock,
  User,
  FileText,
  LayoutDashboard,
} from 'lucide-react';

export default function MyAssignmentsPage() {
  const router = useRouter();
  const { data: assignments, isLoading } = useStaffAssignments();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter assignments
  const filteredAssignments = assignments?.filter(assignment => 
    assignment.accounts?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assignment.accounts?.slug.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const totalAssignments = assignments?.length || 0;

  return (
    <PermissionGate permission="platform:staff">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">My Assignments</h2>
            <p className="text-muted-foreground">
              Accounts you've been assigned to manage
            </p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Building2 className="h-4 w-4 mr-2" />
            {totalAssignments} {totalAssignments === 1 ? 'Account' : 'Accounts'}
          </Badge>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Assignments Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : filteredAssignments.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">
                {searchQuery ? 'No matching accounts' : 'No assignments yet'}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? 'Try adjusting your search criteria' 
                  : 'You haven\'t been assigned to any accounts yet. Contact your administrator for assignments.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAssignments.map((assignment) => (
              <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {assignment.accounts?.name}
                      </CardTitle>
                      <CardDescription>
                        {assignment.accounts?.slug}
                      </CardDescription>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => router.push(`/accounts/${assignment.account_id}`)}
                      title="Open account dashboard"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Assignment Notes */}
                  {assignment.assignment_notes && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <FileText className="h-3 w-3" />
                        Notes from Admin
                      </div>
                      <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                        {assignment.assignment_notes}
                      </p>
                    </div>
                  )}

                  {/* Assignment Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>Assigned by:</span>
                      <span className="font-medium text-foreground">
                        {assignment.assigned_by_user?.display_name || 
                         assignment.assigned_by_user?.email || 
                         'System'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Assigned on:</span>
                      <span className="font-medium text-foreground">
                        {format(new Date(assignment.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => router.push(`/accounts/${assignment.account_id}`)}
                    >
                      <LayoutDashboard className="h-3 w-3 mr-2" />
                      Dashboard
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => router.push(`/accounts/${assignment.account_id}/projects`)}
                    >
                      View Projects
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Recent Activity Section (placeholder for future enhancement) */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Activity tracking coming soon</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PermissionGate>
  );
}