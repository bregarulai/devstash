# Profile Page — Phase 2: Error Handling

## Target

`app/profile/page.tsx`

## Source

Impeccable critique — `context/features/profile-page-improvements-spec.md`

## Issues

### 1. Vague Error Message

**Severity**: P4

**Problem**: `"Unable to load profile. Please try again."` is vague with no recovery path. Users don't know what failed or what to do.

**Fix**: Distinguish between "account not found" (404-style) and "temporary failure" (retry button). Use plain language.

**Changes**:
- `page.tsx`: Refactor the `!user` error branch (lines 24-32):
  - If `profileData.user` is null → `"We couldn't find your profile. If this persists, contact support."`
  - If the `try/catch` block fails → show a retry button alongside `"Something went wrong loading your profile. [Retry]"`
- Extract the `Promise.all` fetch into a named async function (e.g., `loadProfileDataAsync`) so it can be retried
- For the retry path, since this is a server component, the retry button will be a client component that re-fetches via a Server Action or client-side API call

## Notes

- Server component only. No new client components unless retry requires one.
- Retry mechanism may need a small client-side fetch helper — keep it minimal.
- Do not add loading states (covered in Phase 3).
