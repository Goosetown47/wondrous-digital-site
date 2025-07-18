# Testing & Security Guidelines

This document provides comprehensive testing and security standards for the Wondrous Digital Site platform. All features must adhere to these guidelines to ensure reliability, security, and performance.

## 🎯 Core Testing Principles

**QUALITY IS NON-NEGOTIABLE**: Every feature must be thoroughly tested before deployment. Bugs in production lead to customer churn.

### Testing Pyramid
1. **Unit Tests** (70%) - Fast, isolated component/function tests
2. **Integration Tests** (20%) - Database, API, and service interactions
3. **E2E Tests** (10%) - Critical user journeys

---

## 🧪 Testing Standards

### Unit Testing Requirements

#### What to Test
- **Validation Schemas**: All Zod schemas must have tests
- **Business Logic**: Pure functions and utilities
- **React Components**: User interactions and state changes
- **Error Handling**: Edge cases and error scenarios

#### Example Test Structure
```typescript
// src/schemas/__tests__/project.test.ts
import { describe, it, expect } from 'vitest';
import { createProjectSchema } from '../project';

describe('createProjectSchema', () => {
  it('should validate valid project data', () => {
    const result = createProjectSchema.safeParse({
      project_name: 'Test Project',
      project_type: 'main_site',
      customer_id: '123e4567-e89b-12d3-a456-426614174000',
      niche: 'technology'
    });
    
    expect(result.success).toBe(true);
  });

  it('should reject empty project name', () => {
    const result = createProjectSchema.safeParse({
      project_name: '',
      project_type: 'main_site',
      customer_id: '123e4567-e89b-12d3-a456-426614174000'
    });
    
    expect(result.success).toBe(false);
    expect(result.error.format().project_name?._errors).toContain('Required');
  });
});
```

### Integration Testing

#### Database Operations
```typescript
// Test with real Supabase connection
describe('Project Database Operations', () => {
  it('should enforce RLS policies', async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('customer_id', 'other-customer-id');
    
    // Should not see other customer's projects
    expect(data).toHaveLength(0);
  });

  it('should validate data before insert', async () => {
    const { error } = await supabase
      .from('projects')
      .insert({ 
        project_name: '', // Invalid
        project_type: 'invalid_type' 
      });
    
    expect(error).toBeDefined();
  });
});
```

### E2E Testing Checklist

#### Critical User Flows
- [ ] User registration and login
- [ ] Project creation workflow
- [ ] Page builder drag & drop
- [ ] Content editing and saving
- [ ] Project status transitions
- [ ] Multi-tenant data isolation

#### Mobile E2E Tests
- [ ] Touch interactions work correctly
- [ ] Responsive layouts render properly
- [ ] Forms are usable on mobile keyboards
- [ ] Performance on 3G networks

---

## 🔒 Security Implementation

### Input Validation

#### Always Use Zod Schemas
```typescript
// ✅ GOOD: Validate all user inputs
const handleSubmit = async (formData: unknown) => {
  const result = createProjectSchema.safeParse(formData);
  if (!result.success) {
    // Handle validation errors
    return;
  }
  
  // Safe to use result.data
  await createProject(result.data);
};

// ❌ BAD: Direct use of user input
const handleSubmit = async (formData: any) => {
  await createProject(formData); // Dangerous!
};
```

#### SQL Injection Prevention
```typescript
// ✅ GOOD: Parameterized queries
const { data } = await supabase
  .from('projects')
  .select('*')
  .eq('project_name', userInput); // Safe

// ❌ BAD: String concatenation
const query = `SELECT * FROM projects WHERE name = '${userInput}'`; // SQL Injection risk!
```

### Authentication & Authorization

#### Supabase Auth Best Practices
```typescript
// Always verify user in server-side operations
const user = await supabase.auth.getUser();
if (!user.data.user) {
  throw new Error('Unauthorized');
}

// Use user.id for data filtering
const { data } = await supabase
  .from('projects')
  .select('*')
  .eq('user_id', user.data.user.id);
```

#### Row Level Security (RLS)
```sql
-- Required for ALL tables
CREATE POLICY "Users can only see their own projects"
ON projects FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can only update their own projects"
ON projects FOR UPDATE
USING (auth.uid() = user_id);
```

### Multi-Tenant Data Isolation

#### Always Filter by Project Context
```typescript
// ✅ GOOD: Always include project_id
const { data } = await supabase
  .from('pages')
  .select('*')
  .eq('project_id', currentProjectId);

// ❌ BAD: Missing project context
const { data } = await supabase
  .from('pages')
  .select('*'); // Data leak risk!
```

#### Test Data Isolation
```typescript
describe('Multi-tenant isolation', () => {
  it('should not access other project data', async () => {
    // Login as User A
    const userA = await loginAs('userA@test.com');
    
    // Try to access User B's project
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', userBProjectId);
    
    expect(data).toBeNull();
    expect(error).toBeDefined();
  });
});
```

### XSS Prevention

#### Sanitize User Content
```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize HTML content
const sanitizedHtml = DOMPurify.sanitize(userHtml, {
  ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a'],
  ALLOWED_ATTR: ['href', 'target']
});

// React automatically escapes text content
<div>{userText}</div> // Safe

// Dangerous HTML requires sanitization
<div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
```

### Secrets Management

#### Environment Variables
```typescript
// ✅ GOOD: Use environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// ❌ BAD: Hardcoded secrets
const apiKey = 'sk_live_abc123'; // NEVER DO THIS!
```

#### Pre-commit Checks
```json
// .husky/pre-commit
{
  "*.{ts,tsx}": [
    "eslint --cache",
    "bash -c 'tsc --noEmit'",
    "grep -r 'SUPABASE_SERVICE_ROLE_KEY' --exclude-dir=node_modules || exit 0"
  ]
}
```

---

## 📈 Performance Standards

### Database Performance

#### Required Indexes
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_projects_customer_id ON projects(customer_id);
CREATE INDEX idx_projects_status ON projects(project_status);
CREATE INDEX idx_pages_project_id ON pages(project_id);
```

#### Query Optimization
```typescript
// ✅ GOOD: Select only needed columns
const { data } = await supabase
  .from('projects')
  .select('id, project_name, project_status')
  .eq('customer_id', customerId)
  .limit(20);

// ❌ BAD: Select all columns
const { data } = await supabase
  .from('projects')
  .select('*'); // Wasteful
```

### Frontend Performance

#### Code Splitting
```typescript
// Lazy load heavy components
const PageBuilder = lazy(() => import('./PageBuilder'));

// Route-based splitting
const AdminRoutes = lazy(() => import('./routes/AdminRoutes'));
```

#### Image Optimization
```typescript
// Use responsive images
<img 
  src={imageUrl}
  srcSet={`${imageUrl}?w=400 400w, ${imageUrl}?w=800 800w`}
  sizes="(max-width: 768px) 100vw, 50vw"
  loading="lazy"
  alt={altText}
/>
```

### Performance Targets
- **Desktop Page Load**: < 2 seconds
- **Mobile Page Load**: < 3 seconds (3G)
- **API Response Time**: < 500ms (p95)
- **Time to Interactive**: < 3.5 seconds
- **Bundle Size**: < 200KB (gzipped)

---

## 🗄️ Supabase-Specific Guidelines

### Database Migrations

#### Migration Testing
```bash
# Test migration locally first
supabase db reset
supabase migration up

# Verify migration
supabase db diff

# Create rollback plan
-- migrations/rollback_20250117_feature.sql
DROP TABLE IF EXISTS new_feature_table;
ALTER TABLE existing_table DROP COLUMN IF EXISTS new_column;
```

### RLS Policy Testing
```typescript
// Test RLS policies are working
describe('RLS Policies', () => {
  it('should enforce project ownership', async () => {
    // Create project as User A
    const projectA = await createProjectAs(userA);
    
    // Try to update as User B
    const { error } = await supabase
      .auth.signIn({ email: userB.email })
      .then(() => supabase
        .from('projects')
        .update({ project_name: 'Hacked!' })
        .eq('id', projectA.id)
      );
    
    expect(error?.code).toBe('42501'); // Insufficient privilege
  });
});
```

### Real-time Security
```typescript
// Subscribe with proper filters
const subscription = supabase
  .channel('project-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'projects',
    filter: `customer_id=eq.${currentCustomerId}` // Important!
  }, handleChange)
  .subscribe();
```

### Storage Security
```typescript
// Validate file uploads
const validateUpload = (file: File) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (file.size > maxSize) {
    throw new Error('File too large');
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }
  
  // Additional virus scanning could go here
};
```

---

## 🔄 Development Workflow

### Pre-Feature Checklist
- [ ] Review security requirements
- [ ] Plan validation schemas
- [ ] Design RLS policies
- [ ] Create test plan
- [ ] Consider mobile UX

### During Development
- [ ] Write tests alongside code
- [ ] Validate all inputs
- [ ] Check for data leaks
- [ ] Test on mobile devices
- [ ] Monitor performance

### Pre-Commit Checklist
```bash
# Run all checks
npm run lint          # ESLint with security plugins
npm run type-check    # TypeScript validation
npm run test          # Unit tests
npm run test:e2e      # E2E tests (if applicable)
```

### Code Review Security Checklist
- [ ] All inputs validated with Zod
- [ ] No hardcoded secrets
- [ ] RLS policies in place
- [ ] Data properly scoped by tenant
- [ ] Error messages don't leak info
- [ ] Performance targets met
- [ ] Mobile experience tested

---

## 📊 Monitoring & Observability

### Error Tracking
```typescript
// Sentry or similar
Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Sanitize sensitive data
    delete event.user?.email;
    return event;
  }
});
```

### Performance Monitoring
```typescript
// Track key metrics
export const trackMetric = (name: string, value: number) => {
  // Send to analytics
  if (window.gtag) {
    window.gtag('event', 'timing_complete', {
      name,
      value
    });
  }
};

// Usage
const startTime = performance.now();
await saveProject(data);
trackMetric('project_save_time', performance.now() - startTime);
```

### Security Audit Logging
```typescript
// Log sensitive operations
const auditLog = async (action: string, details: object) => {
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action,
    details,
    ip_address: request.ip,
    user_agent: request.headers['user-agent']
  });
};

// Usage
await auditLog('project.delete', { 
  project_id: projectId,
  project_name: projectName 
});
```

---

## ⚠️ Common Security Pitfalls

### DON'T
- ❌ Trust client-side validation alone
- ❌ Store sensitive data in localStorage
- ❌ Log passwords or API keys
- ❌ Use `.innerHTML` with user content
- ❌ Expose internal error messages to users
- ❌ Skip RLS policies "temporarily"
- ❌ Hardcode environment-specific values

### DO
- ✅ Validate on both client and server
- ✅ Use secure session storage
- ✅ Sanitize logs before storing
- ✅ Use React's built-in XSS protection
- ✅ Return generic error messages
- ✅ Always implement RLS from day one
- ✅ Use environment variables

---

## 🚀 Performance Optimization Checklist

### Database
- [ ] Add indexes for common queries
- [ ] Use pagination (limit/offset)
- [ ] Optimize N+1 queries
- [ ] Cache frequently accessed data
- [ ] Use database views for complex queries

### Frontend
- [ ] Implement code splitting
- [ ] Lazy load images
- [ ] Minimize bundle size
- [ ] Use React.memo wisely
- [ ] Debounce user inputs
- [ ] Virtualize long lists

### API
- [ ] Implement request caching
- [ ] Use CDN for static assets
- [ ] Compress responses (gzip)
- [ ] Rate limit endpoints
- [ ] Batch operations when possible

---

## 📱 Mobile Testing Requirements

### Touch Interactions
- [ ] Buttons minimum 44x44px
- [ ] No hover-only interactions
- [ ] Swipe gestures work properly
- [ ] Form inputs are accessible

### Performance
- [ ] Test on real devices
- [ ] Simulate 3G networks
- [ ] Check memory usage
- [ ] Verify smooth scrolling

### Responsive Design
- [ ] Test all breakpoints
- [ ] Verify text readability
- [ ] Check image scaling
- [ ] Test landscape/portrait

---

## 🎯 Success Metrics

### Testing Coverage
- Unit Tests: > 80% coverage
- Integration Tests: All critical paths
- E2E Tests: Core user journeys
- Security Tests: All auth flows

### Performance Metrics
- Lighthouse Score: > 90
- Core Web Vitals: All green
- API Response: < 500ms (p95)
- Error Rate: < 0.1%

### Security Metrics
- Zero data breaches
- Zero unauthorized access
- All inputs validated
- All secrets secured

---

**Remember**: Security and testing are not optional. They are fundamental requirements for maintaining customer trust and platform reliability.