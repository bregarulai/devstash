# Next.js Best Practices Audit Criteria

## File Conventions
- App Router file structure correct?
- `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` used appropriately?
- Route groups and parallel routes correct?

## Server Components
- Server components used by default?
- `'use client'` only when needed (interactivity, hooks, browser APIs)?
- Correct data fetching patterns (server components fetch directly)?

## Data Patterns
- Server Actions used correctly for form submissions and simple mutations?
- API routes used for appropriate use cases:
  - Webhooks (Stripe, GitHub, etc.)
  - File uploads with progress tracking
  - Long-running operations
  - Specific HTTP status codes or headers
  - Endpoints for future mobile/CLI clients
  - Third-party integrations
- Dynamic routes for item/collection pages?

## Async APIs
- Correct use of async/await?
- `params` and `searchParams` awaited (Next.js 16)?
- `cookies()` and `headers()` awaited (Next.js 16)?
- Proper error boundaries?

## Metadata
- Document metadata configured correctly?
- Image/font optimization appropriate?
- `next/image` used over `<img>`?
- `next/font` used for Google Fonts?

## Bundling
- No unnecessary dependencies?
- Correct module resolution?
- Server-incompatible packages flagged?
