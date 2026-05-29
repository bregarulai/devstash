# Current Feature: Password Reset

## Goals

- Add "Forgot Password" link on the sign-in page
- Create `/forgot-password` page with email input form
- Create `/reset-password` page with new password form (token via query param)
- Implement forgot-password server action that generates a verification token and sends reset email via Resend
- Implement reset-password server action that validates the token and updates the user's password
- Reuse existing `VerificationToken` model and `verification-token.ts` utilities
- Display success/error toast messages on both pages

## Notes

- Reuse `createVerificationToken` and `verifyToken` from `lib/verification-token.ts` — same schema (identifier/email, hashed token, 24h expiry)
- Password reset email sent via Resend (`lib/resend.ts`)
- Token is hashed with SHA-256 before storage, deleted after use (one-time)
- User's `password` field in User model is nullable (GitHub-only users have `null`)
- Follow `{ success, data, error }` return pattern from Server Actions per coding standards
- Use Zod for input validation
- Use shadcn/ui components (Input, Button, Label)
- All styling via Tailwind CSS with design tokens (oklch colors)
- Dark mode default

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
