# Current Feature: Toggle Email Verification System

## Goals

- Add an `.env` variable (e.g. `ENABLE_EMAIL_VERIFICATION`) to enable/disable email verification
- When disabled, skip sending verification emails during registration
- When disabled, allow users to sign in without email verification
- When disabled, skip the verification token creation step on registration
- Update `.env.example` with the new variable
- No code changes to the verify-email page or `/api/auth/verify` route (keep them intact for when re-enabled)

## Status

In Progress

## Notes

- Currently email verification is hard-required: unverified users are blocked from signing in (`lib/auth.ts` checks `user.emailVerified`) and registration always sends a Resend email (`actions/auth.ts`)
- Resend domain is not linked, so only the `onboarding@resend.dev` domain works — this is a temporary workaround
- The flag should be a simple boolean string like `"true"` / `"false"` checked via `process.env.ENABLE_EMAIL_VERIFICATION !== "false"` (default to enabled)
- Files that will need changes: `lib/auth.ts`, `actions/auth.ts`, `actions/resend-verification.ts`, `.env.example`

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
