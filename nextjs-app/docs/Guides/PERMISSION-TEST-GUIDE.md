# Permission Testing Guide

This guide explains how to test our multi-tenant permission system to ensure it's bulletproof.

## Quick Start

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:ui

# Run specific test file
npm test permissions.test

# Run with coverage
npm test -- --coverage
```

### Manual Testing

1. **Set up test users**: Create users with each role type
2. **Follow scenarios**: Use MANUAL-TEST-SCENARIOS.md as a checklist
3. **Document issues**: Log any failures with reproduction steps

## Test Structure

### Unit Tests
Located in component `__tests__` folders:
- `/src/lib/permissions/__tests__/permissions.test.ts` - Core permission logic
- `/src/components/auth/__tests__/PermissionGate.test.tsx` - UI permission gates
- `/src/hooks/__tests__/usePermissions.test.ts` - Permission hooks

### Test Utilities
- `/src/test/utils/auth-mocks.ts` - Mock users, accounts, and roles
- `/src/test/utils/supabase-mocks.ts` - Mock Supabase client

## Testing Checklist

### 1. Permission Boundaries
- [ ] Platform admins can access everything
- [ ] Account owners only manage their account
- [ ] Regular users have limited access
- [ ] Cross-account access is blocked

### 2. UI Visibility
- [ ] Admin tools hidden from non-admins
- [ ] PermissionGate components work correctly
- [ ] Navigation items respect permissions
- [ ] Fallback content displays properly

### 3. API Security
- [ ] Protected endpoints return 403 for unauthorized
- [ ] Service role bypasses RLS appropriately
- [ ] Account context enforced in queries

### 4. Database RLS
- [ ] Policies prevent cross-account data access
- [ ] Platform admins bypass account restrictions
- [ ] Role elevation attacks prevented

## Common Test Scenarios

### Testing Admin Access
```typescript
// Setup admin user
const { user, accountUser } = createTestScenario('platformAdmin');

// Admin should access everything
expect(hasPermission(user, accountUser, 'any.permission')).toBe(true);
```

### Testing Account Isolation
```typescript
// Users in different accounts
const user1 = createTestScenario('regularUser');
const user2 = createTestScenario('otherAccountUser');

// Should have different account contexts
expect(user1.account.id).not.toBe(user2.account.id);
```

### Testing Permission Gates
```typescript
// Mock auth context
mockUseAuth.mockReturnValue({
  user: mockUsers.regularUser,
  currentAccountUser: mockAccountUsers.regularUser,
  isLoading: false,
});

// Test component visibility
render(
  <PermissionGate permission="admin.access">
    <AdminTools />
  </PermissionGate>
);

expect(screen.queryByText('Admin Tools')).not.toBeInTheDocument();
```

## Security Testing

### Role Elevation Attempts
1. Try to modify role via browser dev tools
2. Attempt direct API calls with fake admin role
3. Test JWT token tampering
4. Verify server-side validation

### Cross-Tenant Access
1. Try accessing other account's data via API
2. Attempt URL manipulation to view other projects
3. Test domain routing isolation
4. Verify RLS policies block access

## Debugging Failed Tests

### Permission Denied
1. Check user's role in account_users table
2. Verify account_id matches expected account
3. Confirm permission exists in role's permissions array
4. Check for platform account (00000000-0000-0000-0000-000000000000)

### RLS Policy Issues
```sql
-- Debug RLS in Supabase SQL editor
SET LOCAL "request.jwt.claims" TO '{"sub": "your-user-id"}';
SELECT * FROM accounts; -- Should only see allowed accounts
```

### API Authorization
1. Check Authorization header is present
2. Verify token contains correct user ID
3. Confirm API route has permission checks
4. Test with service role key for admin operations

## Best Practices

1. **Test all roles**: Don't just test happy paths
2. **Test boundaries**: Focus on what users CANNOT do
3. **Test edge cases**: Empty permissions, null users, etc.
4. **Test performance**: Ensure permission checks are fast
5. **Document failures**: Help future debugging

## Continuous Testing

After any permission system changes:
1. Run full test suite
2. Perform manual testing of critical paths
3. Check for regressions in existing features
4. Update tests for new permissions

Remember: A bulletproof permission system is critical for multi-tenant SaaS security!