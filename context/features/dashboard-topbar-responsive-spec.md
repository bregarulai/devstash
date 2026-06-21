# Dashboard Top Bar — Responsive Cleanup

## Overview

The dashboard top bar (`MobileSideBar`) is cluttered on small screens. Three changes:
1. Add the DevStash logo + brand text (matching the homepage header).
2. Collapse the search bar to an icon-only trigger on small screens.
3. Replace the two separate create buttons with a single `+` dropdown menu.

## Files to modify

| File | Change |
| --- | --- |
| `components/dashboard/mobileSideBar/MobileSideBar.tsx` | Add logo, restructure search/actions |
| `components/dashboard/searchBar/SearchBar.tsx` | Accept `iconOnly` prop for compact mode |

## 1. Logo

Reuse the exact SVG from `components/homepage/siteHeader/SiteHeader.tsx:97-106` (the rounded-rect `D` mark with `var(--color-brand)` fill).

- **Desktop (≥ `lg`):** SVG logo (28×28) + `<span>DevStash</span>` text, linked to `/dashboard`.
- **Mobile (`< lg`):** SVG logo only (28×28), linked to `/dashboard`. Hide the text with `hidden lg:inline`.

Place the logo as the first element in the `<header>`, before the search bar.

```tsx
<Link href='/dashboard' className='flex items-center gap-2 shrink-0' aria-label='DevStash home'>
  <svg viewBox='0 0 32 32' width='28' height='28' fill='none'>
    <rect x='3' y='3' width='26' height='26' rx='7' fill='var(--color-brand)' />
    <path
      d='M11 21V11h6.5a3.5 3.5 0 0 1 0 7H14'
      stroke='var(--color-brand-foreground)'
      strokeWidth='2.4'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
  <span className='hidden lg:inline text-lg font-bold'>DevStash</span>
</Link>
```

## 2. Search

Modify `SearchBar` to accept an `iconOnly?: boolean` prop.

- When `iconOnly` is true, render only the `Search` icon inside a ghost icon button (`<Button variant='ghost' size='icon'>`). Tapping it calls `openPalette()`. The full search input is hidden.
- When `iconOnly` is false (default), render the current full search input as-is.

In `MobileSideBar`, pass `iconOnly` based on a Tailwind approach: render two versions and toggle visibility with responsive classes:
- `<div className='flex-1 lg:flex-none lg:mx-auto lg:w-full lg:max-w-md'><SearchBar /></div>` (full, hidden below `sm`)
- `<div className='sm:hidden'><SearchBar iconOnly /></div>` (icon-only, hidden at `sm+`)

Actually, simpler: always pass `iconOnly` and let the parent control visibility via responsive wrapper divs. Or, use a CSS-only approach where the full input hides below `sm` and the icon-only version shows.

**Preferred approach:** Keep it CSS-only — no JS breakpoint detection. Wrap the full search in `<div className='flex-1 hidden sm:flex lg:flex-none lg:mx-auto lg:w-full lg:max-w-md'>` and add an icon-only version in `<div className='flex sm:hidden'>`.

## 3. Create Actions Dropdown

Replace `CollectionCreateDialog` and `ItemCreateDialog` buttons with a single shadcn `DropdownMenu`:

```
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button size='icon' variant='ghost'>
      <Plus className='h-4 w-4' />
      <span className='sr-only'>Create</span>
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align='end'>
    <DropdownMenuItem onSelect={() => openItemCreateDialog()}>
      <Plus className='mr-2 h-4 w-4' />
      New Item
    </DropdownMenuItem>
    <DropdownMenuItem onSelect={() => openCollectionCreateDialog()}>
      <FolderDown className='mr-2 h-4 w-4' />
      New Collection
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

Since `ItemCreateDialog` and `CollectionCreateDialog` manage their own `open` state internally, either:
- **Option A (lift state):** Extract the dialog open state into the parent (`MobileSideBar`) via callbacks, and render both dialogs + the dropdown in the same component.
- **Option B (imperative ref):** Expose `open()` via `forwardRef`/`useImperativeHandle` on each dialog, call from the dropdown menu items.

**Use Option A** — it's simpler and avoids ref forwarding. Move the `<ItemCreateDialog>` and `<CollectionCreateDialog>` renders into `MobileSideBar`, controlled by `useState` booleans. The dropdown `onSelect` sets the corresponding state to `true`.

## 4. Favorites Star

No change. Keep the existing ghost icon button with `<Star>` as-is.

## Final top bar layout (left → right)

```
[Logo] [Search (full or icon-only)] ····· [Star] [+ dropdown]
```

On mobile (< `sm`):
```
[Logo] [Search icon] ····· [Star] [+ dropdown]
```

On desktop (≥ `lg`):
```
[Logo + "DevStash"] [Search input centered] ····· [Star] [+ dropdown]
```

## Definition of Done

- Logo (SVG + optional text) visible at all sizes, links to `/dashboard`.
- Search shows full input at `sm+`, icon-only below `sm`. Both open command palette.
- Single `+` dropdown with "New Item" and "New Collection" entries, visible at all sizes.
- Favorites star unchanged.
- No text truncation or overflow at any breakpoint (test at 375px, 640px, 1024px).
- `npm run lint` and `npm run build` pass.
