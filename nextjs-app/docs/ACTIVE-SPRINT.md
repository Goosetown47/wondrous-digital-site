## ------------------------------------------------ ##
# ACTIVE SPRINT
## ------------------------------------------------ ##

## OVERVIEW

**Production Version:** v0.1.1 
**Development Version:** v0.1.2 [ACTIVE]




# -------------------------------------------------------------------------------------- #
# VERSION 0.1.2
# -------------------------------------------------------------------------------------- #

### Goal: 

### Notes:



## PACKETS ----------------------------------------------------------------------------- ##











# ------------------------------------------------ #
# PROCESS & RULES
# ------------------------------------------------ #

---

## Sprint Process Guide

### Sprint Planning (Start of Sprint)

  1. Review BACKLOG.md → Pull priority items into ACTIVE-SPRINT.md
  2. Set version number → Decide scope (major.minor.patch)
  3. Move packets → Cut H4 sections from BACKLOG to ACTIVE-SPRINT
  4. Order packets → Arrange by priority/dependency


### During Sprint Execution

#### Per Packet Workflow:

  1. Move packet to Current Focus → Work on one packet at a time
  2. Follow DEV-LIFECYCLE.md → Full/Fast Track/Emergency mode per packet
  3. As you discover issues → Add to "Found Work" section:
    - Critical → Must fix in current version
    - Non-Critical → Defer to next version
    - Tech Debt → Document for future
  4. Update STATUS-LOG.md → Log progress after each packet
  5. Check off tasks → Mark complete in ACTIVE-SPRINT.md
  6. Move to Sprint Backlog → When packet done, grab next

#### Daily Flow:

  - Start: Check Current Focus in ACTIVE-SPRINT.md
  - Work: Follow DEV-LIFECYCLE for that packet
  - Discover: Add found issues to appropriate section
  - End: Update STATUS-LOG with progress

#### Sprint Completion

  1. All packets done → Verify all tasks checked
  2. Create Release Notes → /docs/Release_Notes/v0.1.1.md
  3. Archive sprint content → Copy ACTIVE-SPRINT to STATUS-LOG
  4. Clear ACTIVE-SPRINT.md → Reset for next sprint
  5. Update version numbers → Production/Development in all docs


### Key Rules

  - ONE packet in Current Focus at a time
  - COMPLETE DEV-LIFECYCLE per packet before moving on
  - DOCUMENT found work immediately
  - UPDATE STATUS-LOG per packet completion
  - NEVER skip DEV-LIFECYCLE steps

---

## CLASSIFICATIONS
Use these classifications to identify each type of task. We can expand this list as needed.

🪲 - Bug
🚩 - Support Ticket Item
⚙️ - Rework
⚗️ - Testing / Review / Verify
✂️ - Cut/Postponed/Cancelled
🚀 - Feature 
📌 - Administrative / Operations

## Status Legend
- ⬜ Not Started
- 🟦 In Progress
- ✅ Complete
- ❌ Blocked
- 🟨 On Hold

## Manual Test Markings (User will mark):
- ✅ What works as expected
- ❌ What fails or doesn't work
- ⚠️ What's partially working or unclear
- 🤔 What you're unsure about