# ESLINT RECOVERY LOG

Complete inventory of all 305 ESLint errors requiring individual resolution.

**Status Overview:**
- ⏳ Pending: 204 errors
- 🔄 In Progress: 0 errors  
- ✅ Complete: 100 errors

## 📊 Progress Tracking

| Time | Error Count | Status | Notes |
|------|-------------|--------|--------|
| Start | 304 | 🔄 Beginning recovery | App runs successfully, ESLint cleanup needed |
| 10 min | 287 | ✅ Good progress | Fixed 17 errors across 8 files |
| 20 min | 273 | ✅ Excellent progress | Fixed 31 errors total, systematic approach working |
| 30 min | 249 | ✅ Excellent progress | Fixed 55 errors total, completed tools/accounts module |
| 40 min | 238 | ✅ Good progress | Fixed 66 errors total, completed lab module and API routes |
| 50 min | 232 | ✅ Critical fix + progress | Fixed handleSave initialization bug, 72 errors total fixed |
| 60 min | 224 | ✅ Good progress | Fixed 80 errors total, cleaned up tools pages |
| 70 min | 221 | ✅ Good progress | Fixed 83 errors total, completed all tools page fixes |
| 80 min | 208 | ✅ Excellent progress | Fixed 96 errors total, cleaned up API routes and builder components |

---

## File-by-File Error Inventory

### File: ./src/app/(app)/account/archived/page.tsx (5 errors)
- [x] **Error #1** (Line 34): 'queryClient' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Commented out unused variable
  - **Status**: ✅ Complete

- [x] **Error #2** (Line 41): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replaced with `{ id: string; name: string }`
  - **Status**: ✅ Complete

- [x] **Error #3** (Line 42): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replaced with `{ id: string; name: string }`
  - **Status**: ✅ Complete

- [x] **Error #4** (Line 54): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replaced with `{ id: string; name: string }`
  - **Status**: ✅ Complete

- [x] **Error #5** (Line 58): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replaced with `{ id: string; name: string }`
  - **Status**: ✅ Complete

### File: ./src/app/(app)/account/users/page.tsx (3 errors)
- [x] **Error #6** (Line 99): 'error' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Removed error parameter from catch block
  - **Status**: ✅ Complete

- [x] **Error #7** (Line 114): 'error' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Removed error parameter from catch block
  - **Status**: ✅ Complete

- [x] **Error #8** (Line 129): 'error' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Removed error parameter from catch block
  - **Status**: ✅ Complete

### File: ./src/app/(app)/app/admins/page.tsx (3 errors)
- [x] **Error #9** (Line 11): 'Badge' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Commented out unused import
  - **Status**: ✅ Complete

- [x] **Error #10** (Line 36): 'isLoading' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Removed unused variable from destructuring
  - **Status**: ✅ Complete

- [x] **Error #11** (Line 38): 'updateUserRole' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Commented out unused hook
  - **Status**: ✅ Complete

### File: ./src/app/(app)/builder/[projectId]/page.tsx (1 error)
- [x] **Error #12** (Line 13): 'isLoading' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Removed unused variable from destructuring
  - **Status**: ✅ Complete

### File: ./src/app/(app)/core/add/page.tsx (2 errors)
- [x] **Error #13** (Line 133): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replaced with `'component' | 'section'`
  - **Status**: ✅ Complete

- [x] **Error #14** (Line 149): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replaced with `'shadcn' | 'custom' | 'third-party'`
  - **Status**: ✅ Complete

### File: ./src/app/(app)/core/page.tsx (2 errors)
- [x] **Error #15** (Line 10): 'TabsContent' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Removed unused import
  - **Status**: ✅ Complete

- [x] **Error #16** (Line 36): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replaced with `'shadcn' | 'custom' | 'third-party'`
  - **Status**: ✅ Complete

### File: ./src/app/(app)/core/populate/page.tsx (3 errors)
- [x] **Error #17** (Line 119): 'router' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Commented out unused hook
  - **Status**: ✅ Complete

- [x] **Error #18** (Line 152): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replaced with `unknown` type
  - **Status**: ✅ Complete

- [x] **Error #19** (Line 204): 'index' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Removed unused index parameter
  - **Status**: ✅ Complete

### File: ./src/app/(app)/dashboard/page.tsx (1 error)
- [x] **Error #20** (Line 14): 'user' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Removed from destructuring
  - **Status**: ✅ Complete

### File: ./src/app/(app)/lab/[id]/page.tsx (7 errors)
- [x] **Error #21** (Line 10): 'TabsContent' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: No longer present in file
  - **Status**: ✅ Complete

- [x] **Error #22** (Line 16): 'Eye' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: No longer present in file
  - **Status**: ✅ Complete

- [x] **Error #23** (Line 18): 'X' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: No longer present in file
  - **Status**: ✅ Complete

- [x] **Error #24** (Line 18): 'Code' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: No longer present in file
  - **Status**: ✅ Complete

- [x] **Error #25** (Line 57): 'cn' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Already commented out
  - **Status**: ✅ Complete

- [x] **Error #26** (Line 72): 'setAutoSaveEnabled' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Setter not destructured
  - **Status**: ✅ Complete

- [x] **Error #27** (Line 103): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Already has proper type annotations
  - **Status**: ✅ Complete

- [x] **Error #28** (Line 150): React Hook useEffect has missing dependencies - react-hooks/exhaustive-deps
  - **Fix**: Added dependencies and wrapped handleSave in useCallback
  - **Status**: ✅ Complete

- [x] **Error #29** (Line 417): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Line no longer exists in file
  - **Status**: ✅ Complete

### File: ./src/app/(app)/lab/[id]/preview/route.tsx (2 errors)
- [x] **Error #30** (Line 2): 'HeroTwoColumn' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Already commented out
  - **Status**: ✅ Complete

- [x] **Error #31** (Line 80): 'error' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Removed error parameter from catch block
  - **Status**: ✅ Complete

### File: ./src/app/(app)/lab/new/page.tsx (2 errors)
- [ ] **Error #32** (Line 58): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #33** (Line 149): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/app/(app)/lab/page.tsx (1 error)
- [ ] **Error #34** (Line 70): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/app/(app)/lab/themes/[id]/page.tsx (1 error)
- [x] **Error #35** (Line 69): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replaced with `Error` type
  - **Status**: ✅ Complete

### File: ./src/app/(app)/lab/themes/new/page.tsx (1 error)
- [x] **Error #36** (Line 30): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replaced with `Parameters<typeof labDraftService.create>[0]`
  - **Status**: ✅ Complete

### File: ./src/app/(app)/library/page.tsx (3 errors)
- [ ] **Error #37** (Line 6): 'Card' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement Card usage
  - **Status**: ⏳ Pending

- [ ] **Error #38** (Line 6): 'CardContent' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement CardContent usage
  - **Status**: ⏳ Pending

- [ ] **Error #39** (Line 22): 'setSelectedCategory' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused setter or implement category selection
  - **Status**: ⏳ Pending

### File: ./src/app/(app)/project/[projectId]/settings/page.tsx (1 error)
- [ ] **Error #40** (Line 31): 'Globe' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement Globe icon usage
  - **Status**: ⏳ Pending

### File: ./src/app/(app)/tools/accounts/[id]/components/AccountActivity.tsx (1 error)
- [x] **Error #41** (Line 16): 'accountId' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Removed parameter from destructuring
  - **Status**: ✅ Complete

### File: ./src/app/(app)/tools/accounts/[id]/components/AccountOverview.tsx (2 errors)
- [x] **Error #42** (Line 18): 'Calendar' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Already fixed in previous session
  - **Status**: ✅ Complete

- [x] **Error #43** (Line 28): 'statsLoading' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Already fixed in previous session
  - **Status**: ✅ Complete

### File: ./src/app/(app)/tools/accounts/[id]/components/AccountSettings.tsx (5 errors)
- [x] **Error #44** (Line 64): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replaced with `Record<string, unknown>`
  - **Status**: ✅ Complete

- [x] **Error #45** (Line 76): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replaced with `Record<string, unknown>`
  - **Status**: ✅ Complete

- [x] **Error #46** (Line 183): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replaced with `Record<string, unknown>`
  - **Status**: ✅ Complete

- [x] **Error #47** (Line 343): Generic Object Injection Sink - security/detect-object-injection
  - **Fix**: Added proper type annotations to plan objects
  - **Status**: ✅ Complete

- [x] **Error #48** (Line 347): Generic Object Injection Sink - security/detect-object-injection
  - **Fix**: Added proper type annotations to plan objects
  - **Status**: ✅ Complete

- [x] **Error #49** (Line 351): Generic Object Injection Sink - security/detect-object-injection
  - **Fix**: Added proper type annotations to plan objects
  - **Status**: ✅ Complete

### File: ./src/app/(app)/tools/accounts/[id]/components/AccountUsers.tsx (1 error)
- [x] **Error #50** (Line 17): 'accountId' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Fixed by using underscore prefix
  - **Status**: ✅ Complete

### File: ./src/app/(app)/tools/accounts/[id]/page.tsx (4 errors)
- [x] **Error #51** (Line 8): 'useAccountStats' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Commented out unused import
  - **Status**: ✅ Complete

- [x] **Error #52** (Line 48): 'FolderOpen' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Commented out unused import
  - **Status**: ✅ Complete

- [x] **Error #53** (Line 53): 'Shield' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Commented out unused import
  - **Status**: ✅ Complete

- [x] **Error #54** (Line 73): 'updateAccount' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Variable is already commented out
  - **Status**: ✅ Complete

### File: ./src/app/(app)/tools/accounts/new/page.tsx (2 errors)
- [x] **Error #55** (Line 3): 'useState' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Already commented out in previous session
  - **Status**: ✅ Complete

- [x] **Error #56** (Line 66): 'watchName' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Already commented out in previous session
  - **Status**: ✅ Complete

### File: ./src/app/(app)/tools/accounts/page.tsx (7 errors)
- [x] **Error #57** (Line 48): 'bulkLoading' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Removed unused variable from destructuring
  - **Status**: ✅ Complete

- [x] **Error #58** (Line 128): React Hook "useAccountStatus" called in function "render" - react-hooks/rules-of-hooks
  - **Fix**: Renamed to `getAccountStatus` (not a React Hook)
  - **Status**: ✅ Complete

- [x] **Error #59** (Line 166): React Hook "useAccountStatus" called in function "show" - react-hooks/rules-of-hooks
  - **Fix**: Renamed to `getAccountStatus` (not a React Hook)
  - **Status**: ✅ Complete

- [x] **Error #60** (Line 174): React Hook "useAccountStatus" called in function "show" - react-hooks/rules-of-hooks
  - **Fix**: Renamed to `getAccountStatus` (not a React Hook)
  - **Status**: ✅ Complete

- [x] **Error #61** (Line 192): React Hook "useAccountStatus" cannot be called inside a callback - react-hooks/rules-of-hooks
  - **Fix**: Renamed to `getAccountStatus` (not a React Hook)
  - **Status**: ✅ Complete

- [x] **Error #62** (Line 205): React Hook "useAccountStatus" cannot be called inside a callback - react-hooks/rules-of-hooks
  - **Fix**: Renamed to `getAccountStatus` (not a React Hook)
  - **Status**: ✅ Complete

- [x] **Error #63** (Line 245): React Hook "useAccountStatus" cannot be called inside a callback - react-hooks/rules-of-hooks
  - **Fix**: Renamed to `getAccountStatus` (not a React Hook)
  - **Status**: ✅ Complete

- [x] **Error #64** (Line 250): React Hook "useAccountStatus" cannot be called inside a callback - react-hooks/rules-of-hooks
  - **Fix**: Renamed to `getAccountStatus` (not a React Hook)
  - **Status**: ✅ Complete

### File: ./src/app/(app)/tools/staff-assignments/page.tsx (2 errors)
- [x] **Error #65** (Line 13): 'Label' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Removed unused import
  - **Status**: ✅ Complete

- [x] **Error #66** (Line 25): 'Filter' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Removed unused import
  - **Status**: ✅ Complete

### File: ./src/app/(app)/tools/types/[id]/page.tsx (1 error)
- [ ] **Error #67** (Line 80): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/app/(app)/tools/types/new/page.tsx (2 errors)
- [ ] **Error #68** (Line 78): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #69** (Line 108): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/app/(app)/tools/types/page.tsx (3 errors)
- [x] **Error #70** (Line 36): 'cn' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Removed unused import
  - **Status**: ✅ Complete

- [x] **Error #71** (Line 170): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replaced with proper type interface
  - **Status**: ✅ Complete

- [x] **Error #72** (Line 171): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replaced with proper type interface
  - **Status**: ✅ Complete

### File: ./src/app/(app)/tools/users/[userId]/page.tsx (2 errors)
- [ ] **Error #73** (Line 41): 'XCircle' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement XCircle icon usage
  - **Status**: ⏳ Pending

- [ ] **Error #74** (Line 115): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/app/(app)/tools/users/page.tsx (6 errors)
- [x] **Error #75** (Line 43): 'XCircle' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Removed unused import
  - **Status**: ✅ Complete

- [x] **Error #76** (Line 52): 'updateUserRoles' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Commented out unused variable
  - **Status**: ✅ Complete

- [x] **Error #77** (Line 53): 'removeUsersFromAccount' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Commented out unused variable
  - **Status**: ✅ Complete

- [x] **Error #78** (Line 54): 'bulkLoading' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Commented out unused bulk operations hook
  - **Status**: ✅ Complete

- [x] **Error #79** (Line 358): 'getRoleBadgeColor' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Commented out unused function
  - **Status**: ✅ Complete

- [x] **Error #80** (Line 389): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replaced with proper role union type
  - **Status**: ✅ Complete

### File: ./src/app/api/accounts/create/route.ts (1 error)
- [x] **Error #81** (Line 24): 'slug' is never reassigned. Use 'const' instead - prefer-const
  - **Fix**: Changed `let slug` to `const slug`
  - **Status**: ✅ Complete

### File: ./src/app/api/accounts/route.ts (1 error)
- [x] **Error #82** (Line 7): 'request' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Removed unused parameter
  - **Status**: ✅ Complete

### File: ./src/app/api/auth/post-login/route.ts (1 error)
- [x] **Error #83** (Line 5): 'request' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Removed unused parameter
  - **Status**: ✅ Complete

### File: ./src/app/api/components/ui/[fileName]/route.ts (1 error)
- [x] **Error #84** (Line 38): 'error' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Removed unused error parameter from catch block
  - **Status**: ✅ Complete

### File: ./src/app/api/core-components/[id]/route.ts (1 error)
- [ ] **Error #85** (Line 134): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/app/api/debug/auth/route.ts (4 errors)
- [x] **Error #86** (Line 9): 'request' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Removed unused parameter
  - **Status**: ✅ Complete

- [x] **Error #87** (Line 13): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replaced with `Record<string, unknown>`
  - **Status**: ✅ Complete

- [x] **Error #88** (Line 143): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Fixed error handling with proper type checking
  - **Status**: ✅ Complete

- [x] **Error #89** (Line 245): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Fixed error handling with proper type checking
  - **Status**: ✅ Complete

### File: ./src/app/api/domains/[id]/add-to-vercel/route.ts (2 errors)
- [ ] **Error #90** (Line 46): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #91** (Line 65): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/app/api/domains/[id]/remove-from-vercel/route.ts (2 errors)
- [ ] **Error #92** (Line 36): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #93** (Line 45): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/app/api/domains/vercel-status/route.ts (1 error)
- [ ] **Error #94** (Line 14): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/app/api/email/stats/route.ts (1 error)  
- [ ] **Error #95** (Line 5): 'request' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused parameter or implement request handling
  - **Status**: ⏳ Pending

### File: ./src/app/api/invitations/route.ts (1 error)
- [ ] **Error #96** (Line 17): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/app/api/lab/[id]/route.ts (1 error)
- [ ] **Error #97** (Line 132): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/app/api/library/[id]/route.ts (1 error)
- [ ] **Error #98** (Line 81): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/app/api/platform/admins/route.ts (1 error)
- [ ] **Error #99** (Line 9): 'request' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused parameter or implement request handling
  - **Status**: ⏳ Pending

### File: ./src/app/api/platform/staff/route.ts (1 error)
- [ ] **Error #100** (Line 8): 'request' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused parameter or implement request handling
  - **Status**: ⏳ Pending

### File: ./src/app/api/projects/[id]/account/route.ts (2 errors)
- [ ] **Error #101** (Line 131): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #102** (Line 146): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/app/api/themes/[id]/route.ts (1 error)
- [ ] **Error #103** (Line 138): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/app/api/types/[id]/route.ts (3 errors)
- [ ] **Error #104** (Line 20): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #105** (Line 42): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #106** (Line 63): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/app/api/types/route.ts (2 errors)
- [ ] **Error #107** (Line 19): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #108** (Line 37): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/app/api/users/route.ts (1 error)
- [ ] **Error #109** (Line 7): 'request' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused parameter or implement request handling
  - **Status**: ⏳ Pending

### File: ./src/app/auth/verify-email/page.tsx (1 error)
- [ ] **Error #110** (Line 51): 'error' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused variable or implement error handling
  - **Status**: ⏳ Pending

### File: ./src/app/layout.tsx (1 error)
- [ ] **Error #111** (Line 8): Fast refresh only works when a file only exports components - react-refresh/only-export-components
  - **Fix**: Move non-component exports to separate file
  - **Status**: ⏳ Pending

### File: ./src/app/login/page.tsx (4 errors)
- [ ] **Error #112** (Line 12): 'CheckCircle2' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement CheckCircle2 icon usage
  - **Status**: ⏳ Pending

- [ ] **Error #113** (Line 22): 'router' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused variable or implement navigation
  - **Status**: ⏳ Pending

- [ ] **Error #114** (Line 87): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #115** (Line 115): 'error' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused variable or implement error handling
  - **Status**: ⏳ Pending

### File: ./src/app/setup/page.tsx (1 error)
- [ ] **Error #116** (Line 100): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/app/signup/page.tsx (4 errors)
- [ ] **Error #117** (Line 16): 'validatePassword' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement password validation
  - **Status**: ⏳ Pending

- [ ] **Error #118** (Line 31): 'success' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused variable or implement success state
  - **Status**: ⏳ Pending

- [ ] **Error #119** (Line 31): 'setSuccess' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused setter or implement success state
  - **Status**: ⏳ Pending

- [ ] **Error #120** (Line 86): React Hook useEffect has a missing dependency - react-hooks/exhaustive-deps
  - **Fix**: Add 'fieldErrors.email' to dependency array or remove it
  - **Status**: ⏳ Pending

- [ ] **Error #121** (Line 168): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/components/DomainSettings.tsx (6 errors)
- [ ] **Error #122** (Line 3): 'useEffect' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement useEffect
  - **Status**: ⏳ Pending

- [ ] **Error #123** (Line 6): 'CheckCircle' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement CheckCircle icon usage
  - **Status**: ⏳ Pending

- [ ] **Error #124** (Line 6): 'AlertTriangle' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement AlertTriangle icon usage
  - **Status**: ⏳ Pending

- [ ] **Error #125** (Line 7): 'useDomainStatus' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement domain status checking
  - **Status**: ⏳ Pending

- [ ] **Error #126** (Line 20): Unsafe Regular Expression - security/detect-unsafe-regex
  - **Fix**: Use safer regex pattern or validate input
  - **Status**: ⏳ Pending

- [ ] **Error #127** (Line 27): 'tld' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused variable or implement TLD validation
  - **Status**: ⏳ Pending

- [ ] **Error #128** (Line 74): 'selectedDomainId' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused variable or implement domain selection
  - **Status**: ⏳ Pending

- [ ] **Error #129** (Line 74): 'setSelectedDomainId' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused setter or implement domain selection
  - **Status**: ⏳ Pending

### File: ./src/components/DomainTroubleshootingGuide.tsx (3 errors)
- [ ] **Error #130** (Line 8): 'CheckCircle' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement CheckCircle icon usage
  - **Status**: ⏳ Pending

- [ ] **Error #131** (Line 9): 'XCircle' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement XCircle icon usage
  - **Status**: ⏳ Pending

- [ ] **Error #132** (Line 14): 'RefreshCw' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement RefreshCw icon usage
  - **Status**: ⏳ Pending

### File: ./src/components/auth/PermissionGate.tsx (2 errors)
- [ ] **Error #133** (Line 91): Generic Object Injection Sink - security/detect-object-injection
  - **Fix**: Validate object keys or use Map for safe property access
  - **Status**: ⏳ Pending

- [ ] **Error #134** (Line 92): Generic Object Injection Sink - security/detect-object-injection
  - **Fix**: Validate object keys or use Map for safe property access
  - **Status**: ⏳ Pending

### File: ./src/components/auth/__tests__/PermissionGate.test.tsx (3 errors)
- [ ] **Error #135** (Line 16): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface for test mocks
  - **Status**: ⏳ Pending

- [ ] **Error #136** (Line 17): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface for test mocks
  - **Status**: ⏳ Pending

- [ ] **Error #137** (Line 18): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface for test mocks
  - **Status**: ⏳ Pending

### File: ./src/components/builder/Canvas.tsx (3 errors)
- [x] **Error #138** (Line 3): 'BaseSectionProps' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Removed unused import
  - **Status**: ✅ Complete

- [x] **Error #139** (Line 14): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replaced with `Record<string, unknown>`
  - **Status**: ✅ Complete

- [x] **Error #140** (Line 23): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replaced with proper section type interface
  - **Status**: ✅ Complete

### File: ./src/components/builder/CanvasNavbar.tsx (1 error)
- [x] **Error #141** (Line 42): 'projectName' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Removed from interface and parameters
  - **Status**: ✅ Complete

### File: ./src/components/builder/SectionLibrary.tsx (2 errors)
- [x] **Error #142** (Line 13): 'Type' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Removed unused import
  - **Status**: ✅ Complete

- [x] **Error #143** (Line 67): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replaced with proper union type
  - **Status**: ✅ Complete

### File: ./src/components/builder/ThemeSelector.tsx (1 error)
- [x] **Error #144** (Line 14): 'cn' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Removed unused import
  - **Status**: ✅ Complete

### File: ./src/components/lab/resizable-preview.tsx (4 errors)
- [ ] **Error #145** (Line 5): 'GripVertical' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement GripVertical icon usage
  - **Status**: ⏳ Pending

- [ ] **Error #146** (Line 20): 'className' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused parameter or implement className usage
  - **Status**: ⏳ Pending

- [ ] **Error #147** (Line 23): 'defaultWidth' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused parameter or implement default width
  - **Status**: ⏳ Pending

- [ ] **Error #148** (Line 26): 'deviceView' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused variable or implement device view state
  - **Status**: ⏳ Pending

### File: ./src/components/navigation/ProjectDropdown.tsx (6 errors)
- [ ] **Error #149** (Line 15): 'getAccountProjects' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement project fetching
  - **Status**: ⏳ Pending

- [ ] **Error #150** (Line 18): 'Project' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement Project type usage
  - **Status**: ⏳ Pending

- [ ] **Error #151** (Line 21): 'user' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused variable or implement user display
  - **Status**: ⏳ Pending

- [ ] **Error #152** (Line 24): 'loading' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused variable or implement loading state
  - **Status**: ⏳ Pending

- [ ] **Error #153** (Line 24): 'setLoading' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused setter or implement loading state
  - **Status**: ⏳ Pending

- [ ] **Error #154** (Line 27): The 'projects' logical expression could make dependencies change - react-hooks/exhaustive-deps
  - **Fix**: Wrap 'projects' initialization in useMemo hook
  - **Status**: ⏳ Pending

### File: ./src/components/navigation/app-sidebar.tsx (12 errors)
- [ ] **Error #155** (Line 6): 'cn' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement className utility
  - **Status**: ⏳ Pending

- [ ] **Error #156** (Line 19): 'SidebarMenuSub' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement SidebarMenuSub usage
  - **Status**: ⏳ Pending

- [ ] **Error #157** (Line 20): 'SidebarMenuSubItem' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement SidebarMenuSubItem usage
  - **Status**: ⏳ Pending

- [ ] **Error #158** (Line 21): 'SidebarMenuSubButton' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement SidebarMenuSubButton usage
  - **Status**: ⏳ Pending

- [ ] **Error #159** (Line 26): 'Collapsible' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement Collapsible usage
  - **Status**: ⏳ Pending

- [ ] **Error #160** (Line 27): 'CollapsibleContent' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement CollapsibleContent usage
  - **Status**: ⏳ Pending

- [ ] **Error #161** (Line 28): 'CollapsibleTrigger' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement CollapsibleTrigger usage
  - **Status**: ⏳ Pending

- [ ] **Error #162** (Line 40): 'ChevronRight' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement ChevronRight icon usage
  - **Status**: ⏳ Pending

- [ ] **Error #163** (Line 58): 'AvatarImage' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement AvatarImage usage
  - **Status**: ⏳ Pending

- [ ] **Error #164** (Line 65): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #165** (Line 168): 'pathname' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused variable or implement pathname usage
  - **Status**: ⏳ Pending

- [ ] **Error #166** (Line 171): 'localUser' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused variable or implement local user state
  - **Status**: ⏳ Pending

### File: ./src/components/pages/PageCreationDialog.tsx (2 errors)
- [ ] **Error #167** (Line 63): Unnecessary escape character: \\/ - no-useless-escape
  - **Fix**: Remove unnecessary backslash before forward slash
  - **Status**: ⏳ Pending

- [ ] **Error #168** (Line 85): 'page' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused variable or implement page handling
  - **Status**: ⏳ Pending

### File: ./src/components/pages/PageDuplicationDialog.tsx (1 error)
- [ ] **Error #169** (Line 55): Unnecessary escape character: \\/ - no-useless-escape
  - **Fix**: Remove unnecessary backslash before forward slash
  - **Status**: ⏳ Pending

### File: ./src/components/pages/PageList.tsx (3 errors)
- [ ] **Error #170** (Line 20): 'DropdownMenuSeparator' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement DropdownMenuSeparator usage
  - **Status**: ⏳ Pending

- [ ] **Error #171** (Line 47): 'ExternalLink' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement ExternalLink icon usage
  - **Status**: ⏳ Pending

- [ ] **Error #172** (Line 106): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/components/pages/PageSettingsDialog.tsx (2 errors)
- [ ] **Error #173** (Line 39): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #174** (Line 51): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/components/sections/hero-two-column.tsx (2 errors)
- [ ] **Error #175** (Line 27): 'buttonLink' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused variable or implement button link functionality
  - **Status**: ⏳ Pending

- [ ] **Error #176** (Line 33): 'onButtonLinkChange' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused parameter or implement button link change handler
  - **Status**: ⏳ Pending

### File: ./src/components/sections/index.tsx (6 errors)
- [ ] **Error #177** (Line 10): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #178** (Line 12): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #179** (Line 16): Fast refresh only works when a file only exports components - react-refresh/only-export-components
  - **Fix**: Move non-component exports to separate file
  - **Status**: ⏳ Pending

- [ ] **Error #180** (Line 26): 'onContentChange' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused parameter or implement content change handler
  - **Status**: ⏳ Pending

- [ ] **Error #181** (Line 45): Fast refresh only works when a file only exports components - react-refresh/only-export-components
  - **Fix**: Move non-component exports to separate file
  - **Status**: ⏳ Pending

- [ ] **Error #182** (Line 47): Generic Object Injection Sink - security/detect-object-injection
  - **Fix**: Validate object keys or use Map for safe property access
  - **Status**: ⏳ Pending

### File: ./src/components/settings/EmailPreferencesForm.tsx (2 errors)
- [ ] **Error #183** (Line 62): 'hasChanges' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused variable or implement change detection
  - **Status**: ⏳ Pending

- [ ] **Error #184** (Line 89): 'error' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused variable or implement error handling
  - **Status**: ⏳ Pending

### File: ./src/components/settings/SecuritySettings.tsx (2 errors)
- [ ] **Error #185** (Line 8): 'Separator' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement Separator usage
  - **Status**: ⏳ Pending

- [ ] **Error #186** (Line 13): 'isChangingPassword' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused variable or implement password change state
  - **Status**: ⏳ Pending

### File: ./src/components/theme-builder/theme-preview.tsx (2 errors)
- [ ] **Error #187** (Line 11): 'Upload' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement Upload icon usage
  - **Status**: ⏳ Pending

- [ ] **Error #188** (Line 14): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/components/tools/AssignStaffDialog.tsx (3 errors)
- [ ] **Error #189** (Line 25): 'Check' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement Check icon usage
  - **Status**: ⏳ Pending

- [ ] **Error #190** (Line 26): 'X' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement X icon usage
  - **Status**: ⏳ Pending

- [ ] **Error #191** (Line 99): 'error' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused variable or implement error handling
  - **Status**: ⏳ Pending

### File: ./src/components/tools/user-accounts-dialog.tsx (1 error)
- [ ] **Error #192** (Line 50): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/components/ui/badge.tsx (1 error)
- [ ] **Error #193** (Line 36): Fast refresh only works when a file only exports components - react-refresh/only-export-components
  - **Fix**: Move non-component exports to separate file
  - **Status**: ⏳ Pending

### File: ./src/components/ui/button.tsx (1 error)
- [ ] **Error #194** (Line 56): Fast refresh only works when a file only exports components - react-refresh/only-export-components
  - **Fix**: Move non-component exports to separate file
  - **Status**: ⏳ Pending

### File: ./src/components/ui/enhanced-table.tsx (6 errors)
- [ ] **Error #195** (Line 18): 'Trash2' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement Trash2 icon usage
  - **Status**: ⏳ Pending

- [ ] **Error #196** (Line 19): 'Edit' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement Edit icon usage
  - **Status**: ⏳ Pending

- [ ] **Error #197** (Line 20): 'Eye' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement Eye icon usage
  - **Status**: ⏳ Pending

- [ ] **Error #198** (Line 35): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #199** (Line 112): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #200** (Line 123): Variable Assigned to Object Injection Sink - security/detect-object-injection
  - **Fix**: Validate object keys or use Map for safe property access
  - **Status**: ⏳ Pending

- [ ] **Error #201** (Line 123): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #202** (Line 325): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/components/ui/logo.tsx (3 errors)
- [ ] **Error #203** (Line 17): Generic Object Injection Sink - security/detect-object-injection
  - **Fix**: Validate object keys or use Map for safe property access
  - **Status**: ⏳ Pending

- [ ] **Error #204** (Line 32): Generic Object Injection Sink - security/detect-object-injection
  - **Fix**: Validate object keys or use Map for safe property access
  - **Status**: ⏳ Pending

- [ ] **Error #205** (Line 33): Generic Object Injection Sink - security/detect-object-injection
  - **Fix**: Validate object keys or use Map for safe property access
  - **Status**: ⏳ Pending

### File: ./src/components/ui/navigation-menu.tsx (1 error)
- [ ] **Error #206** (Line 119): Fast refresh only works when a file only exports components - react-refresh/only-export-components
  - **Fix**: Move non-component exports to separate file
  - **Status**: ⏳ Pending

### File: ./src/components/ui/sidebar.tsx (1 error)
- [ ] **Error #207** (Line 772): Fast refresh only works when a file only exports components - react-refresh/only-export-components
  - **Fix**: Move non-component exports to separate file
  - **Status**: ⏳ Pending

### File: ./src/components/ui/toggle.tsx (1 error)
- [ ] **Error #208** (Line 45): Fast refresh only works when a file only exports components - react-refresh/only-export-components
  - **Fix**: Move non-component exports to separate file
  - **Status**: ⏳ Pending

### File: ./src/components/ui/use-toast.ts (1 error)
- [ ] **Error #209** (Line 16): 'actionTypes' is assigned a value but only used as a type - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused variable or mark as type-only
  - **Status**: ⏳ Pending

### File: ./src/emails/base-template.tsx (1 error)
- [ ] **Error #210** (Line 30): 'brandColor' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused variable or implement brand color usage
  - **Status**: ⏳ Pending

### File: ./src/hooks/__tests__/useEmailPreferences.test.ts (1 error)
- [ ] **Error #211** (Line 39): Parsing error: '>' expected - Parsing error
  - **Fix**: Fix TypeScript syntax error in test file
  - **Status**: ⏳ Pending

### File: ./src/hooks/__tests__/useStaffAssignments.test.ts (1 error)  
- [ ] **Error #212** (Line 40): Parsing error: '>' expected - Parsing error
  - **Fix**: Fix TypeScript syntax error in test file
  - **Status**: ⏳ Pending

### File: ./src/hooks/use-themes.ts (1 error)
- [ ] **Error #213** (Line 114): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/hooks/useAccountUsers.ts (1 error)
- [ ] **Error #214** (Line 10): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/hooks/useAccounts.ts (2 errors)
- [ ] **Error #215** (Line 18): 'AccountStats' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement AccountStats usage
  - **Status**: ⏳ Pending

- [ ] **Error #216** (Line 248): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/hooks/useDomains.ts (1 error)
- [ ] **Error #217** (Line 125): 'domainId' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused parameter or implement domain ID usage
  - **Status**: ⏳ Pending

### File: ./src/hooks/useEmailPreferences.ts (1 error)
- [ ] **Error #218** (Line 4): 'toast' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement toast notifications
  - **Status**: ⏳ Pending

### File: ./src/hooks/useInvitations.ts (3 errors)
- [ ] **Error #219** (Line 4): 'AccountInvitation' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement AccountInvitation type usage
  - **Status**: ⏳ Pending

- [ ] **Error #220** (Line 126): 'accountId' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused parameter or implement account filtering
  - **Status**: ⏳ Pending

- [ ] **Error #221** (Line 157): 'accountId' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused parameter or implement account filtering
  - **Status**: ⏳ Pending

### File: ./src/hooks/usePages.ts (3 errors)
- [ ] **Error #222** (Line 10): 'CreatePageData' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement CreatePageData type usage
  - **Status**: ⏳ Pending

- [ ] **Error #223** (Line 200): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #224** (Line 218): 'data' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused variable or implement data handling
  - **Status**: ⏳ Pending

### File: ./src/hooks/usePermissions.ts (3 errors)
- [ ] **Error #225** (Line 96): Generic Object Injection Sink - security/detect-object-injection
  - **Fix**: Validate object keys or use Map for safe property access
  - **Status**: ⏳ Pending

- [ ] **Error #226** (Line 113): Generic Object Injection Sink - security/detect-object-injection
  - **Fix**: Validate object keys or use Map for safe property access
  - **Status**: ⏳ Pending

- [ ] **Error #227** (Line 121): Generic Object Injection Sink - security/detect-object-injection
  - **Fix**: Validate object keys or use Map for safe property access
  - **Status**: ⏳ Pending

### File: ./src/hooks/useProjects.ts (1 error)
- [ ] **Error #228** (Line 15): 'CreateProjectData' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement CreateProjectData type usage
  - **Status**: ⏳ Pending

### File: ./src/hooks/useThemes.ts (3 errors)
- [ ] **Error #229** (Line 3): 'Theme' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement Theme type usage
  - **Status**: ⏳ Pending

- [ ] **Error #230** (Line 27): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #231** (Line 31): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/hooks/useUsers.ts (1 error)
- [ ] **Error #232** (Line 7): 'UserInvitation' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement UserInvitation type usage
  - **Status**: ⏳ Pending

### File: ./src/lib/permissions/__tests__/permissions.test.ts (2 errors)
- [ ] **Error #233** (Line 3): 'mockRoles' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused variable or implement test data usage
  - **Status**: ⏳ Pending

- [ ] **Error #234** (Line 7): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface for test mocks
  - **Status**: ⏳ Pending

### File: ./src/lib/permissions/index.ts (9 errors)
- [ ] **Error #235** (Line 10): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #236** (Line 28): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #237** (Line 45): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #238** (Line 60): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #239** (Line 71): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #240** (Line 86): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #241** (Line 122): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #242** (Line 135): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #243** (Line 181): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/lib/permissions/server-checks.ts (2 errors)
- [ ] **Error #244** (Line 2): 'createAdminClient' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement admin client usage
  - **Status**: ⏳ Pending

- [ ] **Error #245** (Line 58): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/lib/services/__tests__/email-integration.test.ts (6 errors)
- [ ] **Error #246** (Line 5): 'render' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement render usage in tests
  - **Status**: ⏳ Pending

- [ ] **Error #247** (Line 25): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface for test mocks
  - **Status**: ⏳ Pending

- [ ] **Error #248** (Line 26): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface for test mocks
  - **Status**: ⏳ Pending

- [ ] **Error #249** (Line 53): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface for test mocks
  - **Status**: ⏳ Pending

- [ ] **Error #250** (Line 56): A `require()` style import is forbidden - @typescript-eslint/no-require-imports
  - **Fix**: Replace require() with ES module import
  - **Status**: ⏳ Pending

- [ ] **Error #251** (Line 289): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface for test mocks
  - **Status**: ⏳ Pending

- [ ] **Error #252** (Line 347): 'staffAssignment' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused variable or implement test assertion
  - **Status**: ⏳ Pending

### File: ./src/lib/services/__tests__/email.test.ts (12 errors)
- [ ] **Error #253** (Line 32): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface for test mocks
  - **Status**: ⏳ Pending

- [ ] **Error #254** (Line 33): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface for test mocks
  - **Status**: ⏳ Pending

- [ ] **Error #255** (Line 34): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface for test mocks
  - **Status**: ⏳ Pending

- [ ] **Error #256** (Line 37): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface for test mocks
  - **Status**: ⏳ Pending

- [ ] **Error #257** (Line 38): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface for test mocks
  - **Status**: ⏳ Pending

- [ ] **Error #258** (Line 39): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface for test mocks
  - **Status**: ⏳ Pending

- [ ] **Error #259** (Line 40): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface for test mocks
  - **Status**: ⏳ Pending

- [ ] **Error #260** (Line 41): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface for test mocks
  - **Status**: ⏳ Pending

- [ ] **Error #261** (Line 71): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface for test mocks
  - **Status**: ⏳ Pending

- [ ] **Error #262** (Line 167): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface for test mocks
  - **Status**: ⏳ Pending

- [ ] **Error #263** (Line 645): Generic Object Injection Sink - security/detect-object-injection
  - **Fix**: Validate object keys or use Map for safe property access
  - **Status**: ⏳ Pending

- [ ] **Error #264** (Line 722): Generic Object Injection Sink - security/detect-object-injection
  - **Fix**: Validate object keys or use Map for safe property access
  - **Status**: ⏳ Pending

- [ ] **Error #265** (Line 722): Function Call Object Injection Sink - security/detect-object-injection
  - **Fix**: Validate function calls with dynamic property access
  - **Status**: ⏳ Pending

### File: ./src/lib/services/domain-verification.ts (6 errors)
- [ ] **Error #266** (Line 1): 'createClient' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement client usage
  - **Status**: ⏳ Pending

- [ ] **Error #267** (Line 2): 'env' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement environment usage
  - **Status**: ⏳ Pending

- [ ] **Error #268** (Line 6): 'VerificationAttempt' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement VerificationAttempt type usage
  - **Status**: ⏳ Pending

- [ ] **Error #269** (Line 39): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #270** (Line 57): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #271** (Line 112): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/lib/services/domains-broken.ts (2 errors)
- [ ] **Error #272** (Line 37): 'sslState' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused variable or implement SSL state handling
  - **Status**: ⏳ Pending

- [ ] **Error #273** (Line 64): Unsafe Regular Expression - security/detect-unsafe-regex
  - **Fix**: Use safer regex pattern or validate input
  - **Status**: ⏳ Pending

### File: ./src/lib/services/domains.ts (2 errors)
- [ ] **Error #274** (Line 37): 'sslState' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused variable or implement SSL state handling
  - **Status**: ⏳ Pending

- [ ] **Error #275** (Line 64): Unsafe Regular Expression - security/detect-unsafe-regex
  - **Fix**: Use safer regex pattern or validate input
  - **Status**: ⏳ Pending

### File: ./src/lib/services/email.ts (6 errors)
- [ ] **Error #276** (Line 34): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #277** (Line 45): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #278** (Line 61): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #279** (Line 287): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #280** (Line 289): Generic Object Injection Sink - security/detect-object-injection
  - **Fix**: Validate object keys or use Map for safe property access
  - **Status**: ⏳ Pending

- [ ] **Error #281** (Line 289): Function Call Object Injection Sink - security/detect-object-injection
  - **Fix**: Validate function calls with dynamic property access
  - **Status**: ⏳ Pending

- [ ] **Error #282** (Line 344): 'data' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused variable or implement data handling
  - **Status**: ⏳ Pending

- [ ] **Error #283** (Line 368): Generic Object Injection Sink - security/detect-object-injection
  - **Fix**: Validate object keys or use Map for safe property access
  - **Status**: ⏳ Pending

### File: ./src/lib/services/invitations.ts (1 error)
- [ ] **Error #284** (Line 4): 'InvitationEmail' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement InvitationEmail usage
  - **Status**: ⏳ Pending

### File: ./src/lib/services/pages.ts (2 errors)
- [ ] **Error #285** (Line 216): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #286** (Line 243): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/lib/services/projects.ts (1 error)
- [ ] **Error #287** (Line 463): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/lib/services/users.server.ts (3 errors)
- [ ] **Error #288** (Line 2): 'createSupabaseServerClient' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement server client usage
  - **Status**: ⏳ Pending

- [ ] **Error #289** (Line 15): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #290** (Line 24): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/lib/services/users.ts (2 errors)
- [ ] **Error #291** (Line 195): 'existingUser' is assigned a value but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused variable or implement user validation
  - **Status**: ⏳ Pending

- [ ] **Error #292** (Line 240): 'accountId' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused parameter or implement account filtering
  - **Status**: ⏳ Pending

### File: ./src/lib/supabase/auth.ts (2 errors)
- [ ] **Error #293** (Line 57): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #294** (Line 57): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/lib/supabase/core-components.ts (1 error)
- [ ] **Error #295** (Line 11): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/lib/supabase/lab-drafts.ts (2 errors)
- [ ] **Error #296** (Line 5): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #297** (Line 96): 'updatePayload' is never reassigned. Use 'const' instead - prefer-const
  - **Fix**: Change `let updatePayload` to `const updatePayload`
  - **Status**: ⏳ Pending

- [ ] **Error #298** (Line 96): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/lib/supabase/server.ts (2 errors)
- [ ] **Error #299** (Line 19): 'error' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused variable or implement error handling
  - **Status**: ⏳ Pending

- [ ] **Error #300** (Line 28): 'error' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused variable or implement error handling
  - **Status**: ⏳ Pending

### File: ./src/lib/supabase/themes.ts (1 error)
- [ ] **Error #301** (Line 162): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/lib/supabase/types.ts (4 errors)
- [ ] **Error #302** (Line 10): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #303** (Line 11): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #304** (Line 19): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #305** (Line 20): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/lib/theme-utils.ts (8 errors)
- [ ] **Error #306** (Line 28): Generic Object Injection Sink - security/detect-object-injection
  - **Fix**: Validate object keys or use Map for safe property access
  - **Status**: ⏳ Pending

- [ ] **Error #307** (Line 31): Generic Object Injection Sink - security/detect-object-injection
  - **Fix**: Validate object keys or use Map for safe property access
  - **Status**: ⏳ Pending

- [ ] **Error #308** (Line 34): Generic Object Injection Sink - security/detect-object-injection
  - **Fix**: Validate object keys or use Map for safe property access
  - **Status**: ⏳ Pending

- [ ] **Error #309** (Line 37): Generic Object Injection Sink - security/detect-object-injection
  - **Fix**: Validate object keys or use Map for safe property access
  - **Status**: ⏳ Pending

- [ ] **Error #310** (Line 40): Generic Object Injection Sink - security/detect-object-injection
  - **Fix**: Validate object keys or use Map for safe property access
  - **Status**: ⏳ Pending

- [ ] **Error #311** (Line 43): Generic Object Injection Sink - security/detect-object-injection
  - **Fix**: Validate object keys or use Map for safe property access
  - **Status**: ⏳ Pending

- [ ] **Error #312** (Line 46): Generic Object Injection Sink - security/detect-object-injection
  - **Fix**: Validate object keys or use Map for safe property access
  - **Status**: ⏳ Pending

- [ ] **Error #313** (Line 49): Generic Object Injection Sink - security/detect-object-injection
  - **Fix**: Validate object keys or use Map for safe property access
  - **Status**: ⏳ Pending

### File: ./src/lib/validation/password.ts (3 errors)
- [ ] **Error #314** (Line 26): Unnecessary escape character: \\[ - no-useless-escape
  - **Fix**: Remove unnecessary backslash before bracket
  - **Status**: ⏳ Pending

- [ ] **Error #315** (Line 26): Unnecessary escape character: \\/ - no-useless-escape
  - **Fix**: Remove unnecessary backslash before forward slash
  - **Status**: ⏳ Pending

- [ ] **Error #316** (Line 85): Unsafe Regular Expression - security/detect-unsafe-regex
  - **Fix**: Use safer regex pattern or validate input
  - **Status**: ⏳ Pending

- [ ] **Error #317** (Line 85): Unnecessary escape character: \\/ - no-useless-escape
  - **Fix**: Remove unnecessary backslash before forward slash
  - **Status**: ⏳ Pending

### File: ./src/providers/auth-provider.tsx (2 errors)
- [ ] **Error #318** (Line 117): React Hook useEffect has a missing dependency - react-hooks/exhaustive-deps
  - **Fix**: Add 'fetchAccounts' to dependency array or remove it
  - **Status**: ⏳ Pending

- [ ] **Error #319** (Line 152): Fast refresh only works when a file only exports components - react-refresh/only-export-components
  - **Fix**: Move non-component exports to separate file
  - **Status**: ⏳ Pending

### File: ./src/test/utils/permission-helpers.ts (5 errors)
- [ ] **Error #320** (Line 97): Generic Object Injection Sink - security/detect-object-injection
  - **Fix**: Validate object keys or use Map for safe property access
  - **Status**: ⏳ Pending

- [ ] **Error #321** (Line 101): '_' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused parameter or prefix with underscore
  - **Status**: ⏳ Pending

- [ ] **Error #322** (Line 121): Generic Object Injection Sink - security/detect-object-injection
  - **Fix**: Validate object keys or use Map for safe property access
  - **Status**: ⏳ Pending

- [ ] **Error #323** (Line 125): Generic Object Injection Sink - security/detect-object-injection
  - **Fix**: Validate object keys or use Map for safe property access
  - **Status**: ⏳ Pending

- [ ] **Error #324** (Line 125): Generic Object Injection Sink - security/detect-object-injection
  - **Fix**: Validate object keys or use Map for safe property access
  - **Status**: ⏳ Pending

- [ ] **Error #325** (Line 185): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface for test utilities
  - **Status**: ⏳ Pending

- [ ] **Error #326** (Line 194): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface for test utilities
  - **Status**: ⏳ Pending

### File: ./src/test/utils/supabase-mocks.ts (11 errors)
- [ ] **Error #327** (Line 3): 'PLATFORM_ACCOUNT_ID' is defined but never used - @typescript-eslint/no-unused-vars
  - **Fix**: Remove unused import or implement platform account usage
  - **Status**: ⏳ Pending

- [ ] **Error #328** (Line 34): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface for test mocks
  - **Status**: ⏳ Pending

- [ ] **Error #329** (Line 43): Unexpected lexical declaration in case block - no-case-declarations
  - **Fix**: Wrap case block content in braces or move declaration outside
  - **Status**: ⏳ Pending

- [ ] **Error #330** (Line 140): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface for test mocks
  - **Status**: ⏳ Pending

- [ ] **Error #331** (Line 140): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface for test mocks
  - **Status**: ⏳ Pending

- [ ] **Error #332** (Line 142): Generic Object Injection Sink - security/detect-object-injection
  - **Fix**: Validate object keys or use Map for safe property access
  - **Status**: ⏳ Pending

- [ ] **Error #333** (Line 152): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any  
  - **Fix**: Replace `any` with proper TypeScript interface for test mocks
  - **Status**: ⏳ Pending

- [ ] **Error #334** (Line 152): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface for test mocks
  - **Status**: ⏳ Pending

- [ ] **Error #335** (Line 153): Generic Object Injection Sink - security/detect-object-injection
  - **Fix**: Validate object keys or use Map for safe property access
  - **Status**: ⏳ Pending

- [ ] **Error #336** (Line 157): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface for test mocks
  - **Status**: ⏳ Pending

- [ ] **Error #337** (Line 157): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface for test mocks
  - **Status**: ⏳ Pending

- [ ] **Error #338** (Line 162): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface for test mocks
  - **Status**: ⏳ Pending

### File: ./src/types/builder.ts (15 errors)
- [ ] **Error #339** (Line 9): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #340** (Line 10): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #341** (Line 24): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #342** (Line 35): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #343** (Line 40): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #344** (Line 52): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #345** (Line 104): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #346** (Line 115): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #347** (Line 121): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #348** (Line 132): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #349** (Line 142): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #350** (Line 156): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #351** (Line 172): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #352** (Line 173): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #353** (Line 175): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

### File: ./src/types/database.ts (2 errors)
- [ ] **Error #354** (Line 130): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

- [ ] **Error #355** (Line 152): Unexpected any. Specify a different type - @typescript-eslint/no-explicit-any
  - **Fix**: Replace `any` with proper TypeScript interface
  - **Status**: ⏳ Pending

---

## Summary by Error Type

### @typescript-eslint/no-unused-vars (115 errors)
Files with unused variables, imports, or parameters that need cleanup.

### @typescript-eslint/no-explicit-any (119 errors)  
Files using `any` type that need proper TypeScript interfaces.

### security/detect-object-injection (25 errors)
Files with potential security vulnerabilities from dynamic object access.

### react-hooks/rules-of-hooks (7 errors)
Files with improper React Hook usage that violates Rules of Hooks.

### react-hooks/exhaustive-deps (4 errors)
Files with useEffect hooks missing dependencies.

### react-refresh/only-export-components (8 errors)
Files mixing component and non-component exports affecting Fast Refresh.

### no-useless-escape (5 errors)
Files with unnecessary escape characters in regex patterns.

### security/detect-unsafe-regex (4 errors)
Files with potentially unsafe regular expressions.

### prefer-const (2 errors)
Files using `let` for variables that are never reassigned.

### no-case-declarations (1 error)
File with lexical declaration in case block without braces.

### @typescript-eslint/no-require-imports (1 error)
File using `require()` instead of ES module imports.

### Parsing errors (2 errors)
Files with TypeScript syntax errors.

---

**Next Steps:**
1. Use this document to track progress on each individual error
2. Update status from ⏳ Pending → 🔄 In Progress → ✅ Complete as work progresses
3. Focus on high-impact error types first (security, hooks, unused variables)
4. Consider bulk fixing similar error patterns across multiple files