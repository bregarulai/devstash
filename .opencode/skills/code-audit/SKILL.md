---
name: code-audit
description: Audit code changes against project coding standards and Next.js best practices. Use when the user wants to check if their code follows coding standards, verify Next.js best practices are followed, review changes before committing, or ensure consistency with the project's conventions. Trigger whenever the user asks to review, check, verify, or audit code quality, coding standards compliance, or Next.js practices. Also use when the user mentions linting, code review, standards check, or best practices verification.
---

# Code Audit

Audit code changes against project coding standards and Next.js best practices.

## Workflow

### Step 1: Load Coding Standards

Read the full content of `context/coding-standards.md`. This file contains all project coding standards including TypeScript, React, Next.js, Tailwind CSS v4, file organization, naming, styling, database, data fetching, error handling, and code quality rules.

Keep these standards in context throughout the audit. Reference them when evaluating code.

### Step 2: Identify Files to Audit

Determine which files need auditing based on the user's request:

- If the user specifies files, audit those files
- If the user asks to check recent changes, use `git diff` or `git status` to identify modified/added files
- If the user is working on a feature, ask which files they want reviewed
- Default: audit all files in the current working directory that have been modified or created

### Step 3: Audit Against Coding Standards

For each file, check compliance with the standards from `context/coding-standards.md`:

**TypeScript**
- Strict mode enabled?
- No `any` types (use `unknown` instead)?
- Interfaces defined for props, API responses, data models?
- Proper type inference?

**React**
- Functional components only (no class components)?
- Hooks used for state and side effects?
- Components focused (one job per component)?
- Reusable logic extracted into custom hooks?

**UI**
- shadcn components used when possible (no hand-built UI components)?

**Next.js**
- Server components by default?
- `'use client'` only when needed?
- Server Actions for form submissions?
- API routes used appropriately (webhooks, file uploads, long-running ops, specific status codes)?
- Dynamic routes for item/collection pages?

**Tailwind CSS v4**
- No `tailwind.config.js` or `tailwind.config.ts`?
- All theme config in `app/globals.css` via `@theme`?
- CSS custom properties used for colors/spacing?

**File Organization**
- Components: `components/[feature]/ComponentName.tsx`?
- Pages: `app/[route]/page.tsx`?
- Server Actions: `actions/[feature].ts`?
- Types: `types/[feature].ts`?
- Lib/Utils: `lib/[utility].ts`?

**Naming**
- Components: PascalCase?
- Files: match component name or kebab-case?
- Functions: camelCase?
- Constants: SCREAMING_SNAKE_CASE?
- Types/Interfaces: PascalCase (no prefix)?

**Styling**
- Tailwind CSS for all styling?
- shadcn/ui components where applicable?
- No inline styles?
- Dark mode first?
- Design tokens used (no hardcoded colors/fonts/spacing)?

**Database**
- Prisma ORM used?
- `prisma migrate dev` used (not `db push`)?

**Data Fetching**
- Server components fetch directly with Prisma?
- Client components use Server Actions?
- Inputs validated with Zod?

**Error Handling**
- try/catch in Server Actions?
- `{ success, data, error }` return pattern?
- User-friendly error messages via toast?

**Code Quality**
- No commented-out code?
- No unused imports or variables?
- Functions under 50 lines?
- React components kept short?

### Step 4: Check Next.js Best Practices

Use the Next.js skill (`agents/skills/nextjs/SKILL.md`) to verify:

**File Conventions**
- App Router file structure correct?
- `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` used appropriately?
- Route groups and parallel routes correct?

**Server Components**
- Server components used by default?
- Client components only where interactivity needed?
- Correct data fetching patterns?

**Data Patterns**
- Server Actions used correctly?
- API routes for appropriate use cases?
- Caching strategies appropriate?

**Async APIs**
- Correct use of async/await?
- Proper error boundaries?
- Streaming patterns if needed?

**Metadata**
- Document metadata configured correctly?
- Image/font optimization appropriate?

**Error Handling**
- Error boundaries in place?
- Route handlers proper?

**Bundling**
- No unnecessary dependencies?
- Correct module resolution?

### Step 5: Read OpenCode Docs if Needed

If the audit reveals questions about:
- shadcn/ui component usage
- Tailwind CSS v4 configuration
- Next.js App Router conventions (especially v16 breaking changes)
- opencode.json or opencode.jsonc configuration
- Skill creation or modification
- MCP server setup

Read the relevant documentation from:
- `node_modules/next/dist/docs/` for Next.js conventions
- `app/globals.css` for Tailwind v4 theme config
- `.opencode/skills/` for existing skill patterns
- `agents/skills/` for built-in skill patterns

### Step 6: Generate Audit Report

Produce a structured audit report with the following format:

```
# Code Audit Report

## Summary
- Total files audited: N
- Standards violations: N
- Next.js best practice issues: N
- Overall compliance: [High/Medium/Low]

## Standards Violations

### [File Path]
- [Line N]: [Violation] - [Expected standard]
- [Line N]: [Violation] - [Expected standard]

### [File Path]
- [Line N]: [Violation] - [Expected standard]

## Next.js Best Practice Issues

### [File Path]
- [Issue]: [Description]
- [Issue]: [Description]

## Recommendations

1. [Actionable recommendation]
2. [Actionable recommendation]

## Positive Observations
- [What's done well]
```

## Usage

Run this skill whenever:
- Before committing changes
- After completing a feature or component
- When reviewing another developer's code
- When unsure if code follows project conventions
- When setting up new routes, pages, or API endpoints
- When adding or modifying shadcn/ui components
- When configuring Tailwind CSS v4 theme

## Important Notes

- Always read the FULL content of `context/coding-standards.md` — do not skip any section
- Be thorough: check every file against every relevant standard
- When in doubt, prefer the Next.js skill documentation over general knowledge (Next.js 16 has breaking changes)
- Flag both critical violations (must fix) and minor issues (should fix)
- Highlight positive compliance to reinforce good patterns
