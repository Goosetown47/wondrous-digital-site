# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - 2025-01-28
- **User Invitation System** - Complete team management functionality
  - Database: Created `account_invitations` table with proper RLS policies
  - API: Full CRUD endpoints for invitation management
  - UI: Team management interface at `/account/users`
  - Features:
    - Invite users by email with role selection
    - 7-day invitation expiry
    - Resend and cancel invitation actions
    - Email duplicate checking
    - Token-based invitation acceptance
    - Proper multi-tenant isolation
  - Files created:
    - `/src/lib/services/invitations.ts` - Service layer
    - `/src/hooks/useInvitations.ts` - React Query hooks
    - `/src/app/(app)/account/users/page.tsx` - Team management UI
    - `/src/app/api/invitations/*` - API routes
    - Migration: `20250804_000000_add_account_invitations.sql`
    - Migration: `20250821_000000_add_account_users_view.sql`
  - Note: Email notifications not yet implemented (requires email service)

### Added - 2025-01-26
- **Platform Admin System** - Comprehensive admin management
  - Redesigned role system with platform account architecture
  - Service role pattern for admin operations (bypasses RLS)
  - Admin promotion/demotion with safety checks
  - Fixed "projects not showing for admins" issue
  - Staff account assignments table for future use

### Added - 2025-01-25
- **Project Management Tools** - Manual project provisioning system
  - Complete CRUD operations for projects
  - Project templates and cloning
  - Archive/restore functionality
  - Domain management per project
  - Theme assignment

- **Page Management System** - Multi-page website support
  - Pages stored in database with sections
  - Page switcher in builder
  - SEO metadata support
  - Save status indicators
  - Automatic homepage creation

- **Enhanced UI Components**
  - Redesigned project settings as full-width page
  - Card-based page management interface
  - Collapsible builder sidebar
  - Unified canvas navbar

### Added - 2025-01-24
- **Account Management Tools** - Multi-tenant account system
  - Account CRUD operations
  - User-account relationships with roles
  - Permission-based access control
  - Audit logging
  - Bulk operations support

### Added - Earlier in January 2025
- **Phase 1 Foundation Components**
  - Core component system from shadcn/ui
  - Lab environment for template creation
  - Library system for template management
  - Theme engine with CSS variables
  - Builder integration with library
  - Authentication with Supabase Auth

## [0.1.0] - 2025-01-01 (Initial Release)

### Added
- Next.js 15 migration from React/Vite
- Multi-tenant architecture with domain-based routing
- Basic page builder with drag-and-drop
- Supabase integration
- Vercel deployment configuration
- Project and domain management