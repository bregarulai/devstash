# DevStash — Project Overview

## 1. Vision

**DevStash** is a fast, searchable, AI-enhanced hub for developer knowledge and resources. It consolidates scattered dev assets — snippets, AI prompts, terminal commands, useful links, documentation, and project templates — into one unified workspace.

The goal: eliminate context switching, preserve hard-to-find knowledge, and bring consistency to fragmented developer workflows.

---

## 2. Problem

Developers keep their essentials scattered across too many tools:

| Asset | Common Home |
|---|---|
| Code snippets | VS Code snippets, Notion |
| AI prompts | ChatGPT / Claude / Gemini chats |
| Context files | Buried inside projects |
| Useful links | Browser bookmarks |
| Documentation | Random folders |
| Terminal commands | `.bash_history`, `.zsh_history` |
| Project templates | GitHub Gists |
| Notes | Standalone note apps |

This fragmentation creates **context switching**, **lost knowledge**, and **inconsistent workflows**. DevStash solves this by providing a single, fast, searchable space for all dev knowledge and resources.

---

## 3. User Personas

| Persona | Description | Primary Use Case |
|---|---|---|
| **Everyday Developer** | Needs a fast way to grab snippets, prompts, commands, and links | Quick save + instant access |
| **AI-First Developer** | Saves prompts, contexts, workflows, system messages | Centralized prompt library |
| **Content Creator / Educator** | Stores code blocks, explanations, course notes | Organized teaching material |
| **Full-Stack Builder** | Collects patterns, boilerplates, API examples | Reusable code + config library |

---

## 4. Features

### 4.1 Items & Item Types

Items are the atomic unit in DevStash. Each item has a **type**, and users can create **custom types**. System types are:

| Type | Color | Icon | Description |
|---|---|---|---|
| `snippet` | `#3b82f6` (blue) | `Code` | Reusable code blocks |
| `prompt` | `#8b5cf6` (purple) | `Sparkles` | AI prompt text |
| `command` | `#f97316` (orange) | `Terminal` | Terminal / CLI commands |
| `note` | `#eab308` (yellow) | `StickyNote` | Freeform text notes |
| `file` | `#6b7280` (gray) | `File` | Uploaded file (Pro) |
| `image` | `#ec4899` (pink) | `Image` | Uploaded image (Pro) |
| `link` | `#10b981` (emerald) | `Link` | URL reference |

> **URLs follow the pattern:** `/items/:type` (e.g., `/items/snippets`)

Items are quick to create and access via a **drawer-based UI**.

### 4.2 Collections

Collections let users **group items** of any type. Key characteristics:

- A collection can contain items of **any type**.
- An item can belong to **multiple collections** (e.g., a React snippet can live in both "React Patterns" and "Interview Prep").
- Collections support:
  - **Favorites** — Star collections for quick access
  - **Pinning** — Pin items to the top within a collection
  - **Recently used** — Track last-accessed items
  - **Color-coded cards** — Background color reflects the dominant item type

**Example collections:**

- "React Hooks" (snippets + notes)
- "Prototype Prompts" (prompts)
- "Context Files" (files)
- "Python Snippets" (snippets)

### 4.3 Search

Full-text search across:

- **Content** (body / file content)
- **Tags** (multi-select filter)
- **Titles**
- **Item types** (filter by type)

### 4.4 Authentication

- Email / Password
- GitHub OAuth
- Stored via **Next-Auth v5**

### 4.5 Core Features

| Feature | Description |
|---|---|
| **Favorites** | Star items or collections for quick access |
| **Pin to top** | Pin items within a collection |
| **Recently used** | Auto-tracked last-accessed items |
| **File import** | Import code from local files |
| **Markdown editor** | Built-in MD editor for text-type items |
| **File upload** | Upload files and images (Pro) |
| **Export** | Export data as JSON or ZIP |
| **Dark mode** | Default; light mode optional |
| **Multi-collection membership** | Add items to / view which collections they belong to |
| **Collection membership view** | See all collections an item belongs to |

---

### 4.6 AI Features (Pro)

| Feature | Description |
|---|---|
| **Auto-tag suggestions** | AI-suggested tags on item creation |
| **AI Summaries** | Auto-generate a summary of item content |
| **Explain This Code** | AI explains any code block in plain language |
| **Prompt optimizer** | Refine and improve prompts with one click |

---

## 5. Data Model

> **Note:** This is a **rough draft** — not set in stone. Field names and relations may change.

### 5.1 Entity Relationship

```
┌──────────┐     ┌─────────────────────┐     ┌──────────┐
│   USER   │────< │     ITEM            │>──── │ ITEM    │
│          │     │                     │     │ COLLECT- │
│  - id    │     │  - id               │     │  ION     │
│  - name  │     │  - title            │     │          │
│  - email │     │  - content_type     │     └──────────┘
│  - ...   │     │  - file_url         │           │
└──────────┘     │  - description      │     ┌──────────┐
                 │  - is_favorite      │     │ COLLEC-  │
                 │  - is_pinned         │     │ TION    │
                 │  - language         │     │          │
                 │  - ...              │     │  - id   │
                 └──────────┬──────────┘     │  - name │
                            │                │  - ... │
                 ┌──────────┴──────────┐     └──────────┘
                 │       TAG           │
                 │  - id               │
                 │  - name             │
                 │  - item_relations ◄──┘
                 └─────────────────────┘
```

### 5.2 Prisma Models (Rough Draft)

```prisma
// ─── USER (extends NextAuth) ───────────────────────────────
model User {
  id              String    @id @default(cuid())
  email           String?   @unique
  name            String?
  password        String?
  image               

**

// ─── ITEM_TYPE ────────────────────────────────────────────
model ItemType {
  id        String   @id @default(cuid())
  name      String   @unique         // "snippet", "prompt", "note", "command", "file", "image", "link"
  icon      String                    // icon name / lucide name
  color     String                    // hex color code
  isSystem  Boolean  @default(true)  // system types can't be deleted
}

// ─── COLLECTION ───────────────────────────────────────────
model Collection {
  id                String     @id @default(cuid())
  name              String
  description       String?
  isFavorite        Boolean    @default(false)
  defaultTypeId     String?
  items             CollectionItem[]
  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt

  user              User       @relation(fields: [userId], references: [id])
  userId            String

  @@index([userId, isFavorite])
}

// ─── ITEM_COLLECTION (join table) ─────────────────────────
model ItemCollection {
  id          String   @id @default(cuid())
  itemId      String
  collectionId String
  addedAt     DateTime @default(now())

  item        Item     @relation(fields: [itemId], references: [id], onDelete: Cascade)
  collection  Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)

  @@unique([itemId, collectionId])
}

// ─── TAG ──────────────────────────────────────────────────
model Tag {
  id        String       @id @default(cuid())
  name      String       @unique
  items     TagItem[]
}

// ─── Item-Tags (join table) ───────────────────────────────
model TagItem {
  id    String @id @default(cuid())
  tagId String
  itemId String
  tag    Tag   @relation(fields: [tagId], references: [id], onDelete: Cascade)
  item   Item  @relation(fields: [itemId], references: [id], onDelete: Cascade)

  @@unique([tagId, itemId])
}
```

---

## 6. Tech Stack

| Layer | Choice |
|---|---|
| **Framework** | Next.js 16 / React 19 (App Router) |
| **Language** | TypeScript |
| **Rendering** | Server-Side Rendering with dynamic components |
| **Database** | Neon (PostgreSQL, cloud-hosted) |
| **ORM** | Prisma 7 |
| **Caching** | Redis (TBD) |
| **File Storage** | Cloudflare R2 |
| **Authentication** | Next-Auth v5 (Email/Password + GitHub OAuth) |
| **CSS Framework** | Tailwind CSS v4 |
| **UI Components** | shadcn/ui |

### Key Technical Decisions

- **Single monorepo** — One codebase for less overhead and faster iteration.
- **No `db push`** — Database migrations will be created manually, run in dev, then applied in production.
- **R2 for files** — File uploads use Cloudflare R2; URLs stored on the `Item` model.

---

## 7. Monetization

| Feature | Free | Pro ($8/mo or $72/yr) |
|---|---|---|
| Items | 50 total | Unlimited |
| Collections | 3 | Unlimited |
| Item types | All system types (no files/images) | All types incl. files/images |
| Custom types | — | Later |
| Search | Basic | Advanced (content, tags, title, type) |
| File uploads | — | Files + Images |
| AI features | — | Auto-tag, Summaries, Code Explain, Prompt Optimizer |
| Export | — | JSON / ZIP |
| Support | — | Priority |

### During Development

All users can access **everything** during development. This is to setup for pro users only during development.

---

## 8. UI / UX

### 8.1 General

- **Style:** Modern, minimal, developer-focused
- **Default:** Dark mode
- **Typography:** Clean, generous whitespace, subtle borders & shadows
- **Inspiration:** Notion, Linear, Raycast
- **Code blocks:** Full syntax highlighting

### 8.2 Layout

```
┌──────────────────────────────────────────────────────────────┐
│  Sidebar (collapsible)     │  Main Content Area              │
│  ┌────────────────────────┐ │  ┌──────────────────────────┐ │
│  │ 🔍 Search              │ │  │  Grid of Collection Cards │ │
│  │                        │ │  │                           │ │
│  │ Item Types             │ │  │  ┌───────────┐ ┌───────┐│ │
│  │ 🟦 Snippets            │ │  │  │ React     │ │ Python│ │ │
│  │ 🟣 Prompts             │ │  │  │ Hooks     │ │ Snip- │ │ │
│  │ 🟧 Commands            │ │  │  │ Patterns  │ │ plets │ │ │
│  │ ⬜ Notes               │ │  │  └───────────┘ └───────┘│ │
│  │ 🔗 Links               │ │  │                           │ │
│  │                        │ │  │  ┌───────────┐ ┌───────┐│ │
│  │ Collections (latest)   │ │  │  │ Prompt    │ │ ...   │ │
│  │                        │ │  │  │ Library   │ └───────┘│ │
│  │ ⚙️  Settings            │ │  └──────────────────────────┘ │
│  └────────────────────────┘ │                               │
│  [Profile / Pro Badge]      │                               │
└──────────────────────────────┴───────────────────────────────┘
```

- **Sidebar:** Item type filters + latest collections
- **Main area:** Grid of color-coded collection cards (background color reflects the dominant item type)
- **Items:** Display as color-bordered cards within collections
- **Detail view:** Individual items open in a quick-access drawer

### 8.3 Type Colors & Icons

| Type | Color | Icon |
|---|---|---|
| Snippet | `#3b82f6` (blue) | `Code` |
| Prompt | `#8b5cf6` (purple) | `Sparkles` |
| Command | `#f97316` (orange) | `Terminal` |
| Note | `#eab308` (yellow) | `StickyNote` |
| File | `#6b7280` (gray) | `File` |
| Image | `#ec4899` (pink) | `Image` |
| Link | `#10b981` (emerald) | `Link` |

### 8.4 Responsive

- Desktop-first; mobile usable
- Sidebar collapses to a **drawer on mobile**

### 8.5 Micro-interactions

- Smooth transitions on all interactive elements
- Hover states on cards
- Toast notifications for actions (create, update, delete, export)
- Loading skeletons for async states

---

## 9. File Structure (Planned)

```
devstash/
├─ app/
│  ├─ (auth)/             # Auth pages (login, register)
│  ├─ dashboard/           # Main app area
│  ├─ items/               # /items/:type
│  ├─ collections/         # Collection detail pages
│  ├─ (export)/            # Import/Export routes
│  └─ api/
│     ├─ auth/             # NextAuth
│     ├─ items/            # Item CRUD
│     ├─ collections/      # Collection CRUD
│     ├─ ai/               # AI feature endpoints
│     └─ upload/           # R2 upload endpoints
├─ components/
│  ├─ ui/                  # shadcn components
│  ├─ layout/              # Sidebar, Header, Drawer
│  └─ items/               # Item cards, type-specific components
│  └─ collections/         # Collection cards, grids
│  └─ search/              # Search bar, filter chips
│  └─ ai/                  # AI feature components
├─ lib/
│  ├─ db.ts                # Database helpers
│  ├─ ai.ts                # OpenAI integration
│  └──utils.ts             # cn() and shared utilities
├─ prisma/
│  ├─ schema