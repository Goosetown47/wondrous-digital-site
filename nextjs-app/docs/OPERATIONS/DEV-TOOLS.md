# DEV TOOLS (WSL Environment)

This document serves as a quick reference guide for all development tools and commands used in the Wondrous Digital platform on WSL (Windows Subsystem for Linux). Each section includes what the tool does, common commands, when to use them, and why.

---

## 🐧 WSL-Specific Commands

*Essential commands for managing WSL environment*

### WSL Management
```bash
# Check WSL version and distro
wsl --list --verbose            # See all installed distros and versions
cat /etc/os-release             # Check Linux distribution details

# Navigate between Windows and Linux
cd /mnt/c/Users/YourName        # Access Windows C: drive
cd ~                            # Go to Linux home directory
explorer.exe .                  # Open current directory in Windows Explorer

# WSL system commands
wsl --shutdown                  # Restart WSL (run from Windows)
free -h                         # Check WSL memory usage
df -h                           # Check disk usage
```
**When to use**: Managing your development environment and troubleshooting WSL issues

### File System Tips
```bash
# IMPORTANT: Keep projects in WSL filesystem for performance
cd ~                            # Linux home (fast)
# NOT: cd /mnt/c/...          # Windows drives (slow for git/npm)

# Copy files between Windows and WSL
cp /mnt/c/Users/YourName/file.txt ~/  # Copy from Windows to WSL
cp ~/file.txt /mnt/c/Users/YourName/  # Copy from WSL to Windows

# Fix file permissions after copying from Windows
chmod 644 file.txt              # Standard file permissions
chmod 755 script.sh             # Executable permissions
```
**When to use**: Setting up projects and managing files

---

## 🖥️ Terminal & System Commands

*Essential commands for managing your development environment*

### Port Management
```bash
# Find what's running on a port (e.g., 3000)
lsof -i :3000                   # Show process using port
sudo lsof -i :3000              # If permission denied
ss -tulpn | grep :3000          # Alternative method

# Kill process on a specific port
kill -9 $(lsof -t -i:3000)      # Kill whatever is on port 3000
sudo kill -9 $(lsof -t -i:3000) # If permission denied
npx kill-port 3000              # Cross-platform - easier to remember

# Check all listening ports
ss -tulpn                       # See all active ports
netstat -tulpn                  # Alternative (if netstat installed)
```
**When to use**: When you get "Port already in use" errors or need to free up ports

### Process Management
```bash
# Find Node.js processes
ps aux | grep node              # See all Node processes with details
pgrep -f node                   # Just get process IDs

# Kill Node processes
killall node                    # Kill all Node processes
pkill -f node                   # Alternative method

# Using PM2 (process manager)
npm run dev:start               # Start dev server in background
npm run dev:stop                # Stop background server
npm run dev:logs                # View server logs
npm run dev:status              # Check if server is running
```
**When to use**: When processes are stuck or you need to run servers in background

### Navigation & File Operations
```bash
# Quick navigation
cd ~/Claude/Projects/wondrous-digital-site/nextjs-app  # Go to project
cd -                            # Go back to previous directory
pwd                             # Show current directory

# Find files
find . -name "*.tsx" -type f    # Find all TSX files
find . -name "*user*" -type f   # Find files with "user" in name

# Search file contents (ripgrep is fastest)
rg "TODO"                       # Find all TODOs in project
rg "console.log" -t ts -t tsx   # Find console.logs in TypeScript files
grep -r "pattern" .             # Fallback if rg not installed
```
**When to use**: During development to quickly find and navigate files

### Environment & Debugging
```bash
# Check environment variables
echo $NODE_ENV                  # Check current environment
env | grep NEXT_                # See all Next.js env vars
printenv                        # Show all environment variables

# System resources
free -h                         # Check memory usage
df -h                           # Check disk space
htop                            # Monitor processes (install: sudo apt install htop)
top                             # Basic process monitor

# Network debugging
curl http://localhost:3000      # Test if server is responding
wget -O- http://localhost:3000  # Alternative to curl
ping app.wondrousdigital.com    # Check domain connectivity
nslookup wondrousdigital.com    # Check DNS resolution
dig wondrousdigital.com         # More detailed DNS info
```
**When to use**: When debugging deployment issues or checking system health

### WSL-Specific Troubleshooting
```bash
# Fix clock sync issues (common in WSL)
sudo hwclock -s                 # Sync hardware clock
sudo ntpdate time.windows.com   # Sync with time server

# Clear WSL DNS cache
sudo resolvectl flush-caches    # Ubuntu 20.04+
sudo service nscd restart       # Older versions

# Fix npm permission issues
mkdir ~/.npm-global             # Create global npm directory
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```
**When to use**: When experiencing WSL-specific issues

---

## ⚛️ Next.js

*The React framework powering our platform*

### Development Commands
```bash
# Start development server
npm run dev                      # Starts on http://localhost:3000
npm run dev -- -p 3001          # Start on different port

# Build commands
npm run build                    # Production build - run before deploying
npm run start                    # Start production server locally
npm run preview                  # Preview production build
```
**When to use**: Daily development and before deployments (DEV-LIFECYCLE step 3 & 6)

### Code Quality
```bash
# Linting
npm run lint                     # Check for code issues
npm run lint:fix                 # Auto-fix what's possible

# Type checking
npx tsc --noEmit                 # Check TypeScript errors without building
npm run type-check               # Alias if configured
```
**When to use**: Before every commit (DEV-LIFECYCLE step 4)

---

## 📘 TypeScript

*Static typing for JavaScript*

### Type Checking
```bash
# Check types
npx tsc --noEmit               # Check without generating files
npx tsc --noEmit --watch      # Watch mode - continuous checking

# Find type issues
npx tsc --noEmit 2>&1 | grep -E "error TS"  # Count TypeScript errors
npx tsc --listFiles           # See which files are being checked
```
**When to use**: Continuously during development (DEV-LIFECYCLE step 3)

### Type Generation
```bash
# Generate types from Supabase
npx supabase gen types typescript --local > src/types/database.ts
```
**When to use**: After database schema changes

---

## 🎨 Tailwind CSS

*Utility-first CSS framework*

### Development Tools
```bash
# Watch for class usage (if configured)
npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch

# Check bundle size
npx tailwindcss -i ./src/input.css -o ./dist/output.css --minify
```
**When to use**: When optimizing CSS bundle size

### Useful Classes Reference
```bash
# Container queries (we use these in Lab)
@container                       # Define container
@sm:hidden @lg:block            # Responsive within container

# Common patterns
cn()                            # Utility for combining classes
```
**When to use**: When building responsive components

---

## 🧩 shadcn/ui

*Component library built on Radix UI*

### Component Management
```bash
# Add new component
npx shadcn@latest add button    # Add button component
npx shadcn@latest add form      # Add form components
npx shadcn@latest add --all     # Add all components (not recommended)

# See available components
npx shadcn@latest add           # Shows component list
```
**When to use**: When you need a new UI component (check Core first!)

### After Adding Components
1. Component appears in `/src/components/ui/`
2. Update Core library if it's a new base component
3. Follow existing patterns for customization

---

## 🧪 Vitest

*Fast unit testing framework*

### Running Tests
```bash
# Run tests
npm run test                     # Run all tests once
npm run test:watch              # Watch mode - rerun on changes
npm run test:ui                 # Open test UI in browser

# Run specific tests
npm run test user               # Run tests matching "user"
npm run test src/lib/           # Run tests in specific directory

# Coverage
npm run test:coverage           # Generate coverage report
```
**When to use**: During development and before commits (DEV-LIFECYCLE step 4)

### Writing Tests
```bash
# Create test file
mkdir -p src/lib/__tests__
touch src/lib/__tests__/user.test.ts

# Run single test file
npx vitest src/lib/__tests__/user.test.ts
```
**When to use**: When adding new features or fixing bugs

---

## 🎭 Playwright

*E2E testing and browser automation*

### Running E2E Tests
```bash
# Install browsers first (one time)
npx playwright install         # Install test browsers

# Run tests
npm run test:e2e              # Run all E2E tests
npm run test:e2e:ui          # Open Playwright UI
npm run test:e2e:debug       # Debug mode

# Run specific tests
npm run test:e2e auth        # Run auth tests only
npm run test:e2e --project=chromium  # Run in specific browser

# Generate tests
npx playwright codegen localhost:3000  # Record actions to generate test
```
**When to use**: Testing user flows and before deployment (DEV-LIFECYCLE step 4)

### Debugging Tests
```bash
# Debug specific test
npx playwright test --debug     # Opens inspector
npx playwright test --headed    # See browser while testing

# Trace viewer
npx playwright show-trace trace.zip  # View test execution trace
```
**When to use**: When tests are failing and you need to see why

---

## 🗄️ Supabase

*PostgreSQL database and authentication*

### Database Commands
```bash
# Start local Supabase (requires Docker)
npx supabase start             # Start Docker containers
npx supabase stop              # Stop containers
npx supabase status            # Check if running

# Migrations
npx supabase migration new feature_name  # Create new migration
npx supabase db push --password 'aTR9dv8Q7J2emyMD'  # Apply migrations
npx supabase migration list --password 'aTR9dv8Q7J2emyMD'  # List migrations

# Database access
npx supabase db dump -f backup.sql  # Backup database
psql postgresql://postgres:postgres@localhost:54322/postgres  # Direct access
```
**When to use**: Database changes and local development (DEV-LIFECYCLE step 3)

### Type Generation
```bash
# Generate TypeScript types
npx supabase gen types typescript --local > src/types/database.ts
```
**When to use**: After any database schema changes

---

## 🚀 Vercel

*Deployment platform*

### Deployment Commands
```bash
# Deploy (requires Vercel CLI)
npx vercel                     # Deploy to preview
npx vercel --prod             # Deploy to production

# Local development
npx vercel dev                # Run with Vercel environment
npx vercel env pull           # Pull environment variables
```
**When to use**: Manual deployments or debugging deployment issues

### Useful Commands
```bash
# Check deployments
npx vercel ls                 # List recent deployments
npx vercel inspect [url]      # Inspect deployment

# Logs
npx vercel logs [url]         # View deployment logs
```
**When to use**: Debugging production issues

---

## 🐛 Sentry

*Error tracking and performance monitoring*

### Setup Commands
```bash
# Initialize Sentry
npx @sentry/wizard@latest -i nextjs

# Upload source maps
npx sentry-cli releases files RELEASE_NAME upload-sourcemaps ./dist
```
**When to use**: Initial setup and deployments

### Release Management
```bash
# Create release
npx sentry-cli releases new VERSION
npx sentry-cli releases set-commits VERSION --auto
npx sentry-cli releases finalize VERSION
```
**When to use**: During deployment process (DEV-LIFECYCLE step 6)

---

## 🐙 GitHub & Git

*Version control and collaboration*

### Branch Management
```bash
# Create and switch branches
git checkout -b feature/add-domains  # Create feature branch
git checkout main                    # Switch to main
git branch -d feature/add-domains    # Delete local branch

# Keep up to date
git pull origin main                 # Get latest changes
git rebase main                      # Rebase current branch on main
```
**When to use**: Starting new features (DEV-LIFECYCLE step 3)

### Committing
```bash
# Stage and commit
git add .                           # Stage all changes
git add -p                          # Stage interactively
git commit -m "feat: add domain management"  # Commit with message

# Fix mistakes
git commit --amend                  # Amend last commit
git reset HEAD~1                    # Undo last commit (keep changes)
git reset --hard HEAD~1             # Undo last commit (lose changes)
```
**When to use**: Saving work progress (DEV-LIFECYCLE step 3)

### GitHub CLI
```bash
# Pull requests
gh pr create                        # Create PR interactively
gh pr list                          # List PRs
gh pr view                          # View current PR in browser

# Issues
gh issue create                     # Create issue
gh issue list                       # List issues
```
**When to use**: Creating PRs (DEV-LIFECYCLE step 6)

---

## 📦 NPM & Package Management

*Managing dependencies*

### Package Commands
```bash
# Install packages
npm install                         # Install all dependencies
npm install package-name            # Add new package
npm install -D package-name         # Add dev dependency

# Update packages
npm update                          # Update all packages
npm outdated                        # See outdated packages
```
**When to use**: Adding features or updating dependencies

### Security & Maintenance
```bash
# Security audit
npm audit                           # Check for vulnerabilities
npm audit fix                       # Auto-fix vulnerabilities
npm audit --audit-level=moderate    # Only show moderate+

# Clean up
rm -rf node_modules package-lock.json && npm install  # Fresh install
npm prune                           # Remove unused packages
npm cache clean --force             # Clear npm cache
```
**When to use**: Regular maintenance and before deployments

---

## 🔍 ESLint & Prettier

*Code quality and formatting*

### Linting
```bash
# Run ESLint
npm run lint                        # Check for issues
npm run lint:fix                    # Fix automatically
npx eslint src/lib --fix           # Lint specific directory

# Find specific issues
npx eslint . --ext .ts,.tsx | grep "any"  # Find 'any' types
```
**When to use**: Before every commit (DEV-LIFECYCLE step 4)

### Formatting
```bash
# Run Prettier
npm run prettier:check              # Check formatting
npm run prettier:write              # Format all files
npx prettier --write src/lib/user.ts  # Format specific file
```
**When to use**: Before commits to maintain consistent style

---

## 🔥 Firecrawl (MCP)

*Web scraping and research tool*

### Using Firecrawl MCP
```typescript
// Available via MCP in Claude
mcp__firecrawl-mcp__firecrawl_scrape     // Scrape single page
mcp__firecrawl-mcp__firecrawl_map        // Discover URLs on site
mcp__firecrawl-mcp__firecrawl_search     // Search web for info
```
**When to use**: Researching solutions or gathering documentation

---

## 🏃 PM2 Process Manager

*Running servers in background*

### PM2 Commands (via npm scripts)
```bash
# Development server
npm run dev:start                   # Start in background
npm run dev:stop                    # Stop server
npm run dev:restart                 # Restart server
npm run dev:logs                    # View logs
npm run dev:status                  # Check status

# Direct PM2 commands
pm2 list                            # List all processes
pm2 monit                           # Monitor in real-time
pm2 flush                           # Clear logs
```
**When to use**: Long development sessions where you need terminal free

---

## 📧 Resend

*Email service for the platform*

### Testing Emails
```bash
# Send test email (if CLI configured)
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "test@example.com",
    "subject": "Test",
    "html": "<p>Test email</p>"
  }'
```
**When to use**: Testing email functionality

---

## 🛡️ Zod

*Schema validation library*

### Validation Patterns
```typescript
// Generate schema from type
npx tsx scripts/generate-zod-schema.ts  # If you have a generator

// Common patterns
z.string().email()                      // Email validation
z.string().url()                        // URL validation
z.string().min(1, "Required")          // Required field
```
**When to use**: Creating forms or API endpoints

---

## 🚨 Common Issues & Solutions

### Port Already in Use
```bash
# Quick fix
npx kill-port 3000
# Or find and kill manually
sudo lsof -i :3000
sudo kill -9 [PID]
```

### Module Not Found
```bash
# Try these in order:
npm install                         # Install dependencies
rm -rf node_modules && npm install # Clean install
npm cache clean --force            # Clear npm cache
```

### Permission Denied
```bash
# Fix file permissions
chmod +x script.sh                  # Make executable
chmod -R 755 directory/            # Fix directory permissions
sudo chown -R $USER:$USER .        # Take ownership
```

### Out of Memory (WSL specific)
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Configure WSL memory limit
# Create/edit .wslconfig in Windows user directory
# /mnt/c/Users/YourName/.wslconfig
# Add:
# [wsl2]
# memory=8GB
# Then restart WSL: wsl --shutdown
```

### WSL Clock Drift
```bash
# Fix time sync issues
sudo hwclock -s
# Or
sudo ntpdate time.windows.com
```

### Slow Git Operations on Windows Drive
```bash
# Move project to WSL filesystem
mv /mnt/c/projects/myapp ~/projects/myapp
# Git operations are much faster in WSL filesystem
```

---

## 📍 Quick Command Chains

### Fresh Start
```bash
cd ~/Claude/Projects/wondrous-digital-site/nextjs-app && \
rm -rf node_modules package-lock.json && \
npm install && \
npx tsc --noEmit && \
npm run lint
```

### Pre-Commit Check
```bash
npx tsc --noEmit && npm run lint && npm run test && npm run build
```

### Full Test Suite
```bash
npm run test && npm run test:e2e && npm run build
```

### Fix Common WSL Issues
```bash
# Fix time, permissions, and DNS in one go
sudo hwclock -s && \
sudo chmod -R 755 . && \
sudo resolvectl flush-caches
```

---

## 🐧 WSL Best Practices

1. **Keep projects in WSL filesystem** (`~/projects/` not `/mnt/c/`)
2. **Use Windows Terminal** for better experience
3. **Install Node via nvm** for easy version management
4. **Configure git in WSL** separately from Windows
5. **Use VSCode with WSL extension** for seamless development

---

Remember: This document is your quick reference. For detailed workflows, see DEV-LIFECYCLE.md