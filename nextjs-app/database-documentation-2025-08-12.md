# Production Database Documentation

Generated: 8/11/2025, 9:15:05 PM

Database URL: https://bpdhbxvsguklkbusqtke.supabase.co

## Table Row Counts

| Table Name | Row Count | Has User Data | Notes |
|------------|-----------|---------------|-------|
| accounts | 6 | ⚠️ Yes | Has data |
| account_users | 7 | ⚠️ Yes | Has data |
| account_permissions | null | No | Empty |
| projects | 12 | ⚠️ Yes | Has data |
| pages | 22 | ⚠️ Yes | Has data |
| domains | null | No | Empty |
| domain_verifications | null | No | Empty |
| library_items | 3 | No | Has data |
| library_versions | 1 | No | Has data |
| lab_drafts | 4 | No | Has data |
| user_profiles | 7 | ⚠️ Yes | Has data |
| audit_logs | 462 | ⚠️ Yes | Has data |
| types | 4 | No | Has data |
| email_templates | null | No | Empty |
| email_logs | null | No | Empty |
| project_templates | null | No | Empty |
| project_deployments | null | No | Empty |
| api_keys | null | No | Empty |
| billing_plans | null | No | Empty |
| subscriptions | null | No | Empty |
| usage_metrics | null | No | Empty |
| support_tickets | null | No | Empty |
| notifications | null | No | Empty |
| scheduled_tasks | null | No | Empty |
| feature_flags | null | No | Empty |
| webhook_endpoints | null | No | Empty |
| webhook_logs | null | No | Empty |

## Summary

- **Total tables checked:** 27
- **Tables with data:** 10
- **Empty tables:** 17
- **Missing tables:** 0
- **Total rows across all tables:** 528

## Tables with User Data

These tables contain production user data and need special handling:

- **audit_logs**: 462 rows
- **pages**: 22 rows
- **projects**: 12 rows
- **account_users**: 7 rows
- **user_profiles**: 7 rows
- **accounts**: 6 rows

## Platform Configuration Tables

These tables contain platform configuration (safe to copy structure):

- **library_items**: 3 rows
- **library_versions**: 1 rows
- **lab_drafts**: 4 rows
- **types**: 4 rows

## Test Account Analysis

Found 4 potential test accounts:

- Test Company 12 (created: 7/28/2025)
- Test 2 (created: 7/28/2025)
- Test Account 3 (created: 7/30/2025)
- Test Account (created: 8/10/2025)

## Storage Estimate

Based on row counts (rough estimate):
- Small tables (<100 rows): 9
- Medium tables (100-1000 rows): 1
- Large tables (1000+ rows): 0

## Recommendations for Development Database

### 1. Schema Migration
- Export schema using: `supabase db dump --schema-only`
- This will copy all table structures, indexes, and functions

### 2. Data Handling
**DO NOT COPY** these tables with user data:
- audit_logs (462 rows)
- pages (22 rows)
- projects (12 rows)
- account_users (7 rows)
- user_profiles (7 rows)
- accounts (6 rows)

**SAFE TO COPY** structure only:
- All table schemas
- All functions and triggers
- All RLS policies

### 3. Test Data Requirements
Create seed data for:
- Test accounts (3-5)
- Sample projects (2-3 per account)
- Demo pages and content
- Test users with different roles

### 4. Critical Configurations
- Ensure auth settings match production
- Set up same RLS policies
- Configure email templates (if used)
