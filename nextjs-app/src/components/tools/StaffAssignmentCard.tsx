import { format } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUnassignStaff } from '@/hooks/useStaffAssignments';
import type { StaffMember } from '@/hooks/useStaffAssignments';
import {
  User,
  Building2,
  Clock,
  UserCog,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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

interface StaffAssignmentCardProps {
  staff: StaffMember;
  onAssign: () => void;
}

export function StaffAssignmentCard({ staff, onAssign }: StaffAssignmentCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [removeDialog, setRemoveDialog] = useState<{
    open: boolean;
    accountId?: string;
    accountName?: string;
  }>({ open: false });
  
  const unassignStaff = useUnassignStaff();

  const initials = staff.display_name
    ? staff.display_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : staff.email.charAt(0).toUpperCase();

  const handleRemove = (accountId: string, accountName: string) => {
    setRemoveDialog({ open: true, accountId, accountName });
  };

  const confirmRemove = () => {
    if (removeDialog.accountId) {
      unassignStaff.mutate({
        staffUserId: staff.id,
        accountId: removeDialog.accountId,
      });
    }
    setRemoveDialog({ open: false });
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{staff.display_name || staff.email}</h3>
                {staff.display_name && (
                  <p className="text-sm text-muted-foreground">{staff.email}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <Building2 className="h-3 w-3 mr-1" />
                {staff.assignment_count || 0} {(staff.assignment_count || 0) === 1 ? 'Account' : 'Accounts'}
              </Badge>
              <Button size="sm" onClick={onAssign}>
                <UserCog className="h-4 w-4 mr-2" />
                Manage
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Joined {format(new Date(staff.created_at), 'MMM d, yyyy')}</span>
            </div>
            {staff.last_sign_in_at && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>Last seen {format(new Date(staff.last_sign_in_at), 'MMM d, yyyy')}</span>
              </div>
            )}
          </div>

          {staff.assignments && staff.assignments.length > 0 && (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between">
                  <span>View assigned accounts</span>
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="space-y-2">
                  {staff.assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-2 rounded-lg border bg-muted/50"
                    >
                      <div>
                        <p className="font-medium text-sm">{assignment.accounts?.name}</p>
                        <p className="text-xs text-muted-foreground">{assignment.accounts?.slug}</p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleRemove(assignment.account_id, assignment.accounts?.name || '')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      </Card>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={removeDialog.open} onOpenChange={(open) => setRemoveDialog({ open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {staff.display_name || staff.email} from {removeDialog.accountName}?
              They will lose access to this account and all its projects.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRemove}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove Assignment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}