# How To: User Invitation System

**Date**: 2025-01-28  
**Feature**: Account Team Member Invitations  
**Problem Solved**: Allow account owners to invite team members with specific roles  

## Overview

The invitation system enables account owners to manage their team by inviting users via email. Invited users receive a token-based invitation that they can accept or decline. The system enforces proper multi-tenant isolation and role-based permissions.

## Architecture

### Database Schema

```sql
-- account_invitations table
CREATE TABLE account_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('account_owner', 'user')),
  token UUID DEFAULT gen_random_uuid(),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  UNIQUE(account_id, email)
);

-- account_users_with_details view (for displaying team members)
CREATE VIEW account_users_with_details AS
SELECT 
  au.*,
  u.email,
  u.raw_user_meta_data->>'display_name' as display_name,
  u.raw_user_meta_data->>'avatar_url' as avatar_url
FROM account_users au
JOIN auth.users u ON au.user_id = u.id;
```

### Service Layer Pattern

The invitation system follows our established service pattern:

```typescript
// /src/lib/services/invitations.ts
export const invitationService = {
  async getAccountInvitations(accountId: string) {
    // Fetches all invitations for an account
  },
  
  async createInvitation(data: {
    accountId: string;
    email: string;
    role: 'account_owner' | 'user';
    invitedBy: string;
  }) {
    // Creates new invitation with duplicate checking
  },
  
  async getInvitationByToken(token: string) {
    // Retrieves invitation for acceptance page
  },
  
  // ... other methods
};
```

### API Routes

All invitation endpoints follow RESTful patterns:

```
GET    /api/invitations              # List account invitations
POST   /api/invitations/create       # Create new invitation
GET    /api/invitations/by-token/[token]     # Get by token
POST   /api/invitations/by-token/[token]/accept   # Accept
POST   /api/invitations/by-token/[token]/decline  # Decline  
DELETE /api/invitations/[id]/cancel  # Cancel invitation
POST   /api/invitations/[id]/resend  # Resend invitation
```

### React Query Hooks

```typescript
// /src/hooks/useInvitations.ts
export function useAccountInvitations(accountId?: string) {
  return useQuery({
    queryKey: ['invitations', accountId],
    queryFn: async () => {
      const response = await fetch(`/api/invitations?accountId=${accountId}`);
      return response.json();
    },
    enabled: !!accountId,
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      const response = await fetch('/api/invitations/create', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['invitations', variables.accountId]);
    },
  });
}
```

## Implementation Guide

### 1. Setting Up the Database

Apply the migration to create the invitation table:

```bash
cd nextjs-app
npx supabase migration up 20250804_000000_add_account_invitations.sql
```

### 2. Creating the Team Management UI

The main UI is at `/src/app/(app)/account/users/page.tsx`:

```tsx
export default function AccountUsersPage() {
  const { currentAccount } = useAuth();
  const { data: teamMembers } = useAccountUsers(currentAccount?.id);
  const { data: invitations } = useAccountInvitations(currentAccount?.id);
  
  return (
    <PermissionGate 
      permissions={['account_users:read']} 
      resource="account_users"
      fallback={<div>You don't have permission...</div>}
    >
      <div className="space-y-6">
        {/* Team members list */}
        <TeamMembersList members={teamMembers} />
        
        {/* Pending invitations */}
        <PendingInvitations invitations={invitations} />
        
        {/* Invite button */}
        <InviteUserDialog accountId={currentAccount?.id} />
      </div>
    </PermissionGate>
  );
}
```

### 3. Implementing the Invite Dialog

```tsx
function InviteUserDialog({ accountId }: { accountId?: string }) {
  const [open, setOpen] = useState(false);
  const createInvitation = useCreateInvitation();
  
  const handleSubmit = async (data: InviteFormData) => {
    try {
      await createInvitation.mutateAsync({
        accountId,
        email: data.email,
        role: data.role,
      });
      
      toast.success('Invitation sent!');
      setOpen(false);
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Dialog content with form */}
    </Dialog>
  );
}
```

### 4. Security Considerations

#### RLS Policies

The system uses Row Level Security to ensure:
- Only account owners can create/manage invitations
- Invitations are isolated by account
- Tokens are unique and unguessable

```sql
-- Example RLS policy
CREATE POLICY "Account owners can manage invitations"
ON account_invitations
FOR ALL
USING (
  account_id IN (
    SELECT account_id FROM account_users 
    WHERE user_id = auth.uid() 
    AND role = 'account_owner'
  )
);
```

#### Permission Checks

All UI components use `PermissionGate`:

```tsx
<PermissionGate permissions={['account_users:write']}>
  <InviteButton />
</PermissionGate>
```

API routes verify permissions:

```typescript
// In API route
const hasPermission = await checkPermission(
  session.user.id,
  'account_users',
  'write',
  accountId
);

if (!hasPermission) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

## Testing the System

### Manual Testing Steps

1. **Create an invitation**:
   - Log in as account owner
   - Navigate to Account → Team Members
   - Click "Invite User"
   - Enter email and select role
   - Verify invitation appears in pending list

2. **Resend invitation**:
   - Find pending invitation
   - Click menu → Resend
   - Verify success message

3. **Cancel invitation**:
   - Click menu → Cancel
   - Confirm in dialog
   - Verify invitation is removed

4. **Accept invitation** (when acceptance UI is built):
   - Visit `/invitations/[token]`
   - Click Accept
   - Verify user is added to account

### Common Issues and Solutions

**Issue**: "Email already invited" error  
**Solution**: The system prevents duplicate invitations. Check if user is already invited or a member.

**Issue**: Invitation not showing in list  
**Solution**: Check React Query cache invalidation. The hooks should invalidate on mutation success.

**Issue**: Permission denied errors  
**Solution**: Ensure user has `account_owner` role. Platform admins bypass these checks.

## Future Enhancements

1. **Email Notifications**:
   ```typescript
   // When email service is integrated
   await emailService.send({
     to: invitation.email,
     template: 'invitation',
     data: {
       inviterName,
       accountName,
       acceptUrl: `${baseUrl}/invitations/${token}`
     }
   });
   ```

2. **Invitation Acceptance UI**:
   - Create `/invitations/[token]` page
   - Show invitation details
   - Accept/Decline buttons
   - Auto-redirect after action

3. **Batch Invitations**:
   - CSV upload
   - Bulk email input
   - Progress tracking

4. **Invitation Analytics**:
   - Track acceptance rates
   - Time to accept metrics
   - Invitation funnel

## Code References

- **Database Migration**: `/supabase/migrations/20250804_000000_add_account_invitations.sql`
- **Service Layer**: `/src/lib/services/invitations.ts`
- **React Hooks**: `/src/hooks/useInvitations.ts`
- **API Routes**: `/src/app/api/invitations/*`
- **UI Components**: `/src/app/(app)/account/users/page.tsx`
- **Types**: Update `/src/types/database.ts` with invitation types

## Related Documentation

- [How to Use Supabase](./HOW-TO-USE-SUPABASE.md) - For database operations
- [Permission System](../MASTER-TASK-LIST.MD#sub-phase-2c-authentication--authorization-layer) - For understanding roles