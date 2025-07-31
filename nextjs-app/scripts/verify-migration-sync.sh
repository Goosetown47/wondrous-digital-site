#!/bin/bash

# Script to verify Supabase migrations are in sync
# Can be used as a pre-commit hook or CI check

echo "🔍 Verifying Migration Sync Status"
echo "=================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Exit codes
EXIT_SUCCESS=0
EXIT_OUT_OF_SYNC=1
EXIT_ERROR=2

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Must run from nextjs-app directory${NC}"
    exit $EXIT_ERROR
fi

# Parse command line arguments
DB_PASSWORD=""
STRICT_MODE=false
FIX_COMMANDS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --password)
            DB_PASSWORD="$2"
            shift 2
            ;;
        --strict)
            STRICT_MODE=true
            shift
            ;;
        --show-fix)
            FIX_COMMANDS=true
            shift
            ;;
        --help)
            echo "Usage: $0 --password 'your_password' [options]"
            echo ""
            echo "Options:"
            echo "  --password <pass>  Database password (required)"
            echo "  --strict           Exit with error if out of sync"
            echo "  --show-fix         Show repair commands for issues"
            echo "  --help             Show this help message"
            echo ""
            echo "Exit codes:"
            echo "  0 - Migrations are in sync"
            echo "  1 - Migrations are out of sync"
            echo "  2 - Error occurred"
            echo ""
            echo "Examples:"
            echo "  $0 --password 'your_password'"
            echo "  $0 --password 'your_password' --strict --show-fix"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit $EXIT_ERROR
            ;;
    esac
done

# Check if password is provided
if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}❌ Error: Please provide database password${NC}"
    echo "Usage: $0 --password 'your_password' [options]"
    exit $EXIT_ERROR
fi

# Function to check migrations
check_migrations() {
    local output
    output=$(npx supabase migration list --password "$DB_PASSWORD" 2>&1)
    
    if [[ $output == *"error"* ]] || [[ $output == *"Error"* ]]; then
        echo -e "${RED}❌ Error checking migration status:${NC}"
        echo "$output"
        return $EXIT_ERROR
    fi
    
    # Check for various sync issues
    local has_issues=false
    local issues=()
    
    # Check for pending migrations
    if [[ $output == *"pending"* ]]; then
        has_issues=true
        issues+=("pending")
    fi
    
    # Check for missing local migrations
    if [[ $output == *"Remote migration versions not found in local"* ]]; then
        has_issues=true
        issues+=("missing_local")
    fi
    
    # Check for drift
    local drift_output
    drift_output=$(npx supabase db diff --password "$DB_PASSWORD" 2>&1)
    if [[ $drift_output != *"No changes"* ]] && [[ $drift_output != *"empty"* ]]; then
        has_issues=true
        issues+=("schema_drift")
    fi
    
    # Report results
    if [ "$has_issues" = false ]; then
        echo -e "${GREEN}✅ All migrations are in sync!${NC}"
        echo ""
        echo -e "${BLUE}Summary:${NC}"
        echo "  - No pending migrations"
        echo "  - All remote migrations exist locally"
        echo "  - No schema drift detected"
        return $EXIT_SUCCESS
    else
        echo -e "${YELLOW}⚠️  Migration sync issues detected:${NC}"
        echo ""
        
        for issue in "${issues[@]}"; do
            case $issue in
                "pending")
                    echo -e "${YELLOW}📋 Pending migrations found${NC}"
                    echo "$output" | grep "pending" | head -5
                    echo ""
                    ;;
                "missing_local")
                    echo -e "${YELLOW}📁 Missing local migrations${NC}"
                    echo "Some migrations exist in remote but not locally"
                    echo ""
                    ;;
                "schema_drift")
                    echo -e "${YELLOW}🔄 Schema drift detected${NC}"
                    echo "Database schema differs from migration files"
                    echo ""
                    ;;
            esac
        done
        
        if [ "$FIX_COMMANDS" = true ]; then
            echo -e "${BLUE}🔧 Suggested fixes:${NC}"
            echo ""
            
            if [[ " ${issues[@]} " =~ " pending " ]] || [[ " ${issues[@]} " =~ " missing_local " ]]; then
                echo "1. Run the repair script to fix sync issues:"
                echo -e "${GREEN}   ./scripts/repair-migration-sync.sh --password '$DB_PASSWORD' --auto-fix${NC}"
                echo ""
            fi
            
            if [[ " ${issues[@]} " =~ " schema_drift " ]]; then
                echo "2. Review schema differences:"
                echo -e "${GREEN}   npx supabase db diff --password '$DB_PASSWORD'${NC}"
                echo ""
                echo "3. Create a migration for the changes:"
                echo -e "${GREEN}   npx supabase db diff --password '$DB_PASSWORD' | npx supabase migration new schema_sync${NC}"
                echo ""
            fi
            
            echo "4. Verify sync after fixes:"
            echo -e "${GREEN}   ./scripts/verify-migration-sync.sh --password '$DB_PASSWORD'${NC}"
        fi
        
        return $EXIT_OUT_OF_SYNC
    fi
}

# Main execution
echo ""
echo -e "${BLUE}Checking migration status...${NC}"
echo ""

check_migrations
result=$?

# Handle strict mode
if [ "$STRICT_MODE" = true ] && [ $result -ne $EXIT_SUCCESS ]; then
    echo ""
    echo -e "${RED}❌ Exiting with error due to --strict mode${NC}"
    echo "Fix the sync issues before proceeding"
    exit $result
fi

# Git pre-commit hook integration
if [ "$GIT_HOOK" = true ] && [ $result -ne $EXIT_SUCCESS ]; then
    echo ""
    echo -e "${RED}❌ Pre-commit check failed: Migrations are out of sync${NC}"
    echo "Run ./scripts/repair-migration-sync.sh to fix issues"
    exit $result
fi

exit $result