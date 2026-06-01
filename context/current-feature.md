# Current Feature

## Status

## Goals

<!-- Define goals for the next feature -->

## Notes

<!-- Add notes, constraints, and details -->

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

- **Dashboard Hardening Phase 3 (Completed)** - Implemented reusable EmptyState component, GetStartedHero for new users, empty states for CollectionsSession, PinnedItems, and RecentItems sections with actionable CTAs

- **Dashboard Hardening Phase 4 (Completed)** - Fixed prisma.user.findFirst to findUnique correctness issue, standardized user prop across sibling components, added command palette with Ctrl+K/Cmd+K activation for quick navigation and item creation, added keyboard shortcut hints to key dashboard actions, and ensured all interactive elements have keyboard alternatives

- **Sign-In Form Hardening Phase 1 (Completed)** - Extracted sign-in form into client component with useTransition, added password visibility toggle with inline SVG, added autocomplete attributes, and prevented double-submission with disabled state on submit button

- **Sign-In Form Hardening Phase 2 (Completed)** - Added Zod validation to sign-in form with react-hook-form, zodResolver, and shadcn Field components for typed form state and inline error display

- **Sign-In Form Hardening Phase 3 (Completed)** - Updated CardDescription copy to neutral text "Sign in to your DevStash account", verified SignInToast mounts unconditionally without firing on every page load, and confirmed auth() call and dynamic = 'force-dynamic' settings are appropriate

- **Register Page Hardening (Completed)** - Converted register page to react-hook-form + Zod validation with onChange mode, added password visibility toggle with Eye/EyeOff icons, live password confirmation feedback, password requirements checklist, autocomplete attributes, loading state with disabled button, aria-invalid on fields, inline FieldError messages, fixed button height and sign-in link hover color, moved RegisterToast to page root level, removed force-dynamic, and preserved form values on validation error
