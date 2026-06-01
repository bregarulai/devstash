# Sign-In Form Hardening — Phase 2

**Target**: `app/(auth)/sign-in/page.tsx`
**Phase**: 2 of 3
**Status**: Draft
**Created**: 2026-05-31
**Priority**: P2

## Overview

Client-side validation feedback and toast integration review. These issues reduce friction for users and ensure the existing `SignInToast` component fires correctly for all auth states.

---

## 2.1: Client-Side Validation Feedback

**Problem**: Users only learn about invalid input after full form submission. Inline validation reduces friction and prevents unnecessary round-trips.

**Approach**: Add HTML5 validation attributes at minimum. Consider Zod-based validation later if needed.

**File**: `app/(auth)/sign-in/sign-in-form.tsx`

**Implementation**:
```tsx
<Input
  id="email"
  name="email"
  type="email"
  required
  placeholder="you@example.com"
  className="h-10"
  autocomplete="username"
  title="Enter a valid email address"
/>

<Input
  id="password"
  name="password"
  type={showPassword ? 'text' : 'password'}
  required
  placeholder="••••••••"
  className="h-10 pr-10"
  autocomplete="current-password"
  minLength={8}
  maxLength={128}
  title="Password must be at least 8 characters"
/>
```

**Constraints**:
- `minLength={8}` prevents short passwords
- `maxLength={128}` matches typical auth limits
- `title` attributes provide browser tooltip on validation failure
- HTML5 `type="email"` already handles basic email format

---

## 2.2: Unverified Email Toast Integration

**Problem**: The `SignInToast` component is mounted but its trigger conditions aren't visible from the source. The unverified email flow needs toast confirmation after resend.

**Approach**: Review `SignInToast` to ensure it fires for verification resend. Add toast confirmation if missing.

**File**: `components/auth/signInToast/SignInToast.tsx` (review only)

**Review checklist**:
- [ ] Toast fires after successful verification resend via `handleResendVerification`
- [ ] Toast message is specific ("Verification email sent" vs generic)
- [ ] Toast does NOT fire on every page load (only on state change)
- [ ] Toast dismisses after timeout or manual close

**If changes needed**:
```tsx
// Add toast trigger after resend action
handleResendVerification(email).then(() => {
  toast({
    title: 'Verification email sent',
    description: 'Check your inbox for the verification link.',
  });
});
```

**Note**: This phase is primarily a review. If `SignInToast` already handles these cases correctly, no changes needed.

---

## 2.3: Success Feedback

**Problem**: The `success` search param is typed in `searchParams` but never acted upon — no toast, no inline message.

**Approach**: Wire `success` param to trigger `SignInToast` (if not already) and verify the toast message is clear.

**File**: `app/(auth)/sign-in/page.tsx` (verify trigger)

**Review checklist**:
- [ ] `success` param triggers a visible toast
- [ ] Toast message is specific ("Signed in successfully" vs generic)
- [ ] Toast does not conflict with other toast triggers
- [ ] Toast fires only once (not on every re-render)

**If changes needed**:
```tsx
// In page.tsx, pass success state to SignInToast
<SignInToast success={success} />

// Or in SignInToast component:
const { success } = await searchParams;
if (success) {
  toast({
    title: 'Signed in successfully',
    description: 'Welcome back to DevStash.',
  });
}
```

---

## Files Changed

| File | Action |
|------|--------|
| `app/(auth)/sign-in/sign-in-form.tsx` | **Modified** — add validation attributes |
| `components/auth/signInToast/SignInToast.tsx` | **Review** — verify toast triggers |
| `app/(auth)/sign-in/page.tsx` | **Review** — verify success param handling |

## Implementation Order

1. Add validation attributes to `sign-in-form.tsx`
2. Review `SignInToast.tsx` — verify all trigger conditions
3. Review `page.tsx` — verify `success` param handling
4. Test validation (try submitting empty form, short password, invalid email)
5. Test toast triggers (verify email resend, success state)

## Constraints

- Follow coding standards: shadcn components only, Zod validation where applicable
- HTML5 validation attributes are sufficient for this phase (no Zod yet)
- Toast messages must be specific and user-friendly
- Dark mode first, light mode as option
