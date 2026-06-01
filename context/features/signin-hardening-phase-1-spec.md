# Sign-In Form Hardening — Phase 1

**Target**: `app/(auth)/sign-in/page.tsx`
**Phase**: 1 of 3
**Status**: Draft
**Created**: 2026-05-31
**Priority**: P1

## Overview

Core form hardening: loading states, password visibility toggle, and autocomplete attributes. These are blocking issues that prevent double-submission and hurt power users who rely on password managers.

---

## 1.1: Extract Form into Client Component

**Problem**: The current page is a pure server component with no interactivity on the form.

**Approach**: Create a `SignInForm` client component that wraps the email/password form and handles interactivity.

**File**: `app/(auth)/sign-in/sign-in-form.tsx` (new)

**Implementation**:
```tsx
'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { handleSignIn } from '@/actions/sign-in';

export function SignInForm() {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={async (formData: FormData) => {
        startTransition(async () => {
          await handleSignIn(formData);
        });
      }}
    >
      {/* ... form fields ... */}
    </form>
  );
}
```

**Constraints**:
- Do NOT remove `handleSignIn` Server Action — wrap it with `useTransition`
- Button text changes to indicate state ("Signing in...")
- `disabled={isPending}` prevents double-submission

---

## 1.2: Form Loading State

**Problem**: Users click "Sign in" and get no feedback until the server responds.

**Approach**: Use `useTransition` to track pending state. Update button text and disable it during submission.

**File**: `app/(auth)/sign-in/sign-in-form.tsx`

**Implementation**:
```tsx
<Button type="submit" disabled={isPending} className="w-full h-10">
  {isPending ? 'Signing in...' : 'Sign in with email'}
</Button>
```

---

## 1.3: Password Visibility Toggle

**Problem**: Users typing passwords on mobile or in public need to verify what they entered.

**Approach**: Add a show/hide password button inside the password input field using a wrapper div with absolute positioning.

**File**: `app/(auth)/sign-in/sign-in-form.tsx`

**Implementation**:
```tsx
function PasswordInput() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2 relative">
      <Label htmlFor="password" className="text-sm font-medium">
        Password
      </Label>
      <div className="relative">
        <Input
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          required
          placeholder="••••••••"
          className="h-10 pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          aria-pressed={showPassword}
        >
          {showPassword ? (
            <svg /* eye-off icon */ />
          ) : (
            <svg /* eye icon */ />
          )}
          <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
        </Button>
      </div>
    </div>
  );
}
```

**Accessibility**:
- `aria-label` toggles based on state
- `aria-pressed` indicates current toggle state
- `sr-only` span for screen readers
- Button is focusable and keyboard-operable

---

## 1.4: Autocomplete Attributes

**Problem**: Password managers and browsers can't auto-fill without `autocomplete="username"` and `autocomplete="current-password"`.

**Approach**: Add standard autocomplete attributes to both inputs.

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
/>

<Input
  id="password"
  name="password"
  type={showPassword ? 'text' : 'password'}
  required
  placeholder="••••••••"
  className="h-10 pr-10"
  autocomplete="current-password"
/>
```

---

## Files Changed

| File | Action |
|------|--------|
| `app/(auth)/sign-in/sign-in-form.tsx` | **New** — client component |
| `app/(auth)/sign-in/page.tsx` | **Modified** — import and render `SignInForm` |

## Implementation Order

1. Create `sign-in-form.tsx` with all 4 changes
2. Update `page.tsx` to import and render `SignInForm`
3. Verify loading state works (test with slow connection)
4. Verify password toggle works (test show/hide)
5. Verify autocomplete attributes are recognized by browser

## Constraints

- Follow coding standards: shadcn components only, Server Actions preserved
- Password toggle uses inline SVG (no new icon dependency)
- All new components follow `components/[feature]/[ComponentName]/ComponentName.tsx` structure
- Use `cn()` from `lib/utils.ts` for conditional class merging
- Dark mode first, light mode as option
