#!/bin/bash
# Script to check Supabase migration sync status
# Run this before starting any database work

set -e

echo "🔍 Checking Supabase migration sync status..."
echo "============================================"

# Set up environment
export SUPABASE_ACCESS_TOKEN=sbp_1348b275ff67f7aa2bc4426fd498ea44504bf612
DB_PASSWORD='aTR9dv8Q7J2emyMD'

# Check if we're in the right directory
if [ ! -d "supabase/migrations" ]; then
    echo "❌ Error: Not in the nextjs-app directory"
    echo "Please run from: cd nextjs-app && ./scripts/check-migration-sync.sh"
    exit 1
fi

# List migrations
echo ""
echo "📋 Current migration status:"
npx supabase migration list --password "$DB_PASSWORD" 2>&1 | tail -20

# Check for common issues
echo ""
echo "🔍 Checking for common issues..."

# Check for non-standard migration names
NON_STANDARD=$(ls supabase/migrations/*.sql 2>/dev/null | grep -E '[0-9]{8}_[0-9]{6}_' || true)
if [ ! -z "$NON_STANDARD" ]; then
    echo "⚠️  Warning: Found migrations with non-standard naming (underscore between date and time):"
    echo "$NON_STANDARD"
    echo "Standard format should be: YYYYMMDDHHMMSS_description.sql"
fi

# Check for local-only migrations
LOCAL_ONLY=$(npx supabase migration list --password "$DB_PASSWORD" 2>&1 | grep -E "^\s+[0-9]{14}\s+\|\s+\|" || true)
if [ ! -z "$LOCAL_ONLY" ]; then
    echo ""
    echo "⚠️  Warning: Found local migrations not in remote:"
    echo "$LOCAL_ONLY"
    echo ""
    echo "To fix, either:"
    echo "1. Push migrations: npx supabase db push --password '$DB_PASSWORD'"
    echo "2. Or if manually applied: npx supabase migration repair TIMESTAMP --status applied --password '$DB_PASSWORD'"
fi

# Success message
echo ""
echo "✅ Migration sync check complete!"
echo ""
echo "📝 Quick reference:"
echo "  - Push migrations: npx supabase db push --password '$DB_PASSWORD'"
echo "  - Fix sync issues: npx supabase migration repair TIMESTAMP --status applied --password '$DB_PASSWORD'"
echo "  - List migrations: npx supabase migration list --password '$DB_PASSWORD'"
echo ""