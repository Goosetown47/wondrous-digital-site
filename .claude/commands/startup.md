# Session Startup - Initialize Context

Load essential project context and establish working knowledge for this session.

## 1. Core Documentation Review

Please read and internalize the following foundational documents:

- Read CLAUDE.md for project-specific AI collaboration guidelines
- Read `nextjs-app/docs/PRINCIPLES.md` to understand our development principles  
- Read `nextjs-app/docs/PROCESS.md` to understand our workflow and development process
- Read `nextjs-app/docs/CODE-CHECKLIST.md` for our code quality standards
- Read latest Handoff Notes in `nextjs-app/docs/Handoff_Notes/` to get up to speed on last session. You don't need to read them all, just the one with the most recent date.

After reading, briefly acknowledge the key points from each document.

## 2. Current Sprint Status

Identify and read the latest release notes:
- Look in `nextjs-app/docs/Release_Notes/` directory
- Find the file with the highest version number (e.g., v1.2.0.md would be newer than v1.1.0.md)
- Read the latest release to understand current sprint progress
- Note any "In Progress" or "Upcoming" sections

## 3. Codebase Current State

Check the current state of the codebase:
```
bash
git status

git log --oneline -5
```
Review any uncommitted changes and recent commits to understand what was last worked on.

## 4. Environment & Dependencies Status

Quick health check:
- Review package.json for any recently added dependencies
- Check if node_modules exists and matches package-lock.json
- Note the Node version requirement if specified in .nvmrc or package.json

## 5. Database Schema Awareness

Review the current database structure:
- Check supabase/migrations/ for the latest migration files
- Note the most recent schema changes

## 6. Create Session Working Memory

After gathering all this context, provide a concise summary:

- Application Purpose: [One sentence from CLAUDE.md]
- Current Version: [From latest release notes]
- Sprint Focus: [Current sprint goals from release notes]
- Development Principles: [2-3 key principles to keep in mind]
- Active Work: [Based on git status and recent commits]
- Pending Tasks: [Top TODOs found]

Session Ready Checklist:

- [ ] Documentation absorbed
- [ ] Current sprint understood
- [ ] Codebase state assessed
- [ ] Development principles noted
- [ ] Ready to maintain code quality standards

## 7. End with: "Session context loaded. What would you like to work on today?"



