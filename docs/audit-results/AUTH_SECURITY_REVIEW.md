# DevStash — Security Audit Report

Last audited: 2026-06-07

---

## Passed Checks

The following security practices are correctly implemented:

### Password Hashing
- **Algorithm**: `bcryptjs` (bcrypt) — industry-standard password hashing
- **Cost factor**: 12 — adequate for modern hardware (recommended 12+)
- **Applied consistently**: All password hashing uses cost factor 12 in:
  - `actions/auth.ts:47` (registration)
  - `actions/auth.ts:179` (password change)
  - `actions/reset-password.ts:54` (password reset)
  - `app/api/profile/change-password/route.ts:44` (API password change)
- **No plaintext passwords** logged, returned in responses, or stored

### Rate Limiting
- **All auth endpoints have rate limiting configured** in `lib/rate-limit.ts:64-93`:
  - Sign-in: 5 attempts / 15 minutes
  - Register: 3 attempts / 1 hour
  - Forgot password: 3 attempts / 1 hour
  - Reset password: 5 attempts / 15 minutes
  - Resend verification: 3 attempts / 15 minutes
  - Email verify: 10 attempts / 15 minutes
  - GitHub OAuth: 20 attempts / 15 minutes
- **Rate limiting applied on all endpoints**:
  - `actions/sign-in.ts:13-19` (sign-in)
  - `actions/auth.ts:17-23` (register)
  - `actions/forgot-password.ts:13-20` (forgot password)
  - `actions/reset-password.ts:12-21` (reset password)
  - `actions/resend-verification.ts:11-18` (resend verification)
  - `app/api/auth/verify/route.ts:9-24` (email verify)
  - `actions/sign-in-github.ts:9-16` (GitHub OAuth)

### Token Security
- **Entropy**: `crypto.randomBytes(32)` — 256 bits (256-bit hex = 512-bit entropy) — adequate
- **Hashed before storage**: SHA-256 hash stored in DB, raw token returned to user — good
- **Expiration**: 24 hours — standard
- **Single-use enforcement**: Token deleted after verification in `lib/verification-token.ts:44-51`
- **Token comparison**: Uses hashed token lookup via Prisma — safe

### Session Management
- **Strategy**: JWT (configured in `lib/auth.config.ts:9`)
- **Session validation**: `auth()` called on all protected pages:
  - `app/dashboard/page.tsx:26` (dashboard)
  - `app/profile/page.tsx:12` (profile)
  - `app/api/profile/change-password/route.ts:8` (change password API)
  - `app/api/profile/delete-account/route.ts:7` (delete account API)
  - `app/(auth)/sign-in/page.tsx:29` (sign-in page — redirects if already logged in)
- **User ID from session**: All DB queries use `session.user.id`, not user-supplied IDs
- **Session validation patterns**: Consistent `if (!session?.user?.id)` checks across all pages

### Input Validation
- **Zod schemas on all forms**:
  - `types/db.ts:6-14` (registerSchema)
  - `types/db.ts:25-28` (signInSchema)
  - `types/db.ts:40-49` (changePasswordSchema)
  - `types/db.ts:332-342` (resetPasswordSchema)
  - `types/db.ts:324-326` (forgotPasswordSchema)
- **Server action validation**: All server actions validate input before processing
- **API route validation**: `app/api/profile/change-password/route.ts:21` and `app/api/profile/delete-account/route.ts:20` validate request body

### Email Enumeration Prevention
- **Forgot password**: Dummy token generated before checking user existence (`actions/forgot-password.ts:45`) — prevents timing-based enumeration
- **Resend verification**: Dummy token generated before checking user (`actions/resend-verification.ts:28`) — prevents timing-based enumeration
- **Sign-in**: Generic "Invalid email or password" error message (`actions/sign-in.ts:47`) — doesn't reveal whether email exists

### OAuth Security
- **NextAuth handles automatically**: CSRF protection (state parameter), PKCE, nonce, token signing, cookie security flags (httpOnly, secure, sameSite)
- **GitHub OAuth**: Rate limited, uses NextAuth's built-in OAuth flow

### Authorization
- **User ID validation**: All DB queries use `session.user.id` — no user-supplied IDs used for authorization
- **Current password verification**: `handleChangePassword` verifies current password before updating (`actions/auth.ts:173`)
- **Account deletion**: Uses session user ID, not user-supplied ID (`actions/auth.ts:131-132`)

---

## Findings

### 🔴 Critical

#### 1. Dashboard Layout Missing Authentication Check
- **File:** `app/dashboard/layout.tsx:1-3`
- **Issue:** The dashboard layout is a bare wrapper with no authentication check. Any new page added under `/dashboard/` would be accessible without authentication unless it individually checks. The current `page.tsx` does check auth, but this is a structural vulnerability — the layout should enforce auth for all child routes.
- **Fix:** Add session validation in the layout:
  ```tsx
  import { auth } from '@/lib/auth';
  import { redirect } from 'next/navigation';

  export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/sign-in');
    }
    return <div className="min-h-screen bg-background">{children}</div>;
  }
  ```

#### 2. Account Deletion API Missing CSRF Protection
- **File:** `app/api/profile/delete-account/route.ts:6-43`
- **Issue:** The DELETE endpoint for account deletion has no CSRF protection. While the session is validated (line 7-11), an attacker could craft a malicious page that tricks a logged-in user into triggering this DELETE request. NextAuth handles CSRF for OAuth flows, but custom API routes need their own CSRF protection.
- **Fix:** Add a CSRF token check or use a POST endpoint with a CSRF token:
  ```ts
  // Add CSRF token validation
  const csrfToken = request.headers.get('x-csrf-token');
  if (!csrfToken || csrfToken !== getCsrfToken()) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
  }
  ```

#### 3. Password Reset Reveals User Existence After Token Verification
- **File:** `actions/reset-password.ts:46-52`
- **Issue:** After the token is verified, the code checks if the user exists and redirects with "User not found" error. This reveals whether a user with that email exists in the system. An attacker could use a valid token (obtained from email interception or brute force) to enumerate users.
- **Fix:** Use a generic error message that doesn't reveal user existence:
  ```ts
  if (!user) {
    redirect('/reset-password?error=Reset+link+is+invalid+or+has+expired');
  }
  ```

### 🟡 High

#### 4. Password Reset Link Contains Email in URL Query Parameter
- **File:** `actions/forgot-password.ts:54`
- **Issue:** The reset link includes the email as a query parameter (`?token=...&email=...`). This email could be logged in:
  - Server access logs
  - Browser history
  - Proxy logs
  - Email client logs
  - Any intermediate systems that log URLs
- **Fix:** Remove the email from the URL and use the token alone for verification:
  ```ts
  const resetLink = `${process.env.AUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`;
  ```
  Then in the reset-password page, look up the email from the token's identifier field.

#### 5. Forgot Password Allows Reset for Unverified Users
- **File:** `actions/forgot-password.ts:33-41`
- **Issue:** The code checks if the user has verified their email (line 39-41), but only redirects if `emailVerificationEnabled` AND the user exists AND is unverified. If the user doesn't exist, the code proceeds to generate a token anyway (line 45). This means:
  - Unverified users can still trigger password reset emails
  - The "dummy token" approach at line 45 creates a token for non-existent users, which is wasteful and could be used for timing analysis
- **Fix:** Add a separate check for unverified users that doesn't generate any token:
  ```ts
  if (emailVerificationEnabled && user && !user.emailVerified) {
    redirect('/forgot-password?error=Please+verify+your+email+address+first');
  }
  // Only generate dummy token after all user-specific checks
  if (!user) {
    // No token generation needed — user doesn't exist
    redirect('/forgot-password?success=...');
  }
  ```

#### 6. Rate Limiting IP Key Uses Client-Supplied Header
- **File:** `lib/rate-limit.ts:44-58`
- **Issue:** The `getClientIP` function extracts IP from `x-forwarded-for` header, which can be spoofed by attackers not behind a trusted proxy. On Vercel, the platform handles this by stripping untrusted headers, but the code doesn't verify the IP comes from a trusted source.
- **Fix:** On Vercel, use `x-real-ip` or Vercel's `x-vercel-ip` headers which are set by the platform and cannot be spoofed:
  ```ts
  export function getClientIP(headers: Headers | null): string {
    if (!headers) return "unknown";
    // Prefer platform-set headers that cannot be spoofed
    const vercelIp = headers.get("x-vercel-ip");
    if (vercelIp) return vercelIp;
    const realIp = headers.get("x-real-ip");
    if (realIp) return realIp;
    // Fallback to x-forwarded-for (may be spoofed)
    const forwardedFor = headers.get("x-forwarded-for");
    if (forwardedFor) return forwardedFor.split(",")[0].trim();
    return "unknown";
  }
  ```

### 🟢 Low

#### 7. No Security Headers Configured
- **File:** `app/layout.tsx:1-45`
- **Issue:** No security headers are configured. Next.js has some defaults but not comprehensive security headers. Missing:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Content-Security-Policy`
  - `X-XSS-Protection`
  - `Referrer-Policy`
  - `Permissions-Policy`
- **Fix:** Add security headers via Next.js middleware or in the layout:
  ```ts
  // app/middleware.ts
  import { NextResponse } from 'next/server';
  
  export function middleware(request: Request) {
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    return response;
  }
  ```

#### 8. Console Error Logging Could Expose Sensitive Data
- **Files:** 
  - `actions/forgot-password.ts:101`
  - `actions/auth.ts:108`
  - `actions/resend-verification.ts:86`
- **Issue:** `console.error` with error objects could log sensitive information (stack traces, internal state) to production logs.
- **Fix:** Use a structured logging library that filters sensitive data, or log only error messages:
  ```ts
  console.error("Failed to send email:", error instanceof Error ? error.message : String(error));
  ```

#### 9. Account Deletion Lacks Re-Authentication
- **File:** `app/api/profile/delete-account/route.ts:6-43`
- **Issue:** Account deletion only requires the user to be authenticated (via session). It doesn't require re-entering the password or any additional confirmation. A compromised session or CSRF attack could lead to account deletion.
- **Fix:** Require password re-confirmation for account deletion:
  ```ts
  const body = await request.json();
  const result = deleteAccountSchema.safeParse(body);
  // Add password verification
  if (result.success) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });
    if (!user?.password) {
      return NextResponse.json({ error: 'Password verification required' }, { status: 400 });
    }
    const valid = await bcrypt.compare(body.password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }
  }
  ```

#### 10. Email Verification Resend Redirects to Sign-In Page on Success
- **File:** `actions/resend-verification.ts:89`
- **Issue:** After successfully resending a verification email, the user is redirected to `/sign-in?success=resent`. This could confuse users who are already on the verification page — they lose their context and have to navigate back.
- **Fix:** Redirect to the verification page with a success parameter:
  ```ts
  redirect('/verify-email?success=resent');
  ```

---

## Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 3 |
| 🟡 High | 3 |
| 🟢 Low | 4 |
| **Total** | **10** |

### Key Strengths
- Password hashing with bcrypt cost factor 12
- Comprehensive rate limiting on all auth endpoints
- Token security with 256-bit entropy, SHA-256 hashing, 24-hour expiration, single-use enforcement
- Session validation on all protected pages
- Input validation with Zod schemas on all forms and API routes
- Email enumeration prevention via dummy token generation
- User ID validation using session, not user-supplied IDs
- OAuth security handled by NextAuth

### Priority Recommendations
1. **Add auth check to dashboard layout** — prevents unauthenticated access to any future pages
2. **Add CSRF protection to account deletion API** — prevents account takeover via CSRF
3. **Remove email from password reset URL** — prevents email exposure in logs
4. **Add re-authentication for account deletion** — prevents account loss from compromised sessions
