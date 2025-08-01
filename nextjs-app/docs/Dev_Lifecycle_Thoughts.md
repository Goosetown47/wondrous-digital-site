# Development Lifecycle

We are modifying our development process. Moving forward we will be completing “packets” of features from start to production deployment before moving on to new features. We will be thorough in our process moving forward. I know this will take more time to do, but as we complete our application and get ready for launch, we need to be more rigorous. 

## Development

### **1/ Setup & Planning**

1. **Re-read your HOW TO USE development tools document**
    - Ensure you’re up to speed with how you can use Typescript, ESLint, Vitest, Playwright, and Sentry properly to ensure you can utilize the toolsets.
2. **Initial Setup Checklist**
    - [ ]  Branch protection rules enabled on main
    - [ ]  TypeScript strict mode enabled
    - [ ]  ESLint configured with Next.js rules
    - [ ]  Vitest configured for unit tests
    - [ ]  Playwright configured for E2E tests
    - [ ]  Sentry integrated for error tracking
    - [ ]  GitHub Actions workflows configured
    - [ ]  Vercel connected to GitHub repo

1. **Take input from user and identify possible things to work on**
    - Identify our features/progress in /docs/MASTER-TASK-LIST.MD
    - Have a discussion with user
    - Define user stories and acceptance criteria
    - If features aren’t written out in MASTER-TASK-LIST, write them out based on confirmed direction with user.
    - Create GitHub issues for each feature

1. **Release Update Documentation**
    1. Identify which version this is and set up a “Release Overview” document add to /docs/version_logs folder.
        1. You can identify which version we are on via our version history log on MASTER-TASK-LIST.md file.
        2. This will have a list of features added, bugs fixed, etc. 
        3. It should be in a “customer facing” format that non technical people can read and understand. It will be public facing information. 
        4. It should NOT contain any critical or sensitive information. Just new features and bug fixes.

### **2/ Create User Stories**

- After we have written our feature tasks in MASTER-TASK-LIST.MD, create user stories we can manually test that cover basic AND edge case functions for that feature in our MASTER-TEST-LIST.MD document.
    - Format: “As a platform admin, I can…” / “As a user, I can…”
    - These should be manually testable by the user in the application or by looking in our platform software like Supabase to confirm.
    - These will be conducted after we build and do internal testing.
- Confirm with user that the stories are accurate and correct before proceeding.

### **3/ Update your knowledge & application awareness**

- Do a scan to make sure your understanding of the application as it exists now is up to date.
- Remind yourself of our goals by reading our PRD: `/wondrous-digital-site/nextjs-app/docs/PRD Design & Build System.md`

### **4/ Build the features in Dev**

We will only do work in a way that is production ready. No hacks. No shortcuts. No temporary solutions to “check the task off”.

**For each feature:**

1. **Remember our principles and apply them during dev process**
    1. KISS, DRY, SOLID
2. **GitHub Setup**
    - Create feature branch for the feature packet
    - Link to GitHub issues in commits
3. **Write failing tests first (TDD approach)**
    - Vitest unit test for business logic
    - Playwright test for user flow
4. **Implement feature**
    - Follow TypeScript best practices
    - Regular type checking during development
5. **Immediate validation:**
    - npm run type-check && npm run lint
6. **We will build features in the packet one by one and complete the MANUAL TESTS for each feature before moving on.**
    - Work with the user to complete each manual test, and have the user check them off in the MASTER TEST LIST document before moving on, once satisfied.

### **5/ Testing & Quality Assurance**

These should be tests you can run on your own and ensure that they pass without much help from the user. You should verify with the user along the way what you’re doing is correct. Also use each checkpoint to update the user with what you’ve found.

1. **Static Analysis**
    - [ ]  TypeScript: npm run build (zero errors)
    - [ ]  ESLint: npm run lint (zero warnings)
    - [ ]  No any types without justification
2. **Unit Testing (Vitest)**
    - [ ]  All functions have tests
    - [ ]  80%+ code coverage
    - [ ]  Edge cases covered
3. **E2E Testing (Playwright)**
    - [ ]  Happy path user flows
    - [ ]  Error scenarios
    - [ ]  Mobile responsiveness
    - [ ]  Cross-browser compatibility
4. **Performance Testing**
    - [ ]  Lighthouse scores (via Playwright)
    - [ ]  Bundle size analysis
    - [ ]  Load time < 3 seconds
5. **Security Audit**
    - [ ]  No exposed API keys
    - [ ]  Input validation on all forms
    - [ ]  OWASP top 10 checklist
6. **Create Pull Request**
    - [ ]  PR template filled out
    - [ ]  Linked to GitHub issues

### **6/ Pre-deployment**

Let’s get ready to deploy our work to our application.

**PR Review Process**

**Merge Strategy**

Update the “Release Overview” document for this version with what’s been released. 

### **7/ Deployment**

Deploy the changes to the application

1. **Automatic Production Deployment**
    - Vercel auto-deploys from main branch
    - Monitor deployment status

1. **Post-Deployment**
    - [ ]  Verify production deployment
    - [ ]  Check Sentry for new errors
    - [ ]  Monitor Vercel Analytics
    - [ ]  Close GitHub issue