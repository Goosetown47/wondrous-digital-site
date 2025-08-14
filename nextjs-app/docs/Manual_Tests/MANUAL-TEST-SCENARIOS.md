# Manual Test Scenarios for v0.1.2

## User Creation Features

### Test 1: Create User with All Roles ✅
**As:** Platform Admin (admin@wondrousdigital.com)
**Steps:**
1. Log in as platform admin
2. Navigate to Tools > Users
3. Click "Create User" button
4. Test creating users with each role:
- tyler.lahaie@wondrous.gg \ Password: atz_dek-nky2WBU_jav
- staff@wondrousdigital.com \ Password: tvt*gdy5aka-UTF2zfu
- owner@example.com \ Password: afq!HXC7pqk3fgv4rym
- test-user@example.com \ Password: ukc-zbr5DZT4pfb3yvf

**Expected Results:**
- ✅ All users created successfully
- ✅ Success toast notification appears
- ✅ New users appear in the users list
- ✅ Platform roles (Admin/Staff) don't require account selection
- ✅ Account roles (Owner/User) require account selection

### Test 2: Validation Testing ✅ PASS
**Steps:**
1. Try to create a user with invalid data:
   - Email: "notanemail"
   - Password: "short"
   - Full Name: "" (empty)
   - Role: User
   - Account: None selected

**Expected Results:**
- ❌ Form shows validation errors:
  - "Invalid email address"
  - "Password must be at least 8 characters"
  - "Full name is required"
  - "Account is required for this role"

### Test 3: Duplicate Email Prevention ✅ PASS
**As:** Platform Admin
**Steps:**
1. Try to create a user with an existing email (e.g., admin@wondrousdigital.com)

**Expected Results:**
- ❌ Error message: "A user with this email already exists"
- ❌ User is not created

### Test 4: Password Generation ✅ PASS
**As:** Platform Admin
**Steps:**
1. Click "Generate Password" button
2. Verify password meets requirements
3. Create user with generated password

**Expected Results:**
- ✅ Password is at least 16 characters
- ✅ Contains uppercase, lowercase, numbers, and symbols
- ✅ Password field shows/hide toggle works
- ✅ User created successfully

### Test 5: Delete User ✅ PASS
**As:** Platform Admin
**Steps:**
1. Navigate to Tools > Users
2. Find a test user you created
3. Click the delete button (trash icon)
4. Confirm deletion in the dialog

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ User is removed from the list
- ✅ Success notification appears
- ❌ Cannot delete yourself
- ❌ Cannot delete other admins

### Test 6: Login as Created Users ✅ PASS
**Steps:**
1. Log out of admin account
2. Try logging in with each created test user
3. Verify email auto-confirmation worked

**Expected Results:**
- ✅ All users with auto-confirm can log in immediately
- ✅ Users see appropriate navigation based on role
- ✅ Admin/Staff see Lab, Library, Core, Tools
- ✅ Regular users/owners don't see admin sections



## Service Layer & API Security

### Test 7: Admin API Access Control  ✅ [FIXED]
**As:** Regular User (test-user@example.com)
**Steps:**
1. Log in as regular user
2. Try to navigate to:
   - /lab ✅ (redirects to /dashboard)
   - /library ✅ (redirects to /dashboard)
   - /core ✅ (redirects to /dashboard)
   - /tools ✅ (returns 404 - correct behavior)
   - /admin ✅ (returns 404 - correct behavior)

**Expected Results:**
- ✅ Redirected to /dashboard?error=unauthorized for admin pages
- ✅ Cannot access admin pages

**Fix Applied:**
- Added server-side role checks to Lab, Library, and Core pages
- Pages now redirect unauthorized users before rendering
- No more client-side errors or partial page rendering


### Test 8: Account Owner Permissions ✅ [FIXED]
**As:** Account Owner (owner@example.com)
**Steps:**
1. Log in as account owner
2. Verify navigation menu

**Expected Results:**
- ✅ See: 
  - Dashboard ✅
  - Builder ✅
  - Settings ✅
- ✅ Don't see: 
  - Lab ✅ (correctly hidden from navigation)
  - Library ✅ (correctly hidden from navigation)
  - Core ✅ (correctly hidden from navigation)
  - Tools ✅ (correctly hidden from navigation)
  - Admin ✅ (correctly hidden from navigation)
- ✅ Can manage:
  - own account's projects ✅
  - and users ❌ (functionality not built yet - future feature)

**Fix Applied:**
- Same server-side role checks prevent account owners from accessing admin pages
- Navigation correctly hides admin items based on role


 
### Test 9: Staff Access ✅ PASS
**As:** Staff User (staff@wondrousdigital.com)
**Steps:**
1. Log in as staff user
2. Navigate to:
   - /lab ✅ (accessible)
   - /library ✅ (accessible)
   - /core ✅ (accessible)
   - /tools ✅ (accessible)
   - /admin ❌ (not accessible - admin only)

**Expected Results:**
- ✅ Can access most admin areas
- ❌ Cannot access /admin (reserved for admins)



 
### Test 10: API Security (Developer Console)  ✅ [FIXED]
**As:** Regular User
**Steps:**
1. Open browser developer console
2. Try to call admin APIs:
```javascript
// Try to fetch themes (admin/staff only)
fetch('/api/themes').then(r => r.json()).then(console.log)

// Try to fetch core components
fetch('/api/core-components').then(r => r.json()).then(console.log)

// Try to fetch library items
fetch('/api/library').then(r => r.json()).then(console.log)
```

**Expected Results:**
- ✅ /api/themes returns theme data (regular users can view themes)
- ✅ /api/core-components returns 403 Forbidden
- ✅ /api/library returns 403 Forbidden
- ✅ Error: "Access denied. Admin or staff role required."

**Fix Applied:**
- All admin APIs now properly check roles and return 403 JSON responses
- Theme API allows GET requests for all authenticated users (they need to select themes)
- No more 500 errors or HTML responses in API calls