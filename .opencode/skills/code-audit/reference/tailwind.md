# Tailwind CSS v4 Audit Criteria

## No v3 Config Files
- No `tailwind.config.js` or `tailwind.config.ts`?
- Flag any such files as errors (Tailwind v4 ignores them)

## Theme Config in CSS
- All theme config in `app/globals.css` via `@theme`?
- CSS custom properties used for colors/spacing?

## No JavaScript-Based Config
- No JavaScript-based Tailwind config allowed?
- All colors use `oklch()`?
