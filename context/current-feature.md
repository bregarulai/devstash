# Current Feature: Dashboard Hardening Phase 2

## Status

In Progress

## Goals

- Add skeleton loading states for StatsCards section
- Add skeleton loading states for CollectionsSession section
- Add skeleton loading states for PinnedItems section
- Add skeleton loading states for RecentItems section
- Ensure skeletons match the actual layout dimensions (no layout shift on load)
- Loading states should appear instantly (no spinner delay)

## Notes

- Create shared `<DashboardSkeleton />` component at `components/dashboard/DashboardSkeleton.tsx` using shadcn Skeleton component
- StatsCards skeleton: 4 small rectangular blocks in a row, ~120px wide, 60px tall, bg-muted fill with rounded-xl
- CollectionsSession skeleton: Grid of 6 collection card placeholders, each ~200px wide, 100px tall, matches 3-column grid layout
- PinnedItems skeleton: 3-4 item card placeholders in vertical stack, 100% width, 72px tall, bg-muted fill with rounded-xl
- RecentItems skeleton: 5-6 item card placeholders in vertical stack, 100% width, 72px tall, bg-muted fill with rounded-xl
- Use bg-muted fill with optional ring-1 ring-foreground/5 for definition
- No animation, no shimmer — static placeholder only
- Recommend Option A: Render skeleton inline with a `<ClientLoader />` wrapper component
- Existing components (StatsCards, CollectionsSession, PinnedItems, RecentItems) already accept empty data — no changes needed
- Severity: P0 — users with slow connections see a blank page with no feedback

## History

- **Initial setup** - Next.js 16, Tailwind CSS V4, Typescript configured (Completed)

- **Phase 1 Completed** - Dashboard UI Phase 1 completed with build verification

- **Phase 2 Completed** - Implemented collapsible sidebar with mobile drawer, items/types section with type icons and links, favorite collections section, recent collections section, and user avatar at the bottom

- **Phase 3 Completed** - Implemented stats cards (items, collections, favorites), pinned items section, recent items section, and recent collections section. Merged to main and deleted feature branch.

- **Prisma + Neon PostgresSQL Setup Completed** - Implemented Prisma + Neon PostgreSQL database layer

- **Seed Data (Completed)** - Create seed script with user, system item types, and sample collections/items

- **Dashboard Collections** - Replaced dummy collection data with actual database data from Neon PostgreSQL, created `lib/db/collections.ts`, derived collection card border color from most-used content type, showed type icons, and updated collection stats display (Completed)

- **Dashboard Items** - Implemented pinned and recent items sections with database data, created `lib/db/items.ts` with data fetching functions, updated StatsCards to use real data, updated collection stats display (Completed)

- **Stats & Sidebar (Completed)** - Display stats from database data instead of mock data, show system item types in sidebar with icons linking to /items/[typename], add "View all collections" link under collections list, update collection card border color and type icons, update `lib/db/items.ts` as needed for stats functionality

- **Add Pro Badge to Sidebar (Completed)** - Added PRO badge to file and image item types in sidebar using shadcn UI Badge component with clean, subtle styling

- **Quick Wins (Completed)** - Extract duplicate transformation helpers, remove dead code, fix filename typo, add loading states, add skeleton component, define named constants, add isPro field, create hooks/ and types/ directories

- **Auth Setup (Completed)** - Implemented NextAuth v5 with GitHub OAuth, split config pattern, proxy protection, and API routes

- **Auth Credentials (Completed)** - Added Credentials provider for email/password authentication, created `/api/auth/register` route, updated `auth.config.ts` with placeholder, updated `auth.ts` with bcrypt validation, supports GitHub OAuth + email/password side by side

- **Auth UI (Completed)** - Implemented custom sign-in page with email/password and GitHub OAuth, register page with form validation, sonner toast notifications, and success redirect

- **Email Verification on Register (Completed)** - Installed Resend SDK, created verification token system with SHA-256 hashing and 24h expiry, added verification email on registration via Resend, created `/api/auth/verify` route for token validation, built `/verify-email` page with success/error/expired states, blocked sign-in for unverified users, added resend verification functionality, and handled all edge cases (expired tokens, already verified, invalid tokens)

- **Toggle Email Verification (Completed)** - Added ENABLE_EMAIL_VERIFICATION env variable to enable/disable email verification, skip token creation and email sending when disabled, allow sign-in without verification when disabled

- **Password Reset (Completed)** - Added forgot password link, created `/forgot-password` and `/reset-password` pages, implemented server actions for token generation and password update

- **Email Template Improvements (Completed)** - Added dark-themed HTML email templates with branded styling and text fallbacks for verification and password reset emails

- **Dashboard Hardening Phase 1 (Completed)** - Implemented error handling and reliability hardening including try/catch for dashboard data fetch, session.user direct usage, null-safe defaults, DashboardDataRetry component, and alert UI component
