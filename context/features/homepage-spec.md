# Homepage (App) Spec

## Overview

Replace the placeholder `app/page.tsx` (`<h1>DevStash</h1>`) with the real marketing homepage, porting the static mockup in `prototypes/homepage/` (`index.html`, `styles.css`, `script.js`) into Next.js App Router components using Tailwind v4 + shadcn/ui. Server components by default; client components only where interactivity is required.

## References

- `prototypes/homepage/index.html`, `styles.css`, `script.js` — exact visual/animation source of truth
- `context/features/homepage-mockup-spec.md` — original mockup spec
- `app/page.tsx`, `app/layout.tsx` — page shell (layout already sets `<html className="dark">`, Geist fonts, `bg-background text-foreground`)
- `app/globals.css` — design tokens (`--color-snippet/prompt/command/note/file/image/link`, `--color-primary`, etc.)
- `context/coding-standards.md`, `context/project-overview.md`

## Routing & Links (all must resolve)

| Trigger | Destination |
| --- | --- |
| Logo | `/` |
| Nav: Features / AI / Pricing | `#features` / `#ai` / `#pricing` (same-page anchors, `scroll-behavior: smooth`) |
| Nav: Sign In (guest) | `/sign-in` |
| Nav: Get Started (guest) | `/register` |
| Nav: Dashboard (authed) | `/dashboard` |
| Nav: Sign Out (authed) | NextAuth `signOut()` (redirect to `/`) |
| Hero: Get Started Free | `/register` |
| Hero: See Features | `#features` |
| AI section: Upgrade to Pro | `#pricing` |
| Pricing: Free → Get Started | `/register` |
| Pricing: Pro → Upgrade to Pro | `/register` (until a billing/checkout route exists) |
| CTA: Get Started Free | `/register` |
| Footer: Product | `#features` / `#ai` / `#pricing` |
| Footer: Item Types | `#features` (each type is described there) |
| Footer: Account | Sign In `/sign-in`, Get Started `/register`, Settings `/settings` |
| Footer: social (GitHub, X) | external project URLs, `target="_blank" rel="noopener noreferrer"` |

Use `next/link` for internal routes, plain `<a>` for in-page anchors and external links.

## Server vs Client Split

### `app/page.tsx` — Server Component

- `export const metadata` with title/description from the mockup `<title>`/`<meta>`.
- Call `auth()` from `@/lib/auth/auth/auth` to read session; pass `isAuthed` boolean to `SiteHeader`.
- Compose sections in order: `SiteHeader`, `Hero`, trusted strip, `Features`, `AiSection`, `Pricing`, `Cta`, `SiteFooter`.
- No data fetching beyond the session (homepage is public/static marketing).

### Server components (no `'use client'`)

- `components/homepage/hero/Hero.tsx` — hero copy, gradient headline, CTA buttons, meta line; renders `ChaosVisual` (client) inside the visual grid.
- `components/homepage/features/Features.tsx` — section head + 6 feature cards. Each card uses its item-type token (`text-snippet`, `text-prompt`, etc.) for the top border and icon chip. Wrap each card in `Reveal`.
- `components/homepage/aiSection/AiSection.tsx` — two-column grid: left copy with `Badge` ("Pro Feature"), checklist, "Upgrade to Pro" button; right static code-editor mockup with "AI Generated Tags".
- `components/homepage/pricing/Pricing.tsx` — section head + `PricingToggle` (client) + two `Card`s (Free, Pro). Pro card has `Badge` ("Most Popular"), highlighted border/glow. Price amount/per swap is driven by `PricingToggle` state (lift state here or keep inside toggle and render price inline — pick the DRY option).
- `components/homepage/cta/Cta.tsx` — centered CTA card with heading, subcopy, primary button.
- `components/homepage/siteFooter/SiteFooter.tsx` — brand, link columns, bottom bar. Year rendered server-side via `new Date().getFullYear()` (no client JS).

### Client components (`'use client'`)

- `components/homepage/siteHeader/SiteHeader.tsx` — fixed top nav. Props: `isAuthed: boolean`. Behaviors: adds opaque/blurred background class after `scrollY > 24` (passive scroll listener); mobile hamburger toggles a disclosure menu; closes menu on link click. Renders auth-aware actions (Dashboard + Sign Out vs Sign In + Get Started). Use shadcn `Button` (primary CTA = `default`, Sign In = `ghost`/`outline`).
- `components/homepage/chaosVisual/ChaosVisual.tsx` — the "chaos → arrow → dashboard" visual. Port `script.js`: `requestAnimationFrame` drift, wall bounce, mouse/touch repulsion, rotation/scale pulse. Respect `prefers-reduced-motion` (render static layout, no rAF). Re-measure on resize (debounced). The arrow pulse and dashboard preview are pure CSS/Tailwind. Keep the 8 icon SVGs from the mockup.
- `components/homepage/reveal/Reveal.tsx` — `IntersectionObserver` wrapper that adds the visible class once in view (unobserve after). Falls back to visible when `IntersectionObserver` is unavailable. Accept `className`/`as` props. Reused across sections to keep markup DRY.
- `components/homepage/pricingToggle/PricingToggle.tsx` — Monthly/Yearly segmented control with "Save 25%" label. Holds billing state and swaps the Pro price (`$8`/mo vs `$72`/year) and per label. Use shadcn `Button` or a styled toggle group.

## Styling Rules

- Tailwind v4 only — no `tailwind.config.*`, no inline styles, no custom CSS file. Add any missing keyframes/tokens via `@theme` in `app/globals.css` if needed (e.g. `arrowPulse`).
- Use design tokens for all colors: `bg-background`, `text-foreground`, `text-muted-foreground`, `border`, and item-type tokens `text-snippet`/`bg-snippet`/`border-snippet` (and prompt/command/note/file/image/link). Do not hardcode hex/oklch values from the mockup.
- Use shadcn components: `Button`, `Card` (feature + price cards), `Badge` ("Pro Feature", "Most Popular"). Do not hand-build equivalents.
- Use `cn()` from `lib/utils.ts` for conditional classes.
- Dark-mode-first; the layout already forces `dark` on `<html>`.
- Responsive: mobile-first single column; `sm:`/`lg:` breakpoints to match the mockup (feature grid 1→2→3 cols, pricing 1→2 cols, hero visual stacks with arrow rotated 90° on mobile, nav links hidden under `lg:` with hamburger below).

## DRY / Cleanliness

- One job per component; extract the four client islands rather than one giant client page.
- Reuse `Reveal` for all scroll-fade sections.
- Centralize item-type accent mapping (e.g. a small `ITEM_TYPE_ACCENT` map of token class names) instead of repeating color classes per card.
- No commented-out code, no unused imports, no `any`. Keep components short.

## Definition of Done

- `app/page.tsx` renders the full homepage matching the mockup visually.
- Lint (`npm run lint`) and build (`npm run build`) pass.
- All buttons/links go to the destinations listed above; authed users see Dashboard + Sign Out, guests see Sign In + Get Started.
- Chaos animation runs with mouse repulsion and respects reduced-motion; pricing toggle swaps price; nav blurs on scroll and has a working mobile menu.
