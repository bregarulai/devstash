---
target: app/items/[type]/page.tsx
total_score: 35
p0_count: 0
p1_count: 2
p2_count: 2
p3_count: 1
timestamp: 2026-06-20T20-38-28Z
slug: app-items-type-page-tsx
---
## Anti-Patterns Verdict

**Does this look AI-generated?** No.

**LLM assessment**: The design system is coherent and deliberate — monochrome base, functional item-type colors only, Geist throughout, flat surfaces, proper tonal layering. The page reads as a real tool interface, not a generated template. No gradient text, no glassmorphism, no hero-metric templates, no numbered section markers. The issues below are inconsistencies, not generative artifacts.

**Deterministic scan**: The bundled detector found zero issues. Clean.

**Visual overlays**: Browser injection was not attempted for this source-file target.

## Overall Impression

This is a solid product UI page that respects its own design system more often than it violates it. The architecture (list → detail drawer) is the right pattern for a knowledge hub. The strongest elements are the item-type color discipline and the drawer's view/edit mode separation. The weakest: two clear design-system violations in ImageCard that break the flat/no-shadow vocabulary, and a missing unsaved-changes guard that erodes trust for a tool interface.

## What's Working

1. **Item-type color restraint.** Colored icon backgrounds at 15% opacity, colored badges in the drawer, no decorative color. This is exactly right for a tool where every color must earn its place functionally.
2. **The drawer architecture.** View/Edit mode separation, skeleton loading, error state, and the `useAutoOpenDrawer` deep-link pattern are well-executed. The drawer feels like a first-class feature.
3. **File list vs. card grid branching.** Conditional rendering for `file` type (list view with columns) vs. other types (card grid) is the correct UX decision — files need size/date visibility, snippets need content preview.

## Priority Issues

### [P1] ImageCard uses a 3px colored left border
**What**: `ImageCard.tsx:52` applies `border-l-[3px]` with a dynamic `borderLeftColor` from the item type color.
**Why it matters**: Directly violates the DESIGN.md rule: "Don't use border-left or border-right greater than 1px as a colored stripe on cards or list items." A user familiar with Linear/Raycast will immediately notice the thick colored stripe as "not how polished tools do it." It also creates visual inconsistency with ItemCard, which uses no side stripe.
**Fix**: Remove the left border. Rely on the icon badge for type identification, matching ItemCard's treatment.
**Suggested command**: `/impeccable polish`

### [P1] ImageCard uses `hover:shadow-md`
**What**: `ImageCard.tsx:52` includes `hover:shadow-md` in the className.
**Why it matters**: DESIGN.md explicitly states: "Don't add box-shadows to surfaces. Flat design is a deliberate choice." ItemCard correctly uses `hover:bg-accent/50` (a tonal shift). ImageCard breaks the elevation vocabulary.
**Fix**: Replace `hover:shadow-md` with `hover:bg-accent/50` to match ItemCard's tonal hover pattern.
**Suggested command**: `/impeccable polish`

### [P2] Copy success uses hardcoded `text-green-500`
**What**: `ItemCard.tsx:117` and `ImageCard.tsx:97` both use `<Check className='text-green-500' />` for the copy confirmation state.
**Why it matters**: The design system defines a functional success token. Hardcoded Tailwind green bypasses the theme system and may not pass WCAG contrast in dark mode. It also means the success color won't adapt if the palette changes.
**Fix**: Replace with the project's success token (e.g., `text-success` if defined in globals.css, or the appropriate oklch-based utility).
**Suggested command**: `/impeccable polish`

### [P2] No unsaved-changes guard in drawer edit mode
**What**: `DrawerEditContent` modifies local state but there's no `beforeunload` handler or navigation blocker.
**Why it matters**: If a user edits the title, then clicks a sidebar link, changes are silently lost. For a tool interface, this erodes trust. Users expect their work to be protected.
**Fix**: Add `useBlocker` from `next/navigation` or a `beforeunload` event when `isEditing && hasChanges`.
**Suggested command**: `/impeccable harden`

### [P3] Sidebar "Navigation" and "Types" use uppercase tracked labels
**What**: `Sidebar.tsx` renders `<p className='px-2 text-xs tracking-wider text-muted-foreground'>Navigation</p>` and the "Types" heading uses `uppercase tracking-wider`.
**Why it matters**: Close to the banned pattern of "tiny uppercase tracked eyebrow above every section." While sidebar structural labels are a borderline case, the pattern is recognizable as the 2023-era kicker.
**Fix**: Consider sentence case ("Navigation", "Types") without uppercase tracking, or accept this as a sidebar-specific convention if intentional.
**Suggested command**: `/impeccable quieter`

## Persona Red Flags

### Alex (Power User)
- Copy-to-clipboard on cards fails silently on HTTP (no toast, no fallback). Alex will try to copy, nothing happens, and they'll assume the feature is broken.
- No Cmd+K search shortcut visible. Power users expect this from Linear/Raycast-class tools.
- The drawer actions row doesn't support keyboard shortcuts (e.g., `E` to edit, `Backspace` to delete).

### Jordan (First-Timer)
- ImageCard's 3px left border is visually dominant and doesn't match ItemCard. Jordan may perceive two different "types" of cards when it's just an inconsistency.
- The empty state copy ("Create your first {type} to get started") doesn't explain what a snippet or prompt is. The type taxonomy may not be self-explanatory.
- No onboarding hints explaining the drawer pattern.

### Sam (Accessibility)
- ImageCard has no additional focus ring beyond the default browser outline. The 3px colored left border is the only visual distinction.
- Copy button uses `title="Copy content"` but no `aria-label`. Screen readers will read from the title attribute, which is acceptable but `aria-label` is more reliable.

## Minor Observations

- `ItemCard.tsx:106-107` renders an empty `<div />` as a spacer when there are no tags. Use `justify-between` on the parent and let the empty state collapse naturally.
- `FileListRow.tsx:82` uses `bg-muted/50` as a default background, giving file rows a tinted background while card rows don't. Subtle inconsistency.
- The `useAutoOpenDrawer` hook removes the `itemId` search param via `router.replace` on mount — a clean deep-link pattern.

## Questions to Consider

1. **Should the drawer be a route instead of a Sheet?** A `/items/snippets/[id]` route would enable deep linking, back-button navigation, and sharing. The current Sheet pattern loses URL state. The `useAutoOpenDrawer` hook is a workaround, not a solution.

2. **Is the card grid the right layout for all text-based types?** Snippets with long titles and 3 tags may read better as a list (like the file view) with a code preview line.

3. **The copy button copies `item.content` directly.** For snippets, this is right. For prompts, should it prepend the system message? For commands, should it copy just the command string? The semantics of "copy" differ by type.

4. **The DESIGN.md says "no brand accent color" but the dark mode uses `--sidebar-primary: oklch(0.488 0.243 264.376)` — a saturated blue.** Where does this appear, and does it violate the "item-type colors only" rule?
