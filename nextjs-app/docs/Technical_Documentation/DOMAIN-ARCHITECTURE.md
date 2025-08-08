# Domain System Architecture

## Overview

The domain system follows a server-side architecture pattern where all domain operations that require elevated privileges (like updating verification status) are performed on the server using admin credentials. This bypasses Row Level Security (RLS) restrictions while maintaining security.

## Architecture Components

### 1. Server-Side Services (`/src/lib/services/domains.server.ts`)

Contains functions that use the Supabase admin client:

```typescript
const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
```

Key functions:
- `addDomainToVercel(domain)` - Adds domain to Vercel project
- `checkDomainStatus(domain)` - Checks verification & SSL status
- `updateDomainVerification(domainId, updates)` - Updates domain in database with admin privileges

### 2. API Routes

#### `/api/domains/[id]/update/route.ts`
- **Method**: PUT
- **Purpose**: Updates domain verification status, SSL state, and verification details
- **Authentication**: Validates user has access to the domain's project
- **Flow**:
  1. Authenticates user via Supabase auth
  2. Verifies user has access to the domain's project
  3. Calls server-side `updateDomainVerification` function
  4. Returns success/error response

#### `/api/domains/[id]/verify/route.ts`
- **Method**: POST
- **Purpose**: Triggers domain verification check
- **Flow**:
  1. Fetches domain details using admin client
  2. Calls `verifyDomainWithRetry` to check Vercel status
  3. Updates database with verification results
  4. Schedules retry if domain not yet verified

### 3. Client-Side Services (`/src/lib/services/domains.ts`)

Contains client-facing functions that call API routes:

```typescript
export async function updateDomainVerification(
  domainId: string,
  updates: {
    verified?: boolean;
    ssl_state?: string;
    verification_details?: Record<string, unknown>;
  }
): Promise<{ error: string | null }> {
  const response = await fetch(`/api/domains/${domainId}/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  // ...
}
```

### 4. React Hooks (`/src/hooks/useDomains.ts`)

Provides React Query hooks for domain operations:
- `useDomains(projectId)` - Fetches domains for a project (read-only)
- `useAddDomain()` - Adds a domain via API route
- `useVerifyDomain()` - Triggers verification via API route
- `useDomainStatus(domainId)` - Polls domain status (read-only)

## Data Flow

### Adding a Domain
```
User → React Hook → API Route → Server Function → Vercel API
                              ↘ Database (with permissions check)
```

### Verifying a Domain
```
User → React Hook → Verify API → Server Functions → Vercel API
                                                  ↘ Admin Database Update
```

### Updating Domain Status
```
Verification Service → updateDomainVerification (server) → Admin Database Update
```

## Security Model

1. **Client-Side**: 
   - Can only read domains they have access to (RLS enforced)
   - All write operations go through API routes

2. **API Routes**:
   - Authenticate user
   - Verify user has access to the resource
   - Call server-side functions with admin privileges

3. **Server-Side**:
   - Uses service role key for admin access
   - Bypasses RLS for necessary operations
   - Logs all operations for audit trail

## Database Schema

```sql
CREATE TABLE project_domains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  is_primary BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  ssl_state TEXT DEFAULT 'PENDING',  -- PENDING, INITIALIZING, ERROR, READY
  verification_details JSONB,         -- Stores DNS verification requirements
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # For admin operations

# Vercel (optional but recommended)
VERCEL_API_TOKEN=your_vercel_token
VERCEL_PROJECT_ID=your_project_id
VERCEL_TEAM_ID=your_team_id  # Optional
```

## Best Practices

1. **Never expose service role key to client**
   - Only use in server-side code
   - Set `persistSession: false` on admin client

2. **Always validate permissions in API routes**
   - Check user authentication
   - Verify resource ownership before admin operations

3. **Log operations for debugging**
   - Use consistent log prefixes like `[DOMAIN]`
   - Log both successes and failures

4. **Handle errors gracefully**
   - Return specific error messages
   - Don't expose internal errors to clients

5. **Use TypeScript for type safety**
   - Define interfaces for all data structures
   - Use `Pick<>` for partial updates

## Migration Path

When moving from client-side to server-side operations:

1. Create server-side function with admin client
2. Create API route that validates permissions
3. Update client-side function to call API
4. Test thoroughly with different user roles
5. Remove old client-side database operations

## Testing

Test the verification flow:
```bash
node scripts/test-verify-flow.mjs
```

Check domain columns:
```bash
node scripts/check-domain-columns.mjs
```

## Future Enhancements

1. **Webhook Support**: Add webhook endpoints for Vercel to notify us of domain changes
2. **Batch Operations**: Support verifying multiple domains in one request
3. **Audit Log**: Create dedicated table for domain operation history
4. **Background Jobs**: Use a job queue for long-running verification tasks
5. **Caching**: Cache Vercel API responses to reduce API calls