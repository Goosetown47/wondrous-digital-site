import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/providers/auth-provider';

export interface StaffAssignment {
  id: string;
  staff_user_id: string;
  account_id: string;
  assignment_notes: string | null;
  assigned_by: string | null;
  created_at: string;
  updated_at: string;
  accounts?: {
    id: string;
    name: string;
    slug: string;
  };
  staff_user?: {
    id: string;
    email: string;
    display_name?: string;
  };
  assigned_by_user?: {
    id: string;
    email: string;
    display_name?: string;
  };
}

export interface StaffMember {
  id: string;
  email: string;
  display_name: string | null;
  last_sign_in_at: string | null;
  created_at: string;
  assignment_count?: number;
  assignments?: StaffAssignment[];
}

// Get all staff members with their assignments
export function useStaffMembers() {
  return useQuery({
    queryKey: ['staff-members'],
    queryFn: async () => {
      // First get all staff members
      const { data: staffUsers, error: staffError } = await supabase
        .from('account_users')
        .select(`
          user_id,
          auth_users!inner(
            id,
            email,
            last_sign_in_at,
            created_at,
            raw_user_meta_data
          )
        `)
        .eq('account_id', '00000000-0000-0000-0000-000000000000')
        .eq('role', 'staff');

      if (staffError) throw staffError;

      // Get assignments for all staff
      const { data: assignments, error: assignmentsError } = await supabase
        .from('staff_account_assignments')
        .select(`
          *,
          accounts!inner(
            id,
            name,
            slug
          )
        `);

      if (assignmentsError) throw assignmentsError;

      // Get user profiles
      const staffUserIds = staffUsers?.map(s => s.user_id) || [];
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, display_name')
        .in('user_id', staffUserIds);

      // Combine the data
      const staffMembers: StaffMember[] = (staffUsers || []).map(staff => {
        const userAssignments = assignments?.filter(a => a.staff_user_id === staff.user_id) || [];
        const profile = profiles?.find(p => p.user_id === staff.user_id);
        
        return {
          id: staff.user_id,
          email: staff.auth_users.email,
          display_name: profile?.display_name || staff.auth_users.raw_user_meta_data?.full_name || null,
          last_sign_in_at: staff.auth_users.last_sign_in_at,
          created_at: staff.auth_users.created_at,
          assignment_count: userAssignments.length,
          assignments: userAssignments,
        };
      });

      return staffMembers;
    },
  });
}

// Get assignments for a specific staff member
export function useStaffAssignments(staffUserId?: string) {
  const { user } = useAuth();
  const userId = staffUserId || user?.id;

  return useQuery({
    queryKey: ['staff-assignments', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('staff_account_assignments')
        .select(`
          *,
          accounts!inner(
            id,
            name,
            slug
          ),
          assigned_by_user:auth_users!assigned_by(
            id,
            email,
            raw_user_meta_data
          )
        `)
        .eq('staff_user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get display names from profiles
      const userIds = data?.map(d => d.assigned_by).filter(Boolean) || [];
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);

      return data?.map(assignment => ({
        ...assignment,
        assigned_by_user: assignment.assigned_by_user ? {
          ...assignment.assigned_by_user,
          display_name: profiles?.find(p => p.user_id === assignment.assigned_by_user.id)?.display_name || 
                       assignment.assigned_by_user.raw_user_meta_data?.full_name
        } : null
      })) || [];
    },
    enabled: !!userId,
  });
}

// Assign staff to accounts
export function useAssignStaff() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      staffUserId,
      accountIds,
      notes,
    }: {
      staffUserId: string;
      accountIds: string[];
      notes?: string;
    }) => {
      if (!user) throw new Error('Must be logged in');

      // First, remove existing assignments
      const { error: deleteError } = await supabase
        .from('staff_account_assignments')
        .delete()
        .eq('staff_user_id', staffUserId);

      if (deleteError) throw deleteError;

      // Then add new assignments
      if (accountIds.length > 0) {
        const assignments = accountIds.map(accountId => ({
          staff_user_id: staffUserId,
          account_id: accountId,
          assignment_notes: notes || null,
          assigned_by: user.id,
        }));

        const { data, error } = await supabase
          .from('staff_account_assignments')
          .insert(assignments)
          .select();

        if (error) throw error;
        return data;
      }

      return [];
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staff-members'] });
      queryClient.invalidateQueries({ queryKey: ['staff-assignments', variables.staffUserId] });
    },
  });
}

// Remove staff assignment
export function useUnassignStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      staffUserId,
      accountId,
    }: {
      staffUserId: string;
      accountId: string;
    }) => {
      const { error } = await supabase
        .from('staff_account_assignments')
        .delete()
        .eq('staff_user_id', staffUserId)
        .eq('account_id', accountId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staff-members'] });
      queryClient.invalidateQueries({ queryKey: ['staff-assignments', variables.staffUserId] });
    },
  });
}

// Get assignment activity logs
export function useAssignmentActivity(limit = 50) {
  return useQuery({
    queryKey: ['assignment-activity', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          user:auth_users!user_id(
            id,
            email,
            raw_user_meta_data
          )
        `)
        .eq('action', 'staff.assignments_updated')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Get display names
      const userIds = data?.map(d => d.user_id).filter(Boolean) || [];
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);

      return data?.map(log => ({
        ...log,
        user: log.user ? {
          ...log.user,
          display_name: profiles?.find(p => p.user_id === log.user.id)?.display_name || 
                       log.user.raw_user_meta_data?.full_name
        } : null
      })) || [];
    },
  });
}