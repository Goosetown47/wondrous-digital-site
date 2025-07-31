#!/bin/bash

# Script to check Supabase migration status and health

echo "🔍 Checking Supabase Migration Status..."
echo "========================================"

# Color codes
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

# Check if password is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Please provide database password as argument${NC}"
    echo "Usage: ./scripts/check-migration-status.sh 'your_password'"
    exit 1
fi

DB_PASSWORD="$1"

echo ""
echo -e "${BLUE}📋 Current Migration Status:${NC}"
echo "----------------------------"
MIGRATION_OUTPUT=$(npx supabase migration list --password "$DB_PASSWORD" 2>&1)
echo "$MIGRATION_OUTPUT"

# Check for issues and provide repair suggestions
NEEDS_REPAIR=false
PENDING_COUNT=0
MISSING_LOCAL=false

# Count pending migrations
if [[ $MIGRATION_OUTPUT == *"pending"* ]]; then
    PENDING_COUNT=$(echo "$MIGRATION_OUTPUT" | grep -c "pending")
    NEEDS_REPAIR=true
fi

# Check for missing local migrations
if [[ $MIGRATION_OUTPUT == *"Remote migration versions not found in local"* ]]; then
    MISSING_LOCAL=true
    NEEDS_REPAIR=true
fi

echo ""
echo -e "${BLUE}📁 Local Migration Files:${NC}"
echo "------------------------"
ls -la supabase/migrations/*.sql 2>/dev/null | grep -v ".backup\|.applied\|.skip" | tail -10 || echo "No migration files found"

echo ""
echo -e "${BLUE}🔄 Checking for Drift:${NC}"
echo "---------------------"
DRIFT_OUTPUT=$(npx supabase db diff --password "$DB_PASSWORD" 2>&1)
echo "$DRIFT_OUTPUT"

HAS_DRIFT=false
if [[ $DRIFT_OUTPUT != *"No changes"* ]] && [[ $DRIFT_OUTPUT != *"empty"* ]] && [[ $DRIFT_OUTPUT != *"error"* ]]; then
    HAS_DRIFT=true
fi

echo ""
echo -e "${GREEN}✅ Status Check Complete!${NC}"
echo ""

# Provide specific repair suggestions if issues found
if [ "$NEEDS_REPAIR" = true ] || [ "$HAS_DRIFT" = true ]; then
    echo -e "${YELLOW}⚠️  Issues Detected:${NC}"
    echo ""
    
    if [ $PENDING_COUNT -gt 0 ]; then
        echo -e "${YELLOW}• Found $PENDING_COUNT pending migration(s)${NC}"
    fi
    
    if [ "$MISSING_LOCAL" = true ]; then
        echo -e "${YELLOW}• Some remote migrations are missing locally${NC}"
    fi
    
    if [ "$HAS_DRIFT" = true ]; then
        echo -e "${YELLOW}• Schema drift detected between database and migrations${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}🔧 Suggested Actions:${NC}"
    echo ""
    
    if [ "$NEEDS_REPAIR" = true ]; then
        echo "1. Run the automatic repair script:"
        echo -e "${GREEN}   ./scripts/repair-migration-sync.sh --password '$DB_PASSWORD' --auto-fix${NC}"
        echo ""
        echo "   Or for a dry run first:"
        echo -e "${GREEN}   ./scripts/repair-migration-sync.sh --password '$DB_PASSWORD' --dry-run${NC}"
        echo ""
    fi
    
    if [ "$HAS_DRIFT" = true ]; then
        echo "2. To handle schema drift:"
        echo "   a) Create a migration for the changes:"
        echo -e "${GREEN}      npx supabase db diff --password '$DB_PASSWORD' | npx supabase migration new sync_schema${NC}"
        echo ""
        echo "   b) Or if changes were already applied manually, create and mark as applied:"
        echo -e "${GREEN}      ./scripts/apply-emergency-sql.sh drift-fix.sql --create-migration --auto-repair --password '$DB_PASSWORD'${NC}"
        echo ""
    fi
    
    echo "3. For manual repair of specific migrations:"
    echo -e "${GREEN}   npx supabase migration repair TIMESTAMP --status applied --password '$DB_PASSWORD'${NC}"
    echo ""
else
    echo -e "${GREEN}🎉 All migrations are in sync!${NC}"
    echo ""
fi

echo -e "${BLUE}💡 Tips:${NC}"
echo "- Full documentation: docs/SUPABASE-MIGRATION-WORKFLOW.md"
echo "- For emergency fixes: ./scripts/apply-emergency-sql.sh --help"
echo "- To verify sync status: ./scripts/verify-migration-sync.sh --password '$DB_PASSWORD'"