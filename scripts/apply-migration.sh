#!/bin/bash

echo "🚀 Applying Admin Management Migration to Supabase..."

# Configuration
SUPABASE_URL="https://bpdhbxvsguklkbusqtke.supabase.co"
SUPABASE_DB_URL="postgresql://postgres.bpdhbxvsguklkbusqtke:DJK8gzh6pec!etb9jcz@aws-0-us-east-2.pooler.supabase.com:6543/postgres"
MIGRATION_FILE="supabase/migrations/20250117_admin_management_schema.sql"

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "📄 Reading migration file..."

# Try using supabase db push with password provided via stdin
echo "DJK8gzh6pec!etb9jcz" | supabase db push --password-stdin

if [ $? -eq 0 ]; then
    echo "✅ Migration applied successfully!"
    
    # Verify the migration
    echo ""
    echo "📋 Verifying migration..."
    echo "Check your Supabase dashboard to confirm:"
    echo "- New tables: project_versions, audit_logs, project_status_history, maintenance_pages"
    echo "- New columns in projects table: project_status, subdomain, netlify_site_id, etc."
    echo "- New columns in customers table: account_type, subscription_status, notes"
    echo "- New view: project_management_view"
else
    echo "❌ Migration failed. Please check the error messages above."
    exit 1
fi