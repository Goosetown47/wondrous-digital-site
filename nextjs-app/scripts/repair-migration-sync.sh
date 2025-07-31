#!/bin/bash

# Script to repair Supabase migration sync issues

echo "🔧 Supabase Migration Repair Tool"
echo "================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Must run from nextjs-app directory${NC}"
    exit 1
fi

# Parse command line arguments
DRY_RUN=false
AUTO_FIX=false
DB_PASSWORD=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --auto-fix)
            AUTO_FIX=true
            shift
            ;;
        --password)
            DB_PASSWORD="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --dry-run          Show what would be done without making changes"
            echo "  --auto-fix         Automatically fix common issues"
            echo "  --password <pass>  Database password"
            echo "  --help             Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 --password 'your_password' --dry-run"
            echo "  $0 --password 'your_password' --auto-fix"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Check if password is provided
if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}❌ Error: Please provide database password${NC}"
    echo "Usage: $0 --password 'your_password' [options]"
    exit 1
fi

echo ""
echo -e "${BLUE}📋 Checking migration status...${NC}"
echo ""

# Get migration status and parse it
MIGRATION_OUTPUT=$(npx supabase migration list --password "$DB_PASSWORD" 2>&1)

if [[ $MIGRATION_OUTPUT == *"error"* ]] || [[ $MIGRATION_OUTPUT == *"Error"* ]]; then
    echo -e "${RED}❌ Error checking migration status:${NC}"
    echo "$MIGRATION_OUTPUT"
    exit 1
fi

# Parse out pending migrations
PENDING_MIGRATIONS=()
MISSING_LOCAL=()
APPLIED_BUT_MISSING=()

# Check for pending migrations
while IFS= read -r line; do
    if [[ $line == *"pending"* ]]; then
        # Extract timestamp from the line
        TIMESTAMP=$(echo "$line" | grep -oE '[0-9]{8}_[0-9]{6}')
        if [ ! -z "$TIMESTAMP" ]; then
            PENDING_MIGRATIONS+=("$TIMESTAMP")
        fi
    fi
done <<< "$MIGRATION_OUTPUT"

# Check for migrations in remote but not local
if [[ $MIGRATION_OUTPUT == *"Remote migration versions not found in local"* ]]; then
    echo -e "${YELLOW}⚠️  Found migrations in remote that are missing locally${NC}"
    # Extract the missing migrations
    MISSING_SECTION=$(echo "$MIGRATION_OUTPUT" | sed -n '/Remote migration versions not found/,/^$/p')
    while IFS= read -r line; do
        TIMESTAMP=$(echo "$line" | grep -oE '[0-9]{8}_[0-9]{6}')
        if [ ! -z "$TIMESTAMP" ]; then
            MISSING_LOCAL+=("$TIMESTAMP")
        fi
    done <<< "$MISSING_SECTION"
fi

# Function to repair a migration
repair_migration() {
    local timestamp=$1
    local status=$2
    local reason=$3
    
    if [ "$DRY_RUN" = true ]; then
        echo -e "${BLUE}[DRY RUN] Would run:${NC} npx supabase migration repair $timestamp --status $status --password '***'"
        echo -e "${BLUE}[DRY RUN] Reason:${NC} $reason"
    else
        echo -e "${GREEN}Repairing migration $timestamp as $status...${NC}"
        echo -e "${BLUE}Reason:${NC} $reason"
        npx supabase migration repair "$timestamp" --status "$status" --password "$DB_PASSWORD"
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Successfully marked $timestamp as $status${NC}"
        else
            echo -e "${RED}❌ Failed to repair $timestamp${NC}"
            return 1
        fi
    fi
}

# Report findings
echo -e "${BLUE}📊 Migration Analysis:${NC}"
echo "----------------------"

if [ ${#PENDING_MIGRATIONS[@]} -eq 0 ] && [ ${#MISSING_LOCAL[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ All migrations are in sync!${NC}"
    exit 0
fi

# Handle missing local migrations
if [ ${#MISSING_LOCAL[@]} -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}Missing Local Migrations:${NC}"
    for migration in "${MISSING_LOCAL[@]}"; do
        echo "  - $migration"
        
        if [ "$AUTO_FIX" = true ]; then
            echo ""
            echo -e "${YELLOW}This migration exists in remote but not locally.${NC}"
            echo "It was likely applied manually via Supabase Dashboard."
            repair_migration "$migration" "applied" "Migration applied manually, marking as applied to sync"
        fi
    done
    
    if [ "$AUTO_FIX" = false ]; then
        echo ""
        echo -e "${YELLOW}Suggested fix:${NC}"
        for migration in "${MISSING_LOCAL[@]}"; do
            echo "  npx supabase migration repair $migration --status applied --password 'YOUR_PASSWORD'"
        done
    fi
fi

# Handle pending migrations
if [ ${#PENDING_MIGRATIONS[@]} -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}Pending Migrations:${NC}"
    for migration in "${PENDING_MIGRATIONS[@]}"; do
        # Check if the migration file exists
        MIGRATION_FILE=$(find supabase/migrations -name "${migration}*.sql" -type f 2>/dev/null | head -1)
        
        if [ -z "$MIGRATION_FILE" ]; then
            echo "  - $migration (file not found locally)"
        else
            echo "  - $migration ($(basename "$MIGRATION_FILE"))"
            
            if [ "$AUTO_FIX" = true ]; then
                echo ""
                # Check if this is in our emergency log
                if grep -q "$migration" scripts/emergency-sql-log.md 2>/dev/null; then
                    echo -e "${YELLOW}Found in emergency log - was applied manually${NC}"
                    repair_migration "$migration" "applied" "Found in emergency SQL log, was applied manually"
                else
                    echo -e "${YELLOW}Migration file exists but shows as pending.${NC}"
                    echo "Was this migration applied manually? (y/n)"
                    read -r response
                    if [[ "$response" =~ ^[Yy]$ ]]; then
                        repair_migration "$migration" "applied" "User confirmed manual application"
                    else
                        echo -e "${BLUE}Skipping $migration - mark manually if needed${NC}"
                    fi
                fi
            fi
        fi
    done
    
    if [ "$AUTO_FIX" = false ]; then
        echo ""
        echo -e "${YELLOW}If these were applied manually, fix with:${NC}"
        for migration in "${PENDING_MIGRATIONS[@]}"; do
            echo "  npx supabase migration repair $migration --status applied --password 'YOUR_PASSWORD'"
        done
        echo ""
        echo -e "${YELLOW}If these were NOT applied, you can apply them with:${NC}"
        echo "  npx supabase db push --password 'YOUR_PASSWORD'"
    fi
fi

# Final verification if auto-fix was used
if [ "$AUTO_FIX" = true ] && [ "$DRY_RUN" = false ]; then
    echo ""
    echo -e "${BLUE}🔄 Verifying repairs...${NC}"
    npx supabase migration list --password "$DB_PASSWORD" | grep -E "(pending|error)" > /dev/null
    if [ $? -ne 0 ]; then
        echo -e "${GREEN}✅ All migrations are now in sync!${NC}"
    else
        echo -e "${YELLOW}⚠️  Some issues remain. Run the script again or check manually.${NC}"
    fi
fi

echo ""
echo -e "${BLUE}💡 Tips:${NC}"
echo "  - Use --dry-run to preview changes before applying"
echo "  - Use --auto-fix for interactive repair mode"
echo "  - Always verify changes with: npx supabase migration list --password 'YOUR_PASSWORD'"
echo "  - Document manual SQL applications in scripts/emergency-sql-log.md"