---
name: DevStash
description: A unified hub for developer knowledge & resources
colors:
  neutral-950: "#09090b"
  neutral-800: "#18181b"
  neutral-700: "#27272a"
  neutral-600: "#3f3f46"
  neutral-500: "#52525b"
  neutral-400: "#a1a1aa"
  neutral-300: "#d4d4d8"
  neutral-200: "#e4e4e7"
  neutral-100: "#f4f4f5"
  neutral-50: "#fafafa"
  white: "#ffffff"
  primary-ink: "#18181b"
  destructive: "#ef4444"
  snippet: "#3b82f6"
  prompt: "#8b5cf6"
  command: "#f97316"
  note: "#fde047"
  file: "#6b7280"
  image: "#ec4899"
  link: "#10b981"
typography:
  display:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "normal"
  headline:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "normal"
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "4px"
  md: "8px"
  lg: "10px"
  xl: "12px"
  2xl: "18px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-default:
    backgroundColor: "{colors.primary-ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "4px 10px"
    height: "32px"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    borderColor: "{colors.border}"
    rounded: "{rounded.md}"
    padding: "4px 10px"
    height: "32px"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.md}"
    padding: "4px 10px"
    height: "32px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "4px 10px"
    height: "32px"
  button-destructive:
    backgroundColor: "{colors.destructive}/10"
    textColor: "{colors.destructive}"
    rounded: "{rounded.md}"
    padding: "4px 10px"
    height: "32px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.xl}"
    padding: "16px"
  card-sm:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.xl}"
    padding: "12px"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    borderColor: "{colors.border}"
    rounded: "{rounded.md}"
    height: "32px"
    padding: "4px 10px"
  badge:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.sm}"
---
# Design System: DevStash

## 1. Overview

**Creative North Star: "The Developer's Workbench"**

DevStash is a tool interface — not a marketing page, not a portfolio. The visual system serves the product: fast retrieval, clear organization, zero distraction. The aesthetic is the same as Linear, Raycast, and VS Code: dark-first, type-driven, restrained color.

The system uses a neutral monochrome base (no brand accent color) with item-type colors as the only chromatic elements. This means every color on screen has a functional purpose: it identifies an item type, indicates state, or signals an error. No color is decorative.

Dark mode is the default. Light mode is a secondary variant. The interface feels native in dark environments.

**Key Characteristics:**
- Dark-first, monochrome base with functional color
- Geist typeface family: clean, technical, highly legible
- Flat surfaces with tonal layering (no shadows)
- Gently curved edges (8px radius)
- Item-type colors as the sole chromatic vocabulary
- Minimal borders, ring-based focus states

## 2. Colors

The palette is neutral-first. There is no brand accent color. Chromatic identity comes entirely from the seven item-type colors, which are the only saturated hues in the system.

### Primary

- **Ink** (#18181b): Default button background, headings, primary text in light mode. The dark anchor of the light theme.

### Secondary

- **Surface Gray** (#fafafa): Secondary button background, muted surfaces. A near-white tint used sparingly for surface variation.

### Destructive

- **Alert Red** (#ef4444): Error states, destructive actions. Used only for warnings and removals.

### Neutral

- **Dark Background** (#09090b): Primary dark-mode canvas. The base for `prefers-color-scheme: dark`.
- **Dark Surface** (#18181b): Dark-mode card/container background.
- **Dark Border** (#27272a): Dark-mode borders and dividers.
- **Muted Text** (#a1a1aa): Placeholder text, disabled states, secondary labels in dark mode.
- **Light Background** (#ffffff): Primary light-mode canvas.
- **Light Border** (#e4e4e7): Light-mode borders and dividers.
- **Foreground** (#fafafa / #09090b): Body text. Inverts between themes.

### Item Types (Chromatic Identity)

- **Snippet Blue** (#3b82f6): Code snippets. The most frequently seen color in the system.
- **Prompt Purple** (#8b5cf6): AI prompts. Secondary chromatic anchor.
- **Command Orange** (#f97316): Terminal commands. High visibility for actionable items.
- **Note Yellow** (#fde047): Notes. Warm, attention-grabbing for quick-reference items.
- **File Gray** (#6b7280): File attachments. Neutral chromatic for non-text items.
- **Image Pink** (#ec4899): Image attachments. Distinct from File Gray.
- **Link Emerald** (#10b981): External links. Green signals "outward" action.

**The Item-Type Rule.** Saturated colors appear only as item-type identifiers, focus rings, or destructive states. No section, card, or decorative element may use them. Their rarity is the point.

### Named Rules

**The One-Color Rule.** Any given screen surface should contain at most one item-type color per row or grid cell. Clustered item-type colors on a single surface reads as noise, not organization.

## 3. Typography

**Display Font:** Geist (system-ui fallback)
**Body Font:** Geist (system-ui fallback)
**Mono Font:** Geist Mono (ui-monospace fallback)

**Character:** A single typeface family with weight contrast. Geist is a geometric sans-serif designed for screen readability — tight x-height, open apertures, technical precision. The mono variant carries code and terminal output. No font pairing needed; weight and size do the hierarchy work.

### Hierarchy

- **Display** (600, clamp(2rem, 5vw, 3rem), 1.1): Page titles, dashboard heading. Reserved for the top of the hierarchy only.
- **Headline** (600, 1.25rem, 1.4): Section titles, card titles. The most frequently used bold weight.
- **Body** (400, 0.875rem, 1.5): Item content, descriptions, body text. Max line length 65–75ch.
- **Label** (500, 0.75rem, 1): Badge text, navigation labels, type indicators. Often uppercase with tracking.
- **Mono** (400, 0.875rem, 1.5): Code blocks, terminal output, file paths.

### Named Rules

**The Single-Family Rule.** DevStash uses one font family (Geist) in multiple weights. No font pairing, no third typeface. Weight and size contrast provide all hierarchy.

## 4. Elevation

Flat by default. Depth is conveyed through tonal layering (background vs. surface vs. elevated surface) and subtle ring borders (`ring-1 ring-foreground/10`), not shadows. This is the same approach as Linear and Raycast: clean, uncluttered surfaces that don't cast.

Card containers use a 1px ring at 10% foreground opacity for subtle separation from the background. No `box-shadow` tokens exist in the system.

### Named Rules

**The No-Shadow Rule.** Surfaces are flat. Elevation comes from background tone shifts and ring borders only. Never add a shadow to a card, button, or container.

## 5. Components

### Buttons

- **Shape:** Gently curved edges (8px radius)
- **Primary:** Ink background (#18181b), white text, 32px height, 10px horizontal padding
- **Hover:** Background darkens via opacity; no shadow, no scale
- **Focus:** Ring border (focus-visible:border-ring) + 3px ring (focus-visible:ring-3)
- **Secondary:** Surface gray background, dark text
- **Outline:** Transparent background, border border, hover:bg-muted
- **Ghost:** Transparent, no border, hover:bg-muted
- **Destructive:** 10% opacity destructive background, full opacity destructive text

### Cards / Containers

- **Corner Style:** 12px radius (rounded-xl)
- **Background:** Card token (inverts between themes: white in light, #18181b in dark)
- **Border:** 1px ring at 10% foreground opacity (`ring-1 ring-foreground/10`)
- **Internal Padding:** 16px default, 12px for sm size
- **Shadow:** None (flat)

### Inputs / Fields

- **Style:** Transparent background, 1px border (border-input), 8px radius
- **Focus:** Ring border shift (focus-visible:border-ring) + 3px ring glow
- **Placeholder:** Muted foreground color (#a1a1aa in dark mode)
- **Error:** Destructive border + ring (aria-invalid:border-destructive)
- **Disabled:** Input background at 50% opacity, cursor-not-allowed

### Badges / Chips

- **Style:** Secondary background, secondary foreground text
- **Corner Style:** 4px radius (rounded-sm) — tight, compact
- **Role:** Item type indicators, status labels, collection counts

### Navigation (Sidebar)

- **Style:** Tonal layering — sidebar background is a distinct tone from main content
- **Active state:** Background tint + foreground color shift
- **Hover:** Subtle background tint (hover:bg-muted)
- **Typography:** Label weight (500), compact size for type names

## 6. Do's and Don'ts

### Do:
- **Do** use dark mode as the default canvas. The `dark` class is set on the root `<html>`.
- **Do** use item-type colors solely for their functional purpose: identifying item types, indicating active state, or signaling destructive action.
- **Do** keep surfaces flat. Use tonal differences and ring borders for depth, never shadows.
- **Do** use Geist for all text. One family, multiple weights. No font pairing.
- **Do** use 8px radius as the default corner treatment. 12px for cards, 4px for badges.
- **Do** keep the palette restrained. Neutral base, functional color only.

### Don't:
- **Don't** add a brand accent color. DevStash has no primary brand hue — item-type colors are the chromatic identity.
- **Don't** use neon, glow, or gradient effects. Anti-reference: no neon cyberpunk aesthetics.
- **Don't** add box-shadows to surfaces. Flat design is a deliberate choice, not a limitation.
- **Don't** introduce a second font family. Geist is the type system.
- **Don't** use saturated colors on decorative elements. Every color must earn its place functionally.
- **Don't** use border-left or border-right greater than 1px as a colored stripe on cards or list items.
- **Don't** use gradient text (`background-clip: text`). Single solid color only.
- **Don't** use glassmorphism (backdrop-blur) as a default treatment. Rare and purposeful only.
