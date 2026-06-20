# API Routes Cleanup — Phase 1: Remove Unused Change Password Route

## Overview

Remove the redundant `/api/profile/change-password` API route that duplicates the existing `handleChangePassword` server action.

| Item | Detail |
|------|--------|
| Complexity | Low |
| Risk | Low |
| Files to delete | 2 |

> **IMPORTANT**: When implementing these fixes, you MUST NOT break any existing functionality or user flow. Always double-check your work by verifying that affected features still work as expected after each change.

---

## Problem

Two implementations exist for changing a user's password:

1. **Server Action** — `actions/auth/Auth.ts:93-141` — `handleChangePassword(data: ChangePasswordValues)`
2. **API Route** — `app/api/profile/change-password/route.ts:1-82` — `POST /api/profile/change-password`

Only the server action is actually used. `ChangePasswordForm.tsx` (line 13) imports from `@/actions` and calls `handleChangePassword` (line 37). The API route has zero consumers.

The API route is also less secure: it performs manual CSRF token validation (lines 34-39) while server actions have built-in CSRF protection via Next.js.

---

## Files to Delete

| File | Reason |
|------|--------|
| `app/api/profile/change-password/route.ts` | Unused — no consumers |
| `app/api/profile/change-password/route.test.ts` | Tests for the unused route |

---

## Verification

1. Run `npm run lint` — no lint errors
2. Run `npm run build` — build succeeds
3. Run `npm run test:run` — all existing tests pass
4. Manual check: Navigate to Settings > Change Password, submit the form, verify it works
