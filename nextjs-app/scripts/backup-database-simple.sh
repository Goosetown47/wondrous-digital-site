#!/bin/bash

# Simple Database Backup Script using direct connection
# Creates comprehensive backups without Docker dependency

set -e  # Exit on error

echo "🔒 Starting database backup process..."

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load environment variables
if [ -f "$PROJECT_ROOT/.env.local" ]; then
    export $(cat "$PROJECT_ROOT/.env.local" | grep -v '^#' | xargs)
fi

# Check required environment variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL not set"
    exit 1
fi

# Extract project ID from Supabase URL
PROJECT_ID=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's/https:\/\/\([^.]*\).supabase.co/\1/')

# Create backup directory with timestamp
TIMESTAMP=$(date +"%Y-%m-%d-%H%M%S")
BACKUP_DIR="$PROJECT_ROOT/backups/$TIMESTAMP"
mkdir -p "$BACKUP_DIR"

echo "📁 Creating backup in: $BACKUP_DIR"
echo "🔗 Project: $PROJECT_ID"

# Use supabase db dump with password
echo "📦 Creating database export..."

# Export schema
echo "   Exporting schema..."
npx supabase db dump --linked --password "aTR9dv8Q7J2emyMD" > "$BACKUP_DIR/full-backup.sql" 2>"$BACKUP_DIR/backup.log"

if [ $? -eq 0 ]; then
    echo "✅ Database export completed"
    SIZE=$(ls -lh "$BACKUP_DIR/full-backup.sql" | awk '{print $5}')
    echo "   Size: $SIZE"
else
    echo "❌ Export failed. Check $BACKUP_DIR/backup.log for details"
    cat "$BACKUP_DIR/backup.log"
fi

# Create backup info
cat > "$BACKUP_DIR/backup-info.txt" << EOF
Database Backup Information
==========================
Created: $(date)
Project ID: $PROJECT_ID
Environment: Production

Files in this backup:
- full-backup.sql: Complete database export
- backup-info.txt: This file
- todays-changes.txt: Summary of changes made today

To restore:
1. Create a new Supabase project
2. Run: npx supabase db push --db-url [NEW_DB_URL] < full-backup.sql
EOF

# Document today's changes
cat > "$BACKUP_DIR/todays-changes.txt" << EOF
Changes Made Today ($(date +"%Y-%m-%d"))
=====================================

1. Fixed Theme System:
   - Updated React Query invalidation in useThemes.ts
   - Removed broken validate_project_theme trigger
   - Applied migration: 20250812000000_remove_broken_theme_check_function.sql

2. User Creation Features:
   - Created 4 test accounts
   - Fixed various API access issues
   - Added RLS policies for pages and projects

3. Database Status:
   - Total rows: 528
   - Tables with data: 10
   - Test accounts: 4
   - Real accounts: 2

Note: The automatic daily backup from 6:30am does NOT include these changes.
EOF

# Create latest symlink
ln -sfn "$TIMESTAMP" "$PROJECT_ROOT/backups/latest"

echo ""
echo "📊 Backup Summary:"
echo "   Location: $BACKUP_DIR"
echo "   Files created:"
ls -lh "$BACKUP_DIR" | grep -v '/$' | tail -n +2 | awk '{print "   - " $9 " (" $5 ")"}'
echo ""
echo "✅ Backup process completed!"
echo "💡 Access via: $PROJECT_ROOT/backups/latest"