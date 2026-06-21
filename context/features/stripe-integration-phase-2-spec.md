# Stripe Integration Phase 2 — Integration & UI

## Overview

Phase 2 builds on the Phase 1 foundation (`lib/stripe/stripe.ts`, `lib/constants/limits.ts`, fixed JWT callback) to wire up the actual subscription flow: Stripe Checkout, Customer Portal, the webhook handler that flips `isPro` in the database, server-side feature-gate enforcement, and the billing UI in Settings.

This phase requires a Stripe account (test mode), the Stripe CLI for local webhook forwarding, and Dashboard configuration of products, prices, and a webhook endpoint.

---

## Goals

- A free user can click "Upgrade — Monthly" or "Upgrade — Annual" in Settings and complete checkout on Stripe-hosted pages.
- After successful checkout, a reload of `/settings` shows the Pro badge and "Manage subscription" button (no sign-out required).
- A Pro user can open the Stripe Customer Portal to cancel or update their subscription; cancellation reverts `isPro` to `false` via webhook.
- Free users are blocked at 50 items, 3 collections, and from uploading `file`/`image` types — enforced server-side.
- The item create dialog visually disables `file`/`image` for free users with a lock icon.
- `npm run test:run`, `npm run lint`, and `npm run build` stay green.

---

## Finding #5 — Create Stripe Webhook Handler

### Problem

Stripe sends subscription lifecycle events to a webhook endpoint. Without it, `isPro` never flips in the database after checkout, and cancellations don't downgrade users.

### Current Code

- No `app/api/stripe/` directory exists.
- `proxy.ts:31` matcher `/((?!api|_next/static|_next/image|favicon.ico).*)` already excludes `/api/*` from the auth redirect — good, webhooks carry no session and must not be bounced to `/sign-in`.
- No existing route reads a raw body with `request.text()`; the webhook will be the first.

### Requirements

1. **Create `app/api/stripe/webhook/route.ts`** exporting a `POST` handler.
2. **Read the raw body with `request.text()`** — **not** `request.json()`. Stripe signature verification requires the exact bytes.
3. **Verify the signature** with `stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)`:
   - Read the signature from the `stripe-signature` request header.
   - Return `400` if the header is missing.
   - Return `400` with the error message if `constructEvent` throws.
4. **Handle these event types**:
   - `checkout.session.completed` — set `isPro: true`, store `stripeSubscriptionId` and `stripeCustomerId` from the event.
   - `customer.subscription.updated` — set `isPro: true` if `status === 'active' || 'trialing'`, else `false`.
   - `customer.subscription.deleted` — set `isPro: false`, clear `stripeSubscriptionId`.
   - All other event types: no-op (do not error).
5. **Resolve the user ID** from `event.data.object.metadata.userId` or `client_reference_id` (Checkout sessions).
6. **Return `{ received: true }`** with `200` on success, `500` if the DB update throws.
7. **Do not call `auth()`** — webhooks are unauthenticated. The proxy matcher already excludes `/api/*`.

### Implementation Details

```typescript
// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/stripe';
import { prisma } from '@/lib/prisma/prisma';

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
        break;
    }
  } catch (err) {
    console.error('Stripe webhook handler failed:', err);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
```

### Testing Requirements (Stripe CLI required)

This route is **not unit-testable in isolation** because `stripe.webhooks.constructEvent` validates against the real Stripe signing scheme. Verification is manual:

- Run `stripe listen --forward-to localhost:3000/api/stripe/webhook` in a separate terminal.
- Use the `whsec_...` printed by the CLI as the local `STRIPE_WEBHOOK_SECRET`.
- Run `stripe trigger checkout.session.completed` and confirm the DB row for the test user flips to `isPro: true`.
- Run `stripe trigger customer.subscription.deleted` and confirm `isPro` reverts to `false`.

---

## Finding #6 — Create Checkout & Customer Portal API Routes

### Problem

Users need a way to start a Stripe Checkout session (upgrade) and open the Customer Portal (manage/cancel). Both redirect to Stripe-hosted pages, so the route just returns a URL for the client to navigate to.

### Current Code

- `app/api/upload/route.ts:14-18` is the existing route pattern to mirror: `auth()` → 401 if no session → `NextResponse.json(...)`.
- `actions/auth/Auth.ts:66` references `process.env.AUTH_URL` as a base URL fallback — reuse it for Checkout return URLs.

### Requirements

1. **Create `app/api/stripe/checkout/route.ts`** (`POST`):
   - Require auth; return `401` if no session.
   - Parse JSON body with Zod: `{ interval: 'monthly' | 'yearly' }`. Return `400` on invalid.
   - Map `interval` to `STRIPE_PRICE_IDS.monthly` or `.yearly`.
   - Find the user's `stripeCustomerId`; if missing, create a Stripe Customer with `metadata.userId` and persist the ID.
   - Create a `stripe.checkout.sessions.create` with `mode: 'subscription'`, the price as a single line item, `success_url` and `cancel_url` pointing to `/settings?checkout=success` and `/settings?checkout=cancelled`, and `client_reference_id: session.user.id`.
   - Return `{ url }` on success.
2. **Create `app/api/stripe/portal/route.ts`** (`POST`):
   - Require auth; return `401` if no session.
   - Load the user's `stripeCustomerId`; return `400` with `{ error: 'No subscription found' }` if absent.
   - Create a `stripe.billingPortal.sessions.create` with `return_url` pointing to `/settings`.
   - Return `{ url }` on success.
3. **Base URL resolution**: Use `process.env.APP_URL ?? process.env.AUTH_URL ?? 'http://localhost:3000'` for return URLs.

### Implementation Details

See `docs/stripe-integration-plan.md` §4.1.3 and §4.1.4 for full code listings. Key invariants:

- Never pass `process.env.STRIPE_SECRET_KEY` directly — always use the `stripe` singleton from `lib/stripe/stripe.ts`.
- Always set `metadata.userId` on the Customer and `client_reference_id` on the Checkout Session so the webhook can resolve the user even if the metadata chain breaks.
- The Checkout `success_url` includes a `?checkout=success` query param so the Settings page can show a confirmation toast (optional Phase 2 polish).

---

## Finding #7 — Create Stripe Server Actions

### Problem

Client components can't call API routes directly with a JSON body in a typed, error-handled way that matches the project's `ActionResult` convention. Server actions wrap the fetch and return the discriminated union.

### Current Code

- `actions/items/Items.ts:9-11` defines the `ActionResult<T>` pattern to mirror.
- `actions/items/Items.ts:13-19` defines the `requireAuth()` helper pattern.
- `actions/index.ts:1-10` is the barrel file that re-exports all actions.

### Requirements

1. **Create `actions/stripe/Stripe.ts`** (`'use server'`) exporting:
   - `createCheckoutAction(interval: 'monthly' | 'yearly'): Promise<ActionResult<{ url: string }>>`
   - `createPortalAction(): Promise<ActionResult<{ url: string }>>`
2. **Use the `ActionResult` discriminated union** — `{ success: true, data: { url }, error: null }` or `{ success: false, data: null, error: string }`.
3. **Check auth** with `auth()`; return `{ success: false, data: null, error: 'Unauthorized' }` if no session.
4. **Fetch the API route** (`/api/stripe/checkout`, `/api/stripe/portal`) and parse the JSON. On non-2xx, return the `error` field from the response.
5. **Export from `actions/index.ts`**: add `export { createCheckoutAction, createPortalAction } from './stripe/Stripe'`.

### Implementation Details

The server action internally `fetch`es the project's own API route. This is the established pattern when the route does external I/O that's easier to test in a route handler than in an action. Use `process.env.APP_URL ?? 'http://localhost:3000'` as the fetch base. See `docs/stripe-integration-plan.md` §4.1.6 for full code.

---

## Finding #8 — Enforce Free-Tier Limits in Server Actions

### Problem

`createItemAction` and `createCollectionAction` write to the database without checking how many items/collections the user already has. A free user can currently create unlimited items and collections.

### Current Code

- `actions/items/Items.ts:21-45` — `createItemAction` calls `createItem` immediately after Zod validation.
- `actions/collections/Collections.ts:20-44` — `createCollectionAction` calls `createCollection` immediately after Zod validation.
- `lib/db/items/items.ts:198-213` — `getItemStats` already counts items and collections.

### Requirements

1. **In `createItemAction`** (after auth, before `createItem`):
   - Read `isPro` from the database (not just the session, to avoid stale-JWT races right after a webhook fires).
   - If `!isPro`: call `getItemStats(userId)` and reject with a clear error if `totalItems >= FREE_TIER_LIMITS.maxItems`.
   - If `!isPro` and `result.data.itemType` is a Pro-only type (`isProOnlyItemType`): reject with a "Pro feature" error.
2. **In `createCollectionAction`** (after auth, before `createCollection`):
   - Read `isPro` from the database.
   - If `!isPro`: count collections with `prisma.collection.count({ where: { userId } })` and reject if `>= FREE_TIER_LIMITS.maxCollections`.
3. **Error messages** must mention the limit and the upgrade path, e.g.:
   - `"Free plan limited to 50 items. Upgrade to Pro for unlimited items."`
   - `"Free plan limited to 3 collections. Upgrade to Pro for unlimited collections."`
   - `"File and image items are a Pro feature."`
4. **Update existing tests** `actions/items/Items.test.ts` and `actions/collections/Collections.test.ts` to cover the limit-rejection paths.

### Implementation Details

```typescript
// inside createItemAction, after auth + Zod, before createItem:
const dbUser = await prisma.user.findUnique({
  where: { id: userId },
  select: { isPro: true },
});

if (!dbUser?.isPro) {
  if (isProOnlyItemType(result.data.itemType)) {
    return { success: false, data: null, error: 'File and image items are a Pro feature.' };
  }
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

> **Why read `isPro` from DB instead of `session.user.isPro`:** Immediately after a webhook flips `isPro`, the user's JWT may still be stale for the remainder of the current request. The DB is the source of truth. Since Phase 1 already adds a DB read in the JWT callback, the marginal cost is one extra `findUnique` on the create path only — acceptable.

---

## Finding #9 — Block File/Image Uploads for Free Users

### Problem

`app/api/upload/route.ts` only checks auth — any signed-in user can upload files, even on the free plan. This is the authoritative gate for file/image item types since the client-side `ItemTypeSelector` disable (Finding #11) is cosmetic.

### Current Code

`app/api/upload/route.ts:14-18`:

```typescript
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ...proceeds to upload to R2 with no isPro check
}
```

### Requirements

1. **After the auth check, before any upload logic**: load `isPro` from the database.
2. **If `!isPro`**: return `403` with `{ error: 'File and image uploads are a Pro feature. Upgrade to Pro to enable them.' }`.
3. **Do not gate `app/api/download/route.ts`**: existing file items should remain accessible even if a user downgrades (product policy — confirm with stakeholder before launch, but default to keeping downloads open).

### Implementation Details

```typescript
import { prisma } from '@/lib/prisma/prisma';

// after the existing auth check:
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

---

## Finding #10 — Build BillingSection Component & Wire Into Settings

### Problem

The Settings page has no billing UI. Free users have no upgrade path, and Pro users have no way to manage their subscription.

### Current Code

- `app/settings/page.tsx:10-58` — already loads `profileData.user.isPro` and wraps in `DashboardWrapper`.
- `components/settings/settingsPageClient/SettingsPageClient.tsx:30-83` — renders only `EditorPreferencesForm` and an "Account Actions" card.
- `components/profile/profilePageClient/ProfilePageClient.tsx:85-89` — there's already a `PRO` badge pattern to mirror.
- shadcn `Card`, `Button`, `Badge`, `Separator`, `Dialog` are all already in `components/ui/` — do **not** install new ones.

### Requirements

1. **Create `components/settings/billingSection/BillingSection.tsx`** (`'use client'`):
   - Accept a `planTier: 'free' | 'monthly' | 'yearly'` prop.
   - For `free`: show the current plan as "Free" and two buttons — "Upgrade — $8/mo" and "Upgrade — $72/yr" — that call `createCheckoutAction('monthly' | 'yearly')` and redirect via `window.location.href = data.url`.
   - For `monthly` / `yearly`: show "Pro (Monthly)" or "Pro (Annual)" with a badge and a single "Manage subscription" button that calls `createPortalAction()` and redirects.
   - Show loading states on the buttons while the action is in flight.
   - Show error toasts on failure (use `sonner`, already in `package.json:46`).
2. **Modify `app/settings/page.tsx`** to compute `planTier` server-side:
   - Add `stripeSubscriptionId: true` to the `select` in `loadProfileDataAsync` (`lib/db/user/user.ts:22-33`).
   - If `user.isPro && user.stripeSubscriptionId`: `stripe.subscriptions.retrieve(...)` → read `sub.items.data[0]?.price.id` → `priceIdToPlan(priceId) ?? 'free'`.
   - Otherwise `planTier = 'free'`.
   - Pass `planTier` as a prop to `SettingsPageClient`.
3. **Modify `components/settings/settingsPageClient/SettingsPageClient.tsx`**:
   - Add `planTier` to `SettingsPageClientProps`.
   - Render `<BillingSection planTier={planTier} />` at the **top** of the layout, above `EditorPreferencesForm`.
4. **Update `types/db.ts`** — add `stripeSubscriptionId: string | null` to `profileUserDataSchema` (line 382-390) so the typed `ProfileData` carries it.

### Implementation Details

- The settings page becomes the first place that imports `lib/stripe/stripe.ts` at request time. Ensure `STRIPE_SECRET_KEY` is set in `.env` for local dev, otherwise the page will throw at render.
- The Stripe `subscriptions.retrieve` call should be wrapped in try/catch — if Stripe is down or the sub was deleted out-of-band, fall back to `planTier = 'free'` and log the error.
- Do not create a new shadcn component for the billing card — compose `Card`/`CardHeader`/`CardContent`/`Button`/`Badge` directly, exactly as `SettingsPageClient` already does.

---

## Finding #11 — Cosmetic Pro Gate in ItemTypeSelector

### Problem

`ItemTypeSelector` shows all 7 item types to every user. Free users can click `file` or `image`, fill out the form, and only hit the error at submission time. The UI should make the gate visible upfront.

### Current Code

`components/items/itemCreateDialog/ItemTypeSelector.tsx:10-34` — maps over `ITEM_TYPES` and renders a button for each with no Pro distinction.

### Requirements

1. **Add an `isPro: boolean` prop** to `ItemTypeSelector`.
2. **For `file` and `image` types when `isPro === false`**:
   - Disable the button (`disabled` attribute).
   - Add a `Lock` icon (from `lucide-react`) next to the label.
   - Apply `opacity-50 cursor-not-allowed` classes.
   - Do not fire `onSelect` on click.
3. **Pass `isPro` down from `ItemCreateDialog`**, which should read it from the dashboard context / session.
4. **This is cosmetic only** — the server action (Finding #8) and upload route (Finding #9) are the real enforcement. Do not rely on the UI to prevent Pro-type creation.

### Implementation Details

```tsx
import { Lock } from 'lucide-react';
import { PRO_ONLY_ITEM_TYPES } from '@/lib/constants/limits';

// inside the map:
const locked = !isPro && (PRO_ONLY_ITEM_TYPES as readonly string[]).includes(type.value);
return (
  <button
    key={type.value}
    type='button'
    disabled={locked}
    onClick={() => !locked && onSelect(type.value)}
    className={cn(
      /* existing classes */,
      locked && 'opacity-50 cursor-not-allowed',
    )}
  >
    <Icon className='h-4 w-4' />
    {type.label}
    {locked && <Lock className='h-3 w-3 ml-1' />}
  </button>
);
```

---

## Files to Create

| File | Purpose | Requires Stripe CLI to test |
|------|---------|-----------------------------|
| `app/api/stripe/webhook/route.ts` | Webhook handler | Yes |
| `app/api/stripe/checkout/route.ts` | Create Checkout Session | Yes (end-to-end) |
| `app/api/stripe/portal/route.ts` | Create Customer Portal session | Yes (end-to-end) |
| `actions/stripe/Stripe.ts` | Server actions wrapping the routes | Yes (end-to-end) |
| `components/settings/billingSection/BillingSection.tsx` | Billing UI for Settings | Yes (end-to-end) |

## Files to Modify

| File | Change |
|------|--------|
| `actions/items/Items.ts` | Enforce 50-item limit + Pro-only type block in `createItemAction` |
| `actions/collections/Collections.ts` | Enforce 3-collection limit in `createCollectionAction` |
| `app/api/upload/route.ts` | Block uploads for free users with `403` |
| `actions/index.ts` | Export `createCheckoutAction`, `createPortalAction` |
| `app/settings/page.tsx` | Compute `planTier` from Stripe subscription, pass to client |
| `components/settings/settingsPageClient/SettingsPageClient.tsx` | Accept `planTier` prop, render `BillingSection` |
| `components/items/itemCreateDialog/ItemTypeSelector.tsx` | Add `isPro` prop, disable `file`/`image` with lock icon |
| `lib/db/user/user.ts` | Add `stripeSubscriptionId` to `loadProfileDataAsync` select |
| `types/db.ts` | Add `stripeSubscriptionId` to `profileUserDataSchema` |
| `actions/items/Items.test.ts` | Cover limit-rejection + Pro-type-rejection paths |
| `actions/collections/Collections.test.ts` | Cover collection limit-rejection path |
| `.env` (local) | Fill in `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_MONTHLY`, `STRIPE_PRICE_ID_YEARLY` |
| `.env.production` | Same keys with live values for production |

---

## Stripe Dashboard Setup (required before testing)

1. **Products & prices** (Dashboard → Products → Add product):
   - Product: **DevStash Pro**
   - Price 1: **$8.00 USD / month**, recurring monthly → copy `price_...` → `STRIPE_PRICE_ID_MONTHLY`
   - Price 2: **$72.00 USD / year**, recurring yearly → copy `price_...` → `STRIPE_PRICE_ID_YEARLY`
2. **Customer Portal** (Dashboard → Settings → Billing → Customer Portal):
   - Enable. Allow cancellation and payment method updates. Configure return URL to `https://<domain>/settings`.
3. **Webhook endpoint** (Dashboard → Developers → Webhooks → Add endpoint):
   - URL: `https://<domain>/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the `whsec_...` signing secret → production `STRIPE_WEBHOOK_SECRET`.
4. **Local webhook secret** (different from production):
   - Run `stripe listen --forward-to localhost:3000/api/stripe/webhook`
   - Use the printed `whsec_...` as local `STRIPE_WEBHOOK_SECRET`.
5. **Test cards** (test mode): `4242 4242 4242 4242` (success), `4000 0000 0000 0002` (declined).

---

## Testing Checklist

### Unit tests (Vitest, no Stripe CLI)

- [ ] `actions/items/Items.test.ts` — free user at 50 items → rejection error; Pro user → succeeds; free user creating `file` type → Pro-feature error
- [ ] `actions/collections/Collections.test.ts` — free user at 3 collections → rejection error; Pro user → succeeds
- [ ] `npm run test:run` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` passes

### Manual / end-to-end (Stripe CLI + test mode)

- [ ] `stripe listen --forward-to localhost:3000/api/stripe/webhook` returns 200 for `stripe trigger checkout.session.completed`
- [ ] Free user clicks "Upgrade — $8/mo" → Stripe Checkout loads → pay with `4242...` → redirected to `/settings?checkout=success` → reload → Pro badge appears in sidebar and profile
- [ ] Free user clicks "Upgrade — $72/yr" → same flow → Settings shows "Pro (Annual)"
- [ ] Pro user clicks "Manage subscription" → Customer Portal opens → cancel subscription → webhook `customer.subscription.deleted` fires → reload `/settings` → `isPro` reverts, upgrade buttons reappear
- [ ] Free user at 50 items → "New Item" returns the limit error toast
- [ ] Free user at 3 collections → "New Collection" returns the limit error toast
- [ ] Free user → `file`/`image` buttons in `ItemTypeSelector` are disabled with a lock icon
- [ ] Free user → `POST /api/upload` with a valid session returns `403` (verify via `curl` or devtools)
- [ ] Tamper with the webhook body (change a byte) → `400` response, no DB mutation
- [ ] Missing `stripe-signature` header → `400` response
- [ ] Webhook for an unhandled event type (e.g. `invoice.paid`) → `200`, no DB mutation, no error

## Acceptance Criteria

- [ ] End-to-end upgrade flow works in test mode with the Stripe CLI forwarding webhooks
- [ ] End-to-end cancellation flow reverts `isPro` without requiring the user to sign out
- [ ] All three free-tier gates (items, collections, uploads) are enforced server-side and covered by unit tests
- [ ] `BillingSection` renders the correct state for `free`, `monthly`, and `yearly` plan tiers
- [ ] `ItemTypeSelector` visually disables `file`/`image` for free users
- [ ] No new shadcn components installed — only existing `Card`/`Button`/`Badge` composed

---

## References

- `docs/stripe-integration-plan.md` — §4.1.3 (checkout), §4.1.4 (portal), §4.1.5 (webhook), §4.1.6 (server actions), §4.2.2-§4.2.7 (modifications), §4.3 (Dashboard setup), §4.4 (testing checklist)
- `context/features/stripe-integration-phase-1-spec.md` — **implement first**; provides `lib/stripe/stripe.ts`, `lib/constants/limits.ts`, and the JWT callback fix this phase depends on
- `app/api/upload/route.ts:14-18` — route handler pattern to mirror
- `actions/items/Items.ts:9-19` — `ActionResult` + `requireAuth` pattern to mirror
- `actions/index.ts:1-10` — barrel file to update
- `lib/db/items/items.ts:198-213` — `getItemStats` for item/collection counts
- `lib/db/user/user.ts:22-33` — `loadProfileDataAsync` select to extend
- `types/db.ts:382-390` — `profileUserDataSchema` to extend
- `components/settings/settingsPageClient/SettingsPageClient.tsx:30-83` — where `BillingSection` is inserted
- `components/profile/profilePageClient/ProfilePageClient.tsx:85-89` — existing `PRO` badge pattern
- `components/items/itemCreateDialog/ItemTypeSelector.tsx:10-34` — cosmetic gate target
- `proxy.ts:31` — matcher already excludes `/api/*` (no change needed)
- `context/coding-standards.md`
- `context/project-overview.md:526-547` — feature matrix

## Severity

**P0** — This phase delivers the actual monetization flow. Without it, DevStash has no subscription mechanism.

## Notes

- **Implement Phase 1 first.** This phase imports `lib/stripe/stripe.ts`, `lib/constants/limits.ts`, and relies on the fixed JWT callback. None of the routes/actions here will compile or behave correctly without the Phase 1 work.
- **Webhook handler is not unit-testable** in isolation — `stripe.webhooks.constructEvent` validates against Stripe's real signing scheme. The Stripe CLI is the only way to test it locally. Document this in the test file with a comment so future contributors don't try to mock it.
- **Checkout and Portal are Stripe-hosted pages.** We never render payment forms in-app, so `@stripe/stripe-js` / `@stripe/react-stripe-js` are **not** needed for this phase. Only add them if a future phase builds an embedded Elements form.
- **Server-side enforcement is mandatory.** The `ItemTypeSelector` disable (Finding #11) is cosmetic — a determined user can still POST to `/api/upload` or call `createItemAction` with `itemType: 'file'`. The upload route (Finding #9) and the item action (Finding #8) are the real gates.
- **Plan tier display** requires a live Stripe API call in `app/settings/page.tsx`. Wrap it in try/catch and fall back to `'free'` on any error — the settings page must never crash because Stripe is unavailable.
- **Local vs production webhook secrets differ.** The `stripe listen` CLI prints its own `whsec_...` that is unrelated to the dashboard endpoint's secret. Document this in `.env.example` if it isn't already clear.
