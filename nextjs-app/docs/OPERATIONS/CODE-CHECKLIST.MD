# CODE-CHECKLIST.MD

## Critical Code Quality Checklist for Wondrous Digital Platform

This document serves as a **MANDATORY** checklist that must be followed for every feature, fix, or code change. It was created after spending multiple days fixing 452 TypeScript errors, 304+ ESLint errors, and numerous build/deployment issues.

**⚠️ IMPORTANT**: Failure to follow this checklist will result in accumulating technical debt that blocks deployments and requires days of cleanup work.

**⚠️ IMPORTANT**: If you run into a problem, DO NOT skip over it just to move to the next thing. Put a plan together to solve the problem and ask the user what they think about it. ONLY proceed if they say skip it.


---

## 📋 Table of Contents

1. [Root Cause Analysis](#root-cause-analysis)
2. [Pre-Coding Checklist](#pre-coding-checklist)
3. [During-Coding Checklist](#during-coding-checklist)
4. [Post-Coding Checklist](#post-coding-checklist)
5. [Pre-Commit Checklist](#pre-commit-checklist)
6. [MUST-NOT-DO Anti-Patterns](#must-not-do-anti-patterns)
7. [Verification Commands](#verification-commands)
8. [Pattern Examples](#pattern-examples)

---

## 🔍 Root Cause Analysis

### What Led to 452 TypeScript Errors

1. **Missing Type Definitions (30% of errors)**
   - Packages installed without corresponding @types packages
   - Custom types not defined for third-party libraries
   - JSX namespace not properly configured

2. **Implicit Any Types (25% of errors)**
   - Function parameters without type annotations
   - Untyped destructured objects
   - Missing return type annotations

3. **Incorrect Type Assertions (20% of errors)**
   - Direct array access without checks: `relation.accounts[0]`
   - Property access on union types without type guards
   - Assuming optional properties exist

4. **Async/Await Patterns (15% of errors)**
   - Missing `await` on `createSupabaseServerClient()`
   - Incorrect async parameter handling in Next.js 15

5. **Test Infrastructure (10% of errors)**
   - Improperly mocked Supabase clients
   - Incorrect mock return types
   - Direct process.env assignments

### What Led to 304+ ESLint Errors

1. **Disabled ESLint Rules**
   - `@typescript-eslint/no-explicit-any` not enforced
   - Unused variables and imports accumulated
   - Inconsistent code style

2. **Poor Import Management**
   - Unused imports never cleaned up
   - Duplicate imports
   - Wrong import paths

3. **Inefficient State Management**
   - Unused state variables
   - Redundant destructuring
   - Dead code accumulation

### Build & Deployment Issues

1. **Build-Time vs Runtime Initialization**
   - Resend client initialized at module load time
   - Environment variables accessed during build
   - Missing lazy initialization patterns

2. **Next.js 15 Compatibility**
   - Missing Suspense boundaries for client hooks
   - Incorrect static generation patterns
   - Invalid HTML nesting (block elements in inline)

3. **Hardcoded Components**
   - Lab editor hardcoded for HeroTwoColumn only
   - No dynamic component loading
   - Inflexible architecture

---

## ✅ Pre-Coding Checklist

**BEFORE writing any code, verify:**

### Environment Setup
- [ ] Working in `/nextjs-app/` directory (NOT root `/src/`)
- [ ] Latest dependencies installed: `npm install`
- [ ] No npm audit vulnerabilities: `npm audit`
- [ ] TypeScript compiles with zero errors: `npx tsc --noEmit`
- [ ] ESLint shows zero errors: `npm run lint`

### Dependency Check
- [ ] All required packages have @types packages installed
- [ ] No missing peer dependencies warnings
- [ ] Package versions compatible with Next.js 15

### Configuration Verification
```bash
# Run these commands from /nextjs-app directory
cd nextjs-app

# Check TypeScript configuration
npx tsc --noEmit

# Check ESLint configuration  
npm run lint

# Check for missing types
npm ls | grep "UNMET"
```

---

## 🔨 During-Coding Checklist

### TypeScript Requirements

#### ✅ ALWAYS DO:
- [ ] Add explicit types to ALL function parameters
- [ ] Add return types to ALL functions
- [ ] Use type guards for union types
- [ ] Check arrays before accessing: `Array.isArray(x) ? x[0] : x`
- [ ] Handle all possible undefined/null cases

#### ❌ NEVER DO:
```typescript
// ❌ BAD: Implicit any
function processData(data) { ... }

// ✅ GOOD: Explicit types
function processData(data: ProcessedData): Result { ... }

// ❌ BAD: Direct array access
const account = relation.accounts[0];

// ✅ GOOD: Safe array access
const account = Array.isArray(relation.accounts) 
  ? relation.accounts[0] 
  : relation.accounts;

// ❌ BAD: Property access on union type
const permissions = role.permissions;

// ✅ GOOD: Type guard first
if ('permissions' in role && role.permissions) {
  const permissions = role.permissions;
}
```

### Next.js 15 Patterns

#### Server Components
- [ ] Use `await` with createSupabaseServerClient()
- [ ] Handle async params properly
- [ ] No client-side hooks in server components

#### Client Components
- [ ] Wrap `useSearchParams()` in Suspense boundary
- [ ] Add 'use client' directive when needed
- [ ] Handle loading states properly

```typescript
// ❌ BAD: Missing Suspense
export default function Page() {
  const searchParams = useSearchParams();
  return <div>...</div>;
}

// ✅ GOOD: With Suspense
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <PageContent />
    </Suspense>
  );
}

function PageContent() {
  const searchParams = useSearchParams();
  return <div>...</div>;
}
```

### API Routes
- [ ] Validate all inputs with Zod schemas
- [ ] Handle all error cases explicitly
- [ ] Return proper status codes
- [ ] Use lazy initialization for external services

```typescript
// ❌ BAD: Direct initialization
const resend = new Resend(process.env.RESEND_API_KEY);

// ✅ GOOD: Lazy initialization
let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (resendClient) return resendClient;
  
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('RESEND_API_KEY not set');
      return null;
    }
    throw new Error('RESEND_API_KEY required');
  }
  
  resendClient = new Resend(apiKey);
  return resendClient;
}
```

### Component Development
- [ ] NO hardcoded component types
- [ ] Use dynamic imports for flexibility
- [ ] Implement proper prop validation
- [ ] Handle all edge cases

### Database Operations
- [ ] Always check query results before using
- [ ] Handle Supabase errors explicitly
- [ ] Use proper TypeScript types from database.ts
- [ ] Implement optimistic updates correctly

---

## 🧪 Post-Coding Checklist

### Build Verification
Run these commands **BEFORE** marking any task complete:

```bash
# From /nextjs-app directory
cd nextjs-app

# 1. TypeScript check (MUST PASS with 0 errors)
npx tsc --noEmit

# 2. ESLint check (MUST PASS with 0 errors)
npm run lint

# 3. Build check (MUST SUCCEED)
npm run build

# 4. Test the feature locally
npm run dev
# Then manually test your changes
```

### Feature Testing
- [ ] Feature works in development mode
- [ ] No console errors in browser
- [ ] No TypeScript errors in IDE
- [ ] All edge cases handled
- [ ] Loading states implemented
- [ ] Error states implemented

### Code Review
- [ ] No `any` types (except with eslint-disable comment and justification)
- [ ] No unused imports or variables
- [ ] No commented-out code
- [ ] No console.log statements (except intentional logging)
- [ ] No hardcoded values that should be dynamic
- [ ] No TODO comments without tickets

---

## 🚀 Pre-Commit Checklist

**MANDATORY** before EVERY commit:

```bash
# Run this exact sequence from /nextjs-app
cd nextjs-app

# 1. Type check
npx tsc --noEmit
# Expected: NO ERRORS

# 2. Lint check  
npm run lint
# Expected: NO ERRORS

# 3. Format check
npm run prettier:check
# Expected: NO CHANGES NEEDED

# 4. Build check (for significant changes)
npm run build
# Expected: BUILD SUCCESSFUL
```

### Commit Message Standards
- [ ] Clear, descriptive message
- [ ] Follows conventional commits format
- [ ] References issue/ticket if applicable

```bash
# Good commit messages:
# fix: Resolve TypeScript errors in user service layer
# feat: Add lazy loading for Resend email client
# refactor: Remove hardcoded component types from lab editor
```

---

## ⛔ MUST-NOT-DO Anti-Patterns

### 1. **NEVER** Skip Type Definitions
```typescript
// ❌ ABSOLUTELY FORBIDDEN
const processUser = (user: any) => { ... }

// ✅ REQUIRED
const processUser = (user: User) => { ... }
```

### 2. **NEVER** Access Arrays Without Checks
```typescript
// ❌ CAUSES RUNTIME ERRORS
const firstItem = items[0];

// ✅ SAFE PATTERN
const firstItem = items?.[0] ?? null;
// OR
const firstItem = Array.isArray(items) && items.length > 0 
  ? items[0] 
  : null;
```

### 3. **NEVER** Ignore Async/Await
```typescript
// ❌ BREAKS IN NEXT.JS 15
const supabase = createSupabaseServerClient();

// ✅ CORRECT
const supabase = await createSupabaseServerClient();
```

### 4. **NEVER** Hardcode Dynamic Content
```typescript
// ❌ INFLEXIBLE
import { HeroTwoColumn } from '@/components/sections/hero-two-column';
return <HeroTwoColumn {...props} />;

// ✅ DYNAMIC
const Component = sectionComponents[draft.component_name];
return Component ? <Component {...props} /> : null;
```

### 5. **NEVER** Initialize Services at Module Level
```typescript
// ❌ BREAKS BUILD
const emailClient = new Resend(process.env.RESEND_API_KEY);

// ✅ LAZY INITIALIZATION
let emailClient: Resend | null = null;
function getEmailClient() {
  if (!emailClient && process.env.RESEND_API_KEY) {
    emailClient = new Resend(process.env.RESEND_API_KEY);
  }
  return emailClient;
}
```

### 6. **NEVER** Mix HTML Block/Inline Elements
```html
<!-- ❌ INVALID HTML -->
<p>
  <ul>
    <li>Item</li>
  </ul>
</p>

<!-- ✅ VALID HTML -->
<div>
  <p>Text content</p>
  <ul>
    <li>Item</li>
  </ul>
</div>
```

### 7. **NEVER** Leave Unused Code
```typescript
// ❌ ACCUMULATES TECHNICAL DEBT
import { unused1, unused2 } from './utils';
const [unusedState, setUnusedState] = useState();

// ✅ CLEAN CODE
// Only import and declare what you use
```

### 8. **NEVER** Use process.env Directly in Tests
```typescript
// ❌ BREAKS TESTS
process.env.NODE_ENV = 'test';

// ✅ USE VITEST METHODS
vi.stubEnv('NODE_ENV', 'test');
```

---

## 🔧 Verification Commands

### Quick Health Check
```bash
# Run from /nextjs-app directory
npm run health-check

# If health-check doesn't exist, run these:
npx tsc --noEmit && npm run lint && echo "✅ All checks passed!"
```

### Find Common Issues
```bash
# Find any types
grep -r "any" src/ --include="*.ts" --include="*.tsx" | grep -v "eslint-disable"

# Find console.log statements
grep -r "console.log" src/ --include="*.ts" --include="*.tsx"

# Find TODO comments
grep -r "TODO\|FIXME\|HACK" src/ --include="*.ts" --include="*.tsx"

# Find direct array access patterns
grep -r "\[0\]" src/ --include="*.ts" --include="*.tsx"
```

### Fix Common Issues
```bash
# Auto-fix ESLint issues
npm run lint:fix

# Format code
npm run prettier:write

# Clean and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Pattern Examples

### Supabase Query Pattern
```typescript
// ✅ CORRECT PATTERN
export async function getUser(userId: string) {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
  
  return data;
}
```

### Component Props Pattern
```typescript
// ✅ CORRECT PATTERN
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({ 
  label, 
  onClick, 
  variant = 'primary',
  disabled = false 
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'px-4 py-2 rounded',
        variant === 'primary' ? 'bg-blue-500' : 'bg-gray-500'
      )}
    >
      {label}
    </button>
  );
}
```

### Error Handling Pattern
```typescript
// ✅ CORRECT PATTERN
try {
  const result = await riskyOperation();
  return { success: true, data: result };
} catch (error) {
  console.error('Operation failed:', error);
  return { 
    success: false, 
    error: error instanceof Error 
      ? error.message 
      : 'Unknown error occurred' 
  };
}
```

---

## 🎯 Summary

**The Golden Rules:**

1. **ZERO TypeScript errors** before committing
2. **ZERO ESLint errors** before committing
3. **ALWAYS run build** before marking tasks complete
4. **NEVER use `any`** without explicit justification
5. **ALWAYS handle** loading, error, and edge cases
6. **NEVER hardcode** what should be dynamic
7. **ALWAYS test** your changes manually

**Remember**: Taking shortcuts now means spending days fixing errors later. This checklist exists because we already learned this lesson the hard way.

---

**Last Updated**: 2025-01-14  
**Created After**: Fixing 452 TypeScript errors, 304+ ESLint errors, and multiple deployment failures