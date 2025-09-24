## Plan

Create a comprehensive plan based on your notes and ideas.

**Usage:** `/project:plan system` or `/project:plan feature`

**Arguments:**
- `system` - Create high-level system architecture plan
- `feature` - Create detailed feature implementation plan

### Planning Process:

1. **Context Gathering**
   - Scanning @docs/Tech_Docs for relevant technical documentation
   - Analyzing current database schema and structure
   - Reviewing existing codebase for related functionality
   - Reading PROCESS.md for our development methodology

2. **Clarification Phase**
   - I'll ask 3-5 targeted questions about your notes
   - Help identify gaps or ambiguities in the requirements
   - Ensure alignment with existing systems

3. **Deep Analysis** (Ultra-thinking mode)
   - Comprehensive analysis of requirements
   - Architecture implications
   - Integration considerations
   - Risk assessment

### Output for $ARGUMENTS:

**system** - High-level system architecture
- Product-focused system overview
- List of discrete features to build
- How it fits into the broader marketing platform
- Development roadmap outline
- Key architectural decisions
- Success metrics

**feature** - Detailed feature implementation
- Clear feature specification
- Task list following PROCESS.md guidelines:
  - Database schema changes
  - API endpoints needed
  - UI components required
  - State management updates
  - Testing requirements
- Prioritized task order
- Acceptance criteria
- Edge cases to handle

### Instructions:
After running this command, provide your rough notes, ideas, or requirements. I'll then begin the clarification process before creating your plan.

**Example:** 
- `/project:plan system` → then provide notes about the overall system
- `/project:plan feature` → then provide notes about a specific feature