#!/bin/bash

# Script to clean up test/dummy component files from the repository
# Keeps only hero1.tsx in the correct location

echo "🧹 Starting component cleanup..."

# Files to delete (test/dummy components)
FILES_TO_DELETE=(
  # Navigation components (removing ALL since we're not using them)
  "nextjs-app/src/components/core/navigation/footer2.tsx"
  "nextjs-app/src/components/core/navigation/navbar2.tsx"

  # Section components (test/dummy files)
  "nextjs-app/src/components/core/sections/bento1.tsx"
  "nextjs-app/src/components/core/sections/services1.tsx"
  "nextjs-app/src/components/core/sections/brilliant-hero.tsx"
  "nextjs-app/src/components/core/sections/double-trouble-hero.tsx"
  "nextjs-app/src/components/core/sections/nav-bar-3.tsx"
  "nextjs-app/src/components/core/sections/services4.tsx"
  "nextjs-app/src/components/core/sections/sign-up-form-1.tsx"
  "nextjs-app/src/components/core/sections/super-hero-banner.tsx"
  "nextjs-app/src/components/core/sections/test-hero-banner.tsx"

  # Incorrectly placed hero1 (missing nextjs-app prefix)
  "src/components/core/sections/hero1.tsx"
)

# Delete each file
for file in "${FILES_TO_DELETE[@]}"; do
  if [ -f "$file" ]; then
    echo "  Deleting local: $file"
    rm -f "$file"
  else
    echo "  Not found locally: $file (may only exist on GitHub)"
  fi

  # Stage the deletion for git
  git rm -f "$file" 2>/dev/null || echo "  Already deleted from git: $file"
done

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Files kept:"
echo "  - nextjs-app/src/components/core/sections/hero1.tsx (on GitHub/staging)"
echo "  - nextjs-app/src/lib/core-components-registry.ts (minimal registry)"
echo ""
echo "Next steps:"
echo "  1. Commit these deletions"
echo "  2. Push to feature branch"
echo "  3. Pull from staging to get hero1.tsx"