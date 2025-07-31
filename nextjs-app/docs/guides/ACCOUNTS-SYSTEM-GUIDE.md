# Accounts System Guide

This guide explains how the multi-tenant accounts system works in Wondrous Digital.

## Table of Contents
1. [System Overview](#system-overview)
2. [Database Schema](#database-schema)
3. [User Types & Permissions](#user-types--permissions)
4. [User Journey Flows](#user-journey-flows)
5. [API Patterns](#api-patterns)
6. [Common Tasks](#common-tasks)
7. [Troubleshooting](#troubleshooting)

## System Overview

Wondrous Digital uses a **multi-tenant architecture** where:

- **Accounts** are the top-level containers (like organizations)
- **Projects** belong to accounts (individual websites)
- **Users** can belong to multiple accounts with different roles
- **Platform admins** have special access to all accounts

### Hierarchy
```
Platform
├── Account A
│   ├── Project 1 (website)
│   ├── Project 2 (website)
│   └── Users (with roles)
├── Account B
│   ├── Project 3 (website)
│   └── Users (with roles)
└── Platform Account (00000000-0000-0000-0000-000000000000)
    └── Admins & Staff
```

## Database Schema

### Core Tables

#### `accounts`
- `id` (UUID, primary key)
- `name` (text) - Display name
- `slug` (text, unique) - URL-friendly identifier
- `plan` (text) - Subscription plan (free, pro, business)
- `settings` (jsonb) - Account configuration
- `created_at`, `updated_at`

#### `account_users`
- `account_id` (UUID, FK to accounts)
- `user_id` (UUID, FK to auth.users)
- `role` (text) - User's role in this account
- `created_at`, `updated_at`
- Primary key: (account_id, user_id)

#### `roles`
- `id` (UUID, primary key)
- `name` (text) - Role identifier
- `display_name` (text) - Human-readable name
- `permissions` (text[]) - Array of permission strings
- `is_system` (boolean) - If true, cannot be modified

### Special Account
- **Platform Account ID**: `00000000-0000-0000-0000-000000000000`
- Users with 'admin' or 'staff' role in this account have platform-wide access

## User Types & Permissions

### 1. Platform Admin
- **Role**: `admin` in platform account
- **Access**: Everything
- **Use Case**: Wondrous Digital team members
- **How it works**: API endpoints use service role to bypass RLS

### 2. Platform Staff
- **Role**: `staff` in platform account
- **Access**: Lab, Library, Core components, Tools
- **Use Case**: Contractors, designers
- **Cannot**: Modify billing, delete accounts

### 3. Account Owner
- **Role**: `account_owner` in regular account
- **Access**: Full control of their account
- **Can**: Manage projects, invite users, change settings
- **Cannot**: See other accounts

### 4. Regular User
- **Role**: `user` in regular account
- **Access**: Limited based on permissions
- **Default**: Can view projects, cannot modify

## User Journey Flows

### New User Signup

1. User signs up via `/signup`
2. Supabase creates auth.users record
3. Trigger `on_auth_user_created_profile` creates user_profiles record
4. Trigger `on_auth_user_created_account`:
   - Creates personal account "{email}'s Account"
   - Adds user as `account_owner`
   - Creates audit log entry
5. User verifies email
6. User logs in → sees only their account

### Existing User Login

1. User logs in via `/login`
2. `/api/accounts` checks if admin/staff:
   - **Yes**: Returns all accounts (except platform account)
   - **No**: Returns only user's accounts via RLS
3. AccountDropdown shows available accounts
4. User selects account → stored in context

### Admin Access Pattern

1. Admin logs in
2. System checks for admin role in platform account
3. `/api/accounts` uses service role client
4. Admin sees all customer accounts
5. Can impersonate/assist any account

## API Patterns

### When to Use Service Role

Use `createAdminClient()` for:
- Admin operations that need to see all data
- System operations (triggers, migrations)
- Bypassing RLS for platform features

Example:
```typescript
// Check if user is admin first
const isAdmin = await isAdmin(user.id);
if (isAdmin) {
  const serviceClient = createAdminClient();
  // Use serviceClient for unrestricted access
}
```

### When to Use Regular Client

Use standard Supabase client for:
- All regular user operations
- When RLS should apply
- User-specific queries

Example:
```typescript
// Regular users - RLS applies automatically
const { data } = await supabase
  .from('accounts')
  .select('*'); // Only returns user's accounts
```

## Common Tasks

### Add User to Account
```sql
INSERT INTO account_users (account_id, user_id, role)
VALUES ('account-uuid', 'user-uuid', 'user');
```

### Change User Role
```sql
UPDATE account_users 
SET role = 'account_owner'
WHERE account_id = 'account-uuid' 
  AND user_id = 'user-uuid';
```

### Create Account Programmatically
```typescript
const { data: account } = await supabase
  .from('accounts')
  .insert({
    name: 'New Account',
    slug: 'new-account',
    plan: 'free'
  })
  .select()
  .single();

// Add user as owner
await supabase
  .from('account_users')
  .insert({
    account_id: account.id,
    user_id: userId,
    role: 'account_owner'
  });
```

### Check User Permissions
```typescript
import { hasPermission } from '@/lib/permissions';

const canCreateProject = await hasPermission(
  userId,
  accountId,
  'projects:create'
);
```

## Troubleshooting

### User Can't See Any Accounts
1. Check `account_users` table - user must have a record
2. Verify personal account was created on signup
3. Check RLS policies on accounts table

### User Sees All Accounts (shouldn't)
1. Check if user has admin role in platform account
2. Verify `/api/accounts` is checking roles correctly
3. Ensure not using service role for regular users

### New User Signup Fails
1. Check `on_auth_user_created_account` trigger exists
2. Verify trigger function has correct permissions
3. Check audit_logs for error messages

### RLS Policy Issues
1. Use service role client for debugging
2. Check `auth.uid()` vs user_id usage
3. Verify foreign key relationships

## Security Best Practices

1. **Never expose service role key** to frontend
2. **Always check user role** before using service client
3. **Use RLS as default** - service role only when needed
4. **Audit log sensitive operations**
5. **Validate account access** in API endpoints

## Future Enhancements

- [ ] Team management within accounts
- [ ] Granular permissions system
- [ ] Account switching in UI
- [ ] Billing per account
- [ ] White-label options per account