# Code Decomposition — Phase 4: API & Actions

## Overview

Extract shared auth pattern and result types across the item API route and server actions.

| Priority | Count |
|----------|-------|
| Medium | 2 |

> **IMPORTANT**: When implementing these changes, you MUST NOT break any existing functionality or user flow. Always double-check your work by verifying that affected features still work as expected after each change.

---

## 9. Item API Route — Extract Auth, Reuse Include, Use Shared DB Layer

**File:** `app/api/items/[id]/route.ts:11-15, 26-39, 76-80, 97-103`

Three issues in the API route:

### 9a. Duplicated Auth Check

Lines 11-15 and 76-80 are identical:
```ts
const session = await auth();
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**Change:** Extract `requireAuth()` helper:
```ts
async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    return { session: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { session, error: null };
}
```

### 9b. Duplicated `ITEM_INCLUDE`

Lines 26-39 define an inline `include` clause identical to `ITEM_INCLUDE` in `lib/db/items/items.ts`.

**Change:** Import and reuse `ITEM_INCLUDE`:
```ts
import { ITEM_INCLUDE } from '@/lib/db/items/items';
```

### 9c. Bypasses Shared DB Layer

Line 97 uses `prisma.item.updateMany` directly instead of calling `updateItem()` from `lib/db/items/items.ts`.

**Change:** Import and use `updateItem()`:
```ts
import { updateItem } from '@/lib/db/items/items';
```

---

## 10. Item Actions — Define Generic Result Type, Extract Auth

**File:** `actions/items/Items.ts:8-10, 15-18, 37-39, 46-49, 71-73, 78-82`

### 10a. Duplicated Result Types

Lines 8-10, 37-39, and 71-73 define identical result shapes:
```ts
{ success: true; data: ...; error: null } | { success: false; data: null; error: string }
```

**Change:** Define a generic `ActionResult<T>` type:
```ts
type ActionResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: string };
```

### 10b. Duplicated Auth Pattern

Lines 15-18, 46-49, and 78-82 are identical auth guards:
```ts
const session = await auth();
if (!session?.user?.id) {
  return { success: false, data: null, error: 'Unauthorized' };
}
```

**Change:** Extract `requireAuth()` helper:
```ts
async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    return { userId: null, error: 'Unauthorized' as const };
  }
  return { userId: session.user.id, error: null };
}
```

Usage in each action:
```ts
const { userId, error } = await requireAuth();
if (error) return { success: false, data: null, error };
```

**Impact:** ~25 lines removed; pattern reusable across all future actions.
