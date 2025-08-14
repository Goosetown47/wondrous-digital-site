#!/bin/bash

# Database Backup Script
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
- schema.sql: Database schema only (tables, functions, triggers, etc.)
- data.sql: Data only (all table contents)
- full-backup.sql: Complete database dump (schema + data)
- migrations.txt: List of applied migrations
- backup-info.txt: This file

To restore:
1. Schema only: psql -h [HOST] -U [USER] -d [DATABASE] < schema.sql
2. Data only: psql -h [HOST] -U [USER] -d [DATABASE] < data.sql
3. Full restore: psql -h [HOST] -U [USER] -d [DATABASE] < full-backup.sql
EOF

# Function to run Supabase CLI commands
run_supabase_backup() {
    local backup_type=$1
    local output_file=$2
    local flags=$3
    
    echo "📦 Creating $backup_type backup..."
    
    # Build the database URL
    DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
    
    # Run the backup command
    if npx supabase db dump --db-url "$DATABASE_URL" $flags > "$output_file" 2>"$output_file.error"; then
        echo "✅ $backup_type backup created successfully"
        # Get file size
        SIZE=$(ls -lh "$output_file" | awk '{print $5}')
        echo "   Size: $SIZE"
        rm -f "$output_file.error"
    else
        echo "❌ Failed to create $backup_type backup"
        echo "   Error: $(cat "$output_file.error")"
        return 1
    fi
}

# Create schema-only backup
run_supabase_backup "schema" "$BACKUP_DIR/schema.sql" "--schema-only"

# Create data-only backup
run_supabase_backup "data" "$BACKUP_DIR/data.sql" "--data-only"

# Create full backup (schema + data)
run_supabase_backup "full" "$BACKUP_DIR/full-backup.sql" ""

# Get list of applied migrations
echo "📋 Fetching migration history..."
cat > "$BACKUP_DIR/migrations.txt" << EOF
Applied Migrations
==================
Generated: $(date)

EOF

# Try to get migrations from the database
npx supabase migration list --db-url "postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}" >> "$BACKUP_DIR/migrations.txt" 2>/dev/null || echo "Could not fetch migration list" >> "$BACKUP_DIR/migrations.txt"

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