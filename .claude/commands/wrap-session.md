## Wrap Session

Cleanly conclude the current work session and prepare for the next one.

### Session Summary

**Work Completed:**
- [ ] List all features/bugs/tasks completed this session
- [ ] Note any partial progress on incomplete items
- [ ] Document any decisions or discoveries made

**Handoff Notes:**
- [ ] Create SESSION_[DATE]_[Descriptive_Name].md in `/home/goosetown/Claude/Projects/wondrous-digital-site/nextjs-app/docs/Handoff_Notes/` with:
  - What did we do this session 
    - Current status of work
    - Next immediate tasks
    - Any blockers or questions
  - What do you need to know to get started in the next session
    - Context needed for continuation
    - Branch name and state
    - Note any technical debt identified
    - Record any deferred decisions
    - Any tricky parts, Known issues, Dependencies to check

## Questions to Resolve:
If none, skip. Don't create just to create.
- [Any open decisions]
- [Clarifications needed]


### Final Documentation

**Update Status Files:**
- [ ] Find current file we're working on in `/home/goosetown/Claude/Projects/wondrous-digital-site/nextjs-app/docs/In_Progress/` 
- [ ] Mark today's work in LOG with session end time
- [ ] Update log
	- [ ] Update with final status
- [ ] Update any changed Technical Documentation
	- [ ] Document any learned patterns or gotchas


### Code State

**Quality Checks**
- [ ] Run Typescript check (not via build command) - must have 0 errors/warnings.
- [ ] Run ESLint check - must have 0 errors/warnings.

**Clean Working Directory:**
- [ ] Commit all changes with message: "session-end: [summary of work]"
- [ ] Push to remote branch
- [ ] Stash any exploratory code for later

**Quality Final Check:**
- [ ] Ensure no debug console.logs left in code
- [ ] Verify no hardcoded test values
- [ ] Check no temporary comments remain
- [ ] Confirm all TODOs are documented

### Before Closing:

- All work saved and committed
- Documentation updated
- No failing tests (unless documented)
- Clean TypeScript/Lint (or issues documented)
- Handoff notes created
- Branch is in stable state


