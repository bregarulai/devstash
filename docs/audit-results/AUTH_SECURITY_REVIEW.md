# DevStash — Auth Security Audit Report

Last audited: 2026-06-16

---

## Passed Checks

The following security practices are correctly implemented and verified:

### Password Hashing
- **Algorithm**: `bcryptjs` (bcrypt) — industry-standard password hashing
- **Cost factor**: 12 — meets OWASP 2026 recommendation of 12+ for cloud VMs
- **Applied consistently** across all password creation/reset flows:
  - `actions/auth/Auth.ts:49` (registration — `bcrypt.hash(password, 12)`)
  - `actions/auth/Auth.ts:201` (password change — `bcrypt.hash(newPassword, 12)`)
  - `actions/resetPassword/ResetPassword.ts:56` (password reset — `bcrypt.hash(password, 12)`)
  - `app/api/profile/change-password/route.ts:44` (API password change — `bcrypt.hash(newPassword, 12)`)
- **No plaintext passwords** logged, returned in API responses, or stored
- **Source**: [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html); [bcryptjs cost factor guide (2026)](https://codetools.run/blog/bcrypt-cost-factor-guide/)

### Token Security
- **Entropy**: `crypto.randomBytes(32)` — 256 bits of cryptographic randomness (adequate)
- **Hashed before storage**: SHA-256 hash stored in DB, raw token returned to user
- **Expiration**: 24 hours — standard for verification tokens
- **Single-use enforcement**: Token deleted after verification in `lib/auth/verificationToken/verificationToken.ts:44-51`
- **Token comparison**: Uses hashed token lookup via Prisma — no timing attack risk since hash output is compared

### Session Management
- **Strategy**: JWT (configured in `lib/auth/authConfig/authConfig.ts:13`)
- **Session validation**: `auth()` called consistently on all protected pages and API routes
- **User ID from session**: All DB queries use `session.user.id`, never user-supplied IDs

### Input Validation
- **Zod schemas** on all auth forms:
  - `types/db.ts:6-14` — `registerSchema` (name, email, password min 8, confirmPassword match)
  - `types/db.ts:25-28` — `signInSchema` (email, password min 1)
  - `types/db.ts:40-49` — `changePasswordSchema` (currentPassword, newPassword min 8, confirmPassword match)
  - `types/db.ts:390-400` — `resetPasswordSchema` (token, email, password min 8, confirmPassword match)
  - `types/db.ts:382-384` — `forgotPasswordSchema` (email)
  - `types/db.ts:355-357` — `deleteAccountSchema` (password min 1)
- **Server-side validation**: All server actions and API routes validate input with Zod before processing

### Rate Limiting Coverage
- **All major auth endpoints have rate limiting** via Upstash Redis (`lib/auth/rateLimit/rateLimit.ts:64-97`):
  - Sign-in: 5 requests / 15 minutes (per IP + email)
  - Register: 3 requests / 1 hour (per IP)
  - Forgot password: 3 requests / 1 hour (per IP)
  - Reset password: 5 requests / 15 minutes (per IP)
  - Resend verification: 3 requests / 15 minutes (per IP + email)
  - Email verify: 10 requests / 15 minutes (per IP)
  - GitHub OAuth: 20 requests / 15 minutes (per IP)
  - Delete account: 3 requests / 15 minutes (per IP)

### Email Enumeration Prevention
- **Forgot password**: Dummy token created before checking user existence (`actions/forgotPassword/ForgotPassword.ts:47`) — equalizes response timing
- **Resend verification**: Dummy token created before checking user (`actions/resendVerification/ResendVerification.ts:30`) — equalizes response timing
- **Sign-in**: Returns null for both invalid credentials and non-existent users in NextAuth (`lib/auth/auth/auth.ts:43-44,52-53`)
- **Forgot password**: Generic success message regardless of email existence (`actions/forgotPassword/ForgotPassword.ts:51,107`)

### OAuth Security
- **NextAuth v5 handles**: CSRF protection (state parameter), PKCE, nonce, token signing, cookie security flags (httpOnly, secure, sameSite)
- **GitHub OAuth**: `allowDangerousEmailAccountLinking: false` (`lib/auth/authConfig/authConfig.ts:7`) — prevents auto-linking
- **Source**: [NextAuth v5 docs](https://authjs.dev)

### Authorization
- **All DB queries scoped to user**: Every item, collection, and file query includes `userId: session.user.id`
- **IDOR protection**: Download route validates key ownership (`app/api/download/route.ts:24` — `key.includes(/${session.user.id}/`)
- **Account deletion**: Requires password re-verification (`lib/auth/accountDeletion/accountDeletion.ts:26`)

### Proxy (Middleware) Configuration
- **Correctly named `proxy.ts`** for Next.js 16 (renamed from `middleware.ts`)
- **Correct function name**: Exports named `proxy` function
- **Correct matcher**: Excludes API routes, static files, and images
- **Source**: [Next.js 16 Proxy docs](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)

---

## Findings

### 🔴 Critical

#### 1. CSRF Token Validation is Non-Existent in Account Deletion
- **File:** `app/api/profile/delete-account/route.ts:34-37`
- **Issue:** The CSRF token check only verifies the `x-csrf-token` header is **present** (`!csrfToken`), but never validates the token **value** against the NextAuth CSRF endpoint or any stored value. Any non-empty string passes this check. The frontend fetches a real CSRF token from `/api/auth/csrf` (`hooks/useDeleteAccount/useDeleteAccount.ts:12-14`), but the server never verifies it.
- **Proof:**
  ```typescript
  // route.ts:34-37 — only checks presence, not value
  const csrfToken = (await headers()).get('x-csrf-token');
  if (!csrfToken) {  // ← only checks !null/!undefined/!empty
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
  }
  // No validation of csrfToken value against anything
  ```
- **Impact:** An attacker can bypass the CSRF protection by sending any non-empty `x-csrf-token` header. Combined with the session cookie (which could be obtained via XSS or session fixation), this allows account deletion without a valid CSRF token.
- **Fix:** Validate the CSRF token against the NextAuth CSRF endpoint:
  ```typescript
  // After extracting csrfToken from header
  const csrfResponse = await fetch(`${process.env.AUTH_URL || 'http://localhost:3000'}/api/auth/csrf`, {
    headers: { cookie: request.headers.get('cookie') || '' },
  });
  const { csrfToken: expectedToken } = await csrfResponse.json();
  if (!csrfToken || csrfToken !== expectedToken) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
  }
  ```
  Or use NextAuth's built-in CSRF validation by switching to a form-based submission.

### 🟡 High

#### 2. Rate Limiter Fails Open When Upstash Redis Is Unavailable
- **File:** `lib/auth/rateLimit/rateLimit.ts:17-31, 133-142`
- **Issue:** If Upstash Redis credentials are not configured or the service is unavailable, the rate limiter returns `success: true` for all requests. This means **all rate limiting is silently bypassed** during Redis outages.
- **Proof:**
  ```typescript
  // rateLimit.ts:21-31 — fail open when no credentials
  if (!url || !token) {
    return {
      limit: async () => ({
        success: true,  // ← always allows request
        // ...
      }),
    };
  }
  // rateLimit.ts:133-142 — fail open on catch
  } catch {
    return {
      success: true,  // ← always allows request
      // ...
    };
  }
  ```
- **Impact:** During a Redis outage, all auth endpoints (sign-in, register, password reset) become vulnerable to brute-force attacks with no rate limiting.
- **Fix:** Either fail closed (block requests) or implement an in-memory fallback rate limiter:
  ```typescript
  // Option 1: Fail closed (stricter)
  return { limit: async () => ({ success: false, remaining: 0, ... }) };
  
  // Option 2: In-memory fallback
  const memoryStore = new Map<string, { count: number; reset: number }>();
  // Implement sliding window with memory store
  ```

#### 3. No Rate Limiting on Password Change Endpoint
- **File:** `app/api/profile/change-password/route.ts` (entire file)
- **Issue:** The password change API endpoint has **no rate limiting**. While it requires authentication and current password verification, an attacker with a valid session could brute-force the current password to change it.
- **Proof:** The `change-password/route.ts` file has no imports from `rateLimit.ts` and no rate limit check.
- **Impact:** An attacker with a stolen session cookie can attempt unlimited current password guesses to change the password and take over the account.
- **Fix:** Add rate limiting to the password change endpoint:
  ```typescript
  import { createRateLimiter, checkRateLimit, RATE_LIMIT_CONFIGS, getClientIP } from '@/lib/auth/rateLimit/rateLimit';
  
  // At the start of POST handler:
  const ip = getClientIP(request.headers);
  const rateLimiter = createRateLimiter({ limit: 5, duration: 15 * 60 }); // 5 attempts / 15 min
  const rateResult = await checkRateLimit(rateLimiter, `changepwd:${ip}`, { limit: 5, duration: 15 * 60 });
  if (!rateResult.success) {
    return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });
  }
  ```

#### 4. Password Reset Reveals User Existence After Token Verification
- **File:** `actions/resetPassword/ResetPassword.ts:48-54`
- **Issue:** After the reset token is verified, the code queries the user by email and redirects with `User+not+found` if the user doesn't exist. This reveals whether a user with that email exists in the system.
- **Proof:**
  ```typescript
  // ResetPassword.ts:48-54
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    redirect('/reset-password?error=User+not+found');  // ← reveals user existence
  }
  ```
- **Impact:** An attacker who intercepts or guesses a valid reset token can enumerate registered email addresses.
- **Fix:** Use a generic error message:
  ```typescript
  if (!user) {
    redirect('/reset-password?error=Reset+link+is+invalid+or+has+expired');
  }
  ```

### 🟡 Medium

#### 5. Password Hash Exposed in ProfileData Type
- **File:** `lib/db/user/user.ts:30`, `types/db.ts:336`
- **Issue:** The `loadProfileDataAsync` function selects `password: true` from the database, and the `profileUserDataSchema` type includes `password: z.string().or(z.null())`. While the password hash is not directly passed to client components (only a `hasPassword` boolean is derived at `app/profile/page.tsx:42`), the hash is included in the server-side `ProfileData` type and could inadvertently leak if the data shape changes.
- **Proof:**
  ```typescript
  // lib/db/user/user.ts:23-32
  select: {
    // ...
    password: true,  // ← selects password hash
  }
  
  // types/db.ts:329-337
  export const profileUserDataSchema = z.object({
    // ...
    password: z.string().or(z.null()),  // ← includes hash in type
  });
  ```
- **Impact:** If any code change inadvertently passes the full `profileData.user` object to a client component or API response, the bcrypt hash would be exposed.
- **Fix:** Remove `password` from the select and use a computed boolean:
  ```typescript
  // lib/db/user/user.ts
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isPro: true,
      createdAt: true,
      // Don't select password — use a separate query if needed
    },
  });
  const hasPassword = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  }).then(u => u?.password !== null);
  ```

#### 6. Redirect Callback Does Not Validate `baseUrl` Origin Consistently
- **File:** `lib/auth/authConfig/authConfig.ts:16-21`
- **Issue:** The redirect callback compares `urlObj.origin === baseUrl`, but `baseUrl` is provided by NextAuth and may include a trailing slash in some configurations. If `baseUrl` is `"http://localhost:3000/"` (with trailing slash), `new URL("http://localhost:3000").origin` returns `"http://localhost:3000"` (without trailing slash), causing the comparison to fail and redirecting to `baseUrl` instead of the intended URL.
- **Proof:**
  ```typescript
  // authConfig.ts:16-21
  async redirect({ url, baseUrl }) {
    if (url.startsWith("/")) return `${baseUrl}${url}`
    const urlObj = new URL(url)
    if (urlObj.origin === baseUrl) return url  // ← may fail if baseUrl has trailing slash
    return baseUrl
  }
  ```
- **Impact:** Minor — could cause unexpected redirects after OAuth sign-in if `baseUrl` has a trailing slash.
- **Fix:** Normalize `baseUrl` before comparison:
  ```typescript
  async redirect({ url, baseUrl }) {
    const normalizedBase = baseUrl.replace(/\/$/, '');
    if (url.startsWith("/")) return `${normalizedBase}${url}`
    const urlObj = new URL(url)
    if (urlObj.origin === normalizedBase) return url
    return normalizedBase
  }
  ```

### 🟢 Low

#### 7. Sign-In Pre-Checks Email Existence Before Authentication
- **File:** `actions/signIn/SignIn.ts:49-57`
- **Issue:** The sign-in action queries the database for `emailVerified` status before calling `signIn()`. While the actual authentication happens in NextAuth (which doesn't leak), this pre-query could theoretically enable timing-based enumeration (DB query + bcrypt comparison vs. just bcrypt comparison).
- **Proof:**
  ```typescript
  // SignIn.ts:49-57
  const user = await prisma.user.findUnique({
    where: { email },
    select: { emailVerified: true },
  });
  const shouldRedirect = emailVerificationEnabled && user && !user.emailVerified;
  // ...
  await signIn('credentials', { email, password });  // ← actual auth
  ```
- **Impact:** Very low — the timing difference is minimal (both paths involve DB + bcrypt), and rate limiting further mitigates this.
- **Fix:** Move the email verification check after `signIn()` succeeds:
  ```typescript
  await signIn('credentials', { email, password });
  // Only check emailVerified after successful authentication
  const user = await prisma.user.findUnique({
    where: { email },
    select: { emailVerified: true },
  });
  const shouldRedirect = emailVerificationEnabled && user && !user.emailVerified;
  redirect(shouldRedirect ? '/verify-required' : '/dashboard');
  ```

#### 8. Dashboard Page Shows "Not signed in" Instead of Redirecting
- **File:** `app/dashboard/page.tsx:24-26`
- **Issue:** When the session is missing, the dashboard page renders a "Not signed in" div instead of redirecting to `/sign-in`. While the proxy middleware should catch this, the fallback behavior is inconsistent with other pages (profile, items) which redirect.
- **Proof:**
  ```typescript
  // dashboard/page.tsx:24-26
  if (!session?.user?.id) {
    return <div className="min-h-screen flex items-center justify-center">Not signed in</div>;
    // ← should redirect, not render
  }
  ```
- **Impact:** Low — the proxy middleware should prevent this, but inconsistent fallback behavior could confuse users.
- **Fix:** Redirect instead of rendering:
  ```typescript
  if (!session?.user?.id) {
    redirect('/sign-in');
  }
  ```

---

## Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 1 |
| 🟡 High | 3 |
| 🟡 Medium | 2 |
| 🟢 Low | 2 |
| **Total** | **8** |

### Key Strengths
- Password hashing with bcrypt cost factor 12 (OWASP-compliant for 2026)
- Comprehensive rate limiting on 8 auth endpoints via Upstash Redis
- Token security with 256-bit entropy, SHA-256 hashing, 24-hour expiration, single-use enforcement
- Session validation on all protected pages and API routes
- Input validation with Zod schemas on all forms and API routes
- Email enumeration prevention via dummy token generation in forgot-password and resend-verification flows
- OAuth security handled by NextAuth v5 (CSRF, PKCE, nonce, cookie flags)
- IDOR protection on file download route (key ownership validation)
- Proxy correctly configured for Next.js 16

### Priority Recommendations
1. **Fix CSRF token validation** in account deletion — validate token value, not just presence
2. **Add rate limiting** to password change endpoint — prevent brute-force current password
3. **Use generic error message** in password reset — prevent user enumeration after token verification
4. **Consider fail-closed rate limiting** or in-memory fallback for Redis outages
