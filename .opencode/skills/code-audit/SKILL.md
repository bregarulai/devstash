---
name: code-audit
description: Audit code changes against project coding standards and Next.js best practices. Use when the user wants to check if their code follows coding standards, verify Next.js best practices are followed, review changes before committing, or ensure consistency with the project's conventions. Trigger whenever the user asks to review, check, verify, or audit code quality, coding standards compliance, or Next.js practices. Also use when the user mentions linting, code review, standards check, or best practices verification.
---

# Code Audit

Audit code changes against project coding standards and Next.js best practices.

## Workflow

### Step 1: Load Coding Standards

Read the full content of `context/coding-standards.md`. Keep these standards in context throughout the audit.

### Step 2: Identify Files to Audit

Determine which files need auditing:

- If the user specifies files, audit those files
- If the user asks to check recent changes, use `git diff` or `git status` to identify modified/added files
- If the user is working on a feature, ask which files they want reviewed
- Default: audit all files in the current working directory that have been modified or created

### Step 3: Audit Against Coding Standards

Load the relevant reference files from `reference/` based on the file types being audited:

| Reference | Use when auditing |
|---|---|
| [typescript.md](./reference/typescript.md) | `.ts`, `.tsx` files |
| [zod-schemas.md](./reference/zod-schemas.md) | `types/db.ts`, `lib/db/`, any Zod usage |
| [react.md](./reference/react.md) | `.tsx`, `.jsx` component files |
| [ui.md](./reference/ui.md) | Any UI/component files |
| [nextjs.md](./reference/nextjs.md) | `app/` routes, route handlers, Server Actions |
| [tailwind.md](./reference/tailwind.md) | `.css` files, any styling-related files |
| [file-organization.md](./reference/file-organization.md) | Any file (check path conventions) |
| [naming.md](./reference/naming.md) | Any file (check naming conventions) |
| [styling.md](./reference/styling.md) | `.css`, `.tsx` with style-related code |
| [database.md](./reference/database.md) | Prisma schema, migration files, DB queries |
| [data-fetching.md](./reference/data-fetching.md) | Server components, route handlers, actions |
| [error-handling.md](./reference/error-handling.md) | Server Actions, API routes, mutations |
| [code-quality.md](./reference/code-quality.md) | Any file (general quality checks) |

### Step 4: Check Next.js Best Practices

Use the Next.js skill (`agents/skills/nextjs/SKILL.md`) for App Router conventions, especially Next.js 16 async API changes.

### Step 5: Read OpenCode Docs if Needed

If the audit reveals questions about shadcn/ui, Tailwind v4, Next.js v16, or opencode configuration, read docs from `node_modules/next/dist/docs/`, `app/globals.css`, or relevant skill files.

### Step 6: Run Lint and Type-Check

Run both commands and include their output in the audit report:

1. `npm run lint` — catches ESLint warnings including deprecated types, unused imports, etc.
2. `npx tsc --noEmit` — catches TypeScript compiler warnings (deprecated APIs, type mismatches, etc.)

If either command fails, note the errors but continue the audit — report them separately from standards violations.

### Step 7: Generate Audit Report

Produce a structured audit report:

```
# Code Audit Report

## Summary
- Total files audited: N
- Standards violations: N
- Next.js best practice issues: N
- Lint issues: N
- Type-check issues: N
- Overall compliance: [High/Medium/Low]

## Standards Violations

### [File Path]
- [Line N]: [Violation] - [Expected standard]

## Next.js Best Practice Issues

### [File Path]
- [Issue]: [Description]

## Zod Schema Inference Issues

### [File Path]
- [Line N]: [Issue] - [Expected pattern]

## Lint Output

```
[lint output or "No issues found"]
```

## Type-Check Output

```
[tsc output or "No issues found"]
```

## Recommendations

1. [Actionable recommendation]

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
