# Stripe Integration Plan — DevStash Pro

> Subscription billing for DevStash Pro: **$8/mo monthly** or **$72/yr annual**.
> Generated from codebase research on `prisma/schema.prisma`, `lib/auth/*`, `actions/*`, `lib/db/*`, `app/api/*`, and `components/**`.

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Feature Gating Analysis](#2-feature-gating-analysis)
3. [API & Webhook Patterns](#3-api--webhook-patterns)
4. [Deliverable — Implementation Plan](#4-deliverable--implementation-plan)
   - [4.1 Files to Create](#41-files-to-create)
   - [4.2 Files to Modify](#42-files-to-modify)
   - [4.3 Stripe Dashboard Setup](#43-stripe-dashboard-setup)
   - [4.4 Testing Checklist](#44-testing-checklist)
   - [4.5 Implementation Order](#45-implementation-order)

---

## 1. Current State Analysis

### 1.1 User Model & Stripe Fields — **Already Present**

The Prisma schema already contains the three Stripe fields needed for subscriptions. **No migration is required for these fields.**

`prisma/schema.prisma:16-37`:

```prisma
model User {
  id                   String       @id @default(cuid())
  email                String       @unique
  emailVerified        DateTime?
  name                 String?
  image                String?
  password             String?
  isPro                Boolean      @default(false)
  stripeCustomerId     String?      @unique
  stripeSubscriptionId String?      @unique
  editorPreferences    Json?
  createdAt            DateTime     @default(now())
  updatedAt            DateTime     @updatedAt
  // ...relations
  @@map("users")
}
```

| Field | Status | Purpose |
| --- | --- | --- |
| `isPro` | ✅ Present, defaults `false` | Feature-gate flag, synced into NextAuth session |
| `stripeCustomerId` | ✅ Present, `@unique` | Links user to Stripe Customer object |
| `stripeSubscriptionId` | ✅ Present, `@unique` | Links user to Stripe Subscription object |

> **Note:** The schema uses Prisma 7 with `@prisma/adapter-pg` (see `lib/prisma/prisma.ts:10-12`). Migrations must follow the rule in `context/project-overview.md`: use `npx prisma migrate dev --name <name>` — never `prisma db push`.

### 1.2 NextAuth Configuration

- **Config location:** `lib/auth/authConfig/authConfig.ts` (callbacks, providers, adapter)
- **Instance location:** `lib/auth/auth/auth.ts` (exports `handlers`, `auth`, `signIn`, `signOut`)
- **Route handler:** `app/api/auth/[...nextauth]/route.ts` (re-exports `handlers`)
- **Session strategy:** `jwt` (see `authConfig.ts:13`) — no database sessions, so `isPro` must live in the JWT token.
- **Adapter:** `PrismaAdapter(prisma)` from `@auth/prisma-adapter`.

#### Session type augmentation — `types/next-auth.d.ts`

`isPro` is already declared on the session user:

```typescript
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      isPro: boolean
    } & DefaultSession["user"]
  }
}
```

#### Current JWT callback — `authConfig.ts:22-32` ⚠️ Needs the workaround

```typescript
async jwt({ token, user }) {
  if (user) {
    (token as { id: string }).id = String(user.id);
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { isPro: true },
    });
    (token as { isPro: boolean }).isPro = dbUser?.isPro ?? false;
  }
  return token;
},
```

**Problem:** The DB lookup only runs when `user` is truthy — i.e. **only on initial sign-in**. When a Stripe webhook flips `isPro` to `true` in the database, an already-logged-in user's JWT still carries the stale `isPro: false` until they fully sign out and back in. The `session({ session, token })` callback (lines 33-41) only copies the token value onto the session — it never re-reads the DB.

**Fix:** Apply the workaround described in `context/research/stripe-integration-research.md` — always sync `isPro` from the DB using `token.sub` (set by NextAuth after sign-in). See [§4.2.1](#421-libauthauthconfigauthconfigts--always-sync-ispro).

### 1.3 How User Data Is Accessed

| Context | How `isPro` is read | Example |
| --- | --- | --- |
| Server Component | `const session = await auth(); session.user.isPro` | `app/items/[type]/page.tsx:49`, `app/collections/page.tsx:50`, `app/favorites/page.tsx:46`, `app/collections/[id]/page.tsx:59` |
| Server Action | `requireAuth()` helper → `session.user.id`, then DB | `actions/items/Items.ts:13-19`, `actions/collections/Collections.ts:12-18` |
| Client Component | Passed as prop via `DashboardWrapper` → `Sidebar` | `components/dashboard/dashboardWrapper/DashboardWrapper.tsx:17`, `components/dashboard/sidebar/Sidebar.tsx:29` |
| Profile badge | `user.isPro` prop | `components/profile/profilePageClient/ProfilePageClient.tsx:85-89` |
| DB layer | `select: { isPro: true }` | `lib/db/user/user.ts:29`, `lib/db/users/users.ts:14` |

> **Key insight:** `session.user.isPro` is the primary gate signal in the client. The server-side source of truth is `prisma.user.isPro`. After webhook updates, a **page reload** (re-running the server component + JWT callback) is sufficient to propagate the new status — once the JWT workaround is in place.

### 1.4 Existing Subscription / Payment Code — **None**

- No `lib/stripe.ts`, no `app/api/stripe/` or `app/api/webhooks/stripe/` routes.
- No Stripe SDK in `package.json` (need to add `stripe` + `@stripe/stripe-js`).
- `.env.example:23-28` **already declares** all required Stripe env vars (see [§3.3](#33-environment-variable-patterns)).
- `actions/index.ts` has no billing actions yet.
- `components/settings/` has `EditorPreferencesForm`, `ChangePasswordForm`, `DeleteAccountDialog` — **no billing/plan section**.

---

## 2. Feature Gating Analysis

### 2.1 Free Tier Limits (from `context/project-overview.md`)

| Resource | Free | Pro |
| --- | --- | --- |
| Items | **50 total** | Unlimited |
| Collections | **3** | Unlimited |
| File & Image item types | ❌ | ✅ |
| AI auto-tagging / code explain / prompt optimizer | ❌ | ✅ |
| Data export (JSON/ZIP) | ❌ | ✅ |
| Custom item types | ❌ | Coming soon |
| Priority support | ❌ | ✅ |

> `context/project-overview.md:565` notes: *"During development, all users can access all features. Pro gating will be enabled before launch."* This plan implements the gating.

### 2.2 Where Counts Are Checked (or Could Be)

The item/collection counts already exist via `getItemStats` in `lib/db/items/items.ts:198-213`:

```typescript
export async function getItemStats(userId: string): Promise<ItemStats> {
  const [totalItems, totalCollections, favoriteItems, favoriteCollections] =
    await Promise.all([
      prisma.item.count({ where: { userId } }),
      prisma.collection.count({ where: { userId } }),
      // ...
    ]);
  return { totalItems, totalCollections, favoriteItems, favoriteCollections };
}
```

**Enforcement points that need limit checks:**

| Action | File | Function | Limit to enforce |
| --- | --- | --- | --- |
| Create item | `actions/items/Items.ts:21` | `createItemAction` | `totalItems < 50` (free) |
| Create collection | `actions/collections/Collections.ts:20` | `createCollectionAction` | `totalCollections < 3` (free) |
| File upload | `app/api/upload/route.ts:14` | `POST` | Reject `file`/`image` types entirely (free) |
| Item type selection | `components/items/itemCreateDialog/ItemTypeSelector.tsx:10` | `ItemTypeSelector` | Disable `file`/`image` buttons (free) |

**No checks currently exist** — `createItem` (`lib/db/items/items.ts:63-108`) and `createCollection` (`lib/db/collections/collections.ts`) write directly without counting. Server-side enforcement is mandatory (client-side gating is cosmetic only).

### 2.3 Pro-Only Features — Current State

| Feature | Where it lives | Pro-gated? |
| --- | --- | --- |
| File/Image item types | `ITEM_TYPES` in `lib/constants.ts:6-14`, `SHOW_FILE_UPLOAD` in `lib/constants.ts:19` | ❌ Not gated |
| File upload UI | `components/fileUpload/FileUpload/FileUpload.tsx` | ❌ Not gated |
| File upload API | `app/api/upload/route.ts` | ❌ Not gated (only checks auth) |
| File download API | `app/api/download/route.ts` | ❌ Not gated |
| AI features | (not yet built) | n/a — gate when added |
| Data export | (not yet built) | n/a — gate when added |
| `ItemTypeSelector` | `components/items/itemCreateDialog/ItemTypeSelector.tsx` | ❌ Shows all 7 types to everyone |

### 2.4 Settings Page Structure

`app/settings/page.tsx` loads `loadProfileDataAsync` (which already selects `isPro`), wraps the page in `DashboardWrapper`, and renders `SettingsPageClient` (`components/settings/settingsPageClient/SettingsPageClient.tsx`).

`SettingsPageClient` currently renders two sections:
1. `EditorPreferencesForm`
2. "Account Actions" card (Change Password + Delete Account)

**A new "Plan & Billing" card must be inserted** (recommended: at the top, above Editor Preferences) showing:
- Current plan (Free / Pro Monthly / Pro Annual)
- Upgrade buttons (Monthly $8, Annual $72) → Stripe Checkout
- "Manage subscription" button → Stripe Customer Portal (Pro only)

The page already has `user.isPro` available on `DashboardWrapper`'s `user` prop (`app/settings/page.tsx:50`), so no new data fetching is needed for the badge — but the **plan tier** (monthly vs annual) requires reading the Stripe subscription's price ID, which should be fetched server-side and passed down (see [§4.2.6](#426-appsettingspagetsx--pass-plan-tier-to-client)).

---

## 3. API & Webhook Patterns

### 3.1 API Route Structure

Existing routes follow this exact pattern (`app/api/upload/route.ts:14-18`):

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth/auth';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ...logic, return NextResponse.json(...)
}
```

- Auth check via `auth()` from `@/lib/auth/auth/auth`.
- `NextRequest` / `NextResponse` from `next/server`.
- JSON responses with `{ error: string }` shape and HTTP status codes.
- No existing route uses `request.text()` for raw bodies yet — the Stripe webhook will be the first.

### 3.2 Server Action Error Handling

Actions use a discriminated `ActionResult<T>` union and a `requireAuth()` helper (`actions/items/Items.ts:9-19`):

```typescript
type ActionResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: string };

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    return { userId: null, error: 'Unauthorized' as const };
  }
  return { userId: session.user.id, error: null };
}
```

Validation uses Zod (`*.safeParse`), errors return the first issue message, `revalidatePath` is called on success. New Stripe actions should follow this exact pattern.

### 3.3 Environment Variable Patterns

`.env.example:23-28` already declares (no changes needed to the example file):

```bash
# STRIPE
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_MONTHLY=
STRIPE_PRICE_ID_YEARLY=
```

Add one additional var for the app base URL used in Checkout return URLs (or reuse `AUTH_URL` already referenced in `actions/auth/Auth.ts:66`):

```bash
# Optional — reuse AUTH_URL instead
APP_URL=http://localhost:3000
```

---

## 4. Deliverable — Implementation Plan

### 4.1 Files to Create

#### 4.1.1 `lib/stripe/stripe.ts` — Stripe SDK singleton

```typescript
import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(secretKey, {
  apiVersion: '2025-08-27.basil', // pin to current stable; adjust on install
  typescript: true,
});

export const STRIPE_PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_ID_MONTHLY!,
  yearly: process.env.STRIPE_PRICE_ID_YEARLY!,
} as const;

export type PlanInterval = 'monthly' | 'yearly';

export function priceIdToPlan(priceId: string): PlanInterval | null {
  if (priceId === STRIPE_PRICE_IDS.monthly) return 'monthly';
  if (priceId === STRIPE_PRICE_IDS.yearly) return 'yearly';
  return null;
}
```

> Place under `lib/stripe/` to mirror the existing `lib/auth/`, `lib/db/`, `lib/email/` folder-per-module convention.

#### 4.1.2 `lib/constants/limits.ts` — Free-tier limits

```typescript
export const FREE_TIER_LIMITS = {
  maxItems: 50,
  maxCollections: 3,
} as const;

export const PRO_ONLY_ITEM_TYPES = ['file', 'image'] as const;

export function isProOnlyItemType(type: string): boolean {
  return (PRO_ONLY_ITEM_TYPES as readonly string[]).includes(type);
}
```

#### 4.1.3 `app/api/stripe/checkout/route.ts` — Create Checkout Session

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth/auth';
import { stripe, STRIPE_PRICE_IDS } from '@/lib/stripe/stripe';
import { prisma } from '@/lib/prisma/prisma';
import { z } from 'zod';

const bodySchema = z.object({
  interval: z.enum(['monthly', 'yearly']),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const json = await request.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid interval' }, { status: 400 });
  }

  const priceId = parsed.data.interval === 'monthly'
    ? STRIPE_PRICE_IDS.monthly
    : STRIPE_PRICE_IDS.yearly;

  const baseUrl = process.env.APP_URL ?? process.env.AUTH_URL ?? 'http://localhost:3000';

  // Find or create the Stripe Customer so we can reuse it across checkouts
  let { stripeCustomerId } = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: session.user.email ?? undefined,
      metadata: { userId: session.user.id },
    });
    stripeCustomerId = customer.id;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeCustomerId },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/settings?checkout=success`,
    cancel_url: `${baseUrl}/settings?checkout=cancelled`,
    client_reference_id: session.user.id,
    subscription_data: {
      metadata: { userId: session.user.id },
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
```

#### 4.1.4 `app/api/stripe/portal/route.ts` — Customer Portal

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth/auth';
import { stripe } from '@/lib/stripe/stripe';
import { prisma } from '@/lib/prisma/prisma';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 400 });
  }

  const baseUrl = process.env.APP_URL ?? process.env.AUTH_URL ?? 'http://localhost:3000';

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${baseUrl}/settings`,
  });

  return NextResponse.json({ url: portalSession.url });
}
```

#### 4.1.5 `app/api/stripe/webhook/route.ts` — Webhook Handler (critical)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stripe, priceIdToPlan } from '@/lib/stripe/stripe';
import { prisma } from '@/lib/prisma/prisma';

// Stripe requires the raw body — read with request.text(), NOT request.json()
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const sess = event.data.object;
        const userId = sess.client_reference_id ?? sess.metadata?.userId;
        const subscriptionId = typeof sess.subscription === 'string' ? sess.subscription : null;
        const customerId = typeof sess.customer === 'string' ? sess.customer : null;

        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              isPro: true,
              stripeSubscriptionId: subscriptionId,
              ...(customerId ? { stripeCustomerId: customerId } : {}),
            },
          });
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const userId = sub.metadata.userId;

        // Active subscription → Pro; anything else (canceled/unpaid) → Free
        const isActive = sub.status === 'active' || sub.status === 'trialing';

        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              isPro: isActive,
              stripeSubscriptionId: isActive ? sub.id : null,
            },
          });
        }
        break;
      }

      default:
        // Unhandled event types are safe to ignore
        break;
    }
  } catch (err) {
    console.error('Stripe webhook handler failed:', err);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
```

> **Important — `proxy.ts` matcher:** The current `proxy.ts:31` matcher is `/((?!api|_next/static|_next/image|favicon.ico).*)`, which already **excludes** `/api/*` from the proxy. This is correct: the webhook route must not be redirected to `/sign-in` when there's no session (webhooks carry no session). Keep this exclusion.
>
> **Local testing:** Use the Stripe CLI to forward events: `stripe listen --forward-to localhost:3000/api/stripe/webhook`. The CLI prints a `whsec_...` value — set that as `STRIPE_WEBHOOK_SECRET` in `.env` for local dev (it differs from the dashboard webhook secret).

#### 4.1.6 `actions/stripe/Stripe.ts` — Server actions (thin wrappers)

```typescript
'use server';

import { auth } from '@/lib/auth/auth/auth';

type ActionResult =
  | { success: true; data: { url: string }; error: null }
  | { success: false; data: null; error: string };

export async function createCheckoutAction(
  interval: 'monthly' | 'yearly',
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, data: null, error: 'Unauthorized' };
  }

  try {
    const res = await fetch(`${process.env.APP_URL ?? 'http://localhost:3000'}/api/stripe/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interval }),
    });
    const json = await res.json();
    if (!res.ok) {
      return { success: false, data: null, error: json.error ?? 'Checkout failed' };
    }
    return { success: true, data: { url: json.url }, error: null };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'Checkout failed',
    };
  }
}

export async function createPortalAction(): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, data: null, error: 'Unauthorized' };
  }

  try {
    const res = await fetch(`${process.env.APP_URL ?? 'http://localhost:3000'}/api/stripe/portal`, {
      method: 'POST',
    });
    const json = await res.json();
    if (!res.ok) {
      return { success: false, data: null, error: json.error ?? 'Portal failed' };
    }
    return { success: true, data: { url: json.url }, error: null };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'Portal failed',
    };
  }
}
```

> Add to `actions/index.ts`: `export { createCheckoutAction, createPortalAction } from './stripe/Stripe'`.

#### 4.1.7 `components/settings/billingSection/BillingSection.tsx`

A new client component rendered inside `SettingsPageClient`. Uses shadcn `Card`, `Button`, `Badge` (all already installed). Free tier shows two upgrade buttons; Pro tier shows the plan label + "Manage subscription" button calling `createPortalAction`. On click, call the server action and `window.location.href = data.url` to redirect to Stripe-hosted Checkout/Portal.

#### 4.1.8 `components/ui/` — No new shadcn components needed

`Card`, `Button`, `Badge`, `Separator`, `Dialog` are all already in `components/ui/`. Do **not** hand-edit these or add new ones — per `AGENTS.md`, use `npx shadcn@latest add <component>` only if something is missing.

---

### 4.2 Files to Modify

#### 4.2.1 `lib/auth/authConfig/authConfig.ts` — Always sync `isPro`

Apply the workaround from the research prompt. Replace the `jwt` callback (lines 22-32):

```typescript
async jwt({ token, user }) {
  if (user) {
    (token as { id: string }).id = String(user.id);
  }

  // Always sync isPro from DB to catch webhook updates.
  // token.sub is set by NextAuth after sign-in; user is only set on first sign-in.
  const userId = (token as { id?: string }).id ?? token.sub;
  if (userId) {
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { isPro: true },
    });
    (token as { isPro: boolean }).isPro = dbUser?.isPro ?? false;
  }

  return token;
},
```

**Trade-off:** One extra `findUnique` per session validation (JWT is re-issued on every request that calls `auth()`). Acceptable for a solo/small-scale app; cache later with a short TTL if needed. The existing test file `lib/auth/authConfig/authConfig.test.ts` must be updated to account for the callback being called without a `user` argument on subsequent sessions.

#### 4.2.2 `actions/items/Items.ts` — Enforce 50-item free limit

In `createItemAction` (line 21), after `requireAuth()` and **before** `createItem`, add:

```typescript
import { FREE_TIER_LIMITS } from '@/lib/constants/limits';
import { getItemStats } from '@/lib/db/items/items';
import { prisma } from '@/lib/prisma/prisma';

// inside createItemAction, after auth:
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { isPro: true },
});
if (!user?.isPro) {
  const stats = await getItemStats(userId);
  if (stats.totalItems >= FREE_TIER_LIMITS.maxItems) {
    return {
      success: false,
      data: null,
      error: `Free plan limited to ${FREE_TIER_LIMITS.maxItems} items. Upgrade to Pro for unlimited items.`,
    };
  }
}
```

Also gate `file`/`image` types server-side (defense in depth, even though the UI hides them):

```typescript
import { isProOnlyItemType } from '@/lib/constants/limits';

if (isProOnlyItemType(result.data.itemType) && !user?.isPro) {
  return { success: false, data: null, error: 'File and image items are a Pro feature.' };
}
```

> Note: `session.user.isPro` could be used instead of a fresh DB lookup, but the DB read is the source of truth and avoids stale-JWT race conditions immediately after a webhook fires. Since we're already adding a DB read in the JWT callback, reusing `session.user.isPro` here is also acceptable — pick one and stay consistent.

#### 4.2.3 `actions/collections/Collections.ts` — Enforce 3-collection free limit

Same pattern in `createCollectionAction` (line 20):

```typescript
import { FREE_TIER_LIMITS } from '@/lib/constants/limits';
import { prisma } from '@/lib/prisma/prisma';

// after auth, before createCollection:
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { isPro: true },
});
if (!user?.isPro) {
  const count = await prisma.collection.count({ where: { userId } });
  if (count >= FREE_TIER_LIMITS.maxCollections) {
    return {
      success: false,
      data: null,
      error: `Free plan limited to ${FREE_TIER_LIMITS.maxCollections} collections. Upgrade to Pro for unlimited collections.`,
    };
  }
}
```

#### 4.2.4 `app/api/upload/route.ts` — Block file/image for free users

After the auth check (line 17), before processing:

```typescript
import { prisma } from '@/lib/prisma/prisma';

const dbUser = await prisma.user.findUnique({
  where: { id: session.user.id },
  select: { isPro: true },
});

if (!dbUser?.isPro) {
  return NextResponse.json(
    { error: 'File and image uploads are a Pro feature. Upgrade to Pro to enable them.' },
    { status: 403 },
  );
}
```

> This is the authoritative gate. Even if a free user somehow submits the file create form, the upload itself will be rejected. `app/api/download/route.ts` can stay open to all (so existing file items remain accessible if a user downgrades — decide based on product policy).

#### 4.2.5 `components/items/itemCreateDialog/ItemTypeSelector.tsx` — Cosmetic gate

Add an `isPro` prop; disable `file`/`image` buttons with a lock icon and tooltip when `isPro === false`. Pass `isPro` down from `ItemCreateDialog` (which receives it via the dashboard context/session). This is **cosmetic only** — the server action and upload route are the real enforcement.

```tsx
import { PRO_ONLY_ITEM_TYPES } from '@/lib/constants/limits';
import { Lock } from 'lucide-react';

// render:
{ITEM_TYPES.map((type) => {
  const locked = !isPro && (PRO_ONLY_ITEM_TYPES as readonly string[]).includes(type.value);
  return (
    <button
      key={type.value}
      type='button'
      disabled={locked}
      onClick={() => !locked && onSelect(type.value)}
      className={cn(/* ...existing classes */, locked && 'opacity-50 cursor-not-allowed')}
    >
      <Icon className='h-4 w-4' />
      {type.label}
      {locked && <Lock className='h-3 w-3 ml-1' />}
    </button>
  );
})}
```

#### 4.2.6 `app/settings/page.tsx` — Pass plan tier to client

The settings page already fetches `user.isPro`. To show **which plan** (monthly vs annual), read the Stripe subscription's price ID server-side:

```typescript
import { stripe, priceIdToPlan } from '@/lib/stripe/stripe';

// after loading profileData:
let planTier: 'free' | 'monthly' | 'yearly' = 'free';
if (user.isPro && user.stripeSubscriptionId) {
  try {
    const sub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
    const priceId = sub.items.data[0]?.price.id;
    planTier = priceId ? (priceIdToPlan(priceId) ?? 'free') : 'free';
  } catch {
    planTier = 'free';
  }
}
```

> `loadProfileDataAsync` in `lib/db/user/user.ts:22-33` currently selects `isPro` but **not** `stripeSubscriptionId`. Add `stripeSubscriptionId: true` to the `select` so the settings page can read it without a second query. Update `ProfileData` / `profileUserDataSchema` in `types/db.ts` accordingly if you surface the subscription ID in the typed return.

Pass `planTier` into `SettingsPageClient`, which renders `BillingSection`.

#### 4.2.7 `components/settings/settingsPageClient/SettingsPageClient.tsx` — Render BillingSection

Add `planTier` to props and render `<BillingSection planTier={planTier} />` at the top of the layout (above `EditorPreferencesForm`).

#### 4.2.8 `actions/index.ts` — Export new Stripe actions

Add:
```typescript
export { createCheckoutAction, createPortalAction } from './stripe/Stripe'
```

#### 4.2.9 `package.json` — Add Stripe dependencies

```bash
npm install stripe
npm install -D @types/stripe   # only if types aren't bundled; modern stripe ships its own types
```

`stripe` v19+ ships TypeScript types and the `stripe-js` companion is only needed for client-side Elements (not required for Checkout-hosted pages). If you later build an embedded payment form, add `@stripe/stripe-js` + `@stripe/react-stripe-js`.

#### 4.2.10 `.env` (local) and `.env.production` — Fill in real values

The `.env.example` already lists the keys. Populate:
- `STRIPE_SECRET_KEY` = `sk_test_...` (test) / `sk_live_...` (prod)
- `STRIPE_PUBLISHABLE_KEY` = `pk_test_...` / `pk_live_...`
- `STRIPE_WEBHOOK_SECRET` = `whsec_...` (from dashboard endpoint, or from `stripe listen` for local)
- `STRIPE_PRICE_ID_MONTHLY` = `price_...` (the $8/mo price)
- `STRIPE_PRICE_ID_YEARLY` = `price_...` (the $72/yr price)

---

### 4.3 Stripe Dashboard Setup

1. **Create products & prices** (Dashboard → Products → Add product):
   - Product: **DevStash Pro**
   - Price 1: **$8.00 USD / month** → recurring, monthly → copy `price_...` → `STRIPE_PRICE_ID_MONTHLY`
   - Price 2: **$72.00 USD / year** → recurring, yearly → copy `price_...` → `STRIPE_PRICE_ID_YEARLY`
2. **Enable Customer Portal** (Dashboard → Settings → Billing → Customer Portal):
   - Allow customers to cancel, update payment method, and switch plans (monthly↔annual) if desired.
   - Configure the return URL to `https://<your-domain>/settings`.
3. **Create a Webhook endpoint** (Dashboard → Developers → Webhooks → Add endpoint):
   - Endpoint URL: `https://<your-domain>/api/stripe/webhook`
   - Events to send (at minimum):
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copy the **Signing secret** (`whsec_...`) → `STRIPE_WEBHOOK_SECRET` (production `.env`).
4. **Local development webhook** (separate secret):
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Use the `whsec_...` printed by the CLI as your **local** `STRIPE_WEBHOOK_SECRET`. It is different from the production dashboard secret.
5. **Test cards** (test mode):
   - Successful card: `4242 4242 4242 4242`, any future expiry, any CVC.
   - Declined card: `4000 0000 0000 0002`.
6. **Tax** (optional, depends on jurisdiction): configure tax rates in the dashboard if you collect tax; otherwise leave disabled for launch.

---

### 4.4 Testing Checklist

#### Unit / integration (Vitest — already configured per `package.json:11-13`)

- [ ] `lib/stripe/stripe.ts` — mock `STRIPE_SECRET_KEY` and assert `stripe` instance builds.
- [ ] `lib/constants/limits.ts` — `isProOnlyItemType('file')` → `true`; `isProOnlyItemType('snippet')` → `false`.
- [ ] `lib/auth/authConfig/authConfig.test.ts` — update existing tests: assert `isPro` is synced when `jwt` is called **without** a `user` arg (simulating a returning session). Mock `prisma.user.findUnique`.
- [ ] `actions/items/Items.test.ts` — add cases: free user at 50 items → `createItemAction` returns limit error; Pro user → succeeds; free user creating `file` type → Pro-feature error.
- [ ] `actions/collections/Collections.test.ts` — free user at 3 collections → error; Pro user → succeeds.
- [ ] Webhook handler — mock `stripe.webhooks.constructEvent` to throw → expect 400; mock valid event of each handled type → assert `prisma.user.update` called with correct `isPro`/`stripeSubscriptionId`.

#### Manual / e2e (test mode with Stripe CLI)

- [ ] `stripe listen` forwarding to local webhook route; confirm 200 responses.
- [ ] Free user clicks "Upgrade — Monthly" → redirected to Stripe Checkout → pay with `4242...` → redirected to `/settings?checkout=success` → reload page → `isPro` badge appears in profile, PRO badge in sidebar.
- [ ] Free user clicks "Upgrade — Annual" → same flow → plan tier shows "Pro (Annual)".
- [ ] Pro user clicks "Manage subscription" → Customer Portal opens → cancel subscription → webhook `customer.subscription.deleted` fires → reload → `isPro` reverts to `false`, upgrade buttons reappear.
- [ ] Free user at 50 items → "New Item" returns limit error toast; upgrade → succeeds.
- [ ] Free user at 3 collections → "New Collection" returns limit error; upgrade → succeeds.
- [ ] Free user → `file`/`image` buttons disabled in `ItemTypeSelector` with lock icon; calling upload API directly returns 403.
- [ ] Webhook signature tampering (modify body) → 400 response, no DB mutation.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes (no type errors from new Stripe imports).
- [ ] `npm run test:run` passes.

---

### 4.5 Implementation Order

Ordered to ship a working upgrade flow first, then enforce limits, then polish UI.

| # | Step | Files | Verifiable outcome |
| --- | --- | --- | --- |
| 1 | Add `stripe` dep, create `lib/stripe/stripe.ts`, `lib/constants/limits.ts` | `package.json`, 2 new files | `npm run build` still green |
| 2 | Update NextAuth `jwt` callback (always-sync `isPro`) + update its tests | `lib/auth/authConfig/authConfig.ts`, `.test.ts` | Tests pass; `isPro` survives reload after manual DB flip |
| 3 | Create webhook route + test locally with `stripe listen` | `app/api/stripe/webhook/route.ts` | `stripe trigger checkout.session.completed` → DB `isPro` flips |
| 4 | Create Checkout + Portal API routes | `app/api/stripe/checkout/route.ts`, `app/api/stripe/portal/route.ts` | `curl` with session cookie returns `{ url }` |
| 5 | Create Stripe server actions + export from `actions/index.ts` | `actions/stripe/Stripe.ts`, `actions/index.ts` | Actions importable from client |
| 6 | Build `BillingSection` component, wire into `SettingsPageClient` + `app/settings/page.tsx` (with plan-tier fetch) | new component, 2 modified files | Free user sees upgrade buttons; Pro user sees "Manage subscription" |
| 7 | **End-to-end upgrade test** in test mode | — | Free → pay → reload → Pro badge appears |
| 8 | Enforce server-side limits: item count, collection count, file/image type block | `actions/items/Items.ts`, `actions/collections/Collections.ts`, `app/api/upload/route.ts` (+ tests) | Free user blocked at limits; Pro user unaffected |
| 9 | Cosmetic UI gating: disable `file`/`image` in `ItemTypeSelector`, surface upgrade prompts | `ItemTypeSelector.tsx`, `ItemCreateDialog` | Locked buttons show lock icon for free users |
| 10 | Add `stripeSubscriptionId` to `loadProfileDataAsync` select + `ProfileData` type; surface plan tier on profile page | `lib/db/user/user.ts`, `types/db.ts`, `ProfilePageClient.tsx` | Profile shows "Pro (Monthly)" / "Pro (Annual)" |
| 11 | Production setup: real prices, live webhook endpoint, live keys in `.env.production` | Stripe dashboard, `.env.production` | Live checkout succeeds with a real card |
| 12 | Final lint + build + test pass | — | `npm run lint && npm run build && npm run test:run` all green |

---

## Appendix — Key File References

| Concern | File:line |
| --- | --- |
| User schema with Stripe fields | `prisma/schema.prisma:16-37` |
| NextAuth config + JWT callback | `lib/auth/authConfig/authConfig.ts:22-41` |
| NextAuth instance (`auth`, `signIn`, `signOut`) | `lib/auth/auth/auth.ts:67-70` |
| Session type augmentation (`isPro`) | `types/next-auth.d.ts:3-10` |
| Server action auth pattern | `actions/items/Items.ts:13-19` |
| ActionResult discriminated union | `actions/items/Items.ts:9-11` |
| Item count query (`getItemStats`) | `lib/db/items/items.ts:198-213` |
| Item create (no limit yet) | `lib/db/items/items.ts:63-108` |
| Upload route (no Pro gate yet) | `app/api/upload/route.ts:14-18` |
| Proxy matcher (excludes `/api`) | `proxy.ts:31` |
| Settings page (loads `isPro`) | `app/settings/page.tsx:10-58` |
| Settings client (no billing section) | `components/settings/settingsPageClient/SettingsPageClient.tsx:30-83` |
| Dashboard wrapper (passes `isPro` to sidebar) | `components/dashboard/dashboardWrapper/DashboardWrapper.tsx:4-33` |
| Profile PRO badge | `components/profile/profilePageClient/ProfilePageClient.tsx:85-89` |
| Item type selector (no Pro gate) | `components/items/itemCreateDialog/ItemTypeSelector.tsx:10-34` |
| Env vars (already declared) | `.env.example:23-28` |
| Actions barrel (no Stripe yet) | `actions/index.ts:1-10` |
| Prisma client singleton | `lib/prisma/prisma.ts:14-20` |
| DB user select (includes `isPro`) | `lib/db/user/user.ts:22-33`, `lib/db/users/users.ts:6-17` |
