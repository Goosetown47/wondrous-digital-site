# Admin Management UI Updates

## Summary of Changes

### 1. Database Updates
- Updated all existing customer accounts to have `account_type = 'prospect'`
- Updated all existing projects to have `project_status = 'draft'`

### 2. New Reusable Components

#### StatusDropdown Component (`/src/components/admin/StatusDropdown.tsx`)
- Generic dropdown component for status changes
- Supports confirmation flow before applying changes
- Visual feedback with colored badges
- Used for both account types and project statuses

#### ActionButton Component (`/src/components/admin/ActionButton.tsx`)
- Icon-based action button with tooltip on hover
- Supports default and danger variants
- Replaces three-dot menus with visible action icons

### 3. AccountsPage Updates (`/src/pages/admin/AccountsPage.tsx`)

#### Tab Count Fixes
- Added `fetchTabCounts()` function that queries all accounts once
- Stores counts in state: `{ prospects: 0, customers: 0, inactive: 0 }`
- Tab counts now show correct totals regardless of current tab

#### UI Improvements
- Replaced "Status" column with "Account Type" dropdown
- Added StatusDropdown for changing account types with confirmation
- Replaced three-dot menu with visible action icons:
  - View Details (Eye icon)
  - Edit Account (Edit icon)
  - Convert to Customer (Arrow icon - only for prospects)
  - Delete Account (Trash icon - red color)

### 4. ProjectsPage Updates (`/src/pages/admin/ProjectsPage.tsx`)

#### Tab Count Fixes
- Added `fetchTabCounts()` function using `project_management_view`
- Stores counts in state: `{ draft: 0, active: 0, archive: 0 }`
- Tab counts show correct totals for each category

#### UI Improvements
- Replaced static status badge with StatusDropdown component
- StatusDropdown includes all 8 project statuses with appropriate colors
- Replaced three-dot menu with visible action icons:
  - View/Edit Project (Eye icon)
  - Clone Project (Copy icon)
  - Deploy Project (Rocket icon - when not deployed)
  - Set to Maintenance (Pause icon - for live customers)
  - Archive Project (Archive icon - when not archived)
  - Delete Project (Trash icon - red color)

### 5. Key Features Implemented

1. **Dynamic Tab Data**: Each tab now queries Supabase directly for its data instead of filtering client-side
2. **Correct Tab Counts**: Tab badges show total counts for each category, not filtered results
3. **Visible Actions**: All actions are now visible as icon buttons with tooltips
4. **Status Dropdowns**: Both pages use dropdowns with confirmation for status changes
5. **Improved UX**: Cleaner interface with better visual feedback

### 6. TypeScript Compliance
- All new components are fully typed
- Build passes without TypeScript errors
- Existing linting issues are in other files, not our changes

## Next Steps
The Admin Management UI is now more intuitive and efficient. The next phase would be:
1. Implement actual View/Edit functionality for accounts and projects
2. Add delete functionality with proper cascading
3. Implement the Templates page (currently in progress in todo list)
4. Add Netlify integration for deployment features