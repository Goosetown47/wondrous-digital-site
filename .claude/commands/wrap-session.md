## Wrap Session

Cleanly conclude the current work session and prepare for the next one.

### Session Summary

**Work Completed:**
- [ ] List all features/bugs/tasks completed this session
- [ ] Note any partial progress on incomplete items
- [ ] Document any decisions or discoveries made

**Handoff Notes:**
- [ ] Create SESSION_[DATE].md in `@docs/Handoff_Notes/` with:
  - Current status of work
  - Next immediate tasks
  - Any blockers or questions
  - Context needed for continuation
  - Branch name and state
  - Note any technical debt identified
  - Record any deferred decisions
  - Any tricky parts, Known issues, Dependencies to check

## Questions to Resolve:
- [Any open decisions]
- [Clarifications needed]


### Final Documentation

**Update Status Files:**
- [ ] Find current file we're working on in `@docs/In_Progress/` 
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
- [ ] Note any uncommitted experiments in NEXT_SESSION.md
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


