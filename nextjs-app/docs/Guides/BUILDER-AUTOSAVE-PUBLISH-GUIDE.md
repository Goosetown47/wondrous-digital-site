# Builder Auto-Save & Draft/Publish Guide

## Overview
Starting with v0.1.1, the builder includes automatic saving and a draft/publish workflow to protect your live site while editing.

## Auto-Save Feature

### How It Works
- **Automatic**: Content saves automatically every 2 seconds after you make changes
- **Visual Feedback**: Look for the save indicator in the top navigation bar
  - "Saving..." - Your changes are being saved
  - "Saved" - Changes successfully saved
  - Red indicator - Save failed (rare, usually network issues)

### What Gets Auto-Saved
- All content edits (text, images, settings)
- Section additions and deletions
- Section reordering
- Theme changes

### Important Notes
- No need to manually save anymore
- If you lose connection, changes may not save until reconnected
- Closing the browser/tab is safe once you see "Saved"

## Draft/Publish Workflow

### Understanding Draft vs Published
- **Draft Content**: What you see in the builder and preview
- **Published Content**: What visitors see on your live site
- **Unpublished Changes**: Indicator shows when draft differs from published

### How to Use

1. **Edit Freely**: Make all your changes in the builder
   - Changes auto-save to draft
   - Live site remains unchanged

2. **Preview Your Work**: Use preview mode to see draft changes
   - Preview always shows draft content
   - Test on different screen sizes

3. **Publish When Ready**: Click the "Publish" button
   - Draft content goes live instantly
   - "Unpublished changes" indicator disappears

### Best Practices
- Review all changes in preview before publishing
- The "Unpublished changes" badge only appears when content actually changes
- ESC key cancels edits in text fields without saving

## Troubleshooting

### Changes Not Saving?
1. Check your internet connection
2. Look for save status indicator
3. Try refreshing the page (draft changes are preserved)

### Can't See Published Changes?
1. Make sure you clicked "Publish" (not just saved)
2. Clear your browser cache
3. Check you're viewing the correct domain

### Accidentally Published?
- Make corrections and publish again
- Previous published version is replaced

## FAQ

**Q: What happens if I edit but don't publish?**
A: Your draft changes are saved but visitors see the last published version.

**Q: Can I revert to a previous version?**
A: Not yet, but version history is planned for a future release.

**Q: Do theme changes need publishing?**
A: Yes, theme changes follow the same draft/publish workflow.