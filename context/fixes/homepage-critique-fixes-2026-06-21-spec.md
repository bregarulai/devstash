# Homepage Critique Fixes — 2026-06-21

**Source**: `/impeccable critique app/page.tsx`
**Date**: 2026-06-21
**Score**: 25/40 (Acceptable, 20-27 band)
**Snapshot**: `.impeccable/critique/2026-06-21T00-18-37Z__app-page-tsx.md`
**Predecessor**: `context/fixes/homepage-critique-fixes-spec.md` (2026-06-20, 28/40 — gradient/palette/shadow fixes, largely implemented)

## Direction (per user decisions 2026-06-21)

- **Brand color**: Keep snippet blue as the brand color. Formally adopt `--color-snippet` (oklch 0.623 0.214 259.815) as the DevStash brand accent and update DESIGN.md to bless it, so the logo / h1 / AI-tab / hero-glow usage is intentional and governed rather than an accidental rule violation. Introduce a `--color-brand` alias token so brand usage and item-type usage are disambiguated at the token layer (see Fix 2).
- **Priority clusters (in order)**: (1) Trust and credibility, (2) Brand and color tells, (3) Features grid structure. Motion and reveal is included but deprioritized to the end.
- **Scope**: Spec only. This file captures all P0/P1 priority issues plus the cluster-relevant findings the user prioritized. No code changes in this pass.

## Constraint

Visual / structural / copy / a11y fixes only. No changes to page behavior, routing, auth flow, or data unless explicitly noted. Preserve all existing interactions, click handlers, links, and responsive breakpoints.

## Why the score dropped from 28 to 25

The 2026-06-20 fixes resolved the gradient-text, indigo/cyan palette, and box-shadow bans, but several fixes were partial or introduced new tells: the hero gradient was replaced with a solid `var(--color-snippet)` span (traded gradient-text for item-type-color-as-decoration), the bento grid only stretched one card instead of breaking the uniform grid, the Reveal `data-js` guard made no-JS safe but the JS-enabled blank-hero window on slow hydration remains, the AI tag row still sprinkles 5 item-type colors decoratively, and the uppercase-tracked eyebrow persisted in the AI section. New findings this run: placeholder social links shipped live, TrustedStrip filler occupying the social-proof slot, and zero security/privacy reassurance for the "AI reads your snippets" + R2 storage claims.

---

## Summary

| Cluster | Priority | Issue | Files |
| ------- | -------- | ----- | ----- |
| Trust | P0 | Placeholder social links shipped live (`your-repo`, `your-handle`) | `Footer.tsx` |
| Trust | P1 | TrustedStrip filler occupies the social-proof slot, delivers no credibility | `TrustedStrip.tsx` |
| Trust | P1 | No security/privacy/training-data reassurance for AI-reads-snippets + R2 file storage | `AiSection.tsx`, `PricingSection.tsx`, `Footer.tsx` |
| Brand | P0 | Item-type blue used as brand without a governing rule (now to be codified, not removed) | `DESIGN.md`, `globals.css`, `SiteHeader.tsx`, `Footer.tsx`, `HeroSection.tsx`, `AiSection.tsx`, `ChaosVisual.tsx` |
| Brand | P1 | AI tags row: 5 item-type colors in one row with arbitrary mapping (One-Color Rule) | `AiSection.tsx` |
| Brand | P1 | Uppercase tracked eyebrow labels ("Pro Feature", "AI Generated Tags", "Most Popular") | `AiSection.tsx`, `PricingSection.tsx` |
| Brand | P2 | Off-token hardcoded syntax colors in AI code mock (`purple-400`/`yellow-300`/`blue-400`) | `AiSection.tsx` |
| Features | P1 | Identical 6-card grid; `col-span-2` only widens one cell, does not break sameness | `FeaturesSection.tsx` |
| Features | P1 | Incoherent type-to-icon-to-title mapping (Terminal/orange = "Instant Search", etc.) | `FeaturesSection.tsx` |
| Features | P2 | Copy/count mismatch: "Seven item types" / "All 7 item types" vs 6 cards (image has no card) | `FeaturesSection.tsx`, `PricingSection.tsx` |
| Features | P3 | Backwards hover affordance: `hover:border-border/40` makes the border fainter on hover | `FeaturesSection.tsx` |
| Motion | P1 | Reveal has no `prefers-reduced-motion` path; gates the above-the-fold hero until hydration | `Reveal.tsx`, `layout.tsx` |
| Motion | P2 | Decorative `arrowPulse` rings + perpetual ambient icon bounce convey no state | `ChaosVisual.tsx` |
| Motion | P3 | `cursor-crosshair` is an odd affordance for the repel stage; arrow shaft/head tonal disconnect | `ChaosVisual.tsx` |

**Detector note**: `detect.mjs` flagged `ChaosVisual.tsx:294` (`borderLeft: '20px solid ...`) as a `side-tab` anti-pattern. Confirmed **false positive**: it is the CSS-triangle arrowhead between the chaos and order panels, not a decorative side-stripe on a card. No action required on that line beyond the motion/tonal items above.

---

## Cluster 1 — Trust and credibility (lead)

### Fix 1 — Replace placeholder social links (P0)

**File**: `components/homepage/sections/Footer.tsx:55-82`

**Problem**: The GitHub and X icons link to `https://github.com/your-repo` and `https://x.com/your-handle`. A skeptical visitor sees `your-repo` in the status bar on hover and bounces. This is a trust-destroying, unrecovered-error signal on a developer-tool landing, and the single most-cited red flag for the Morgan (skeptical senior dev) and Alex (power user) personas.

**Fix**: Link to the real repository and social handle. If either does not exist yet, remove that icon entirely until it does. Never ship `your-*` placeholders to production.

```tsx
// If the repo exists:
<a href="https://github.com/<real-org>/<real-repo>" ...>
// If no public repo yet: remove the <a> block entirely rather than leaving a dead link.
```

**Behavior change**: None to flow; only the `href` (or presence) of the social anchors changes.

### Fix 2 — Replace TrustedStrip filler with a real credibility signal (P1)

**File**: `components/homepage/sections/TrustedStrip.tsx`

**Problem**: The strip sits in the social-proof slot immediately after the hero but delivers four rhetorical questions in mono ("Where did I save that snippet?", etc.) and restates the hero's pain. It adds no trust signal where one belongs and deflates the hero's energy (the emotional-journey valley right after the peak). Both Jordan (first-timer) and Morgan (skeptical senior dev) read it as "they have no customers and nothing to show."

**Fix**: Replace with the strongest real credibility signal available today, in order of preference:
1. A single named testimonial with a real name, role, company, and link (repo or profile).
2. A usage / build signal: "Built by N engineers," repo star count, or "open source, MIT licensed" with a link.
3. A compact trust bar: "Open source" / "Encrypted at rest" / "Not used for AI training" as three short labeled chips (ties into Fix 3).

Keep it short (one line or one row). Do not fabricate testimonials or numbers. If none of the above are available yet, collapse the section entirely rather than ship filler; the hero flows directly into Features.

**Behavior change**: Section content changes; no routing or layout-grid change.

### Fix 3 — Add security/privacy reassurance for AI and file storage claims (P1)

**Files**: `components/homepage/sections/AiSection.tsx:37-40`, `components/homepage/sections/PricingSection.tsx:17`, `components/homepage/sections/Footer.tsx`

**Problem**: "DevStash AI reads your snippets and prompts" (AiSection.tsx:38) and "File uploads (R2 storage)" (PricingSection.tsx:17) make high-stakes claims with zero security/privacy/training-data reassurance anywhere on the page. Morgan (security-conscious senior dev) will not put code into a tool that "reads" it without an explicit "not used for training / encrypted at rest" statement. This is the biggest trust gap for the Pro-tier value prop.

**Fix**: Add a concise, specific reassurance line. Be accurate; do not overstate.
- In AiSection, directly under the AI feature list or the intro paragraph: one line such as "Your snippets are encrypted at rest and never used for model training." (Only ship copy the backend actually guarantees; verify with the codebase before committing to specific wording.)
- In PricingSection, under the Pro tier or near the file-upload feature: "Files stored encrypted in R2. Private to your account."
- In Footer, add a Privacy / Security link column (links to `/privacy` and `/security` if those routes exist; otherwise file as out-of-scope follow-up to create the routes).

**Behavior change**: Copy additions only, plus optional footer link column. No flow change.

### Fix 4 — Thicken the footer with developer-trust links (P1)

**File**: `components/homepage/sections/Footer.tsx:28-50`

**Problem**: The footer has only Product and Account columns. For a dev tool that reads your snippets and stores your files, the absence of docs / changelog / security / privacy / "built by" reads as "hobby project, not infrastructure" to the senior-dev persona.

**Fix**: Add a Resources or Company column with the links that actually resolve today (docs, changelog, security, privacy, GitHub). Verify each route exists for an unauthenticated visitor before adding it; do not link to 404s. If a target page does not exist yet, omit it and file a follow-up. Keep the two existing columns; add a third only with real targets.

**Behavior change**: Footer link inventory changes only.

---

## Cluster 2 — Brand and color tells

### Fix 5 — Codify snippet blue as the brand accent (P0, reframed by user decision)

**Files**: `DESIGN.md`, `app/globals.css`, then reference-only across `SiteHeader.tsx`, `Footer.tsx`, `HeroSection.tsx`, `AiSection.tsx`, `ChaosVisual.tsx`

**Problem**: DESIGN.md currently states "no brand accent color; item-type colors are the only chromatic identity." The homepage nevertheless uses `--color-snippet` (blue) as a de-facto brand color in the logo (SiteHeader.tsx:65, Footer.tsx:11), the h1 emphasis span (HeroSection.tsx:15), the AI code-tab underline `border-snippet` (AiSection.tsx:61), and the ChaosVisual radial glow (ChaosVisual.tsx:276). Per the 2026-06-21 user decision, this usage is to be kept and made intentional, not removed.

**Fix**: Formally adopt snippet blue as the brand accent and govern it.
1. In `app/globals.css`, add a brand alias token in both `:root` and `.dark`:
   ```css
   --color-brand: var(--color-snippet);
   --color-brand-foreground: oklch(0.985 0 0);
   ```
   Expose it through the `@theme inline` block (`--color-brand: var(--color-brand);`) so `text-brand`, `bg-brand`, `border-brand` utilities exist. Brand and snippet share a value today but can diverge later without touching call sites.
2. Replace brand-usage call sites to reference `--color-brand` instead of `--color-snippet`:
   - `SiteHeader.tsx:65` and `Footer.tsx:11` logo `<rect>`: `fill="var(--color-brand)"`.
   - `HeroSection.tsx:15` h1 span: `className="text-[var(--color-brand)]"`.
   - `AiSection.tsx:61` active tab underline: `border-brand` (keep; it is a code-file tab, semantically adjacent to a snippet context, so brand blue is acceptable here).
   - `ChaosVisual.tsx:276` radial glow: keep at low opacity, referencing `var(--color-brand)`; or remove if the glow reads as decoration (see Fix 11).
3. Update `DESIGN.md` Section 2 to add a brand-accent rule: "DevStash has one brand accent: Brand Blue (oklch 0.623 0.214 259.815), aliased to the snippet item-type color. It is used for the logo mark, the wordmark accent, primary CTAs, and brand glows. The item-type snippet blue is used only in item-type contexts (item chips, type dots, type labels) where the item type is explicit." Add the disambiguation rule: "When blue appears on an item-type chip/dot, it means snippet. When blue appears on the logo, a CTA, or a brand glow, it means DevStash. Context disambiguates; do not use brand blue as a generic decorative accent outside brand-mark and primary-CTA contexts."

**Decision point (call out in PR)**: Whether to introduce a dedicated `--color-brand` token (recommended, cleanest) vs. bless `--color-snippet` for dual use in place. This spec assumes the alias approach.

**Behavior change**: None. Color values are identical; only the token reference and the governing doc change.

### Fix 6 — Collapse the AI tags row to a single color (P1)

**File**: `components/homepage/sections/AiSection.tsx:124-137`

**Problem**: The "AI Generated Tags" row renders five chips in one flex-wrap row, each tinted with a different item-type color (snippet/prompt/command/note/link) and mapped arbitrarily (`typescript` to command orange, `state` to note yellow, `toggle` to url/link emerald). Five item-type colors in one row breaks the One-Color Rule and the colors are decorative, not semantic (these are AI-suggested tags, not item-type identifiers).

**Fix**: Render all AI tag chips in a single consistent treatment. Preferred: one neutral chip style (`bg-secondary text-secondary-foreground border border-border rounded-sm` per the DESIGN.md badge spec) so the tags read as "AI suggested" without borrowing item-type semantics. Alternative: introduce a dedicated "AI" color (e.g. reuse `--color-prompt` purple as the AI accent, since AI/prompts are adjacent) applied uniformly to every chip. Do not mix item-type colors in one row.

```tsx
{AI_TAGS.map((tag) => (
  <span
    key={tag.label}
    className="text-xs font-semibold py-1 px-2.5 rounded-sm bg-secondary text-secondary-foreground border border-border"
  >
    {tag.label}
  </span>
))}
```

Remove the per-tag `style` block and the `type` field from `AI_TAGS` if no longer used. Use the badge token radius (`rounded-sm`, 4px) per DESIGN.md, not `rounded-full`.

**Behavior change**: None. Visual treatment of the tag chips changes only.

### Fix 7 — Convert uppercase tracked eyebrows to normal-case hierarchy (P1)

**Files**: `components/homepage/sections/AiSection.tsx:30,121`, `components/homepage/sections/PricingSection.tsx:62`

**Problem**: "Pro Feature" (AiSection.tsx:30), "AI Generated Tags" (AiSection.tsx:121), and "Most Popular" (PricingSection.tsx:62) are all `uppercase tracking-[0.08-0.1em] text-[11px] font-bold`. The tiny-uppercase-tracked-eyebrow is an AI-grammar tell, especially with two instances in one section.

**Fix**: Convert each to normal-case hierarchy via weight and size, keeping the label's meaning:
- AiSection "Pro Feature": normal-case `text-xs font-semibold text-muted-foreground` (or a `bg-secondary` pill without uppercase tracking).
- AiSection "AI Generated Tags": normal-case `text-xs font-semibold text-muted-foreground` (a label, not a kicker).
- PricingSection "Most Popular": keep as a pill badge but drop `uppercase` and `tracking-[0.08em]`; use `text-[11px] font-semibold` normal-case. The pill shape and `bg-brand text-brand-foreground` already distinguish it.

Reserve uppercase tracking for zero or one deliberate brand kicker on the whole page, not as a recurring label style.

**Behavior change**: None. Label styling changes only.

### Fix 8 — Bring the AI code mock onto the token system (P2)

**File**: `components/homepage/sections/AiSection.tsx:68-118`

**Problem**: The fake code editor uses hardcoded Tailwind palette classes (`text-purple-400`, `text-yellow-300`, `text-blue-400`) for syntax highlighting, bypassing the oklch token system. A senior dev reads the arbitrary palette as "mocked, not real."

**Fix**: Define syntax-color tokens in `globals.css` (`--syntax-keyword`, `--syntax-string`, `--syntax-function`, `--syntax-plain`) in both `:root` and `.dark`, exposed through `@theme inline`, and reference them via `text-[var(--syntax-keyword)]` etc. Keep the mac traffic-light dots (`bg-dot-red`/`bg-dot-yellow`/`bg-dot-green`) as they already use tokens. This is a polish item; pair with Fix 6 and Fix 7 when editing the AI section.

**Behavior change**: None. Color references change only.

---

## Cluster 3 — Features grid structure

### Fix 9 — Break the identical 6-card grid and fix the type-to-icon-to-title mapping (P1)

**File**: `components/homepage/sections/FeaturesSection.tsx:5-80`

**Problem**: Six same-sized cards (icon tile + title + description) in a 3x2 grid is the "identical card grids" absolute ban. The existing `lg:col-span-2` on card 0 only widens one cell; it does not break the uniform grid. Worse, the `type`/`icon`/`title`/`color` mapping in the `FEATURES` array is incoherent: `command`/Terminal/orange is titled "Instant Search", `note`/FileText/yellow is titled "Commands & Notes", `url`/Link/emerald is titled "Collections". The item-type colors are therefore decorative, not semantic, which undermines the product's own type-driven IA claim.

**Fix**:
1. **Remap types to titles coherently.** Each card's `type`/`icon`/`color` must match what the card is about. Either:
   - (a) Title each card by its item type ("Code Snippets" with snippet/Code/blue, "AI Prompts" with prompt/Sparkles/purple, "Commands" with command/Terminal/orange, "Notes" with note/FileText/yellow, "Files & Docs" with file/Folder/gray, "Links" with link/Link/emerald), and move "Instant Search" and "Collections" out of this grid into their own distinct, non-card treatment (a search callout and a collections callout); or
   - (b) Keep the six current titles but strip the item-type `color`/`icon` from cards whose title is not an item type (search, collections), giving those cards a neutral icon and neutral color so no item-type color is misused.
   Prefer (a): it makes the grid a tour of the seven item types, which is what the subhead promises.
2. **Resolve the 7-vs-6 count.** The subhead says "Seven item types" (line 58) and PricingSection says "All 7 item types" (line 11), but only 6 cards render and the image type has no card. Either add a 7th card for Images, or change the copy to match the cards shown. Do not let copy and cards disagree.
3. **Break the uniform grid.** Vary card spans so the grid is no longer six identical cells. Keep the icon-tile + title + description content but vary the footprint: e.g. the first card (Code Snippets, the most-used type) spans 2 columns and is taller with a richer preview; two others span 1 column; one spans 2 columns as a wide row. Use `lg:col-span-2` / `lg:row-span-2` on more than one card so the grid reads as a deliberate bento, not one stretched cell among five identical ones.
4. **Fix the backwards hover affordance** (P3, line 65): `hover:border-border/40` makes the border fainter on hover. Change to `hover:border-foreground/20` (or `hover:bg-muted`) so hover strengthens, not dissolves.

**Behavior change**: None to interactions. Grid spans and card content/map change.

---

## Cluster 4 — Motion and reveal (deprioritized)

### Fix 10 — Give Reveal a reduced-motion path and stop gating the above-the-fold hero (P1)

**Files**: `components/homepage/reveal/Reveal.tsx:52-57`, `app/layout.tsx:41-45`

**Problem**: Reveal applies `opacity-0 + translate-y-6` under `[html[data-js]_&]` and animates over 500ms with no `prefers-reduced-motion` guard. The blocking head script sets `data-js` before paint (layout.tsx:41-45), so the no-JS fallback is correct (content visible when JS is off). But on JS-enabled connections the entire hero (headline, subhead, CTAs) is invisible from first paint until React hydrates and the IntersectionObserver fires: a real blank-hero window on slow 3G. Below-fold Reveal content also stays `opacity-0` and will not print if the page is printed without scrolling to it. The product register bans decorative motion and requires a reduced-motion alternative for every animation.

**Fix**:
1. Add a `prefers-reduced-motion` branch in Reveal that sets `isVisible=true` immediately and skips the transition. Use `useSyncExternalStore` against `matchMedia('(prefers-reduced-motion: reduce)')` (the pattern already exists in `ChaosVisual.tsx:38-50`; reuse or extract it).
2. For above-the-fold critical content (the hero), either drop Reveal entirely or default `isVisible=true` and only animate on subsequent / off-screen mounts, so the hero is visible at first paint and never blank during hydration.
3. Add a print safeguard in `globals.css`:
   ```css
   @media print {
     [data-js] & { opacity: 1 !important; transform: none !important; }
   }
   ```

**Behavior change**: Reduced-motion users and printers see content immediately; JS users on slow connections see the hero at first paint. No change to the scroll-reveal effect for below-fold sections on motion-OK users.

### Fix 11 — Remove or repurpose decorative ambient motion (P2)

**File**: `components/homepage/chaosVisual/ChaosVisual.tsx:71-113,298-311`

**Problem**: The `arrowPulse` rings (lines 298-311) are pulsing border-primary circles around the arrow that signal nothing. The icons bounce and breathe forever via the rAF loop (lines 71-113). Both are decorative motion that does not convey state, which the product register bans. The perpetual motion also reads as "style over substance" to the Alex persona.

**Fix**:
- **arrowPulse rings**: remove them, or repurpose to fire once when the panel scrolls into view (a single 400ms pulse that conveys "this is where chaos becomes order"). If kept as a loop, gate it behind `prefers-reduced-motion` (already partly handled) and justify it as a directional affordance, not ambient decoration.
- **Perpetual bounce**: keep the mouse-repel interaction (it conveys the "chaos" message actively) but settle the icons toward their home positions when the mouse is inactive, so the stage is calm at rest and only moves on interaction. This makes the motion convey state ("you are disturbing the chaos") rather than animating for its own sake.
- **Tonal disconnect**: the arrow shaft uses `bg-muted-foreground` (L 0.708) while the head uses `var(--color-foreground)` (L 0.985), two different grays. Unify to `var(--color-foreground)` for both, or `var(--color-muted-foreground)` for both, so the arrow reads as one element.

**Behavior change**: The repel interaction stays; the resting state becomes calm and the pulse rings either fire once or are removed.

### Fix 12 — Replace `cursor-crosshair` and clarify the arrow on mobile (P3)

**File**: `components/homepage/chaosVisual/ChaosVisual.tsx:274,283`

**Problem**: `cursor-crosshair` on the repel stage is an odd affordance (implies precision targeting, not play). On mobile the arrow between stacked panels is `rotate-90` with `h-[70px]`, reading as a thin vertical divider rather than an arrow, and `touchmove` repel fights page scroll.

**Fix**:
- Stage cursor: use `cursor-default` (or `cursor-pointer` if the stage is meant to feel interactive), not `cursor-crosshair`.
- Mobile arrow: shorten the rotated arrow (`h-[44px]`) and make the head proportional so it reads as an arrow pointing down, not a divider. Consider `rotate-90` only on `lg:` and a compact downward arrow on mobile.
- Touch repel: either disable `touchmove` repel on touch devices (let the stage be static on mobile) or use `touch-action: none` on the stage so repel does not fight scroll. Prefer disabling on touch: the repel is a desktop delight, not essential on mobile.

**Behavior change**: Touch users get a static stage (no scroll-fighting); desktop cursor changes; mobile arrow reads as an arrow.

---

## Minor observations (not clustered, address opportunistically)

- **PricingToggle a11y** (`PricingToggle.tsx:21-52`): `role="group"` with two buttons exposes no `aria-pressed`/`aria-checked`/radiogroup role; selected state is visual-only. Add `role="radiogroup"` with `role="radio"` + `aria-checked` on each button, or toggle `aria-pressed` on each. Add an `aria-live="polite"` region that announces the price when billing changes. The price swap (`PricingSection.tsx:69-84`) hides one digit via `display:none` (good for SR) but causes a slight 8-to-72 width reflow; add a "billed annually" clarification when yearly is selected. "Save 25%" uses `text-success` (a state color) for a marketing nudge; consider `text-brand` instead so success stays semantic.
- **Hero `<br/>`** (`HeroSection.tsx:14`): the forced break can rag "Stop Losing Your" internally at mid widths (~500px, 7vw ~ 35px) before breaking to "Developer Knowledge". Drop the `<br/>` and let `text-balance` (already present) handle the wrap, or restructure so the colored span is the natural second line.
- **Footer copyright year** (`Footer.tsx:53`): `new Date().getFullYear()` in a Server Component is fine for SSR, but if the route is statically generated the year freezes at build time. Acceptable for now; note for a dynamic-rendering follow-up.
- **SiteHeader mobile menu** (`SiteHeader.tsx:128-135`): `aria-modal="true"` is set but there is no focus trap and no click-outside-to-close. Add a focus trap (loop Tab within the panel) and close on outside click. Consider using a shadcn `Sheet` if installed (check `components/ui/`) instead of hand-rolling.
- **SiteHeader / main / footer z-index** (`page.tsx:22`, `SiteHeader.tsx:51`, `Footer.tsx:5`): `z-50` on the fixed nav is correct; `z-10` on `main` and `footer` is meaningless because no background layer exists behind `main` (the prior `bg-hero-gradient` was removed). Either remove the `z-10` classes or document the intended stacking. Prefer removing them.
- **AI code mock clipping on mobile** (`AiSection.tsx:54,68`): the code window is `overflow-hidden` with `whitespace-pre` spans; longer lines (e.g. `export function useToggle(initial = false ) {`) risk clipping at 375px. Add `overflow-x-auto` to the code block so long lines scroll horizontally instead of clipping.

---

## Implementation Order (by user-chosen cluster priority)

1. **Fix 1** (P0, Trust) — placeholder social links. Smallest, highest-trust win.
2. **Fix 3 + Fix 4** (P1, Trust) — security/privacy reassurance + footer trust links. Pair these; both touch the footer/AI/pricing copy.
3. **Fix 2** (P1, Trust) — TrustedStrip replacement. Requires a real credibility signal to exist; coordinate with whatever is available.
4. **Fix 5** (P0, Brand) — codify snippet blue as brand: add `--color-brand` token, update DESIGN.md, repoint call sites.
5. **Fix 6 + Fix 7 + Fix 8** (P1/P2, Brand) — AI tags single-color, eyebrow normal-case, code-mock tokens. Edit AiSection in one pass.
6. **Fix 9** (P1, Features) — remap types to titles, resolve 7-vs-6 count, break the uniform grid, fix hover affordance.
7. **Fix 10** (P1, Motion, deprioritized) — Reveal reduced-motion + hero-not-gated.
8. **Fix 11 + Fix 12** (P2/P3, Motion, deprioritized) — ambient motion, cursor-crosshair, mobile arrow.
9. **Minor observations** — PricingToggle a11y, hero `<br/>`, mobile menu focus trap, z-index cleanup, code-mock horizontal scroll.

End with `/impeccable polish app/page.tsx` after the in-scope fixes land, then re-run `/impeccable critique app/page.tsx` to confirm the score moves above 25 and the P0 count drops to 0.

---

## Verification

After each fix (and at the end):

- `npm run build` — no type errors or build failures.
- `npm run lint` — no lint errors.
- `npm run test:run` — existing server-action/util tests still pass (no component tests exist).
- Manual: load `/` with JS on; verify all sections render, reveal animations play, no blank hero during hydration (Fix 10).
- Manual: load `/` with JS disabled; verify all sections render visible (regression check on the existing `data-js` guard).
- Manual: load `/` with `prefers-reduced-motion: reduce`; verify no scroll-reveal slide and no ambient bounce (Fixes 10, 11).
- Manual: hover the social links; verify no `your-repo`/`your-handle` in the status bar (Fix 1).
- Manual: verify the AI tags row renders in a single color, not five (Fix 6); verify no uppercase-tracked eyebrow labels remain (Fix 7).
- Manual: verify the Features grid is non-uniform and each card's icon/color matches its title; verify copy says "seven" only if seven cards/treatment exist (Fix 9).
- Manual: verify the logo, h1 span, and AI tab still render blue (Fix 5 did not remove color, only re-tokened it).
- Manual: verify the footer links all resolve for a logged-out visitor (Fix 4).
- Re-run `/impeccable critique app/page.tsx`; confirm score > 25 and P0 count = 0.

---

## Out of Scope (file separately)

- **Real product screenshot above the fold.** The ChaosVisual and AI code mock remain decoration. A follow-up spec should replace one with an actual dashboard/item-view screenshot once the dashboard is screenshot-ready.
- **Dashboard `--sidebar-primary` indigo.** `globals.css:157` defines the dark sidebar primary as indigo. Now that the homepage is codifying snippet blue as the brand, a separate spec should reconcile the dashboard surface with the new brand-accent rule (keep, change, or unify with brand blue).
- **Privacy / Security / Docs routes.** Fix 3 and Fix 4 link to these only if they exist. Creating the routes is a separate follow-up.
- **Live testimonial / usage numbers.** Fix 2 depends on a real credibility signal being available. If none exists yet, collapse TrustedStrip and file a follow-up for when one is ready.
