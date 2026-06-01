# Current Feature: Dashboard Hardening Phase 3

## Status

In Progress

## Goals

- Add empty-state UI for CollectionsSession when user has zero collections — spec §2.1: heading "No collections yet", body "Collections organize your items by topic. Create one to get started.", CTA "Create collection" → /collections/new
- Add empty-state UI for PinnedItems when user has zero pinned items — spec §2.2: heading "No pinned items", body "Pin your most important snippets, prompts, and links to find them instantly.", CTA "Browse items" → /items
- Add empty-state UI for RecentItems when user has zero recent items — spec §2.3: heading "No recent items", body "Items you view or edit will appear here for quick access.", no CTA (informational only)
- Add a "get started" hero section for brand-new users (zero items total) — spec §3: heading "Welcome to DevStash", body "Your knowledge hub is empty. Start by collecting your first item.", 3 numbered steps (Collect, Organize, Search), CTA "Save your first item" → /collect, persists until first item created
- Empty states should be actionable (include a CTA or guidance text) — spec §1: use muted color tokens, 1-2 sentence max description, primary CTA button when applicable, no decorative icons/illustrations, match parent container width
- Maintain the project's dark-mode-first, restrained aesthetic — spec §1 + design system: no decorative elements, use `text-muted-foreground` and `bg-muted`, follow EmptyState component spec (Option B) + GetStartedHero component spec (Option C)

## Notes

- Severity: P1 — Major. New users see a blank dashboard and have no guidance on what to do next. High abandonment risk at step 1.
- Empty state design principles: use muted color tokens, brief actionable description (1-2 sentences max), primary CTA button when applicable, no decorative icons or illustrations, match width of parent container
- Recommended approach: Option B + C — reusable EmptyState component at `components/ui/EmptyState.tsx` + dedicated GetStartedHero component at `components/dashboard/GetStartedHero.tsx`
- Get started hero should only show once — after user creates first item, it disappears permanently
- CollectionsSession empty state: "No collections yet" → "Create collection" links to /collections/new
- PinnedItems empty state: "No pinned items" → "Browse items" links to /items
- RecentItems empty state: "No recent items" → informational only, no CTA

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

- **Dashboard Hardening Phase 2 (Completed)** - Implemented shared DashboardSkeleton component with skeleton loading states for StatsCards, CollectionsSession, PinnedItems, and RecentItems sections using static bg-muted placeholders without animation or shimmer
