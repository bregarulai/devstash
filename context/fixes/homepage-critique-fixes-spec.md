# Homepage Critique Fixes

**Source**: `/impeccable critique app/page.tsx`
**Date**: 2026-06-20
**Score**: 28/40 (Good, lower edge)
**Direction**: Option 1 — Enforce DESIGN.md strictly. Remove the invented indigo/cyan brand accent, gradients, and glows; let the 7 item-type colors be the only chromatic elements, exactly as DESIGN.md mandates.
**Scope**: All P1, P2, and P3 findings. Visual/structural refactors only — no changes to page behavior, routing, auth flow, or data. Product imagery is **deferred** (decoration-only for this pass).
**Constraint**: No behavior or user-flow changes. Preserve all existing interactions, click handlers, links, and responsive breakpoints.

---

## Summary

| Priority | Issue | Files Affected |
| -------- | ----- | -------------- |
| P1 | Gradient-text hero headline (absolute ban + invisible-text fallback) | `HeroSection.tsx` |
| P1 | Indigo→cyan AI palette drenched across gradients/glows/badges | `button.tsx`, `SiteHeader.tsx`, `HeroSection.tsx`, `PricingToggle.tsx`, `PricingSection.tsx`, `CtaSection.tsx`, `ChaosVisual.tsx`, `globals.css`, `page.tsx` |
| P1 | `Reveal` gates content visibility on IntersectionObserver (blank-content risk) | `Reveal.tsx`, `layout.tsx` |
| P2 | Identical 6-card feature grid (absolute ban) | `FeaturesSection.tsx` |
| P2 | Uppercase tracked eyebrow on 3 sections (absolute ban) | `HeroSection.tsx`, `FeaturesSection.tsx`, `PricingSection.tsx` |
| P2 | Side-stripe item rows + top-stripe cards (DESIGN.md ban) | `ChaosVisual.tsx`, `FeaturesSection.tsx` |
| P2 | No-Shadow Rule violated (Pro card, AI code panel, badge glows) | `PricingSection.tsx`, `AiSection.tsx`, `HeroSection.tsx`, `ChaosVisual.tsx` |
| P3 | `z-1` invalid Tailwind utility on `<main>` | `page.tsx` |
| P3 | Em dash in metadata title | `page.tsx` |
| P3 | No `text-wrap: balance` on headings; `text-pretty` on prose | all section headings |
| P3 | Arbitrary radii outside the `--radius` token ramp | all sections |
| P3 | Touch targets under 44px (mobile menu links, hero CTAs) | `SiteHeader.tsx`, `HeroSection.tsx` |
| P3 | Mobile menu lacks focus-trap / Escape-to-close | `SiteHeader.tsx` |
| P3 | `Reveal` duplicate transition + `duration-600` non-token | `Reveal.tsx` |
| P3 | Footer links to possibly-nonexistent routes | `Footer.tsx` |
| P3 | TrustedStrip cyan quotes + PricingToggle "Save 25%" hardcoded green | `TrustedStrip.tsx`, `PricingToggle.tsx` |

**Deferred (per user decision — decoration only, no real screenshots this pass)**:
- P1 "No real product imagery" — keep ChaosVisual + AI code mock as decoration (after de-gradientification). File a separate spec to ship a real dashboard screenshot above the fold.

**Related but out of scope**:
- `globals.css` `--sidebar-primary: oklch(0.488 0.243 264.376)` (dark) is an indigo brand accent in the dashboard, contradicting "no brand accent." File a separate spec to reconcile the dashboard surface with DESIGN.md. Keep the `--accent-indigo` / `--accent-cyan` tokens in `globals.css` only until that follow-up lands; remove all **homepage** usage now.

---

## P1 Fixes

### 1. Remove gradient-text hero headline

**File**: `components/homepage/sections/HeroSection.tsx` (lines 13-26)

**Problem**: "Developer Knowledge" renders with `linear-gradient(135deg, #818cf8, #22d3ee 60%, #f59e0b)` + `backgroundClip: 'text'` + `WebkitTextFillColor: 'transparent'`. Absolute ban (gradient text) + DESIGN.md ban. No fallback `color`, so any renderer without `background-clip: text` shows a blank H1 line (accessibility + SEO risk).

**Fix**: Replace the `<span>` gradient with a single solid color. Use the Snippet-blue item-type color — the "most frequently seen color in the system" and the actual chromatic identity — for the emphasis word.

```tsx
<span className="text-[var(--color-snippet)]">
  Developer Knowledge
</span>
```

Remove the entire `style={{...}}` inline block. Hierarchy continues to come from the `font-extrabold` + clamp scale on the `<h1>`.

**Behavior change**: None. Same copy, same layout, no entrance change.

### 2. Strip the indigo/cyan palette, gradients, and glows

**Files** (in order of edit):

#### 2a. Remove the `gradient` button variant
**File**: `components/ui/button.tsx` (line 22)

DESIGN.md's button spec has no gradient variant. Remove the entire `gradient: "..."` entry from `variant`. Also remove the `ghost-border` variant's reliance on any accent (it already uses `border-border`/`bg-background/5` — keep it, it complies). This touches a `components/ui/` file; the variant is a custom addition, not shadcn core, so direct removal is acceptable. Do **not** regenerate via shadcn for this change.

Replace every `variant="gradient"` usage with `variant="default"` (the design system's primary button: `bg-primary text-primary-foreground`):
- `SiteHeader.tsx:91` (desktop "Get Started") and `:155` (mobile "Get Started")
- `HeroSection.tsx:32` ("Get Started Free")

#### 2b. Replace the logo gradient with a solid fill
**Files**: `SiteHeader.tsx:44-58`, `Footer.tsx:10-24`

Both render a `<linearGradient id="...-gradient" stopColor="#6366f1" → "#06b6d4">` inside the logo SVG. Replace with a single solid fill using the Snippet-blue item-type color (or ink). Remove the `<defs>`/`<linearGradient>` blocks.

```tsx
<rect x="3" y="3" width="26" height="26" rx="7" fill="var(--color-snippet)" />
```

Update the `id` attributes if any CSS references them (none do — they're SVG-local). Remove the now-unused `header-gradient` / `footer-gradient` ids.

#### 2c. De-gradient the PricingToggle active state
**File**: `components/homepage/pricingToggle/PricingToggle.tsx` (lines 31, 42)

Replace `bg-gradient-to-r from-indigo-500 to-cyan-500 text-white` with the design system's primary treatment:

```
bg-primary text-primary-foreground
```

Also replace `text-green-500` on "Save 25%" (line 49) with the success token `text-success` (defined in `globals.css`).

#### 2d. De-gradient the "Most Popular" badge + remove Pro card glow
**File**: `components/homepage/sections/PricingSection.tsx` (lines 67, 73)

- Badge (line 73): replace `bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-[0_8px_20px_-6px_rgba(99,102,241,0.7)]` with `bg-primary text-primary-foreground` (no shadow).
- Pro card (line 67): remove `shadow-[0_0_0_1px_rgba(148,163,184,0.12),0_30px_80px_-30px_rgba(99,102,241,0.45)]`. Keep emphasis via tonal layering: `ring-1 ring-primary` plus the existing gradient `background` inline style on line 70 — replace that inline gradient with `bg-card` and a subtle top tint via `before:` pseudo or a `bg-secondary` wash. Simplest: drop the inline `style` entirely and use `bg-card` + `ring-1 ring-primary/40` for emphasis without shadow.

#### 2e. Remove the CTA radial gradient
**File**: `components/homepage/sections/CtaSection.tsx` (lines 9-11)

Remove the inline `style` radial gradient. Use `bg-secondary` alone. If a subtle accent is wanted, add a `before:` layer tinted with one item-type color at ≤8% opacity — not indigo/cyan.

#### 2f. De-gradient + de-glow the ChaosVisual arrow
**File**: `components/homepage/chaosVisual/ChaosVisual.tsx` (lines 288, 290-299)

- Arrow bar (line 288): replace `bg-gradient-to-r from-indigo-500 to-cyan-500 ... shadow-[0_0_24px_rgba(99,102,241,0.55)]` with `bg-muted-foreground` (or `bg-primary`) and no shadow.
- Arrowhead (lines 290-299): replace `borderLeft: '20px solid #06b6d4'` + `filter: 'drop-shadow(...)'` with a solid `borderLeft: '20px solid var(--color-foreground)'` and remove the drop-shadow. (The detector's `side-tab` flag here is a false positive — it's a CSS triangle arrowhead — but the cyan + glow still violate DESIGN.md.)
- Pulse rings (lines 303-313): replace `border-indigo-500` with `border-primary`.

#### 2g. Remove the AI section badge gradient + code panel shadow
**File**: `components/homepage/sections/AiSection.tsx` (lines 30-33, 54)

- "Pro Feature" badge (line 30): replace `bg-gradient-to-r from-amber-500 to-pink-500 text-black border-transparent` with `bg-secondary text-secondary-foreground border-border` (or a single item-type tint). Remove the gradient.
- Code panel (line 54): remove `shadow-[var(--shadow-lg)]`. Keep the bordered tonal panel per DESIGN.md's flat-surface rule.

#### 2h. Remove the hero status-dot glow
**File**: `components/homepage/sections/HeroSection.tsx` (line 40)

Replace `bg-green-500 shadow-[0_0_10px_#22c55e]` with `bg-success` (no shadow). The dot stays decorative.

#### 2i. Remove the `bg-hero-gradient` background (or re-tint to a single item-type color)
**Files**: `app/page.tsx` (line 22), `app/globals.css` (lines 363-367)

`bg-hero-gradient` uses `--accent-indigo` / `--accent-cyan` radial halos — the AI palette at low opacity. Strict enforcement: remove the `<div className="bg-hero-gradient ...">` from `page.tsx` and delete the `.bg-hero-gradient` class from `globals.css`. If an atmospheric tint is desired, replace with a single subtle radial using `var(--color-snippet)` at ≤10% opacity. Keep the `--accent-indigo` / `--accent-cyan` **token definitions** in `globals.css` (the dashboard sidebar uses them); only remove homepage usage.

**Behavior change (Fix 2 overall)**: None. All buttons remain clickable with the same labels and destinations; all sections keep their structure. Only color/shadow treatment changes.

### 3. Make `Reveal` safe by default (visible without JS)

**Files**: `components/homepage/reveal/Reveal.tsx`, `app/layout.tsx`

**Problem**: `Reveal` renders `opacity-0 translate-y-6` until the IntersectionObserver fires. On no-JS, crawler, headless-renderer, or hidden-tab paths the observer never fires and sections ship blank. The skill warns: "Reveal animations must enhance an already-visible default. Don't gate content visibility on a class-triggered transition."

**Fix**: Opt into the hidden initial state only when JS is confirmed, via a `data-js` attribute on `<html>` set before paint.

1. In `app/layout.tsx`, add a tiny blocking script in `<head>` that sets `document.documentElement.dataset.js = 'true'` before first paint (prevents flash):

```tsx
<head>
  <script
    dangerouslySetInnerHTML={{
      __html: 'document.documentElement.dataset.js = "true";',
    }}
  />
</head>
```

2. In `Reveal.tsx`, change the className so the hidden initial state only applies under `[data-js]`:

```tsx
className={cn(
  'transition-[opacity,transform] duration-500 ease-out',
  '[html[data-js]_&]:opacity-0 [html[data-js]_&]:translate-y-6',
  isVisible && 'opacity-100 translate-y-0',
  className
)}
```

Tailwind v4 arbitrary variant `[html[data-js]_&]:` scopes the hidden state to JS-enabled browsers. Without JS, content renders visible. When JS is on, the observer toggles `isVisible` and the element transitions in. (This also fixes the P3 duplicate-transition bug — `transition-opacity ... transition-transform ...` collapsed into one `transition-[opacity,transform]`.)

**Behavior change**: None for JS users (same reveal animation). No-JS/crawler visitors now see content instead of blank sections.

---

## P2 Fixes

### 4. Break the identical 6-card feature grid

**File**: `components/homepage/sections/FeaturesSection.tsx` (lines 64-89)

**Problem**: Six same-sized cards (icon + heading + text) in a 3×2 grid is the "identical card grids" absolute ban.

**Fix**: Convert to a bento grid with varying spans so cards are no longer uniform. Keep the icon-chip + title + description content; vary the footprint.

```tsx
<div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4.5 lg:auto-rows-[minmax(0,1fr)]">
  {FEATURES.map((feature, i) => (
    <Reveal key={feature.type} className={cn(i === 0 && 'lg:col-span-2 lg:row-span-1')}>
      <article className="group relative h-full bg-card border border-border rounded-xl p-[22px] overflow-hidden transition-colors duration-200 hover:border-border/40">
        <div
          className="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-3.5"
          style={{ background: `color-mix(in srgb, ${feature.color} 16%, transparent)`, color: feature.color }}
        >
          <feature.icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold mb-1.5">{feature.title}</h3>
        <p className="text-muted-foreground text-[14.5px]">{feature.description}</p>
      </article>
    </Reveal>
  ))}
</div>
```

Also remove the `hover:-translate-y-[3px]` lift (motion without state meaning — product register: "Motion conveys state, not decoration") and the `h-[3px]` top stripe (lines 71-74), which is the same accent-bar trope as the banned side-stripe. Type identification stays on the icon chip.

The first feature (Code Snippets — the most-used type) spans 2 columns, breaking the uniform grid. Use `cn` (already imported in the project) for the conditional span.

**Behavior change**: None. Same six features, same content, same hover affordance (now tonal via `hover:border-border/40`).

### 5. Remove the recurring uppercase tracked eyebrow

**Files**: `HeroSection.tsx:10-12`, `FeaturesSection.tsx:53-55`, `PricingSection.tsx:28-30`

**Problem**: The identical `text-xs font-semibold tracking-[0.12em] uppercase text-cyan-500` kicker recurs above 3 of 6 sections — the "eyebrow on every section is AI grammar" absolute ban. Also uses `text-cyan-500`, a non-token accent.

**Fix**: Remove all three eyebrow `<span>`s. If a single deliberate kicker is desired for brand voice, use it **once** on the hero only, in `text-muted-foreground` sentence case (no uppercase, no wide tracking, no cyan):

```tsx
<span className="inline-block text-xs font-medium text-muted-foreground mb-4">
  The developer knowledge hub
</span>
```

Leave Features and Pricing without eyebrows — the `<h2>` carries those sections.

**Behavior change**: None.

### 6. Remove side-stripe item rows + top-stripe cards

**Files**: `ChaosVisual.tsx:347-363`, `FeaturesSection.tsx:71-74`

**Problem**: ChaosVisual mock item rows render a `w-1` (4px) colored left bar — the exact `border-left > 1px` pattern DESIGN.md bans. The feature cards' `h-[3px]` top bar is the same trope on the top edge (removed in Fix 4).

**Fix**: In ChaosVisual, replace the `w-1` left bar with a small 8px colored dot at the row start, preserving the item-type color signal without the stripe:

```tsx
<div className="px-3 flex items-center gap-2.5 flex-1 min-w-0">
  <span
    className="h-2 w-2 rounded-full flex-none"
    style={{ background: typeColor }}
  />
  <span className="h-1.5 rounded bg-border w-[38%] flex-none" />
  <span className="h-1.5 rounded bg-border w-[22%] flex-none" />
  <span className="h-1.5 rounded bg-border w-[14%] flex-none" />
</div>
```

Derive `typeColor` from the existing item-type → `var(--color-*)` mapping already inline in the file (lines 351-363). Remove the now-unused `w-1 h-full` bar `<div>`.

**Behavior change**: None. The mock still shows type-colored indicators; the visual vocabulary changes from stripe to dot.

### 7. Remove all remaining box-shadows (No-Shadow Rule)

**Files**: `PricingSection.tsx:67`, `AiSection.tsx:54`, `HeroSection.tsx:40`, `ChaosVisual.tsx:288,297`

**Problem**: DESIGN.md: "Surfaces are flat. Never add a shadow to a card, button, or container." Multiple glow/drop shadows remain (most are removed in Fix 2; this fix sweeps anything left).

**Fix**: After Fix 2, audit and remove every `shadow-[...]` and `shadow-*` utility on cards/containers/badges in the homepage tree. Replace emphasis with `ring-1 ring-border` or tonal background shifts (`bg-secondary`, `hover:bg-muted`). Confirm no `shadow-[var(--shadow-lg)]` remains on the AI code panel.

**Behavior change**: None.

---

## P3 Fixes

### 8. Fix `z-1` on `<main>`

**File**: `app/page.tsx:23`

**Problem**: `z-1` is not in Tailwind's default z-index scale (which jumps `z-0` → `z-10`); it likely generates nothing, making the stacking intent implicit.

**Fix**: Change to `z-10` (explicit) or remove the class entirely — the fixed gradient (`z-0`) paints behind `main` by source order regardless. Prefer `z-10` to make intent explicit.

### 9. Remove em dash from metadata title

**File**: `app/page.tsx:12`

**Problem**: `"DevStash — Stop Losing Your Developer Knowledge"` uses an em dash, banned in project copy.

**Fix**: Replace with a colon: `"DevStash: Stop Losing Your Developer Knowledge"`.

### 10. Add `text-wrap` to headings and prose

**Files**: all section headings and long prose blocks.

**Problem**: No `text-wrap: balance` on h1–h3; long clamp-scaled headlines can orphan awkwardly at narrow widths.

**Fix**: Add `text-balance` to every `<h1>`/`<h2>`/`<h3>` in `HeroSection`, `FeaturesSection`, `AiSection`, `PricingSection`, `CtaSection`. Add `text-pretty` to the long prose `<p>` blocks (Hero subtitle, Features intro, AI intro, CTA body). Tailwind v4 ships `text-balance` and `text-pretty` utilities.

### 11. Replace arbitrary radii with token utilities

**Files**: `FeaturesSection.tsx` (`rounded-[14px]`), `PricingSection.tsx` (`rounded-[18px]`), `AiSection.tsx` (`rounded-[22px]`, `rounded-xl`), `CtaSection.tsx` (`rounded-[22px]`), `ChaosVisual.tsx` (`rounded-[14px]`, `rounded-[10px]`, `rounded-[9px]`, `rounded-[7px]`).

**Problem**: DESIGN.md defines one `--radius` ramp (`sm`/`md`/`lg`/`xl`/`2xl`). Arbitrary pixel radii bypass the token system.

**Fix**: Map to tokens — `14px`→`rounded-xl` (12px), `18px`→`rounded-2xl` (18px), `22px`→`rounded-2xl` (18px) or `rounded-3xl` (22px), `10px`→`rounded-lg`, `9px`→`rounded-lg`, `7px`→`rounded-md`. Use `rounded-3xl` only for the largest containers (AI panel, CTA) if 22px is intentional; otherwise collapse to `rounded-2xl` for consistency.

### 12. Bring touch targets to 44px

**Files**: `SiteHeader.tsx:113` (mobile menu links), `HeroSection.tsx:32-37` (hero CTAs).

**Problem**: Mobile menu links are `py-2.5` (~40px tall); `Button size="lg"` is `h-9` (36px). WCAG 2.5.5 recommends 44×44 minimum.

**Fix**:
- Mobile menu links: change `py-2.5` to `py-3` and add `min-h-11`.
- Hero CTAs: after Fix 2a the buttons use `variant="default"` with `size="lg"` (`h-9`). Override with `className="h-11"` (or add a project `size="xl"` variant to `button.tsx` only if reused elsewhere — not warranted for one surface).

### 13. Add Escape-to-close + focus handling to the mobile menu

**File**: `components/homepage/siteHeader/SiteHeader.tsx` (lines 98-163)

**Problem**: The mobile menu toggles on click but has no Escape handler and no focus management.

**Fix**:
- Add `onKeyDown` on the `<nav>` (or the menu panel) that calls `closeMobileMenu` on `Escape`.
- When `isMobileMenuOpen` becomes true, focus the first menu link (via a ref). On close, return focus to the toggle button.
- Add `role="dialog"` and `aria-modal="true"` to the open panel, or `role="menu"` with `role="menuitem"` on links. Keep `aria-expanded` on the toggle (already present).

Use a `useEffect` keyed on `isMobileMenuOpen` to manage focus. Use shadcn's existing patterns where possible (the project uses Radix; if a shadcn `Sheet`/`Dialog` is already installed, prefer it over hand-rolling — check `components/ui/`).

### 14. Fix `Reveal` transition declaration

**File**: `components/homepage/reveal/Reveal.tsx` (line 53)

**Problem**: `transition-opacity duration-600 ease-out transition-transform duration-600 ease-out` declares `transition` twice (the second wins, so opacity never transitions) and `duration-600` is not in Tailwind's default duration scale.

**Fix**: Folded into Fix 3 — use `transition-[opacity,transform] duration-500 ease-out`. Confirm `duration-500` is the only duration utility after the change.

### 15. Verify footer link targets

**File**: `components/homepage/sections/Footer.tsx` (lines 49-60, 64-72)

**Problem**: Links to `/items/snippet`, `/items/prompt`, `/items/command`, `/items/note`, and `/settings` may 404 for non-authed visitors.

**Fix**: Verify each route resolves for an unauthenticated visitor. If a route requires auth, either remove it from the public footer or link to `/sign-in` with a redirect intent. Do not change routes — only adjust which appear in the public footer.

### 16. Replace cyan quotes + hardcoded green with tokens

**Files**: `TrustedStrip.tsx:19,21` (`text-cyan-500`), `PricingToggle.tsx:49` (`text-green-500`).

**Problem**: `text-cyan-500` is a non-token accent; `text-green-500` bypasses the theme system.

**Fix**: `TrustedStrip` quotes → `text-muted-foreground` (or `text-[var(--color-snippet)]` for a single restrained item-type accent). `PricingToggle` "Save 25%" → `text-success`.

---

## Implementation Order

1. **Fix 3** (P1) — `Reveal` safe-default + `data-js` in layout. Foundational; affects every section.
2. **Fix 2** (P1) — Strip gradients/glows/palette across all files. Largest change; do in sub-order 2a→2i.
3. **Fix 1** (P1) — Hero gradient text (overlaps Fix 2; do alongside 2b/2h).
4. **Fix 7** (P2) — Sweep remaining shadows (after Fix 2).
5. **Fix 5** (P2) — Remove eyebrows.
6. **Fix 4** (P2) — Bento feature grid + remove top stripe.
7. **Fix 6** (P2) — ChaosVisual side-stripe → dot.
8. **Fixes 8-16** (P3) — z-1, em dash, text-wrap, radii, touch targets, focus, footer links, tokens.

---

## Verification

After each fix (and at the end):

- `npm run build` — no type errors or build failures
- `npm run lint` — no lint errors
- `npm run test:run` — existing tests still pass (no component tests exist; server-action/util tests should be unaffected)
- Manual: load `/` with JS on — verify all sections render, reveal animations play, no blank sections
- Manual: load `/` with JS **disabled** — verify all sections render visible (Fix 3 regression check)
- Manual: verify the hero H1 reads "Stop Losing Your Developer Knowledge" end-to-end with no blank span (Fix 1)
- Manual: verify no indigo/cyan gradients remain anywhere on the homepage (Fix 2 — visual sweep)
- Manual: verify no `box-shadow` renders on any homepage card/container/badge (Fix 7)
- Manual: verify mobile menu opens/closes, Escape closes it, focus moves to first link and returns to toggle on close (Fix 13)
- Manual: verify touch targets ≥44px on mobile (menu links + hero CTAs) (Fix 12)
- Manual: verify all footer links resolve (or are removed) for a logged-out visitor (Fix 15)
- Manual: verify pricing toggle still switches monthly/yearly prices (Fix 2c regression)
- Re-run `/impeccable critique app/page.tsx` to confirm the score moves above 28 and the P1 count drops to 0 (excluding the deferred imagery item).

---

## Out of Scope (file separately)

- **Real product screenshot above the fold.** Deferred per user decision. The ChaosVisual + AI code mock stay as decoration (de-gradientified). Follow-up spec should replace one of them with an actual dashboard/item-view screenshot.
- **Dashboard `--sidebar-primary` indigo.** `globals.css:153` defines the dark sidebar primary as indigo, contradicting "no brand accent." Separate spec should reconcile the dashboard surface with DESIGN.md and decide whether to remove `--accent-indigo`/`--accent-cyan` tokens entirely.
