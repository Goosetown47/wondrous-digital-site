# Environment Setup Guide

## Overview

As of August 2025, we've separated our development and production databases to ensure safety and proper testing environments.

## Database Configuration

### Production Database
- **Supabase Project ID**: `bpdhbxvsguklkbusqtke`
- **Purpose**: Live production data
- **Used by**: Vercel deployment, production testing

### Development Database  
- **Supabase Project ID**: `hlpvvwlxjzexpgitsjlw`
- **Purpose**: Development and testing
- **Used by**: Local development (`npm run dev`)

## Environment Files

### `.env.local` (Development - Default)
- Used automatically by Next.js in development
- Points to development database
- **YOU NEED TO ADD YOUR DEV SUPABASE KEYS**

### `.env.production.local` (Production - Manual)
- Contains production database credentials
- Use this for emergency production debugging
- **NEVER commit this file**

## How to Get Your Dev Database Keys

1. Go to your Dev Supabase project: https://app.supabase.com/project/hlpvvwlxjzexpgitsjlw
2. Navigate to Settings → API
3. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`
4. Update `.env.local` with these values

## Switching Between Environments

### Use Development (Default)
```bash
npm run dev  # Uses .env.local automatically
```

### Use Production (Emergency Only)
```bash
# Temporarily rename files
mv .env.local .env.local.dev
mv .env.production.local .env.local

# Run with production data
npm run dev

# Don't forget to switch back!
mv .env.local .env.production.local  
mv .env.local.dev .env.local
```

## Vercel Production

Vercel uses environment variables set in the dashboard, not local files:
- Go to: Vercel Dashboard → Settings → Environment Variables
- These remain pointing to production database
- No changes needed for deployment

## Safety Rules

1. **NEVER** commit `.env.local` or `.env.production.local`
2. **ALWAYS** use dev database for local development
3. **ONLY** use production credentials for emergency debugging
4. **TEST** thoroughly in dev before deploying

## Quick Check

To verify which database you're connected to:
```bash
# Check your current config
grep SUPABASE_URL .env.local

# Should show:
# NEXT_PUBLIC_SUPABASE_URL=https://hlpvvwlxjzexpgitsjlw.supabase.co (dev)
# NOT: bpdhbxvsguklkbusqtke (that's production!)
```