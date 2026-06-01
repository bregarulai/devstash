# Sign-In Form Hardening — Phase 3

**Target**: `app/(auth)/sign-in/page.tsx`
**Phase**: 3 of 3
**Status**: Draft
**Created**: 2026-05-31
**Priority**: P3

## Overview

Copy clarification and polish. These are minor UX improvements that reduce cognitive load and make the page feel more intentional rather than templated.

---

## 3.1: Clarify CardDescription Copy

**Problem**: `CardDescription` says "Use your email or GitHub account to sign in" but the form above only shows email fields. Creates slight expectation mismatch.

**Approach**: Change the copy to be neutral and match the visual layout.

**File**: `app/(auth)/sign-in/page.tsx`

**Current**:
```tsx
<CardDescription>
  Use your email or GitHub account to sign in
</CardDescription>
```

**Proposed**:
```tsx
<CardDescription>
  Sign in to your DevStash account
</CardDescription>
```

**Rationale**: This is neutral and doesn't imply a single path, while the two options (email form + GitHub button) are visually presented below. It avoids the "or GitHub" implication appearing before the user sees the GitHub button.

---

## 3.2: Verify SignInToast Mounting

**Problem**: The `SignInToast` component is mounted inside the page but its trigger conditions aren't visible from the source. Need to ensure it fires correctly for all auth states.

**Approach**: Review the mount position and ensure it's not gated by conditions that prevent it from firing.

**File**: `app/(auth)/sign-in/page.tsx`

**Current**:
```tsx
<div className='min-h-screen flex items-center justify-center bg-background px-4'>
  <SignInToast />
  <Card className='w-full max-w-md'>
    {/* ... */}
  </Card>
</div>
```

**Review checklist**:
- [ ] `SignInToast` is mounted unconditionally (not inside a conditional block)
- [ ] Toast does not fire on every page load (only on state change)
- [ ] Toast is rendered before the Card so it appears above the form
- [ ] No CSS conflicts between `SignInToast` and the card layout

**If changes needed**:
- Move `SignInToast` outside the flex container if it causes layout shifts
- Add a key prop to force remount on state change: `<SignInToast key={success || error} />`

---

## 3.3: Minor Polish

### 3.3.1: Remove Unused Metadata

**Problem**: The page imports `auth` from `@/lib/auth` but only uses it for the session check. The import is necessary but verify it's not over-fetching.

**File**: `app/(auth)/sign-in/page.tsx`

**Review**:
- [ ] `auth()` call is necessary (prevents signed-in users from seeing the sign-in page)
- [ ] `redirect('/dashboard')` is correct for authenticated users

### 3.3.2: Verify Dynamic Routing

**Problem**: `dynamic = 'force-dynamic'` is set but the page has no client-side data needs.

**File**: `app/(auth)/sign-in/page.tsx`

**Review**:
- [ ] `force-dynamic` is appropriate for auth pages (prevents caching of session state)
- [ ] No stale cache issues with the sign-in page

---

## Files Changed

| File | Action |
|------|--------|
| `app/(auth)/sign-in/page.tsx` | **Modified** — update CardDescription copy |
| `app/(auth)/sign-in/page.tsx` | **Review** — verify SignInToast mounting |
| `app/(auth)/sign-in/page.tsx` | **Review** — verify auth/dynamic settings |

## Implementation Order

1. Update `CardDescription` copy
2. Review `SignInToast` mount position and conditions
3. Verify `auth()` and `dynamic` settings are appropriate
4. Final visual review of the complete page

## Constraints

- Follow coding standards: shadcn components only
- Copy changes must be neutral and match the visual layout
- No new dependencies or components for this phase
- Dark mode first, light mode as option
