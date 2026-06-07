# DevStash Item CRUD Architecture

## Overview

This document outlines the unified CRUD system architecture for all 7 DevStash item types: **Snippet**, **Prompt**, **Command**, **Note**, **File**, **Image**, and **Link**.

---

## File Structure

```
devstash/
├── prisma/
│   ├── schema.prisma              # Item, ItemType, Collection, Tag models
│   └── seed.ts                    # System item types seed data
├── actions/
│   └── items.ts                   # Item mutations (create, update, delete)
├── lib/
│   ├── prisma.ts                  # Prisma client singleton
│   ├── constants.ts               # Default limits (recent, favorite, sample)
│   └── db/
│       ├── items.ts               # Item data fetching (queries)
│       ├── collections.ts         # Collection data fetching
│       └── user.ts                # User data fetching
├── types/
│   ├── db.ts                      # Zod schemas + TypeScript types for all models
│   └── user.ts                    # User-specific types
├── app/
│   ├── (dashboard)/
│   │   ├── items/
│   │   │   └── [type]/
│   │   │       ├── page.tsx       # Server component: list items by type
│   │   │       └── new/
│   │   │           └── page.tsx   # Server component: new item form
│   │   └── collections/
│   │       └── [id]/
│   │           └── page.tsx
│   ├── api/
│   │   └── items/
│   │       └── [id]/
│   │           └── route.ts       # REST API for item CRUD (optional)
│   └── layout.tsx
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── items/
│   │   ├── item-card.tsx          # Generic card that adapts by itemType
│   │   ├── item-list.tsx          # Grid/list of item cards
│   │   ├── item-form.tsx          # Unified form (title, content, tags, type)
│   │   ├── item-editor.tsx        # Markdown editor for TEXT types
│   │   └── item-detail.tsx        # Detail view with type-specific rendering
│   ├── collections/
│   │   ├── collection-card.tsx
│   │   └── collection-list.tsx
│   └── layout/
│       ├── sidebar.tsx
│       └── drawer.tsx
└── hooks/
    └── use-items.ts               # Client-side item state (optional)
```

---

## `/items/[type]` Routing

### Dynamic Route Structure

The app uses Next.js App Router's dynamic route segments to handle all 7 item types through a single route pattern.

```
/app/(dashboard)/items/[type]/page.tsx
```

### How It Works

1. **Route Parameter**: `[type]` captures the item type slug (e.g., `snippets`, `prompts`, `commands`, `notes`, `files`, `images`, `links`)
2. **Server Component**: `page.tsx` reads `params.type` and fetches items via `lib/db/items.ts`
3. **Type Validation**: The route validates `type` against known `SystemItemType` values
4. **Data Fetching**: Calls `getItemsByType(userId, itemTypeName)` directly from the server component
5. **Shared Components**: Renders `ItemCard`, `ItemList`, and `ItemForm` components that adapt by type

### Route Flow

```
User navigates to /items/snippets
    ↓
Next.js matches /app/(dashboard)/items/[type]/page.tsx
    ↓
page.tsx receives params = { type: "snippets" }
    ↓
Validates type against SystemItemType list
    ↓
Fetches items via getItemsByType(userId, "snippet")
    ↓
Renders ItemList with ItemCard components
    ↓
Each ItemCard reads itemType.icon, itemType.color, itemType.name
    ↓
Type-specific rendering via itemType switch (content display, editor type)
```

### Type-Specific Behavior

| Type      | contentType    | Content Field | Special Rendering              |
|-----------|----------------|---------------|--------------------------------|
| snippet   | TEXT           | content       | Syntax highlighting            |
| prompt    | TEXT           | content       | AI features (Pro)              |
| command   | TEXT           | content       | Code block, copy button        |
| note      | TEXT           | content       | Markdown preview               |
| file      | FILE           | fileUrl       | File preview/download (Pro)    |
| image     | FILE           | fileUrl       | Image preview (Pro)            |
| link      | URL            | url           | External link, favicon         |

---

## Where Type-Specific Logic Lives

### Components (NOT Actions)

All type-specific UI logic lives in **components**, not in server actions or API routes. This keeps mutations generic while rendering adapts to the item type.

#### `components/items/item-card.tsx`

- Reads `item.itemType` (name, icon, color)
- Renders type-specific icon via `ITEM_TYPE_ICONS[itemType.name]`
- Applies type-specific color accent (border, badge, or icon tint)
- Shows type badge/label

#### `components/items/item-form.tsx`

- Unified form for create/update
- Type selector dropdown (system types + custom for Pro)
- Content field adapts by type:
  - TEXT types → Markdown editor (`ItemEditor`)
  - FILE types → File upload zone
  - URL types → URL input
- Language selector (for TEXT types, syntax highlighting)
- Tags input (multi-select)
- URL preview (for link types)

#### `components/items/item-editor.tsx`

- Markdown editor for TEXT content types
- Syntax highlighting via language selection
- Type-specific toolbar (code block, preview, etc.)

#### `components/items/item-detail.tsx`

- Full item view
- Type-specific content rendering:
  - snippet → code block with syntax highlighting
  - prompt → text with AI explain button (Pro)
  - command → code block with copy button
  - note → rendered markdown preview
  - file → file preview/download
  - image → image viewer
  - link → link card with favicon

---

## Component Responsibilities

### `ItemCard` (Generic)

| Responsibility | Details |
|---|---|
| Display | Title, description preview, last-updated date |
| Type identity | Icon, color, badge from `item.itemType` |
| Actions | Favorite toggle, pin toggle, edit, delete |
| Type hint | Shows content type indicator (code block, link, file) |
| Collections | Shows collection memberships count |

### `ItemList` (Generic)

| Responsibility | Details |
|---|---|
| Layout | Grid or list toggle, responsive columns |
| Filtering | Pinned items, favorites, recent, all |
| Sorting | By date, title, type |
| Pagination | Load more or infinite scroll |

### `ItemForm` (Generic)

| Responsibility | Details |
|---|---|
| Fields | Title, content/type-specific field, tags, language |
| Type selection | System types list, custom type support (Pro) |
| Validation | Zod schema via `itemInsertSchema` |
| Submission | Server action → `actions/items.ts` |

### `ItemEditor` (Type-Specific for TEXT)

| Responsibility | Details |
|---|---|
| Editor | Markdown editor with preview |
| Syntax | Language selection for code blocks |
| Toolbar | Type-specific actions (preview, code, export) |

---

## Data Layer (`lib/db/items.ts`)

### Existing Query Functions

| Function | Purpose |
|---|---|
| `getPinnedItems(userId)` | Fetch pinned items |
| `getRecentItems(userId, limit)` | Fetch recent items |
| `getAllItems(userId, limit)` | Fetch all items |
| `getFavoriteItems(userId, limit)` | Fetch favorite items |
| `getItemsByType(userId, itemTypeName, limit)` | Fetch items by type |
| `searchItems(userId, query)` | Search by title/description/content |
| `getItemStats(userId)` | Get item/collection counts |
| `getSystemItemTypesWithCounts()` | Get system types with item counts |

### Mutation Pattern (to be added)

Mutations should live in `actions/items.ts` as server actions:

```typescript
// actions/items.ts

export async function createItem(formData: ItemInsert) {
  // Validate with itemInsertSchema
  // prisma.item.create({ data: validated })
  // Return created item
}

export async function updateItem(id: string, formData: Partial<ItemInsert>) {
  // Validate with partial schema
  // prisma.item.update({ where: { id }, data: validated })
  // Return updated item
}

export async function deleteItem(id: string, userId: string) {
  // Verify ownership: prisma.item.findUnique({ where: { id, userId } })
  // prisma.item.delete({ where: { id } })
  // Return success
}
```

---

## Type System (`types/db.ts`)

### Zod Schemas

| Schema | Purpose |
|---|---|
| `itemInsertSchema` | Create item validation |
| `itemSelectSchema` | Item read/return type |
| `itemWithDetailsSchema` | Item with itemType + tags |
| `systemItemTypeSchema` | System type (name, icon, color, count) |
| `sidebarItemTypeBreakdownSchema` | Sidebar type breakdown |
| `itemStatsSchema` | Item statistics |

### TypeScript Types

| Type | Source |
|---|---|
| `ItemInsert` | `z.infer<typeof itemInsertSchema>` |
| `ItemSelect` | `z.infer<typeof itemSelectSchema>` |
| `ItemWithDetails` | `z.infer<typeof itemWithDetailsSchema>` |
| `SystemItemType` | `z.infer<typeof systemItemTypeSchema>` |
| `SidebarItemTypeBreakdown` | `z.infer<typeof sidebarItemTypeBreakdownSchema>` |
| `ItemStats` | `z.infer<typeof itemStatsSchema>` |

---

## Prisma Schema (Key Models)

### `Item` Model

```prisma
model Item {
  id          String      @id @default(cuid())
  title       String
  contentType ContentType  // TEXT | FILE | URL
  content     String?     @db.Text  // For TEXT types
  fileUrl     String?     // For FILE types (R2 URL)
  fileName    String?
  fileSize    Int?
  url         String?     // For URL types
  description String?     @db.Text
  isFavorite  Boolean     @default(false)
  isPinned    Boolean     @default(false)
  language    String?     // Syntax highlighting language
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  // Relations
  userId     String
  user       User     @relation(...)
  itemTypeId String
  itemType   ItemType @relation(...)
  tags       Tag[]    @relation("ItemTags")
  collections ItemCollection[]

  @@index([userId])
  @@index([itemTypeId])
  @@index([createdAt])
}
```

### `ItemType` Model (System Types)

| Field | Description |
|---|---|
| `name` | Unique per user (snippet, prompt, command, note, file, image, link) |
| `icon` | Lucide React icon name (Code, Sparkles, Terminal, etc.) |
| `color` | CSS color (oklch hex, e.g., `#3b82f6`) |
| `isSystem` | `true` for built-in types, `false` for custom |
| `userId` | `null` for system types, user ID for custom |

### `ContentType` Enum

```prisma
enum ContentType {
  TEXT   // Snippets, prompts, commands, notes
  FILE   // Files, images (Pro only)
  URL    // Links
}
```

---

## System Item Types (Seed Data)

| Name | Icon | Color | ContentType | Route |
|---|---|---|---|---|
| snippet | Code | `#3b82f6` (blue) | TEXT | `/items/snippets` |
| prompt | Sparkles | `#8b5cf6` (purple) | TEXT | `/items/prompts` |
| command | Terminal | `#f97316` (orange) | TEXT | `/items/commands` |
| note | StickyNote | `#fde047` (yellow) | TEXT | `/items/notes` |
| file | File | `#6b7280` (gray) | FILE | `/items/files` |
| image | Image | `#ec4899` (pink) | FILE | `/items/images` |
| link | Link | `#10b981` (emerald) | URL | `/items/links` |

---

## Design Decisions

### 1. Type-Specific Logic in Components, Not Actions

**Why**: Server actions handle generic CRUD operations. Type-specific rendering, form fields, and UI behavior belong in components. This keeps mutations reusable across types while allowing flexible presentation.

### 2. Direct DB Calls from Server Components

**Why**: Next.js 16 App Router supports importing Prisma directly in server components. `lib/db/items.ts` provides typed query functions that server components call directly, avoiding an intermediate API layer for SSR.

### 3. Unified Form, Type-Specific Rendering

**Why**: The `ItemForm` component handles all types with shared fields (title, tags, description). Type-specific fields (content editor, file upload, URL input) are conditionally rendered based on `contentType`.

### 4. Dynamic Route `[type]` Pattern

**Why**: Single route pattern for all 7 types reduces code duplication. The route parameter drives data fetching and type-specific UI adaptation without needing separate pages per type.

### 5. Zod Schemas for Validation

**Why**: `types/db.ts` contains Zod schemas that serve dual purpose: runtime validation (server actions) and TypeScript type inference (`z.infer`). This eliminates separate validation logic.

---

## Monetization Integration Points

| Feature | Free | Pro | Implementation |
|---|---|---|---|
| Items limit | 50 | Unlimited | Check count on create |
| Collections limit | 3 | Unlimited | Check count on create |
| File uploads | ❌ | ✅ | `contentType: FILE` gated |
| Image uploads | ❌ | ✅ | `contentType: FILE` gated |
| Custom types | ❌ | 🔜 | `isSystem: false` gated |
| AI auto-tagging | ❌ | ✅ | OpenAI API call |
| AI code explanation | ❌ | ✅ | OpenAI API call |
| AI prompt optimizer | ❌ | ✅ | OpenAI API call |
| Data export | ❌ | ✅ | JSON/ZIP generation |

---

## Next Steps

1. Create `actions/items.ts` with server actions for create/update/delete
2. Create `app/(dashboard)/items/[type]/page.tsx` dynamic route
3. Build `components/items/item-card.tsx` generic card component
4. Build `components/items/item-form.tsx` unified form component
5. Build `components/items/item-editor.tsx` markdown editor for TEXT types
6. Add `ITEM_TYPE_ICONS` and `ITEM_TYPE_COLORS` to `lib/constants.ts`
7. Implement type validation in the dynamic route
8. Add Pro gating for file/image types
9. Create `app/(dashboard)/items/[type]/new/page.tsx` for new item creation
10. Implement search functionality using `searchItems()`
