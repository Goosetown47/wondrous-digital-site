# PROJECT GUIDELINES

This document outlines the core principles and standards for developing the Wondrous Digital website builder platform. All code contributions must adhere to these guidelines to ensure system reliability, security, and scalability.

## 🎯 Mission Critical Principles

**CUSTOMER RETENTION IS PARAMOUNT**: Every line of code must contribute to a reliable, secure platform. Technical failures result in customer loss, which is unacceptable.

- Do not present solutions that break existing functionality, unless creating a new system that improves and preserves functionality in a better way
- Do not over-engineer or add features not requested without asking first
- Stick to the specific requirements and avoid scope creep

---

## 📋 Core Programming Principles

### KISS (Keep It Simple, Stupid)

- Choose the simplest solution that meets requirements
- Avoid over-engineering and premature optimization
- Prefer explicit code over clever abstractions
- Write code that can be easily understood by other developers

### DRY (Don't Repeat Yourself)

- Extract reusable components and utilities
- Use constants for repeated values
- Create shared types and interfaces
- Centralize business logic in dedicated modules

### SOLID Principles

- **Single Responsibility**: Each component/function has one clear purpose
- **Open/Closed**: Extend functionality without modifying existing code
- **Liskov Substitution**: Derived classes must be substitutable for base classes
- **Interface Segregation**: Create focused, specific interfaces
- **Dependency Inversion**: Depend on abstractions, not concretions

---

## 🏗️ Architecture Rules

### Separation of Concerns

- Keep platform code and customer project code separate where possible
- Maintain clear boundaries between admin and customer systems
- Keep shared utilities truly shared and independent
- Separate data access, business logic, and presentation layers

### Multi-Tenant Data Isolation

- **ALWAYS** filter by tenant/project context in database queries
- **NEVER** expose data across tenant boundaries
- Implement proper access control on ALL data operations
- Test data isolation with multiple test accounts
- Use project_id as a mandatory filter in all customer data queries

### Mobile-First Design - REQUIRED

- **ALL** interfaces must be mobile-optimized by design
- Design mobile experience FIRST, then scale up to desktop
- Touch-friendly interface elements (minimum 44px touch targets)
- Responsive breakpoints implemented consistently across all components

---

## 🔒 Security Standards

### Data Protection

- **NEVER** log sensitive customer data (passwords, API keys, personal information)
- Sanitize ALL user inputs before processing
- Use parameterized queries to prevent SQL injection
- Implement proper authentication on ALL protected routes
- Store sensitive data encrypted at rest

### Access Control

- Verify user permissions before ANY data operation
- Implement role-based access control (RBAC)
- Use database-level security as primary protection layer
- Secure session management with proper expiration
- Validate user ownership of resources before allowing access

---

## 📈 Scalability Rules

### Performance Standards

- Page load times < 2 seconds on desktop
- API responses < 500ms for most operations
- Implement pagination for ALL list views (default: 20 items per page)
- Use proper database indexing on frequently queried columns
- Optimize images and assets for web delivery

### Resource Management

- Optimize component rendering with React.memo where appropriate
- Implement proper error boundaries to prevent cascade failures
- Clean up subscriptions and event listeners on component unmount
- Use code splitting for large applications and lazy loading for routes
- Monitor memory usage and prevent memory leaks

---

## 🧪 Quality Assurance Rules

### Code Quality

- Use TypeScript strictly - no `any` types allowed without explicit justification
- Implement proper error handling with try/catch blocks
- Use meaningful variable and function names that describe intent
- Write unit tests for ALL business logic and critical user flows
- Follow consistent code formatting and linting rules

### Testing Standards

- Test critical user flows (registration, project creation, page building)
- Test data isolation between different tenant projects
- Perform security testing on authentication and authorization
- Test mobile responsiveness on real devices, not just browser dev tools
- Validate form inputs and error handling scenarios

---

## 🚀 Deployment Rules

### Independence

- Generated customer websites must be completely independent of platform
- No runtime dependencies on platform servers for customer sites
- Optimize for static hosting (Netlify, Vercel, etc.)
- Implement proper SEO structure for customer websites
- Ensure customer sites work offline where possible

### Environment Management

- Use environment variables for ALL configuration values
- Never hardcode sensitive values (API keys, database URLs, etc.)
- Test deployments in staging environment before production
- Maintain separate configurations for development, staging, and production
- Use CI/CD pipelines for automated testing and deployment

---

## ⚠️ Critical DON'Ts

### NEVER:

- Deploy customer websites with dependencies on platform systems
- Mix customer data across different projects or tenants
- Expose admin functionality to regular customers
- Skip testing data isolation between projects
- Deploy without proper error handling and logging
- Ignore mobile user experience in favor of desktop
- Use `any` types in TypeScript without documentation
- Hardcode configuration values in source code
- Commit sensitive information to version control
- Break existing functionality without migration strategy

---

## ✅ Critical DOs

### ALWAYS:

- Filter database queries by proper project/tenant context
- Validate user permissions before performing operations
- Test with multiple customer accounts to verify isolation
- Implement proper error boundaries and fallback UI
- Design with mobile-first responsive approach
- Use TypeScript for comprehensive type safety
- Monitor performance metrics and application health
- Document complex business logic and architectural decisions
- Use proper semantic HTML for accessibility
- Implement loading states for async operations

---

## 📱 Mobile Optimization Requirements

### Design Standards

- Mobile-first responsive design approach using Tailwind CSS
- Touch targets minimum 44px × 44px for optimal usability
- Readable text sizes (minimum 16px base font size)
- Adequate contrast ratios (4.5:1 minimum for normal text)
- Consistent spacing and layout across different screen sizes

### Performance Standards

- Mobile page load < 3 seconds on 3G networks
- Optimize images for mobile bandwidth (WebP format preferred)
- Minimize JavaScript bundle sizes using code splitting
- Implement progressive loading and skeleton screens
- Use efficient CSS and avoid layout thrashing

### User Experience

- Intuitive mobile navigation patterns (hamburger menus, bottom navigation)
- Thumb-friendly interface layouts optimized for one-handed use
- Avoid hover-dependent interactions (use touch-friendly alternatives)
- Test on various screen sizes and physical devices
- Ensure forms are optimized for mobile keyboards

---

## 🎯 Success Metrics

- Zero data leakage incidents between customer projects
- 99.9% platform uptime and availability
- < 2 second desktop page load times
- < 3 second mobile page load times on 3G
- Zero TypeScript compilation errors in production builds
- < 1 second API response times for most operations
- 100% mobile accessibility compliance

---

## 🔄 Development Workflow

### Code Review Standards

- All code must be reviewed before merging to main branch
- Security-sensitive changes require additional security review
- Performance impacts must be measured and documented
- Mobile responsiveness must be verified on actual devices

### Documentation Requirements

- Update CLAUDE.md when adding new development commands
- Document API changes in appropriate locations
- Keep architecture documentation current with code changes
- Document breaking changes and migration steps

---

**Remember: Every decision must consider scale, security, and mobile users from day one. Customer trust and platform reliability are our highest priorities.**