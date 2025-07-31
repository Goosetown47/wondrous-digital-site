# Quick Test Reference

## Running Tests

### All Tests
```bash
npm test                   # Run all tests in watch mode
npm run test:run          # Run all tests once
npm run test:coverage     # Run with coverage report
```

### Specific Test Categories
```bash
npm run test:permissions  # Permission system tests only
npm run test:unit        # Unit tests only
npm run test:integration # Integration/API tests
npm run test:components  # Component tests
npm run test:e2e        # All E2E tests
npm run test:e2e:permissions # E2E permission tests only
```

### Debug Mode
```bash
npm run test:debug       # Run tests with debugger
npm run test:ui         # Run tests with UI
```

## Test File Locations

```
src/
├── lib/permissions/__tests__/     # Permission logic tests
├── hooks/__tests__/               # Hook tests
├── components/**/__tests__/       # Component tests
├── app/api/__tests__/            # API tests
└── test/utils/                   # Test utilities

e2e/
└── permissions/                  # E2E permission tests
```

## Key Test Files

### Permission System Core
- `src/lib/permissions/__tests__/permissions.test.ts` - Core permission functions
- `src/lib/permissions/__tests__/role-hierarchy.test.ts` - Role hierarchy and elevation

### Hooks
- `src/hooks/__tests__/usePermissions.test.ts` - Permission hooks
- `src/hooks/__tests__/useRole.test.ts` - Role hooks

### Components
- `src/components/auth/__tests__/PermissionGate.test.tsx` - Permission gate component

### API
- `src/app/api/__tests__/tenant-isolation.test.ts` - Cross-tenant security

### E2E
- `e2e/permissions/admin-access.test.ts` - Admin tools access
- `e2e/permissions/account-isolation.test.ts` - Account isolation

## Writing New Tests

### Permission Test Template
```typescript
import { describe, it, expect } from 'vitest';
import { hasPermission } from '@/lib/permissions';
import { mockUsers } from '@/test/utils/auth-mocks';

describe('Feature Permission', () => {
  it('allows authorized users', async () => {
    const result = await hasPermission(
      mockUsers.accountOwnerA.id,
      'account-id',
      'feature:action'
    );
    expect(result).toBe(true);
  });
  
  it('denies unauthorized users', async () => {
    const result = await hasPermission(
      mockUsers.regularUserB.id,
      'account-id',
      'feature:action'
    );
    expect(result).toBe(false);
  });
});
```

### Component Test Template
```typescript
import { render, screen } from '@testing-library/react';
import { PermissionGate } from '@/components/auth/PermissionGate';

describe('FeatureComponent', () => {
  it('shows feature to authorized users', () => {
    // Mock permission check
    vi.mocked(useHasPermission).mockReturnValue({
      data: true,
      isLoading: false,
    });
    
    render(
      <PermissionGate permission="feature:use">
        <button>Use Feature</button>
      </PermissionGate>
    );
    
    expect(screen.getByText('Use Feature')).toBeInTheDocument();
  });
});
```

## Coverage Requirements

- Overall: 80% minimum
- Permission logic: 100%
- Security boundaries: 90%
- UI components: 80%

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Commits to main branch
- Pre-deployment checks

Failed permission tests block deployment!