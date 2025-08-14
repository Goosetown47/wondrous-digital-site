#!/bin/bash

# Database Backup Script v2
# Creates comprehensive backups of the Supabase database

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
DB_HOST="db.${PROJECT_ID}.supabase.co"
DB_NAME="postgres"
DB_USER="postgres"
DB_PASSWORD="aTR9dv8Q7J2emyMD"
DB_PORT="5432"

# Create backup directory with timestamp
TIMESTAMP=$(date +"%Y-%m-%d-%H%M%S")
BACKUP_DIR="$PROJECT_ROOT/backups/$TIMESTAMP"
mkdir -p "$BACKUP_DIR"

echo "📁 Creating backup in: $BACKUP_DIR"

# Create backup info file
cat > "$BACKUP_DIR/backup-info.txt" << EOF
Database Backup Information
==========================
Created: $(date)
Project ID: $PROJECT_ID
Database Host: $DB_HOST
Database Name: $DB_NAME

Files in this backup:
- full-backup.sql: Complete database dump (schema + data)
- data-only.sql: Data only (all table contents)
- backup-info.txt: This file

To restore:
1. Full restore: psql -h [HOST] -U [USER] -d [DATABASE] < full-backup.sql
2. Data only: psql -h [HOST] -U [USER] -d [DATABASE] < data-only.sql
EOF

# Build the database URL
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# Create full backup (schema + data)
echo "📦 Creating full backup (schema + data)..."
if npx supabase db dump --db-url "$DATABASE_URL" --file "$BACKUP_DIR/full-backup.sql"; then
    echo "✅ Full backup created successfully"
    SIZE=$(ls -lh "$BACKUP_DIR/full-backup.sql" | awk '{print $5}')
    echo "   Size: $SIZE"
else
    echo "❌ Failed to create full backup"
    exit 1
fi

# Create data-only backup
echo "📦 Creating data-only backup..."
if npx supabase db dump --db-url "$DATABASE_URL" --data-only --file "$BACKUP_DIR/data-only.sql"; then
    echo "✅ Data-only backup created successfully"
    SIZE=$(ls -lh "$BACKUP_DIR/data-only.sql" | awk '{print $5}')
    echo "   Size: $SIZE"
else
    echo "❌ Failed to create data-only backup"
fi

# Get list of applied migrations
echo "📋 Saving migration history..."
cat > "$BACKUP_DIR/migrations.txt" << EOF
Applied Migrations
==================
Generated: $(date)

Latest migrations in the codebase:
EOF

# List migration files
ls -la "$PROJECT_ROOT/supabase/migrations/" >> "$BACKUP_DIR/migrations.txt" 2>/dev/null || echo "Could not list migration files" >> "$BACKUP_DIR/migrations.txt"

# Create a latest symlink for easy access
ln -sfn "$TIMESTAMP" "$PROJECT_ROOT/backups/latest"

# Summary
echo ""
echo "✅ Backup completed successfully!"
echo ""
echo "📊 Backup Summary:"
echo "   Location: $BACKUP_DIR"
echo "   Files created:"
ls -lh "$BACKUP_DIR" | grep -E '\.(sql|txt)$' | awk '{print "   - " $9 " (" $5 ")"}'
echo ""
echo "💡 Quick access: $PROJECT_ROOT/backups/latest"
echo ""
echo "🔐 Remember: Keep these backups secure and do not commit them to git!"

# Also create a quick summary of what changed today
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

3. Database Documentation:
   - Generated comprehensive database documentation
   - Created backup scripts
   - Total data: 528 rows across 10 tables with data

Remember: The daily automatic backup from 6:30am this morning does NOT include these changes.
EOF

echo "📝 Created summary of today's changes"