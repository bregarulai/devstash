# Current Feature: Auth Credentials - Email/Password Provider

## Status

In Progress

## Goals

- Add Credentials provider for email/password authentication with registration
- Create registration API route at `/api/auth/register`
- Update `auth.config.ts` with Credentials provider placeholder
- Update `auth.ts` to override Credentials with bcrypt validation
- Support GitHub OAuth + email/password authentication side by side

## Notes

- Use bcryptjs for password hashing (already installed)
- Add password field to User model via migration if not already there
- `auth.config.ts`: Add Credentials provider with `authorize: () => null` placeholder
- `auth.ts`: Override the Credentials provider with actual bcrypt validation logic
- Registration accepts: name, email, password, confirmPassword
- Validate passwords match, check if user already exists, hash with bcryptjs, create user in database

## History

- **Auth Credentials** - Added Credentials provider for email/password authentication, created `/api/auth/register` route, updated `auth.config.ts` with placeholder, updated `auth.ts` with bcrypt validation, supports GitHub OAuth + email/password side by side (In Progress)

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
