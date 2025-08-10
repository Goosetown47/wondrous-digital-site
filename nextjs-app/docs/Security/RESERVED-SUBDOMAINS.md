# Reserved Subdomains and Domain Protection

## Overview

This document outlines all reserved subdomains and domain patterns that require protection within the Wondrous Digital platform. These restrictions are essential for maintaining platform security, preventing phishing attacks, avoiding user confusion, and protecting critical infrastructure endpoints.

**Key Principle**: All reserved subdomains are blocked for regular users but can be used by platform administrators when necessary.

## Why This Matters

1. **Security**: Prevents malicious actors from creating official-looking phishing sites
2. **User Trust**: Ensures users can trust official wondrousdigital.com subdomains
3. **Infrastructure Protection**: Keeps critical service endpoints secure
4. **Brand Integrity**: Maintains control over the wondrousdigital.com namespace
5. **Future Flexibility**: Reserves subdomains we may need for future services

## Access Control

- **Regular Users**: Cannot create projects with slugs that match reserved patterns
- **Platform Admins**: Can override restrictions when needed for legitimate purposes
- **Validation Points**: Project creation, project slug updates, and custom domain additions

## Reserved Subdomain Categories

### 1. Core Infrastructure & Application

These subdomains are critical for platform operation and must remain under platform control.

- `app` - Main application entry point
- `www` - Marketing website (currently protected)
- `api` - API endpoints
- `admin` - Administrative interface
- `dashboard` - User dashboards
- `console` - Developer console
- `portal` - Customer portal
- `platform` - Platform services
- `core` - Core services
- `hub` - Central hub services

**Rationale**: These represent primary entry points and core functionality that users expect to be official.

### 2. Authentication & Security

Critical for maintaining secure authentication flows and preventing credential theft.

- `auth` - Authentication services
- `login`, `signin`, `signup`, `logout` - Auth flows
- `oauth`, `oauth2` - OAuth endpoints
- `sso`, `saml`, `ldap` - Single sign-on protocols
- `secure`, `ssl`, `tls` - Security indicators
- `verify`, `confirm`, `validate` - Verification endpoints
- `reset`, `forgot`, `recover` - Password recovery
- `2fa`, `mfa`, `totp` - Multi-factor authentication
- `identity`, `id` - Identity services
- `session`, `sessions` - Session management

**Rationale**: Protecting these prevents phishing attacks where users might enter credentials on fake login pages.

### 3. Development & Operations

Reserved for platform development, testing, and deployment infrastructure.

- `dev`, `develop`, `development` - Development environment
- `staging`, `stage` - Staging environment
- `test`, `testing`, `qa` - Testing environments
- `preview`, `beta`, `alpha`, `canary`, `edge` - Release channels
- `ci`, `cd`, `deploy`, `deployment`, `build` - CI/CD pipeline
- `git`, `github`, `gitlab`, `bitbucket`, `vcs` - Version control
- `jenkins`, `travis`, `circleci`, `actions` - Build systems
- `docker`, `k8s`, `kubernetes` - Container services
- `localhost`, `local` - Local development

**Rationale**: Prevents confusion about which environments are official and protects development infrastructure.

### 4. Infrastructure Services

Technical services that power the platform.

- `cdn`, `static`, `assets`, `media`, `images`, `files`, `uploads` - Content delivery
- `cache`, `redis`, `memcached`, `varnish` - Caching layers
- `db`, `database`, `mysql`, `postgres`, `postgresql`, `mongodb`, `sql` - Databases
- `backup`, `backups`, `restore`, `recovery` - Data management
- `storage`, `s3`, `blob`, `bucket` - Storage services
- `queue`, `mq`, `rabbitmq`, `kafka` - Message queues
- `search`, `elastic`, `elasticsearch`, `solr` - Search services
- `proxy`, `gateway`, `lb`, `loadbalancer` - Network services

**Rationale**: These could be confused with actual infrastructure endpoints or expose technical architecture.

### 5. Communication & Support

Customer communication channels that need to maintain trust.

- `mail`, `email`, `smtp`, `imap`, `pop`, `pop3`, `mx` - Email services
- `support`, `help`, `helpdesk`, `ticket`, `tickets` - Support systems
- `chat`, `messages`, `messaging`, `im` - Real-time communication
- `webhook`, `webhooks`, `callback`, `callbacks` - Integration endpoints
- `notify`, `notification`, `notifications`, `alerts` - Notification services
- `contact`, `contacts` - Contact management
- `forum`, `forums`, `community` - Community platforms

**Rationale**: Users expect official support and communication to come from platform-controlled domains.

### 6. Monitoring & Analytics

Operational visibility and monitoring services.

- `status`, `health`, `ping`, `uptime`, `heartbeat` - Status monitoring
- `monitor`, `monitoring`, `metrics`, `telemetry` - System monitoring
- `analytics`, `stats`, `statistics`, `tracking` - Analytics services
- `logs`, `logging`, `log` - Logging infrastructure
- `sentry`, `bugsnag`, `rollbar`, `airbrake` - Error tracking
- `grafana`, `kibana`, `datadog`, `newrelic` - Monitoring tools
- `trace`, `tracing`, `apm` - Application performance monitoring
- `debug`, `debugger` - Debugging tools

**Rationale**: Could expose sensitive operational data or be confused with actual monitoring endpoints.

### 7. Business & Legal

Business-critical and legally sensitive endpoints.

- `billing`, `payment`, `payments`, `pay`, `invoice`, `invoices` - Payment processing
- `subscription`, `subscriptions`, `subscribe` - Subscription management
- `pricing`, `plans`, `plan`, `upgrade`, `downgrade` - Pricing tiers
- `checkout`, `cart`, `shop`, `store` - E-commerce
- `legal`, `terms`, `tos`, `privacy`, `policy` - Legal documents
- `gdpr`, `ccpa`, `compliance`, `regulatory` - Compliance
- `contract`, `contracts`, `agreement` - Legal agreements
- `refund`, `refunds`, `dispute` - Financial disputes

**Rationale**: Financial and legal endpoints must be trusted and could be targets for fraud.

### 8. User Management

Account and organization management services.

- `account`, `accounts`, `user`, `users`, `member`, `members` - User accounts
- `profile`, `profiles`, `me`, `my` - User profiles
- `settings`, `preferences`, `config`, `configuration` - User settings
- `team`, `teams`, `org`, `organization`, `organizations`, `company` - Organizations
- `invite`, `invites`, `invitation`, `referral`, `refer` - User invitations
- `role`, `roles`, `permission`, `permissions` - Access control
- `group`, `groups` - User grouping
- `tenant`, `tenants` - Multi-tenancy

**Rationale**: Protects user account integrity and prevents unauthorized access attempts.

### 9. Marketing & Sales

Business development and marketing channels.

- `marketing`, `campaign`, `campaigns`, `promo` - Marketing campaigns
- `sales`, `crm`, `leads`, `lead` - Sales operations
- `demo`, `demos`, `trial`, `try`, `sandbox` - Product trials
- `onboarding`, `welcome`, `getting-started`, `start` - User onboarding
- `partners`, `partner`, `affiliates`, `affiliate`, `resellers` - Partnerships
- `blog`, `news`, `updates`, `changelog` - Content publishing
- `docs`, `documentation`, `guide`, `guides`, `wiki` - Documentation
- `academy`, `learn`, `training`, `tutorial` - Educational content

**Rationale**: Maintains control over official marketing messages and partnership programs.

### 10. Internal & System

Internal tools and system-level access.

- `internal`, `private`, `restricted`, `confidential` - Access levels
- `system`, `sys`, `root`, `superuser`, `sudo`, `su` - System access
- `cron`, `jobs`, `job`, `worker`, `workers`, `task` - Background processing
- `temp`, `tmp`, `test`, `testing` - Temporary resources
- `dev-tools`, `devtools`, `tools` - Development tools
- `diagnostics`, `diag` - System diagnostics
- `maintenance`, `maint` - Maintenance mode

**Rationale**: Could provide unauthorized system access or be confused with internal tools.

### 11. Special Patterns

Patterns that need special handling.

#### Single Letters
- All single letters: `a`, `b`, `c`, ... `z`
- **Rationale**: Often used for internal shortcuts or could be typos

#### Numeric Patterns
- Pure numbers: `123`, `911`, `404`, `500`, etc.
- Emergency numbers: `911`, `999`, `112`
- HTTP status codes: `200`, `301`, `404`, `500`, etc.
- **Rationale**: Could be confusing or used for system responses

#### Common Misspellings & Variations
- `wondrous`, `wonderous`, `wondrousdigital`
- `wd`, `wdigital`, `w-digital`
- Common typos of "wondrous"
- **Rationale**: Prevents typosquatting and brand confusion

#### Protocol & Service Indicators
- `ftp`, `sftp`, `ssh`, `telnet`, `vnc`, `rdp` - Remote access
- `http`, `https`, `ws`, `wss` - Web protocols
- `tcp`, `udp`, `ip` - Network protocols
- **Rationale**: Could be confused with actual service endpoints

### 12. Phishing & Abuse Prevention

Patterns commonly used in phishing attacks.

- `security`, `security-alert`, `secure-update`, `urgent-security`
- `verify-account`, `account-verify`, `confirm-account`
- `suspended`, `locked`, `blocked`, `banned`
- `update-required`, `action-required`, `immediate-action`
- `official`, `verified`, `trusted`, `authentic`
- `no-reply`, `noreply`, `do-not-reply`
- `winner`, `prize`, `lottery`, `free`

**Rationale**: These are commonly used in phishing attacks to create urgency or false legitimacy.

## Implementation Guidelines

### Where to Implement Checks

1. **Project Creation** (`/lib/services/projects.ts`)
   - Validate slug before creating project
   - Return clear error message if reserved

2. **Project Updates** (`/lib/services/projects.ts`)
   - Check new slug against reserved list
   - Prevent updates to reserved slugs

3. **API Routes** (`/app/api/projects/`)
   - Server-side validation for all slug operations
   - Cannot rely on client-side validation alone

4. **Custom Domains** (`/app/api/projects/[id]/domains/route.ts`)
   - Check if custom domain is reserved subdomain
   - Apply same restrictions

### Validation Function Structure

```typescript
interface SlugValidationResult {
  isValid: boolean;
  isReserved: boolean;
  requiresAdmin: boolean;
  category?: string;
  message?: string;
}

function validateSlug(slug: string, isAdmin: boolean): SlugValidationResult
```

### Error Messages

- **User-Friendly**: "This name is reserved for platform use. Please choose a different name."
- **With Category**: "This name is reserved for [category] services. Please choose a different name."
- **Admin Notice**: "This is a reserved name. Admin privileges are being used to override."

### Admin Override Mechanism

1. Check if user has admin role in platform account
2. Log when admin overrides are used
3. Add warning in UI when admin uses reserved name
4. Include in audit trail

## Maintenance Procedures

### Adding New Reserved Subdomains

1. **Identify Need**: Document why the subdomain needs to be reserved
2. **Categorize**: Place in appropriate category in this document
3. **Update Code**: Add to validation logic
4. **Test**: Ensure validation works correctly
5. **Communicate**: Notify team of new reservation

### Review Schedule

- **Quarterly**: Review for new services that need reservation
- **Before Major Features**: Check if new features need subdomain reservations
- **Security Incidents**: Add patterns used in any attacks

### Approval Process

1. Engineering team proposes new reserved subdomain
2. Security team reviews for implications
3. Product team confirms no customer impact
4. Document update with rationale
5. Implementation in validation logic

## Testing Requirements

1. **Unit Tests**: Each reserved pattern should have a test
2. **Admin Override**: Test that admins can use reserved names
3. **Error Messages**: Verify appropriate messages shown
4. **Case Sensitivity**: Ensure case-insensitive matching
5. **Pattern Matching**: Test partial matches don't over-block

## Future Considerations

1. **Internationalization**: May need to reserve non-ASCII variants
2. **New TLDs**: Consider if we expand beyond .com
3. **Granular Permissions**: Some reserved names might be okay for certain account tiers
4. **Sunset Process**: How to un-reserve names no longer needed

---

**Last Updated**: 2025-01-31
**Version**: 1.0
**Owner**: Platform Security Team