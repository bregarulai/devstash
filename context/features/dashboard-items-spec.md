# Dashboard Items Spec

## Overview

Create Pinned and Recent items session below Collections session, with actual data from the database. This includes both pinned and recent items. It should look how it does in `context/screenshots/dashboard-ui-main.png` , but instead of using data coming from our Neon database using Prisma.

If there are no pinned items, nothing should display there.

## Requirements

- Create src/lib/db/items.ts with data fetching functions
- Fetch items directly in server component
- item card icon/border derived from the item type
- Display item type tags and anything else currently in `context/screenshots/dashboard-ui-main.png` . Use attached image file as reference
- Update collection stats display

## References

Check the `@context/screenshots/dashboard-ui-main.png`
