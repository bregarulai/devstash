# Current Feature

## Stats & Sidebar — Replace mock data with database data

## Status

In Progress

## Goals

- Replace `lib/mock-data.ts` stats with real database data
- Display system item types in sidebar with icons linking to `/items/[typename]`
- Show actual collection data from Neon PostgreSQL in sidebar
- Add "View all collections" link under collections list pointing to `/collections`
- Update collection card border color based on most-used item type
- Update `lib/db/items.ts` as needed to support stats functionality

## Notes

- Reference spec: `context/features/stats-sidebar-spec.md`
- Need to verify `lib/db/items.ts` has sufficient data fetching functions
- Use `lib/db/collections.ts` as reference for implementation patterns

## History

- **Initial setup** - Next.js 16, Tailwind CSS V4, Typescript configured (Completed)

- **Phase 1 Completed** - Dashboard UI Phase 1 completed with build verification

- **Phase 2 Completed** - Implemented collapsible sidebar with mobile drawer, items/types section with type icons and links, favorite collections section, recent collections section, and user avatar at the bottom

- **Phase 3 Completed** - Implemented stats cards (items, collections, favorites), pinned items section, recent items section, and recent collections section. Merged to main and deleted feature branch.

- **Prisma + Neon PostgresSQL Setup Completed** - Implemented Prisma + Neon PostgreSQL database layer

- **Seed Data (Completed)** - Create seed script with user, system item types, and sample collections/items

- **Dashboard Collections** - Replaced dummy collection data with actual database data from Neon PostgreSQL, created `lib/db/collections.ts`, derived collection card border color from most-used content type, showed type icons, and updated collection stats display (Completed)

- **Dashboard Items** - Implemented pinned and recent items sections with database data, created `lib/db/items.ts` with data fetching functions, updated StatsCards to use real data, updated collection stats display (Completed)

- **Stats & Sidebar** - Display stats from database data instead of mock data, show system item types in sidebar with icons linking to /items/[typename], add "View all collections" link under collections list, update collection card border color and type icons, update `lib/db/items.ts` as needed for stats functionality (In Progress)
