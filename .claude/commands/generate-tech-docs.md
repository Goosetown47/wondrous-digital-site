## Generate Tech Docs

Generate comprehensive technical documentation for the current feature/bug/system.

**Do First** 
1. Identify the correct file for this documentation in `@docs/Tech_Docs/` or `@docs/In_Progress/`
2. Locate the # TECH DOCS section in that file.
3. Craft the documentation there.

**DO NOT create your own file for this.**
If you can't find the file, ask the user to create one and identify its location.

**Goal:** Documentation that helps both humans and Claude understand the system quickly and completely.
This command creates structured, comprehensive documentation that serves as both a reference for developers and a knowledge base for Claude to understand your system's architecture.

### Documentation Structure

**Core Sections:**

1. **Summary** (2-3 sentences)
   - What problem does this solve?
   - Who is the end user?
   - Business value delivered

2. **Technical Overview**
   - Architecture pattern used (e.g., client-server, event-driven)
   - Key components and their responsibilities
   - Data flow diagram (in ASCII or description)
   - Integration points with other systems

3. **Implementation Details**
   - **Database:** Schema changes, indexes, relationships
   - **API:** Endpoints, request/response formats, auth requirements
   - **Frontend:** Component hierarchy, state management approach
   - **Business Logic:** Core algorithms, validation rules, edge cases

4. **File References**
   - Primary Files:
      - /path/to/main/component.tsx
      - /path/to/api/route.ts
      - /path/to/db/schema.sql
   - Dependencies:
      - References: [other-feature].md
      - Depends on: [system-name].md

5. **Configuration & Environment**
   - Required env variables
   - Feature flags
   - Third-party service requirements

6. **Usage Examples**
   - Code snippet showing how to use this feature
   - Sample API calls
   - UI interaction flow

### Bug-Specific Documentation

**If documenting a bug fix, also include:**

7. **Root Cause Analysis**
   - What was broken?
   - Why did it break?
   - When was it introduced?
   - Impact scope

8. **Solution**
   - Fix approach
   - Why this solution over alternatives?
   - Prevention measures added

### Quality Checklist

**Clarity:**
- [ ] Can a new developer understand this in 5 minutes?
- [ ] Are technical terms defined or linked?
- [ ] Is jargon minimized?

**Completeness:**
- [ ] All major components documented?
- [ ] Error handling explained?
- [ ] Performance considerations noted?
- [ ] Security implications addressed?

**Maintainability:**
- [ ] Will this still make sense in 6 months?
- [ ] Are assumptions explicitly stated?
- [ ] Are TODOs and known limitations listed?

**Claude-Friendly:**
- [ ] Clear headers and structure for parsing
- [ ] Code blocks properly formatted
- [ ] Relationships to other docs explicit
- [ ] Searchable keywords included

### Output Format

Generate documentation in this structure:
```markdown
# [Feature/Bug/System Name]

## Summary
[2-3 sentence business-focused summary]

## Technical Documentation

### How It Works
[Clear explanation of the implementation]

### Architecture
[Components and data flow]

### Key Files
[Listed with purpose of each]

### Integration Points
[How it connects to other systems]

### Configuration
[Setup requirements]

### Examples
[Usage examples with code]

### Related Documentation
- See: [related-feature.md]
- Parent: [system.md]

### Notes
- Decisions: [Why we chose X over Y]
- Limitations: [Known constraints]
- Future: [Planned improvements]
