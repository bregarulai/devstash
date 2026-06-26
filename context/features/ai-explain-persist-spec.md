# Persisted AI Code Explanations

## Overview

Persist AI-generated code explanations so Pro users see them instantly on repeat visits instead of regenerating on every click. Reduces per-user API spend, improves perceived performance, and aligns the explanation with the persistent "stash" model. Recommended hybrid: lazy-persist on first generation, invalidate on content change, keep an explicit "Regenerate" affordance.

## Motivation

- **UX**: Repeat visits currently trigger a multi-second spinner each time. Cached explanations render instantly, eliminating friction for frequently revisited snippets/commands.
- **Business / cost**: Each click burns API tokens. A cache turns N generations per item into ~1, materially improving margins on the Pro tier.
- **Product fit**: DevStash's premise is a persistent stash. Caching the explanation with the stash aligns the AI layer with the core model.

## Requirements

- **Lazy persistence**: On first `explainCode` generation for an item, store the resulting markdown. Subsequent opens of that item show the cached explanation in the Explain tab immediately (no spinner).
- **Schema**: Add persistence columns to the `Item` model (preferred over a junction table, since each item has at most one current explanation):
  - `explanation` — `String?` (markdown, nullable, default null)
  - `explanationUpdatedAt` — `DateTime?` (nullable, default null)
  - `explanationModel` — `String?` (nullable) — model/version used to generate, for future staleness detection / "regenerate all"
- **Cache invalidation**: Clear `explanation` / `explanationUpdatedAt` / `explanationModel` whenever the item's `content` or `language` changes. This invalidation must happen inside `updateItemAction` (and the PATCH endpoint if it remains the source of truth) so stale answers never render.
- **Regenerate affordance**: Keep an explicit "Regenerate" control (Sparkles icon) in the Explain tab for Pro users. Regeneration overwrites the stored explanation, updates `explanationUpdatedAt`, and still applies rate limiting.
- **Pro gating preserved**: Free users keep the Crown icon + tooltip ("AI features require Pro subscription"). Persistence only applies once a Pro user generates; free users never see a cached explanation.
- **Item drawer integration**: If a persisted explanation exists, default the drawer view to allow toggling to "Explain" without any generation step. If no explanation exists, keep current behavior (Explain button generates + persists).
- **Create/edit forms**: Explanations are never generated or shown in create/edit forms — unchanged from current behavior.
- **Delete cascade**: Explanations are stored on the `Item` row, so the existing delete-account → item cascade already covers data deletion on account removal. No new cascade needed.
- **No persistence for tags/description**: This spec covers code explanations only. The existing ephemeral AI auto-tagging and description generation remain stateless.

## Non-functional / Future

- **Storage cost**: Small markdown blob per item — negligible relative to per-call API cost savings.
- **Model update staleness**: Store `explanationModel` alongside text. A later "regenerate all" feature can find items whose model differs from the current `AI_MODEL` and offer to refresh them in bulk.
- **Export/share**: Persisted explanations unlock future "export item with explanation" and "share with explanation" features.

## Out of Scope

- Batch/backfill generation across existing items
- Editing explanations by hand
- Persisting AI tags or descriptions
- Shared/versioned explanations across item forks

## Implementation Plan

1. **Migration**: Add `explanation`, `explanationUpdatedAt`, `explanationModel` columns to `Item`. Update `itemWithDetailsSchema` and related Zod schemas in `types/db.ts`.
2. **Server action**: Extend `explainCode` to upsert the result into the Item row on success; return cached value when present and not stale. Add `getItemExplanation` helper in `lib/db/items.ts` if read paths need it.
3. **Invalidation**: In `updateItemAction`, null the three columns whenever `content` or `language` is part of the update payload.
4. **UI**: In `CodeEditor`, when `enableExplain` and a persisted explanation is present, show the Explain tab immediately and offer "Regenerate" instead of "Explain".
5. **Tests**: Unit tests for persistence (upsert on generate, return cached on repeat, invalidate on content/language change). Migration test not required (Vitest scope is actions + lib).
6. **Review**: Verify lint, build, and `npm run test:run` pass.

## Risk Assessment

- **Stale answers**: Mitigated by content/language invalidation + Regenerate button. Low residual risk.
- **Privacy / data residency**: Persisted output becomes user data, but it travels with the item and is covered by existing delete-account cascade. Low lift.
- **Schema complexity**: One extra column set on a high-volume table. Acceptable given the cost savings and future feature unlocks.