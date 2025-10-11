# Test Components

This folder is for building and testing sections BEFORE importing to CORE.

## Workflow

1. **Build component here** (nav-1.tsx, footer-1.tsx, hero-1.tsx, etc.)
2. **Test via dynamic route** (http://localhost:3000/admin/tests/[section-name])
3. **Iterate until perfect**
4. **Copy code to CORE "Add Section"**
5. **Pipeline creates production file** in core/sections/
6. **Delete test file** (no longer needed)

## Important

- Never import these files into production
- Pipeline ignores this folder
- Clean up after importing to CORE

## Why Separate from `core/sections/`?

**Problem:**
- CORE pipeline auto-generates files in `core/sections/` with auto-naming
- Building directly in `core/sections/` would create naming conflicts
- Pipeline files should only come from pipeline

**Solution:**
- Build in `test/` folder (pipeline ignores this)
- Test via dedicated test pages
- Iterate until perfect
- Copy code to CORE "Add Section"
- Pipeline creates production file with correct naming
- Delete `test/` version

## Example

**Step 1: Build in Test Folder**
```bash
# Create component
/src/components/test/nav-1.tsx
```

**Step 2: Test via Dynamic Route**
View at: http://localhost:3000/admin/tests/nav-1

**Step 3: Iterate**
- View in browser
- Get feedback
- Edit `test/nav-1.tsx`
- Refresh browser
- Repeat until perfect

**Step 4: Import to CORE**
1. Copy code from `test/nav-1.tsx`
2. Go to http://localhost:3000/core
3. Click "Add Section"
4. Paste code
5. Pipeline creates: `core/sections/navbar1.tsx` (or navbar2, etc.)

**Step 5: Clean Up**
- Delete `test/nav-1.tsx`
- Production file is in `core/sections/`
