# DevStash Item Types

## Overview

DevStash has 7 system item types that determine an item's behavior, appearance, and storage model.

## Item Type Reference

| # | Type | Icon (Lucide) | Color | Purpose |
|---|------|---------------|-------|---------|
| 1 | **snippet** | `Code` | `#3b82f6` (blue) | Reusable code blocks, hooks, utilities |
| 2 | **prompt** | `Sparkles` | `#8b5cf6` (purple) | AI prompt templates and workflow patterns |
| 3 | **command** | `Terminal` | `#f97316` (orange) | Terminal commands, scripts, CLI utilities |
| 4 | **note** | `StickyNote` | `#fde047` (yellow) | Context notes, explanations, documentation |
| 5 | **file** | `File` | `#6b7280` (gray) | Uploaded files stored in Cloudflare R2 |
| 6 | **image** | `Image` | `#ec4899` (pink) | Uploaded images stored in Cloudflare R2 |
| 7 | **link** | `Link` | `#10b981` (emerald) | External URLs, documentation references |

## Per-Type Details

### 1. Snippet (`snippet`)

- **Icon**: `Code` (lucide-react)
- **Color**: `#3b82f6`
- **Content Type**: `TEXT`
- **Route**: `/items/snippets`
- **Key Fields**: `content` (code text), `language` (programming language for syntax highlighting)
- **Purpose**: Store reusable code blocks including hooks, utilities, configurations, and patterns
- **Monetization**: Available on Free tier

### 2. Prompt (`prompt`)

- **Icon**: `Sparkles` (lucide-react)
- **Color**: `#8b5cf6`
- **Content Type**: `TEXT`
- **Route**: `/items/prompts`
- **Key Fields**: `content` (prompt text)
- **Purpose**: Save AI prompt templates, system messages, and workflow patterns
- **AI Features**: AI prompt optimizer (Pro only)
- **Monetization**: Available on Free tier

### 3. Command (`command`)

- **Icon**: `Terminal` (lucide-react)
- **Color**: `#f97316`
- **Content Type**: `TEXT`
- **Route**: `/items/commands`
- **Key Fields**: `content` (command/script text), `language` (bash, yaml, etc.)
- **Purpose**: Store terminal commands, shell scripts, Docker configurations, deployment scripts
- **Monetization**: Available on Free tier

### 4. Note (`note`)

- **Icon**: `StickyNote` (lucide-react)
- **Color**: `#fde047`
- **Content Type**: `TEXT`
- **Route**: `/items/notes`
- **Key Fields**: `content` (markdown text), `description` (summary)
- **Purpose**: Context files, explanations, documentation, course notes
- **Monetization**: Available on Free tier

### 5. File (`file`)

- **Icon**: `File` (lucide-react)
- **Color**: `#6b7280`
- **Content Type**: `FILE`
- **Route**: `/items/files`
- **Key Fields**: `fileUrl` (R2 URL), `fileName` (original filename), `fileSize` (bytes)
- **Purpose**: Upload and store arbitrary files (documents, archives, binaries)
- **Monetization**: **Pro only**
- **Storage**: Cloudflare R2 (S3-compatible object storage)

### 6. Image (`image`)

- **Icon**: `Image` (lucide-react)
- **Color**: `#ec4899`
- **Content Type**: `FILE`
- **Route**: `/items/images`
- **Key Fields**: `fileUrl` (R2 URL), `fileName` (original filename), `fileSize` (bytes)
- **Purpose**: Upload and store images (screenshots, diagrams, assets)
- **Monetization**: **Pro only**
- **Storage**: Cloudflare R2 (S3-compatible object storage)

### 7. Link (`link`)

- **Icon**: `Link` (lucide-react)
- **Color**: `#10b981`
- **Content Type**: `URL`
- **Route**: `/items/links`
- **Key Fields**: `url` (external URL), `description` (summary)
- **Purpose**: Curate external documentation, tutorials, and resource links
- **Monetization**: Available on Free tier

## Content Classification

### TEXT Types (4)

| Type | Fields Used |
|------|-------------|
| snippet | `content`, `language` |
| prompt | `content` |
| command | `content`, `language` |
| note | `content`, `description` |

All TEXT types store their primary data in the `Item.content` field. The `language` field is optional and enables syntax highlighting.

### FILE Types (2)

| Type | Fields Used |
|------|-------------|
| file | `fileUrl`, `fileName`, `fileSize` |
| image | `fileUrl`, `fileName`, `fileSize` |

FILE types store their primary data in Cloudflare R2. The `Item.fileUrl` field holds the R2 object URL.

### URL Types (1)

| Type | Fields Used |
|------|-------------|
| link | `url` |

URL types store their primary data in the `Item.url` field.

## Shared Properties

All item types share these base fields on the `Item` model:

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | CUID identifier |
| `title` | String | Display name |
| `contentType` | Enum | `TEXT`, `FILE`, or `URL` |
| `description` | String? | Summary/description |
| `isFavorite` | Boolean | Favorite toggle (default: false) |
| `isPinned` | Boolean | Pin to top (default: false) |
| `language` | String? | Programming language for syntax highlighting |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |
| `userId` | String | Owner reference |
| `itemTypeId` | String | Type reference |
| `tags` | Tag[] | Many-to-many tag relation |
| `collections` | ItemCollection[] | Many-to-many collection relation |

## Display Differences

### Dashboard Sidebar

Item types are displayed as filterable categories with their icon and color:

```
TYPES
🔷 Snippets      #3b82f6
✨ Prompts       #8b5cf6
⌨️ Commands      #f97316
📒 Notes         #fde047
📁 Files         #6b7280
🖼️ Images        #ec4899
🔗 Links         #10b981
```

### Item Cards

Each item card displays:
- Type-specific icon (left side, colored)
- Title
- Preview content (first lines of `content` for TEXT types, filename for FILE types, URL for link types)
- Tags (if any)
- Favorite/pinned indicators

### Color System (CSS Variables)

```css
:root {
  --color-snippet: #3b82f6;
  --color-prompt:  #8b5cf6;
  --color-command: #f97316;
  --color-note:    #fde047;
  --color-file:    #6b7280;
  --color-image:   #ec4899;
  --color-link:    #10b981;
}
```

## System Types Architecture

All 7 types are **system types** (immutable, `isSystem: true`), seeded on first run via `prisma/seed.ts`:

```typescript
const systemItemTypes = [
  { name: 'snippet', icon: 'Code', color: '#3b82f6', isSystem: true },
  { name: 'prompt', icon: 'Sparkles', color: '#8b5cf6', isSystem: true },
  { name: 'command', icon: 'Terminal', color: '#f97316', isSystem: true },
  { name: 'note', icon: 'StickyNote', color: '#fde047', isSystem: true },
  { name: 'file', icon: 'File', color: '#6b7280', isSystem: true },
  { name: 'image', icon: 'Image', color: '#ec4899', isSystem: true },
  { name: 'link', icon: 'Link', color: '#10b981', isSystem: true },
];
```

System types have `userId: null` and are unique by `[name, userId]` composite key.

Pro users will eventually be able to create custom types (future feature).
