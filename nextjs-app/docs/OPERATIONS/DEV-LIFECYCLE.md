# Development Lifecycle

This document outlines our standard development process to ensure consistent quality and prevent technical debt. Following this process helps us ship reliable features without accumulating the kinds of errors that can block deployments.

> **⚠️ IMPORTANT: Deployment Branch**  
> Our production deployment branch is `nextjs-pagebuilder-core` (NOT master/main).  
> All PRs must target `nextjs-pagebuilder-core` for Vercel deployment.


## ---------------------------------------------- ##
# Sprint Process Guide (for reference)

## Sprint Planning (Start of Sprint)

  1. Review BACKLOG.md → Pull priority items into ACTIVE-SPRINT.md
  2. Set version number → Decide scope (major.minor.patch)
  3. Move packets → Cut H4 sections from BACKLOG to ACTIVE-SPRINT
  4. Order packets → Arrange by priority/dependency


## During Sprint Execution

### Per Packet Workflow:

  1. Move packet to Current Focus → Work on one packet at a time
  2. Follow DEV-LIFECYCLE.md → Full/Fast Track/Emergency mode per packet
  3. As you discover issues → Add to "Found Work" section:
    - Critical → Must fix in current version
    - Non-Critical → Defer to next version
    - Tech Debt → Document for future
  4. Update STATUS-LOG.md → Log progress after each packet
  5. Check off tasks → Mark complete in ACTIVE-SPRINT.md
  6. Move to Sprint Backlog → When packet done, grab next

### Daily Flow:

  - Start: Check Current Focus in ACTIVE-SPRINT.md
  - Work: Follow DEV-LIFECYCLE for that packet
  - Discover: Add found issues to appropriate section
  - End: Update STATUS-LOG with progress

### Sprint Completion

  1. All packets done → Verify all tasks checked
  2. Create Release Notes → /docs/Release_Notes/v0.1.1.md
  3. Archive sprint content → Copy ACTIVE-SPRINT to STATUS-LOG
  4. Clear ACTIVE-SPRINT.md → Reset for next sprint
  5. Update version numbers → Production/Development in all docs


## Key Rules

  - ONE packet in Current Focus at a time
  - COMPLETE DEV-LIFECYCLE per packet before moving on
  - DOCUMENT found work immediately
  - UPDATE STATUS-LOG per packet completion
  - NEVER skip DEV-LIFECYCLE steps

## ---------------------------------------------- ##



## Process Modes

Choose the appropriate mode based on your task:

### 🚀 Full Feature Mode
For new features and significant changes. This ensures thorough planning, testing, and documentation for major work.

### 🏃 Fast Track Mode  
For bug fixes and small improvements. This provides a streamlined process for quick fixes while maintaining quality.

### 🚨 Emergency Mode
For critical production issues. This allows rapid response to urgent problems while ensuring proper follow-up.

---

## 🚀 Full Feature Mode Process

### 1. Pre-Flight Checklist & Planning
*Ensures your development environment is clean and all tools are working before you begin.*

#### Environment Check:
- [ ] Working in `/nextjs-app/` directory  
  *Prevents accidentally working in the legacy codebase*
  
- [ ] Latest main branch pulled  
  *Ensures you're building on the most recent stable code*
  
- [ ] `npm install` completed  
  *Guarantees all dependencies are up to date*
  
- [ ] `npm run dev` starts without errors  
  *Confirms the development server is functional*
  
- [ ] `npx tsc --noEmit` shows 0 errors  
  *Verifies no existing TypeScript issues before adding new code*
  
- [ ] `npm run lint` shows 0 errors  
  *Confirms code style compliance before making changes*
  
- [ ] All existing tests pass  
  *Ensures you're starting from a stable baseline*

#### Planning:
- [ ] Review BACKLOG.md and identify features to work on  
  *Maintains alignment with product priorities*
  
- [ ] Discuss scope with user and get alignment  
  *Prevents building the wrong thing or overengineering*
  
- [ ] Check `/docs/PRDs/PRD Design & Build System.md` for context  
  *Understands how this feature fits into the bigger picture*
  
- [ ] Create/update feature tasks in ACTIVE-SPRINT.md  
  *Tracks what's being worked on currently*
  
- [ ] Start Release Notes draft in `/docs/Release_Notes/`  
  *Documents changes as you go rather than trying to remember later*

- [ ] Ensure our dev and production release number is correct - ask the user to confirm.
  *This allows us to stay in sync.*

- [ ] Check to make sure BACKLOG.md, STATUS-LOG.md, and ACTIVE-SPRINT.md have the correct version number.

### 2. Create User Stories
*Defines clear, testable outcomes that can be verified before deployment.*

In ACTIVE-SPRINT.md, create testable user stories:
- [ ] Write stories in format: "As a [role], I can [action] so that [benefit]"  
  *Ensures features solve real user needs*
  
- [ ] Include both happy path and edge cases  
  *Prevents shipping features that break in unusual situations*
  
- [ ] Make them manually testable  
  *Allows verification without complex test setups*
  
- [ ] Get user confirmation before proceeding  
  *Ensures you're building what's actually needed*

Example:
```
Feature: Domain Management
- As a platform admin, I can add custom domains to projects
- As a platform admin, I can verify domain ownership
- As a user, I can see my site on my custom domain
- Edge case: As a user, I see clear error if domain verification fails
```

### 3. Development
*Builds features using consistent patterns and quality standards.*

#### Before coding:
- [ ] Create feature branch from main  
  *Isolates your work from others' changes*
  
- [ ] Review any similar code for patterns  
  *Maintains consistency across the codebase*
  
- [ ] Check for existing utilities/components to reuse  
  *Avoids reinventing the wheel and keeps bundle size down*

#### While coding:
- [ ] Follow KISS, DRY, SOLID principles  
  *Keeps code maintainable and understandable*
  
- [ ] Write TypeScript with explicit types (no `any` without justification)  
  *Catches bugs at compile time instead of runtime*
  
- [ ] Write tests alongside features  
  *Ensures features work correctly and prevents regressions*
  
- [ ] Focus tests on critical business logic, data transformations, API endpoints, key user flows 
  *Tests what matters rather than chasing coverage numbers*
  
- [ ] Run `npx tsc --noEmit` frequently  
  *Catches type errors immediately rather than after hours of coding*
  
- [ ] Commit often with meaningful messages  
  *Makes it easy to track changes and roll back if needed*

#### Database changes:
- [ ] Create migration file with timestamp  
  *Ensures database changes are versioned and repeatable*
  
- [ ] Test migration up AND down locally  
  *Verifies you can roll back if something goes wrong*
  
- [ ] Update TypeScript types  
  *Keeps code in sync with database structure*

### 4. Testing & Quality Assurance
*Verifies features work correctly, securely, and performantly before users see them.*

#### Automated checks:
```bash
# Must pass before moving forward
npm run build         # Ensures code compiles for production
npm run lint          # Maintains consistent code style
npm run test          # Verifies unit tests pass
npm run test:e2e      # Confirms user flows work end-to-end
```

#### Unit Testing with Vitest:
- [ ] Business logic has unit tests  
  *Verifies calculations and data processing work correctly*
  
- [ ] API route handlers tested with mocked Supabase  
  *Ensures endpoints handle all response scenarios*
  
- [ ] Custom hooks tested with testing utilities  
  *Confirms React state management works properly*
  
- [ ] Edge cases covered (null, undefined, empty arrays)  
  *Prevents crashes from unexpected data*
  
- [ ] Run coverage report: `npm run test:coverage`  
  *Identifies untested code paths (focus on quality, not percentage)*

#### E2E Testing with Playwright:
- [ ] Write tests for each user story  
  *Verifies features work from the user's perspective*
  
- [ ] Test authentication flows  
  *Ensures users can't access data they shouldn't*
  
- [ ] Test error scenarios  
  *Confirms the app handles problems gracefully*
  
- [ ] Run performance checks  
  *Prevents shipping slow features*

#### Security Checklist:
- [ ] **Input Validation**
  - All forms have Zod schemas  
    *Prevents malformed data from breaking the app*
  - API routes validate inputs before processing  
    *Stops bad data at the system boundary*
  - File uploads restricted by type/size  
    *Prevents abuse and security vulnerabilities*

- [ ] **Authentication & Authorization**
  - Routes protected with middleware  
    *Ensures only logged-in users access protected pages*
  - API endpoints check user permissions  
    *Prevents users from performing unauthorized actions*
  - RLS policies tested for data isolation  
    *Guarantees users only see their own data*

- [ ] **Common Vulnerabilities**
  - No `dangerouslySetInnerHTML` without sanitization  
    *Prevents XSS attacks from user content*
  - No secrets in client code  
    *Keeps API keys and passwords secure*
  - SQL queries use parameterized inputs  
    *Prevents SQL injection attacks*

- [ ] **Quick Security Scan**
  ```bash
  # Check for exposed secrets
  grep -r "sk_\|pk_\|api_key\|secret" src/ --include="*.ts" --include="*.tsx"
  
  # Run npm audit
  npm audit --audit-level=moderate
  ```
  *Catches common security mistakes before deployment*

#### Performance Checklist:
- [ ] **Lighthouse Audit**
  - Performance score > 90  
    *Ensures fast page loads for users*
  - Accessibility score > 90  
    *Makes the app usable for everyone*

- [ ] **Bundle Size Check**
  ```bash
  npm run build
  # First Load JS should be < 200kB per page
  ```
  *Keeps the app fast even on slow connections*

- [ ] **Core Web Vitals**
  - Images have proper sizing  
    *Prevents layout shift as images load*
  - Large components are lazy loaded  
    *Speeds up initial page load*
  - Database queries are efficient  
    *Prevents slow page loads from data fetching*

#### Platform-Specific Tests:
- [ ] **Multi-tenant Isolation**
  - Test data isolation between accounts  
    *Ensures customer data privacy*
  - Verify project access controls  
    *Prevents unauthorized access to projects*

- [ ] **Builder Performance**
  - Test with many sections (50+)  
    *Ensures the builder stays fast with real content*

- [ ] **Theme Switching**
  - Verify no layout shift  
    *Provides smooth user experience*

#### Manual Testing:
- [ ] Test each user story from ACTIVE-SPRINT.md  
  *Confirms features work as intended*
  
- [ ] Check on different screen sizes  
  *Ensures mobile users have a good experience*
  
- [ ] Verify error handling  
  *Confirms users get helpful feedback when things go wrong*
  
- [ ] User marks each story as tested ✓  
  *Gets final approval before deployment*

#### Sentry Monitoring:
- [ ] Check Sentry for any related errors  
  *Identifies issues that might not appear in testing*
  
- [ ] Set up error alerts if needed  
  *Ensures quick notification of problems*

### 5. Pre-Deployment
*Final verification that features are ready for production.*

#### Final checks:
- [ ] All Vitest tests passing  
  *Confirms unit tests are green*
  
- [ ] All Playwright tests passing  
  *Verifies E2E flows work*
  
- [ ] Build succeeds: `npm run build`  
  *Ensures code will deploy successfully*
  
- [ ] No TypeScript errors  
  *Prevents runtime type issues*
  
- [ ] Migrations tested  
  *Confirms database changes will apply cleanly*
  
- [ ] Feature flags configured (if applicable)  
  *Allows gradual rollout or quick disable if needed*
  
- [ ] Rollback plan documented  
  *Ensures you can recover quickly if issues arise*

#### Documentation:
- [ ] Update Release Notes with user-facing changes  
  *Communicates what's new to customers*
  
- [ ] Update any affected guides in `/docs/`  
  *Keeps documentation current*
  
- [ ] Update STATUS-LOG.md  
  *Maintains record of what was done*
  
- [ ] Move completed items from ACTIVE-SPRINT.md  
  *Keeps sprint tracking accurate*

### 6. Deployment
*Ships features to production with confidence.*

#### Deploy sequence:
- [ ] Create PR to `nextjs-pagebuilder-core` branch (NOT master/main!)  
  *This is our deployment branch that Vercel monitors*
  
- [ ] Verify Vercel preview deployment  
  *Tests in production-like environment*
  
- [ ] Test critical paths on preview  
  *Final verification before going live*
  
- [ ] Merge to `nextjs-pagebuilder-core` (auto-deploys to production)  
  *Ships the feature to users via Vercel*
  
- [ ] Verify production deployment  
  *Confirms features work in production*
  
- [ ] Monitor Sentry for new errors (first 30 min)  
  *Catches any immediate issues*
  
- [ ] Update STATUS-LOG.md with completion  
  *Records successful deployment*

#### If issues arise:
- [ ] Revert deployment if critical  
  *Restores service quickly*
  
- [ ] Or hotfix using Fast Track Mode  
  *Fixes issues without full process*
  
- [ ] Document lessons learned  
  *Prevents similar issues in future*

---

## 🏃 Fast Track Mode (Bug Fixes)

*For bugs and small improvements that need quick turnaround.*

### 1. Quick Check
- [ ] Reproduce the issue  
  *Confirms the bug exists and understand its impact*
  
- [ ] Check recent changes that might have caused it  
  *Identifies the root cause quickly*
  
- [ ] Verify environment is clean (`npm run lint`, `tsc --noEmit`)  
  *Ensures you're not adding to existing problems*

### 2. Fix & Test
- [ ] Create bugfix branch  
  *Isolates the fix from other work*
  
- [ ] Fix the issue with minimal changes  
  *Reduces risk of introducing new bugs*
  
- [ ] Add test to prevent regression  
  *Ensures this bug doesn't come back*
  
- [ ] Test the specific fix manually  
  *Verifies the fix works as expected*
  
- [ ] Run related test suites  
  *Confirms you didn't break anything else*

### 3. Deploy
- [ ] Create focused PR to `nextjs-pagebuilder-core` branch  
  *Target our deployment branch, not master/main*
  
- [ ] Deploy after basic verification  
  *Gets fix to users quickly*
  
- [ ] Monitor for any new related errors  
  *Ensures fix didn't cause new issues*
  
- [ ] Update STATUS-LOG.md  
  *Maintains record of fixes*

---

## 🚨 Emergency Mode

*For production-breaking issues requiring immediate action.*

### 1. Immediate Action
- [ ] Assess impact and severity  
  *Determines how urgent the response needs to be*
  
- [ ] Notify team if needed  
  *Ensures everyone aware of the situation*
  
- [ ] Revert recent deployment if it's the cause  
  *Restores service immediately*
  
- [ ] Or create emergency hotfix branch  
  *Allows targeted fix without full process*

### 2. Fix
- [ ] Make minimal change to resolve issue  
  *Reduces risk during crisis*
  
- [ ] Test the specific fix in preview  
  *Verifies fix works without extensive testing*
  
- [ ] Get quick approval if possible  
  *Maintains some oversight even in emergency*

### 3. Deploy & Follow-up
- [ ] Deploy immediately  
  *Restores service for users*
  
- [ ] Verify issue is resolved in production  
  *Confirms the fix worked*
  
- [ ] Monitor closely for side effects  
  *Catches any new issues from rushed fix*
  
- [ ] Create proper fix later using Full Mode  
  *Ensures long-term solution is solid*
  
- [ ] Post-mortem in STATUS-LOG.md  
  *Learns from the incident to prevent recurrence*
  
- [ ] Update any alerts or monitoring  
  *Catches similar issues faster next time*

---

## Key Principles

1. **No temporary solutions** - Everything must be production-ready  
   *Prevents accumulating technical debt that blocks future work*

2. **Test what matters** - Critical paths over coverage percentage  
   *Focuses effort on preventing real user issues*

3. **User collaboration** - Test together before deployment  
   *Ensures features meet actual needs*

4. **Documentation as you go** - Not as an afterthought  
   *Maintains accurate records without relying on memory*

5. **Learn and adapt** - Update this process based on what works  
   *Continuously improves development efficiency*

---

## Quick Reference Commands

```bash
# Pre-flight checks
cd nextjs-app
npm install
npx tsc --noEmit
npm run lint

# Development
npm run dev
npm run build

# Testing
npm run test          # Vitest unit tests
npm run test:e2e      # Playwright E2E tests
npm run test:coverage # Coverage report

# Code quality
npm run lint
npm run lint:fix
npm run prettier:check
npm run prettier:write

# Database
npx supabase migration new [description]
npx supabase db push --password 'aTR9dv8Q7J2emyMD'
```

---

Remember: Taking shortcuts now means spending days fixing errors later. This process exists because we already learned this lesson the hard way with 452 TypeScript errors and multiple deployment failures.