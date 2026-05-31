# DevStash — OpenCode Instructions

## Context Files

Read the following to get the full context of the project:

- `context/project-overview.md` — Complete project overview, vision, data model, and tech stack
- `context/coding-standards.md` — TypeScript, React, Next.js, and Tailwind CSS coding standards
- `context/ai-interaction.md` — Communication, workflow, branching, and code review guidelines

> **Important**: When reading files from the `/context` directory, ALWAYS read the ENTIRE file content. Do NOT set any `limit` or `offset` parameters that would restrict what is read. Use `Read` tool with no `limit` to ensure you retrieve the complete file contents.

## Project overview

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS v4 — no `tailwind.config.js`; all config lives in `app/globals.css` via `@theme` blocks and CSS custom properties
- **UI layer**: shadcn/ui (Radix Nova style) + Radix UI primitives + `class-variance-authority` + `tailwind-merge`
- **Fonts**: Geist & Geist Mono via `next/font/google`
- **Lint**: `eslint-config-next` (no custom rules yet)

## Commands

| Script     | Command         |
| ---------- | --------------- |
| Dev server | `npm run dev`   |
| Build      | `npm run build` |
| Lint       | `npm run lint`  |

## Key conventions

- **CRITICAL: ALWAYS read `context/coding-standards.md` before any write, edit, update, or refactor to the codebase.** This is extremely important and must be followed without exception.

- **No `tailwind.config.js`** — Tailwind v4 picks up config from `app/globals.css` (`@theme` blocks).
- **No `postcss.config.js` needed** — Next.js 15+ reads `postcss.config.mjs` automatically.
- **Dark mode** — Toggled via CSS class (e.g. `<html className="dark">`). Variables in `:root` and `.dark` blocks control theming.
- **shadcn components** — Added via `npx shadcn@latest add <component>`. Do not hand-edit `components/ui/` files; regenerate with shadcn.
- **Always use shadcn components** — Always use shadcn components for UI elements. If a component is not in the `components/ui` directory, install it from shadcn rather than creating a custom implementation.
- **CSS variables** — All colors/tokens use `oklch()`. Do not assume hex/rgb values are stable.
- **`cn()` utility** — Always use `cn()` from `lib/utils.ts` for conditional class merging. Do not use `clsx` or `tailwind-merge` directly in components.

## Neon MCP

- **ALWAYS use the `dev-stash` project development branch and ONLY the `dev-stash` project development branch when using Neon MCP.**
- **NEVER touch the production branch unless explicitly specified by the user.**

## What to avoid

- Don't create a `tailwind.config.js` — it will be ignored by Tailwind v4.
- Don't import Tailwind directives in JS/TS — they live in `globals.css`.
- Don't assume Next.js conventions from training data — this is Next.js 16 with breaking changes. Check `node_modules/next/dist/docs/`.
- Don't add tests without first confirming the test framework — none is configured yet.

## Skill files

The following skill files are installed and managed by OpenCode:

### `.agents/skills/` (built-in)

- `nextjs/` — Next.js App Router expert guidance (routing, Server Components, Server Actions, layouts, middleware, data fetching, error handling, metadata, etc.)
- `shadcn/` — shadcn/ui component guidance (adding, searching, fixing, debugging, styling, composing UI, CLI commands, critical rules)

### `.opencode/skills/` (project-managed)

- `feature/` — Feature workflow lifecycle (load/start/review/explain/complete) — working file: `context/current-feature.md`
- `list-components/` — List React component files (.tsx/.ts/.jsx/.js) in the components folder
- `cleanup/` — Clean up project housekeeping tasks (run|check) — console.log, unused imports, stale TODOs, orphaned files, env sync, @ts-ignore
- `impeccable/` — Design quality skill with 23 commands and 27 anti-pattern rules (`/impeccable init` to set up design context, then `audit`, `critique`, `polish`, `typeset`, `colorize`, `layout`, `bolder`, `animate`, etc.)

## Quick reference

- **Add a shadcn component**: `npx shadcn@latest add <component-name>`
- **Run dev server**: `npm run dev`
- **Build check**: `next build`
- **Lint**: `npm run lint`
