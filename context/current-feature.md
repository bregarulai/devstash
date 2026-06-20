# Current Feature: Build Marketing Homepage

**Spec**: `context/features/homepage-spec.md`

## Status

In Progress

## Goals

- Replace placeholder `app/page.tsx` with the full marketing homepage ported from `prototypes/homepage/`
- Use server components by default; client components only for SiteHeader (scroll/mobile menu), ChaosVisual (rAF animation), Reveal (IntersectionObserver), and PricingToggle (billing toggle)
- Auth-aware nav: guests see Sign In + Get Started; authed users see Dashboard + Sign Out via `auth()` session check
- All buttons/links resolve to correct destinations (`/sign-in`, `/register`, `/dashboard`, `#features`/`#ai`/`#pricing`, `/settings`)
- Port chaos-to-order visual with rAF drift, wall bounce, mouse/touch repulsion, and reduced-motion fallback
- Use Tailwind v4 tokens (no hardcoded colors), shadcn Button/Card/Badge, `cn()` utility
- Responsive: mobile-first single column, hamburger nav below `lg:`, feature/pricing grids scale correctly
- Pricing toggle swaps between $8/mo and $72/year with "Save 25%" badge
- Lint and build pass with no errors

## Notes

- Layout already sets `<html className="dark">`, Geist fonts, `bg-background text-foreground` — no extra theming needed
- Item type tokens available: `--color-snippet`, `--color-prompt`, `--color-command`, `--color-note`, `--color-file`, `--color-image`, `--color-link` — do not hardcode hex from mockup
- No `/pricing` route exists — pricing is an anchor section on the homepage
- Pro "Upgrade to Pro" CTA links to `/register` until a billing/checkout route is built
- Footer social links use project's official GitHub/X URLs with `target="_blank" rel="noopener noreferrer"` — use placeholders until URLs are confirmed
- Any missing keyframes/tokens (e.g. `arrowPulse`) should be added via `@theme` in `app/globals.css`

## History

(append completed features here)
