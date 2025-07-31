'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { 
  useStaffMembers,
  useAssignmentActivity,
} from '@/hooks/useStaffAssignments';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { StaffAssignmentCard } from '@/components/tools/StaffAssignmentCard';
import { AssignStaffDialog } from '@/components/tools/AssignStaffDialog';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Search,
  Filter,
  Building2,
  Activity,
} from 'lucide-react';

export default function StaffAssignmentsPage() {
  const { data: staffMembers, isLoading: staffLoading } = useStaffMembers();
  const { data: activityLogs, isLoading: activityLoading } = useAssignmentActivity(20);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  // Filter staff members
  const filteredStaff = staffMembers?.filter(staff => {
    const matchesSearch = 
      staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.display_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'assigned' && (staff.assignment_count || 0) > 0) ||
      (filterStatus === 'unassigned' && (staff.assignment_count || 0) === 0);
    
    return matchesSearch && matchesFilter;
  }) || [];

  // Stats
  const totalStaff = staffMembers?.length || 0;
  const assignedStaff = staffMembers?.filter(s => (s.assignment_count || 0) > 0).length || 0;
  const totalAssignments = staffMembers?.reduce((sum, s) => sum + (s.assignment_count || 0), 0) || 0;

  return (
    <PermissionGate permission="platform:admin">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Staff Assignments</h2>
            <p className="text-muted-foreground">
              Manage account assignments for platform staff members
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Staff</span>
            </div>
            <p className="text-2xl font-bold">{totalStaff}</p>
          </div>
          
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Assigned Staff</span>
            </div>
            <p className="text-2xl font-bold">{assignedStaff}</p>
          </div>
          
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <UserX className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Unassigned Staff</span>
            </div>
            <p className="text-2xl font-bold">{totalStaff - assignedStaff}</p>
          </div>
          
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total Assignments</span>
            </div>
            <p className="text-2xl font-bold">{totalAssignments}</p>
          </div>
        </div>

        <Tabs defaultValue="staff" className="space-y-4">
          <TabsList>
            <TabsTrigger value="staff">
              <Users className="h-4 w-4 mr-2" />
              Staff Members
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="h-4 w-4 mr-2" />
              Activity Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="staff" className="space-y-4">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search staff by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === 'assigned' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('assigned')}
                >
                  <UserCheck className="h-4 w-4 mr-1" />
                  Assigned
                </Button>
                <Button
                  variant={filterStatus === 'unassigned' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('unassigned')}
                >
                  <UserX className="h-4 w-4 mr-1" />
                  Unassigned
                </Button>
              </div>
            </div>

            {/* Staff List */}
            {staffLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No staff members found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search criteria' : 'No staff members match your filter'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredStaff.map((staff) => (
                  <StaffAssignmentCard
                    key={staff.id}
                    staff={staff}
                    onAssign={() => {
                      setSelectedStaff(staff.id);
                      setAssignDialogOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="rounded-lg border">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Recent Assignment Changes</h3>
                <p className="text-sm text-muted-foreground">
                  Track all staff assignment modifications
                </p>
              </div>
              
              <ScrollArea className="h-[600px]">
                {activityLoading ? (
                  <div className="p-4 space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-20" />
                    ))}
                  </div>
                ) : activityLogs?.length === 0 ? (
                  <div className="p-8 text-center">
                    <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No activity yet</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {activityLogs?.map((log) => (
                      <div key={log.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="font-medium">
                                {log.user?.display_name || log.user?.email || 'Unknown'}
                              </span>
                              {' updated assignments for '}
                              <span className="font-medium">
                                {log.metadata?.staff_user_id ? 
                                  staffMembers?.find(s => s.id === log.metadata.staff_user_id)?.display_name || 
                                  staffMembers?.find(s => s.id === log.metadata.staff_user_id)?.email ||
                                  'a staff member' 
                                  : 'a staff member'}
                              </span>
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
                            </div>
                            {log.metadata?.assigned_accounts && (
                              <div className="mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  {log.metadata.assigned_accounts.length} accounts assigned
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>

        {/* Assign Staff Dialog */}
        <AssignStaffDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          staffUserId={selectedStaff}
          onSuccess={() => {
            setAssignDialogOpen(false);
            setSelectedStaff(null);
          }}
        />
      </div>
    </PermissionGate>
  );
}