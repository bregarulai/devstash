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

## Project structure

```
app/
  layout.tsx    — Root layout. Imports globals.css. Sets Geist fonts.
  page.tsx      — Root page (app router).
  globals.css   — Tailwind entry point. All CSS variables (light/dark) defined here.
components/
  ui/           — shadcn/ui components. Import with `@/components/ui/<name>`.
lib/
  utils.ts      — Exports `cn()` (clsx + tailwind-merge). Use for conditional class names.
```

- `@/*` path alias maps to project root (see `tsconfig.json`).
- `public/` is the static assets directory.

## Key conventions

- **No `tailwind.config.js`** — Tailwind v4 picks up config from `app/globals.css` (`@theme` blocks).
- **No `postcss.config.js` needed** — Next.js 15+ reads `postcss.config.mjs` automatically.
- **Dark mode** — Toggled via CSS class (e.g. `<html className="dark">`). Variables in `:root` and `.dark` blocks control theming.
- **shadcn components** — Added via `npx shadcn@latest add <component>`. Do not hand-edit `components/ui/` files; regenerate with shadcn.
- **CSS variables** — All colors/tokens use `oklch()`. Do not assume hex/rgb values are stable.
- **`cn()` utility** — Always use `cn()` from `lib/utils.ts` for conditional class merging. Do not use `clsx` or `tailwind-merge` directly in components.

## What to avoid

- Don't create a `tailwind.config.js` — it will be ignored by Tailwind v4.
- Don't import Tailwind directives in JS/TS — they live in `globals.css`.
- Don't assume Next.js conventions from training data — this is Next.js 16 with breaking changes. Check `node_modules/next/dist/docs/`.
- Don't add tests without first confirming the test framework — none is configured yet.

## Skill files

The following skill files are installed and managed by OpenCode:

- `skills/nextjs/` — Next.js App Router guidance
- `skills/shadcn/` — shadcn/ui component guidance

## Quick reference

- **Add a shadcn component**: `npx shadcn@latest add <component-name>`
- **Run dev server**: `npm run dev`
- **Build check**: `next build`
- **Lint**: `npm run lint`
