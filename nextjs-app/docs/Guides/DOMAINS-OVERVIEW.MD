# Domain Management System Overview

## Architecture Overview

Our domain system is built on a multi-tenant architecture where a single Next.js application serves thousands of customer websites through custom domains. This is the same pattern used by platforms like Webflow, Shopify, and Squarespace.

## Domain Types

### 1. Preview Domains (Automatic)
Every project automatically gets a preview domain:
- **Format**: `{project-slug}.sites.wondrousdigital.com`
- **Example**: `veterinary-clinic.sites.wondrousdigital.com`
- **Purpose**: Allows customers to view and share their site before connecting a custom domain
- **SSL**: Automatic via wildcard certificate

### 2. Custom Domains (Customer-Provided)
Customers can connect their own domains:
- **Format**: Any domain they own (e.g., `mybusiness.com`)
- **Limit**: One primary domain per project
- **SSL**: Automatic via Vercel/Let's Encrypt

## White-Label Implementation

We use a fully white-labeled approach where customers never see our infrastructure providers:

```
Customer Domain → sites.wondrousdigital.com → Vercel Infrastructure
    (mybusiness.com)     (our CNAME)            (hidden from customer)
```

### Customer Instructions
Customers will see:
```
Point your domain to: sites.wondrousdigital.com
```

No mention of Vercel or other vendors.

## Technical Implementation

### 1. Domain Resolution Flow
```
Incoming Request
    ↓
Middleware checks hostname
    ↓
Is it *.sites.wondrousdigital.com? → Extract project slug → Route to project
    ↓
Is it a custom domain? → Look up in project_domains table → Route to project
    ↓
Not found → 404 error
```

### 2. Database Structure
```sql
project_domains
- id (UUID)
- project_id (FK to projects)
- domain (unique)
- verified (boolean)
- verified_at (timestamp)
- ssl_status (pending/active/error)
- created_at
- updated_at
```

### 3. Vercel Integration
We use Vercel's API to:
- Add domains programmatically
- Check verification status
- Monitor SSL provisioning
- Remove domains when deleted

## Domain Management Flow

### Adding a Domain
1. Customer enters domain in project settings
2. We validate format and check availability
3. Add to our database (unverified)
4. Add to Vercel via API
5. Show DNS instructions
6. Poll for verification

### Verification Process
1. Customer updates their DNS
2. Vercel detects the CNAME pointing to us
3. We poll Vercel API for status
4. Update database when verified
5. SSL automatically provisions

### Domain States
- **Pending**: DNS not configured yet
- **Verifying**: DNS detected, verification in progress
- **Active**: Verified and SSL active
- **Error**: Configuration problem

## DNS Configuration

### For Subdomains (e.g., www.example.com)
```
Type: CNAME
Name: www (or subdomain)
Value: sites.wondrousdigital.com
```

### For Root Domains (e.g., example.com)
Most DNS providers now support CNAME flattening for root domains. If not:
```
Type: A
Name: @ (or blank)
Value: [Vercel IP addresses]
```

### WWW Handling
We automatically handle both:
- `example.com`
- `www.example.com`

One redirects to the other based on customer preference.

## Security Considerations

### Domain Ownership Verification
- Only verified account owners can add domains
- Domains must be verified through DNS
- One domain can only belong to one project

### SSL/TLS
- All domains get free SSL via Let's Encrypt
- Automatic renewal
- Force HTTPS redirect

### Isolation
- Middleware ensures domains only route to their assigned project
- No cross-project data leakage
- Custom domains are unique across the platform

## Error Handling

### Common Issues
1. **DNS not propagated**: Show waiting message
2. **Domain already in use**: Clear error message
3. **Invalid domain format**: Validation before submission
4. **SSL provisioning failed**: Retry mechanism

### Customer Support
Provide clear troubleshooting:
- DNS checker tool link
- Common DNS provider guides
- Support contact for complex issues

## Implementation Status

### Currently Implemented
- ✅ Basic domain management UI
- ✅ Domain storage in database
- ✅ Middleware routing for domains
- ✅ sites.wondrousdigital.com configured

### To Be Implemented
- [ ] Vercel API integration
- [ ] Preview subdomain system
- [ ] Real verification checking
- [ ] SSL status monitoring
- [ ] DNS instruction improvements
- [ ] Domain validation

## Future Enhancements

### Phase 1 (MVP)
- One custom domain per project
- Basic DNS instructions
- Manual support for issues

### Phase 2 (Post-Launch)
- Multiple domains/redirects
- DNS validation tool
- Automated troubleshooting
- Domain transfer support

### Phase 3 (Scale)
- Bulk domain management
- API for domain automation
- Advanced redirect rules
- Geographic routing