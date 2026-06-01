# Feature: Register Page Hardening

## Status
**Phase:** Ready to implement
**Priority:** P0/P1 — Blocks user activation

## Overview
The register page is a bare-bones form with zero feedback mechanisms. Users clicking "Create account" get no loading state, no validation, no autofill support, and no password guidance. For a product claiming "speed-first interface," this is ironic and causes abandonment.

## Critique Findings

### Design Health Score: 19/40 — Poor

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | No loading/pending state on form submit |
| 2 | Match System / Real World | 3 | Standard registration pattern; appropriate terminology |
| 3 | User Control and Freedom | 2 | No cancel option once form is engaged |
| 4 | Consistency and Standards | 2 | Button uses `h-10` (40px) — design system specifies 32px |
| 5 | Error Prevention | 1 | No client-side password confirmation, no password strength guidance |
| 6 | Recognition Rather Than Recall | 3 | Labels clear; placeholder "Brett Trend" is oddly specific |
| 7 | Flexibility and Efficiency | 1 | No `autocomplete` on any field — kills password managers |
| 8 | Aesthetic and Minimalist Design | 3 | Clean, restrained layout; fits Linear/Raycast aesthetic |
| 9 | Error Recovery | 2 | Server errors via toast only; form values not preserved on error |
| 10 | Help and Documentation | 1 | No password requirements listed |

### Priority Issues

**[P0] No `autocomplete` attributes** — Developers use password managers. Without `autocomplete="name"`, `autocomplete="email"`, and `autocomplete="new-password"`, the form breaks autofill and forces manual typing.

**[P0] No loading state on form submit** — Server actions are async. Users clicking "Create account" and getting nothing back for 500ms-2s will click again, refresh, or assume it broke.

**[P1] No client-side password confirmation** — The form has a "Confirm Password" field but no way to tell the user if passwords match until after a full server round-trip.

**[P1] No password requirements displayed** — New users have no idea what's expected. They'll guess, get an error, guess again.

**[P2] Button height violates design system** — Design system specifies 32px button height. This button is `h-10` (40px).

### Persona Red Flags

- **Alex (Power User):** No `autocomplete` = password manager won't work. Forces 8 manual keystrokes per field.
- **Jordan (First-Timer):** No password requirements visible. Will type a password, click submit, get an error toast, and wonder what went wrong.
- **Sam (Accessibility-Dependent User):** Confirm password field has no visual indicator of match state. No ARIA live region for validation errors.

### Minor Observations

- `RegisterToast` is nested inside the flex container but renders `null`. Should sit at page root level.
- `dynamic = 'force-dynamic'` on a static registration page is unnecessary.
- Placeholder "Brett Trend" is oddly specific. Use generic placeholder or none at all.
- Sign-in link hover color shifts to `muted-foreground` — counter-intuitive, makes link *less* visible on hover.

## Reference Implementation

The sign-in page (`app/(auth)/sign-in/page.tsx`) uses a client component wrapper (`SignInForm`) with:
- `react-hook-form` + `@hookform/resolvers/zod` for form state and validation
- `useTransition` for loading state
- `Field`, `FieldLabel`, `FieldError`, `FieldContent` from `@/components/ui/field` for structured form fields
- Zod schema in `types/signIn.ts` for type-safe validation
- `aria-invalid` for accessibility
- `autoComplete` attributes for password managers

## Implementation Plan

### 1. Create Zod Schema
**File:** `types/register.ts`
- Schema with fields: `name`, `email`, `password`, `confirmPassword`
- Password: `z.string().min(8, "Password must be at least 8 characters")`
- Confirm password: cross-field validation with `.refine()` checking `password === confirmPassword`
- Email: `z.email()`
- Export `RegisterFormData` type via `z.infer`

### 2. Create Client Form Component
**File:** `components/registerForm/RegisterForm.tsx`
- `'use client'` component
- Props: `defaultValues?: { name?: string; email?: string }` (for pre-filled values on validation error redirect)
- `useForm<RegisterFormData>` with `zodResolver(registerSchema)`, `mode: 'onChange'`
- `useTransition` for submit loading state
- Render `<form onSubmit={handleSubmit(onSubmit)}>` with:
  - `Field` wrapper for each input using `@/components/ui/field` components
  - `Input` with proper `autocomplete` attributes: `name`, `email`, `new-password`, `new-password`
  - `aria-invalid` tied to `formState.errors`
  - `FieldError` below each field when `errors.fieldName` exists
  - Password field with show/hide toggle (Eye/EyeOff from lucide-react)
  - Password requirements list below password field (2-3 items max, minimal)
  - Password confirmation with live match/mismatch indicator
  - Submit button: `disabled={isPending}` with loading text "Creating account..."
- Form submission: build `FormData`, call `handleRegister` action via `startTransition`

### 3. Update Register Page
**File:** `app/(auth)/register/page.tsx`
- Convert to async server component
- Accept `searchParams: Promise<{ error?: string; success?: string }>`
- Read searchParams with `await`
- Pass pre-filled values to `RegisterForm` on error redirect
- Move `RegisterToast` to page root level (outside flex container)
- Remove `dynamic = 'force-dynamic'` (static page)
- Replace inline form with `<RegisterForm />` component
- Fix sign-in link hover color: change `hover:text-muted-foreground` to `hover:text-foreground`
- Update sign-in link text: "Sign in" → "Sign in" (keep as-is, it's fine)

### 4. Remove Inline Button Height Override
- Remove `h-10` from all Button components in both register and sign-in pages
- Let shadcn buttons use default 32px height per design system

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `types/register.ts` | **Create** | Zod schema + RegisterFormData type |
| `components/registerForm/RegisterForm.tsx` | **Create** | Client-side form with react-hook-form + zod |
| `app/(auth)/register/page.tsx` | **Modify** | Wrap in RegisterForm, fix accessibility, remove force-dynamic |

## Design System Compliance

- Use `Field`, `FieldLabel`, `FieldError`, `FieldContent` from `@/components/ui/field` (same as SignInForm)
- Use `Input` from `@/components/ui/input` — no custom height override
- Use `Button` from `@/components/ui/button` — default 32px height
- Use `Eye`, `EyeOff` from `lucide-react` for password visibility toggle
- Use Geist font family (default, no override needed)
- Maintain dark-first aesthetic — no decorative elements
- All colors from CSS variables via Tailwind utility classes
- Flat surfaces, no shadows, ring-based focus states

## Acceptance Criteria

- [ ] Form validates on change (`mode: 'onChange'`)
- [ ] Password confirmation shows live match/mismatch feedback
- [ ] Password requirements visible below password field
- [ ] Submit button disabled during loading with "Creating account..." text
- [ ] All fields have correct `autocomplete` attributes
- [ ] `aria-invalid` present on all fields with errors
- [ ] Error messages displayed inline below each field via `FieldError`
- [ ] `RegisterToast` positioned at page root level
- [ ] `dynamic = 'force-dynamic'` removed
- [ ] Sign-in link hover color fixed (increases, not decreases, visibility)
- [ ] Button uses default shadcn height (32px)
- [ ] Form preserves pre-filled values on validation error redirect
- [ ] TypeScript types exported and imported correctly
- [ ] No `h-10` height overrides on any component

## Questions to Consider

- Should password requirements update dynamically as the user types (checkmarks for each requirement met)?
- Should the confirm password field show a green checkmark or red X in real-time?
- Is the toast-only error model sufficient for server-side errors, or should errors also appear inline?
