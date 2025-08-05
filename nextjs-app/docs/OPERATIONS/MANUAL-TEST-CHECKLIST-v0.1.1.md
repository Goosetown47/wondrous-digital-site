# Manual Testing Checklist - v0.1.1

## Draft/Publish System Refactor Testing

### Auto-Save Functionality
- [x] Edit text in a section
  - Verify "Saving..." appears within 2 seconds
  - Verify changes to "Saved" 
  - Confirm content persists after page refresh

- [x] Add a new section
  - Verify auto-save triggers
  - Refresh and confirm section remains

- [x] Delete a section
  - Verify auto-save triggers
  - Refresh and confirm deletion persists

- [ ] Reorder sections (this functionality doesn't exist yet)
  - Drag and drop sections
  - Verify auto-save triggers
  - Refresh and confirm new order

### Draft/Publish Workflow
- [x] Make edits to a page
  - Verify "Unpublished changes" badge appears
  - Open preview - confirm shows draft content
  - Open live site in new tab - confirm shows old published content

- [x] Click Publish button
  - Verify "Publishing..." status appears
  - Verify "Unpublished changes" badge disappears
  - Refresh live site - confirm new content appears

- [x] Test ESC key in edit mode
  - Click to edit text
  - Type new content
  - Press ESC
  - Verify original content restored
  - Verify no "Unpublished changes" badge

### Change Detection Accuracy
- [x] Click edit but don't change
  - Click to edit heading
  - Click save without changes
  - Verify NO "Unpublished changes" badge

- [x] Switch between pages
  - Edit Page A
  - Switch to Page B (no edits)
  - Verify Page B shows NO badge
  - Switch back to Page A
  - Verify Page A still shows badge

- [x] Test property order independence
  - Make an edit and publish
  - Refresh page
  - Verify NO false positive badge

### Edge Cases
- [x] Network interruption
  - Disable network
  - Make an edit
  - Verify save error indicator
  - Re-enable network
  - Verify auto-recovery

- [x] Multiple rapid edits
  - Type quickly in multiple fields
  - Verify debouncing works (not saving on every keystroke)
  - Verify final state saves correctly

- [x] Large content
  - Add many sections (10+)
  - Verify performance remains good
  - Verify save/publish works

### Theme Integration
- [x] Change theme
  - Verify auto-save triggers
  - Verify theme change requires publish
  - Publish and verify theme applies to live site

### Data Integrity
- [x] Draft isolation
  - Edit in one browser
  - Open builder in another browser
  - Verify both see same draft
  - Publish in one
  - Verify other updates

## Sign-off
- [x] All tests pass
- [x] No console errors during testing
- [x] Performance acceptable
- [x] User experience smooth

Tested by: _______________
Date: _______________
Version: v0.1.1