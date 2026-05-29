# Email Verification on Register

## Status

Not Started

## Goals

- Install and configure Resend SDK with existing RESEND_API_KEY
- Add verification token (Using existing VerificationToken model) and expiry to user model
- Send verification email with clickable link via Resend when user registers
- Create `/api/auth/verify` route to validate tokens and set `emailVerified` timestamp
- Create `/verify-email` showing verification status (success/error/expired)
- Block sign-in for unverified email users with clear error message
- Add resend verification functionality if token expires
- Handle edge cases: expired tokens, already verified, invalid tokens
- Redirect verified users to sign-in or dashboard after successful verification
- Mark users as verified on successful token validation

## Notes

- User model already has `emailVerified: DateTime?` field
- `VerificationToken` model exist with `identifier`, `token`, `expires` fields
- RESEND_API_KEY in `.env`
- Github OAth users bypass email verification (already verified by provider)
- Prisma + Neon PostgreSQL is the database layer
- NextAuth v5 with Credentials provider is in place for email/password auth
- Users must click the verification link in their email to complete registration
- Verification token should be securely hashed (Using existing VerificationToken model) before storing
- Token expiry 24 hours recomended
- Existing unverified users should be prompted to verify or resend verification email

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
