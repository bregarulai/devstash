Last audited: 2026-06-19

# DevStash Authentication Security Audit

## Scope

Full audit of authentication, authorization, and session management across the DevStash codebase, including:
- All API routes (`app/api/**/route.ts`)
- Server actions (`actions/`)
- Auth library configuration (`lib/auth/`)
- Database queries and input validation
- Proxy/middleware configuration

---

## Passed Checks

These areas were reviewed and found to be correctly implemented:

### Password Hashing
- **bcrypt with cost factor 12** used consistently across all password hashing (register, reset password, change password, seed). Cost 12 is the OWASP-recommended default for 2026 production servers, yielding ~250ms per hash on modern hardware. Verified in:
  - `actions/auth/Auth.ts:50` — `bcrypt.hash(password, 12)`
  - `actions/resetPassword/ResetPassword.ts:56` — `bcrypt.hash(password, 12)`
  - `app/api/profile/change-password/route.ts:44` — `bcrypt.hash(newPassword, 12)`
  - `prisma/seed.ts:439` — `bcrypt.hash(demoUser.password, 12)`
- **bcrypt.compare** used for all password verification (no plaintext comparison).
- No plaintext passwords logged, stored, or returned in API responses.

### Verification Token Security
- **256-bit entropy** via `crypto.randomBytes(32)` (sufficient for token security).
- **SHA-256 hashed before storage** — raw token never stored in database (`lib/auth/verificationToken/verificationToken.ts:7`).
- **24-hour expiry** configured via `TOKEN_EXPIRY_MS` constant.
- **Single-use enforcement** — tokens deleted after verification (`verificationToken.ts:45-52`) and after expiry (`verificationToken.ts:34-42`).

### Input Validation
- **Zod schemas** applied to all server inputs before processing:
  - `signInSchema` on sign-in
  - `registerSchema` on registration
  - `changePasswordSchema` on password change
  - `forgotPasswordSchema` on forgot password
  - `resetPasswordSchema` on reset password
  - `itemCreateSchema` / `itemEditSchema` / `itemUpdateSchema` on item operations
  - `deleteAccountSchema` on account deletion
  - `verifyTokenSchema` on email verification

### SQL Injection Prevention
- **Prisma ORM** used exclusively — all database queries use parameterized queries.
- No raw SQL queries (`$queryRaw` / `$executeRaw`) found anywhere in the codebase.

### XSS Prevention
- **React rendering** used throughout — no `dangerouslySetInnerHTML` or `innerHTML` found.
- **No `eval()` or `Function()` calls** found.

### Session Management
- **NextAuth v5** handles JWT session strategy, cookie security flags, CSRF protection, and OAuth state/nonce parameters automatically.
- **Prisma adapter** configured for NextAuth for database-backed session management.

### Proxy / Auth Gate
- **`proxy.ts`** correctly configured as Next.js 16's middleware replacement at project root.
- Unauthenticated users redirected to `/sign-in` before reaching protected pages (dashboard, profile, items).
- **All API routes** that handle user data independently verify `auth()` session — not relying solely on proxy.

### API Route Auth Checks
- `app/api/upload/route.ts` — `auth()` check ✓
- `app/api/download/route.ts` — `auth()` check + ownership verification ✓
- `app/api/items/[id]/route.ts` — `auth()` check + `userId` scoping on all queries ✓
- `app/api/profile/change-password/route.ts` — `auth()` check ✓
- `app/api/profile/delete-account/route.ts` — `auth()` check + CSRF token validation ✓
- `app/api/auth/verify/route.ts` — Public endpoint (email verification) with rate limiting ✓

### Data Ownership Enforcement
- All item queries filter by `userId` from session, preventing cross-user data access.
- Download route verifies key contains user's ID path and that an item record exists for the user.
- Account deletion requires password verification against the authenticated user's stored hash.

### Error Handling
- Generic error messages returned to clients (e.g., "Invalid email or password" rather than "User not found").
- Database errors caught and generic messages returned — no stack traces leaked to clients.

---

## Findings

### 🟡 HIGH: Email Enumeration on Registration

- **File:** `actions/auth/Auth.ts:46-48`
- **Code:**
  ```typescript
  if (existingUser) {
    redirect("/register?error=User+with+this+email+already+exists")
  }
  ```
- **Issue:** The registration endpoint returns a distinct, specific error message when an email is already registered. This allows an attacker to enumerate valid email addresses by attempting registration with each one.
- **Impact:** An attacker can build a list of registered email addresses, which can be used for targeted phishing, credential stuffing, or social engineering.
- **Fix:** Use a generic success message regardless of whether the email exists:
  ```typescript
  // After registration (or if user exists), always show the same message
  revalidatePath("/register")
  redirect("/verify-email?success=registered&email=" + encodeURIComponent(email))
  ```
  If the email already exists and the account is already verified, silently succeed. If unverified, resend the verification email. Never reveal whether an email is registered.

---

### 🟡 HIGH: Missing Rate Limiting on `change-password` API Route

- **File:** `app/api/profile/change-password/route.ts` (entire file)
- **Issue:** The API route handler for changing passwords has no rate limiting. While the server action version (`actions/auth/Auth.ts:127-174`) includes rate limiting via Upstash Redis, the direct API route does not. An attacker can call this endpoint directly to brute-force the current password without any rate-limit protection.
- **Impact:** An attacker with a valid session (e.g., from a stolen session cookie) can attempt unlimited password guesses against the current password.
- **Fix:** Add rate limiting to the API route, matching the configuration used in the server action:
  ```typescript
  import { createRateLimiter, checkRateLimit, RATE_LIMIT_CONFIGS, getClientIP } from "@/lib/auth/rateLimit/rateLimit";

  // After auth check, before password processing:
  const ip = getClientIP(request.headers);
  const rateLimiter = createRateLimiter(RATE_LIMIT_CONFIGS.changePassword);
  const rateKey = `changepwd:${ip}:${session.user.id}`;
  const rateResult = await checkRateLimit(rateLimiter, rateKey, RATE_LIMIT_CONFIGS.changePassword, true);

  if (!rateResult.success) {
    const retryAfter = rateResult.retryAfter || 900;
    return NextResponse.json(
      { error: `Too many attempts. Please try again in ${Math.ceil(retryAfter / 60)} minutes` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }
  ```

---

### 🟡 MEDIUM: Forgot Password Timing Side-Channel

- **File:** `actions/forgotPassword/ForgotPassword.ts:46-55`
- **Code:**
  ```typescript
  // Line 48: Always create a dummy token
  await createVerificationToken(email).catch(() => {})

  if (!user) {
    revalidatePath("/forgot-password")
    redirect("/forgot-password?success=...")  // Returns after 1 DB write + 1 DB read
  }

  // Line 55: Create another real token for existing users
  const token = await createVerificationToken(email)  // Additional DB write
  ```
- **Issue:** The code attempts to prevent timing-based enumeration by creating a "dummy" token for non-existent users, but then creates a *second* token for existing users. This means existing users trigger 2 database writes + 1 read, while non-existent users trigger 1 write + 1 read. The additional write operation creates a measurable timing difference.
- **Impact:** A sophisticated attacker can distinguish between existing and non-existent emails by measuring response times with enough samples.
- **Fix:** Make the code paths identical for both cases. Either always create the real token (and don't send the email if the user doesn't exist), or restructure the logic so both paths perform the same operations:
  ```typescript
  const token = await createVerificationToken(email);
  
  if (!user) {
    revalidatePath("/forgot-password");
    redirect("/forgot-password?success=...");
  }
  
  // Send email only for existing users
  const resetLink = `${process.env.AUTH_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  await resend.emails.send({ ... });
  ```

---

### 🟡 MEDIUM: Resend Verification Timing Side-Channel

- **File:** `actions/resendVerification/ResendVerification.ts:30-41`
- **Code:**
  ```typescript
  // Line 31: Always create a dummy token
  await createVerificationToken(email).catch(() => {})

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.emailVerified) {
    redirect("/sign-in?success=resent")  // Returns after 1 DB write + 1 DB read
  }

  // Line 41: Create another token for existing unverified users
  const token = await createVerificationToken(email)  // Additional DB write
  ```
- **Issue:** Same pattern as the forgot password flow — existing unverified users trigger an additional database write compared to non-existent users, creating a timing difference.
- **Fix:** Same approach — restructure so both code paths perform identical database operations.

---

### 🟡 MEDIUM: Password Reset Token Not Invalidated for All Tokens

- **File:** `lib/auth/verificationToken/verificationToken.ts:45-52`
- **Code:**
  ```typescript
  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: existingToken.identifier,
        token: hashedToken,
      },
    },
  });
  ```
- **Issue:** When a password reset token is used, only that specific token is deleted. If an attacker intercepted multiple reset links (or if a user requested multiple resets), previous unused tokens remain valid until they expire. An old token could be used to reset the password even after a newer reset was completed.
- **Fix:** After successful verification, delete ALL tokens for the same identifier (email):
  ```typescript
  await prisma.verificationToken.deleteMany({
    where: {
      identifier: existingToken.identifier,
    },
  });
  ```

---

### 🟡 MEDIUM: `changePasswordSchema` Missing Password Complexity Requirements

- **File:** `types/db.ts:40-49`
- **Code:**
  ```typescript
  export const changePasswordSchema = z
    .object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: z.string().min(8, 'Password must be at least 8 characters'),
      confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, { ... });
  ```
- **Issue:** The `newPassword` field only validates minimum length (8 characters). The `passwordRequirements` constant in the same file defines that passwords should also contain uppercase letters, lowercase letters, and numbers, but these are not enforced in the schema. A user can change their password to `aaaaaaaa` which passes validation.
- **Note:** The `registerSchema` has the same limitation — only `min(8)` is enforced. The `passwordRequirements` array appears to be used only for client-side UI hints.
- **Fix:** Add password complexity validation to the Zod schemas:
  ```typescript
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/\d/, 'Password must contain a number'),
  ```

---

### 🟢 LOW: Dashboard Page Shows "Not Signed In" Instead of Redirecting

- **File:** `app/dashboard/page.tsx:24-26`
- **Code:**
  ```typescript
  if (!session?.user?.id) {
    return <div className="min-h-screen flex items-center justify-center">Not signed in</div>;
  }
  ```
- **Issue:** The dashboard page renders a static "Not signed in" message instead of redirecting to `/sign-in` like other protected pages (`app/profile/page.tsx:14-16` uses `redirect('/sign-in')`). While the proxy handles unauthenticated requests before they reach this page, the secondary auth check is inconsistent with the rest of the codebase.
- **Fix:** Replace with a redirect for consistency:
  ```typescript
  if (!session?.user?.id) {
    redirect('/sign-in');
  }
  ```

---

### 🟢 LOW: Rate Limiter Fails Open When Upstash Is Unavailable

- **File:** `lib/auth/rateLimit/rateLimit.ts:21-31`
- **Code:**
  ```typescript
  if (!url || !token) {
    // Fail open: no rate limiting if credentials are not configured
    return {
      limit: async () => ({
        success: true,
        remaining: config.limit,
        ...
      }),
    };
  }
  ```
- **Issue:** When Upstash Redis credentials are not configured or the service is unavailable, the rate limiter silently allows all requests through. While critical endpoints use `failClosed=true`, the default behavior is fail-open. If Upstash experiences an outage in production, rate limiting is completely disabled.
- **Note:** The `checkRateLimit` function does support `failClosed` parameter for critical endpoints, and it's used correctly for sign-in, register, forgot-password, and reset-password. However, the `resendVerification`, `emailVerify`, `githubOAuth`, and `deleteAccount` endpoints do NOT use `failClosed=true`.
- **Fix:** Consider adding `failClosed=true` for `resendVerification`, `deleteAccount`, and `githubOAuth` rate limit checks as well, or add a health check / alerting for when Upstash is unreachable.

---

## Summary

| Severity | Count | Description |
|----------|-------|-------------|
| 🔴 Critical | 0 | None |
| 🟡 High | 2 | Email enumeration on registration; missing rate limiting on change-password API route |
| 🟡 Medium | 4 | Forgot password timing leak; resend verification timing leak; stale tokens not invalidated; weak password complexity validation |
| 🟢 Low | 2 | Dashboard redirect inconsistency; rate limiter fail-open default |
| **Total** | **8** | |

---

## Recommendations Priority

1. **Immediate (High):** Fix email enumeration on registration and add rate limiting to the change-password API route.
2. **Short-term (Medium):** Fix timing side-channels in forgot-password and resend-verification flows, invalidate all tokens on password reset, and enforce password complexity in Zod schemas.
3. **Medium-term (Low):** Standardize redirect behavior on dashboard, consider `failClosed` for additional endpoints.
