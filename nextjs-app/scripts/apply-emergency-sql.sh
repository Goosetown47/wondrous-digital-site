#!/bin/bash

# Script to track emergency SQL applied outside of migrations

echo "🚨 Emergency SQL Application Tracker"
echo "===================================="

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Parse command line arguments
SQL_FILE=""
CREATE_MIGRATION=false
AUTO_REPAIR=false
DB_PASSWORD=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --create-migration)
            CREATE_MIGRATION=true
            shift
            ;;
        --auto-repair)
            AUTO_REPAIR=true
            shift
            ;;
        --password)
            DB_PASSWORD="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 <sql_file> [options]"
            echo ""
            echo "Options:"
            echo "  --create-migration  Create a proper migration file"
            echo "  --auto-repair       Automatically mark as applied after confirmation"
            echo "  --password <pass>   Database password (for auto-repair)"
            echo "  --help              Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 scripts/fix.sql"
            echo "  $0 scripts/fix.sql --create-migration"
            echo "  $0 scripts/fix.sql --auto-repair --password 'your_password'"
            exit 0
            ;;
        *)
            if [ -z "$SQL_FILE" ]; then
                SQL_FILE="$1"
            fi
            shift
            ;;
    esac
done

# Check if SQL file is provided
if [ -z "$SQL_FILE" ]; then
    echo -e "${RED}❌ Error: Please provide SQL file path${NC}"
    echo "Usage: $0 <sql_file> [options]"
    echo "Use --help for more information"
    exit 1
fi

# Check if SQL file exists
if [ ! -f "$SQL_FILE" ]; then
    echo -e "${RED}❌ Error: SQL file not found: $SQL_FILE${NC}"
    exit 1
fi

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="scripts/emergency-sql-log.md"
MIGRATION_TIMESTAMP=""

# Create proper migration if requested
if [ "$CREATE_MIGRATION" = true ]; then
    echo ""
    echo -e "${BLUE}📝 Creating proper migration file...${NC}"
    
    # Get a description for the migration
    echo "Enter a brief description for this migration (e.g., 'fix_project_delete_policies'):"
    read -r DESCRIPTION
    
    if [ -z "$DESCRIPTION" ]; then
        DESCRIPTION="emergency_fix"
    fi
    
    # Create migration file
    MIGRATION_DIR="supabase/migrations"
    MIGRATION_FILE="$MIGRATION_DIR/${TIMESTAMP}_${DESCRIPTION}.sql"
    
    # Copy SQL content with header
    echo "-- Emergency fix: $DESCRIPTION" > "$MIGRATION_FILE"
    echo "-- Applied manually via Supabase Dashboard" >> "$MIGRATION_FILE"
    echo "" >> "$MIGRATION_FILE"
    cat "$SQL_FILE" >> "$MIGRATION_FILE"
    
    echo -e "${GREEN}✅ Migration file created: $MIGRATION_FILE${NC}"
    echo ""
    
    # Update SQL_FILE to point to the migration
    SQL_FILE="$MIGRATION_FILE"
    MIGRATION_TIMESTAMP="$TIMESTAMP"
fi

echo ""
echo -e "${BLUE}📄 SQL File: $SQL_FILE${NC}"
echo -e "${BLUE}🕐 Timestamp: $TIMESTAMP${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: This SQL should be applied manually in Supabase Dashboard${NC}"
echo ""
echo "Contents:"
echo "---------"
cat "$SQL_FILE"
echo ""
echo "---------"

# Create log entry
echo "" >> "$LOG_FILE"
echo "## Emergency SQL Applied: $TIMESTAMP" >> "$LOG_FILE"
echo "**File:** $SQL_FILE" >> "$LOG_FILE"
echo "**Reason:** [Enter reason here]" >> "$LOG_FILE"
echo "**Applied by:** [Your name]" >> "$LOG_FILE"
if [ ! -z "$MIGRATION_TIMESTAMP" ]; then
    echo "**Migration Timestamp:** $MIGRATION_TIMESTAMP" >> "$LOG_FILE"
fi
echo "" >> "$LOG_FILE"
echo "\`\`\`sql" >> "$LOG_FILE"
cat "$SQL_FILE" >> "$LOG_FILE"
echo "\`\`\`" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Create backup
BACKUP_DIR="scripts/emergency-sql-backups"
mkdir -p "$BACKUP_DIR"
cp "$SQL_FILE" "$BACKUP_DIR/${TIMESTAMP}_$(basename $SQL_FILE)"

echo ""
echo -e "${GREEN}✅ Log entry created in: $LOG_FILE${NC}"
echo -e "${GREEN}✅ Backup saved to: $BACKUP_DIR/${TIMESTAMP}_$(basename $SQL_FILE)${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Copy the SQL above"
echo "2. Go to Supabase Dashboard > SQL Editor"
echo "3. Paste and run the SQL"
echo "4. Update the log entry with the actual reason and your name"

# If migration was created or auto-repair requested
if [ ! -z "$MIGRATION_TIMESTAMP" ] || [ "$AUTO_REPAIR" = true ]; then
    echo ""
    echo -e "${BLUE}🔧 After applying the SQL manually:${NC}"
    
    if [ ! -z "$MIGRATION_TIMESTAMP" ]; then
        REPAIR_TIMESTAMP="$MIGRATION_TIMESTAMP"
    else
        # Extract timestamp from filename if it's a migration
        if [[ "$SQL_FILE" =~ ([0-9]{8}_[0-9]{6}) ]]; then
            REPAIR_TIMESTAMP="${BASH_REMATCH[1]}"
        fi
    fi
    
    if [ ! -z "$REPAIR_TIMESTAMP" ]; then
        echo ""
        echo -e "${YELLOW}Run this command to mark the migration as applied:${NC}"
        echo -e "${GREEN}npx supabase migration repair $REPAIR_TIMESTAMP --status applied --password 'YOUR_PASSWORD'${NC}"
        
        if [ "$AUTO_REPAIR" = true ] && [ ! -z "$DB_PASSWORD" ]; then
            echo ""
            echo -e "${YELLOW}Do you want to mark this migration as applied now? (y/n)${NC}"
            read -r response
            if [[ "$response" =~ ^[Yy]$ ]]; then
                cd "$(dirname "$0")/.." # Go to nextjs-app directory
                npx supabase migration repair "$REPAIR_TIMESTAMP" --status applied --password "$DB_PASSWORD"
                if [ $? -eq 0 ]; then
                    echo -e "${GREEN}✅ Migration marked as applied${NC}"
                else
                    echo -e "${RED}❌ Failed to mark migration as applied${NC}"
                fi
            fi
        fi
    fi
fi

echo ""
echo -e "${BLUE}💡 Tips:${NC}"
echo "  - Use --create-migration to generate a proper migration file"
echo "  - Use --auto-repair with --password to mark as applied after confirmation"
echo "  - Run ./scripts/repair-migration-sync.sh to fix any sync issues"