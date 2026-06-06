# DevStash — Authentication Security Audit

Last audited: 2026-06-05

---

## Passed Checks

### ✅ Token Generation & Entropy
- **File:** `lib/verification-token.ts:5`
- **Method:** `crypto.randomBytes(32).toString("hex")` — 256-bit entropy
- **Status:** **Adequate.** 256 bits (32 bytes) exceeds the 128-bit minimum recommended for security tokens.

### ✅ Token Hashing Before Storage
- **File:** `lib/verification-token.ts:6`
- **Method:** `crypto.createHash("sha256").update(token).digest("hex")`
- **Status:** **Correct.** Tokens are hashed with SHA-256 before being stored in the database.

### ✅ Token Expiration
- **File:** `lib/verification-token.ts:12`
- **Duration:** 24 hours (`24 * 60 * 60 * 1000` ms)
- **Status:** **Standard.** 24-hour expiry is the industry standard for password reset and verification tokens.

### ✅ Single-Use Token Enforcement
- **File:** `lib/verification-token.ts:44-51`
- **Method:** Token is deleted from the database after verification
- **Status:** **Correct.** Tokens are single-use — deleted immediately after verification.

### ✅ Password Hashing Algorithm
- **File:** `actions/auth.ts:35`, `actions/reset-password.ts:40`, `app/api/profile/change-password/route.ts:44`
- **Algorithm:** bcrypt (via bcryptjs)
- **Status:** **Correct algorithm.** bcrypt is the recommended password hashing function.

### ✅ Session Validation on Protected Pages
- **Profile page:** `app/profile/page.tsx:12-16` — `auth()` called, `redirect('/sign-in')` if unauthenticated ✅
- **Sign-in page:** `app/(auth)/sign-in/page.tsx:29-34` — `auth()` called, `redirect('/dashboard')` if already signed in ✅
- **Change password API:** `app/api/profile/change-password/route.ts:8-11` — `auth()` called, returns 401 if unauthenticated ✅
- **Delete account API:** `app/api/profile/delete-account/route.ts:7-10` — `auth()` called, returns 401 if unauthenticated ✅
- **Delete account action:** `actions/auth.ts:113-117` — `auth()` called, returns error if unauthenticated ✅
- **Change password action:** `actions/auth.ts:146-150` — `auth()` called, returns error if unauthenticated ✅

### ✅ Input Validation with Zod
- **Registration:** `types/db.ts:6-14` — `registerSchema` validates name, email, password (min 8), confirmPassword with cross-field refine ✅
- **Sign-in:** `types/db.ts:25-28` — `signInSchema` validates email (z.email), password (min 1) ✅
- **Change password:** `types/db.ts:32-41` — `changePasswordSchema` validates currentPassword, newPassword (min 8), confirmPassword with cross-field refine ✅
- **Forgot password:** `types/db.ts:316-318` — `forgotPasswordSchema` validates email ✅
- **Reset password:** `types/db.ts:324-334` — `resetPasswordSchema` validates token, email, password (min 8), confirmPassword with cross-field refine ✅
- **Delete account:** `types/db.ts:288-291` — `deleteAccountSchema` validates userId and confirm (literal true) ✅
- **Verification token:** `types/db.ts:297-299` — `verifyTokenSchema` validates token (min 1) ✅

### ✅ CSRF Protection
- **Status:** **Handled by NextAuth v5.** NextAuth automatically manages CSRF via OAuth state parameter and double-submit cookie strategy for credentials provider. No custom CSRF code needed.
- **Source:** [Auth.js docs — CSRF Token Retrieval](https://authjs.dev/reference/nextjs/react)

### ✅ OAuth Security (GitHub)
- **State parameter:** Handled automatically by NextAuth v5 via OAuth state cookie ✅
- **Nonce:** Handled automatically by NextAuth v5 ✅
- **PKCE:** Handled automatically by NextAuth v5 for GitHub provider ✅
- **Cookie security flags:** httpOnly, secure, sameSite set automatically by NextAuth v5 ✅
- **Token signing:** JWT strategy uses Auth.js built-in token signing ✅
- **Source:** [Auth.js docs — CookiesOptions](https://authjs.dev/reference/core/types)

### ✅ User ID Validation on Account Modification
- **Delete account:** `actions/auth.ts:119-122` — Uses `session.user.id` to find user, not user-supplied ID ✅
- **Change password:** `actions/auth.ts:152-155` — Uses `session.user.id` to find user ✅
- **Delete account API:** `app/api/profile/delete-account/route.ts:26-29` — Uses `session.user.id` ✅
- **Change password API:** `app/api/profile/change-password/route.ts:29-32` — Uses `session.user.id` ✅

### ✅ Password Change Verifies Current Password
- **Server action:** `actions/auth.ts:161` — `bcrypt.compare(currentPassword, user.password)` before updating ✅
- **API route:** `app/api/profile/change-password/route.ts:38` — `bcrypt.compare(currentPassword, user.password)` before updating ✅

### ✅ Password Reset Verifies Token Before Update
- **File:** `actions/reset-password.ts:26-30` — `verifyToken(token)` called, checks `verifiedEmail === email` before updating password ✅

### ✅ Token Deleted After Password Reset
- **File:** `lib/verification-token.ts:44-51` — `verifyToken` deletes the token after successful verification ✅
- **Impact:** Password reset tokens are single-use ✅

### ✅ No Plaintext Passwords in Responses
- **Sign-in:** Returns generic "Invalid email or password" error ✅
- **Registration:** Returns generic error via URL parameter ✅
- **Change password:** Returns "Current password is incorrect" (generic) ✅

---

## Findings

### 🔴 Critical

#### 1. Production Secrets Committed to Repository
- **Files:** `.env:2-8`, `.env.production:1-7`
- **Issue:** Real production credentials are committed to the repository:
  - `DATABASE_URL` — Production Neon database URL with credentials
  - `AUTH_SECRET` — NextAuth secret key
  - `AUTH_GITHUB_ID` — GitHub OAuth client ID
  - `AUTH_GITHUB_SECRET` — GitHub OAuth client secret
  - `RESEND_API_KEY` — Resend API key
- **Impact:** Anyone with repo access can:
  - Connect to the production database
  - Impersonate the GitHub OAuth app
  - Send emails via Resend
  - Forge NextAuth sessions
- **Fix:** 
  1. Immediately rotate ALL credentials listed above
  2. Add `.env` and `.env.production` to `.gitignore`
  3. Use a secrets manager (e.g., Vercel environment variables, AWS Secrets Manager) for production
  4. Consider using `git-secrets` or `trufflehog` in CI to prevent future commits
- **Source:** [OWASP — Secrets Management](https://owasp.org/www-project-top-ten/)

#### 2. No Rate Limiting on Any Authentication Endpoint
- **Files:** `actions/sign-in.ts:32`, `actions/forgot-password.ts:31`, `actions/resend-verification.ts:23`, `actions/auth.ts:13` (register), `app/api/profile/change-password/route.ts:7`, `app/api/profile/delete-account/route.ts:6`
- **Issue:** Zero rate limiting on any authentication endpoint:
  - **Sign-in** (`handleSignIn`) — No brute force protection
  - **Forgot password** (`handleForgotPassword`) — No email flooding prevention
  - **Resend verification** (`handleResendVerification`) — No email spam prevention
  - **Register** (`handleRegister`) — No email enumeration prevention
  - **Change password** (`POST /api/profile/change-password`) — No brute force protection
  - **Delete account** (`DELETE /api/profile/delete-account`) — No brute force protection
- **Impact:** 
  - Attackers can brute-force credentials without restriction
  - Attackers can flood users with verification/reset emails
  - Attackers can enumerate registered email addresses via timing analysis
  - Account takeover via credential stuffing is trivially possible
- **Fix:** Implement rate limiting on all auth endpoints. Recommended approach:
  ```typescript
  // Example: Using upstash/redis for rate limiting
  import { Ratelimit } from "@upstash/ratelimit"
  import { Redis } from "@upstash/redis"
  
  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 requests per minute
  })
  
  // In each auth endpoint:
  const { success } = await ratelimit.limit(`auth:${ip}`)
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }
  ```
- **Recommended limits:**
  - Sign-in: 5 requests/minute per IP
  - Forgot password: 3 requests/minute per IP
  - Resend verification: 3 requests/minute per IP
  - Register: 3 requests/minute per IP
  - Change password: 5 requests/minute per IP
  - Delete account: 3 requests/minute per IP
- **Source:** [OWASP — Brute Force Protection](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/04-Authentication_Testing/06-Testing_for_Credential_Bruteforce_Implementation)

#### 3. Email Enumeration via Sign-In Flow
- **File:** `actions/sign-in.ts:20-27`
- **Issue:** The sign-in flow checks if the user exists and whether their email is verified BEFORE calling `signIn()`. This creates two distinct failure paths:
  1. If email is unverified: redirects to `/sign-in?error=UnverifiedEmail&email=${email}` — **reveals the email exists**
  2. If password is wrong: redirects to `/sign-in?error=Invalid+email+or+password` — generic
- **Impact:** An attacker can enumerate registered email addresses by observing the `UnverifiedEmail` error. If they receive `UnverifiedEmail`, they know the email is registered but unverified.
- **Fix:** Remove the pre-check for email verification in `handleSignIn`. Let the Credentials provider's `authorize` callback handle the verification check (it already does this at `lib/auth.ts:28-30`). Return the same generic error for all sign-in failures:
  ```typescript
  export async function handleSignIn(formData: FormData) {
    const result = signInSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    })
  
    if (!result.success) {
      redirect("/sign-in?error=Please+check+your+input")
    }
  
    try {
      await signIn("credentials", formData)
    } catch {
      redirect("/sign-in?error=Invalid+email+or+password")
    }
  }
  ```
- **Source:** [OWASP — Account Enumeration](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/04-Authentication_Testing/02-Testing_for_Account_Enumeration_and_Guessing)

---

### 🟡 High

#### 4. bcrypt Cost Factor Too Low
- **Files:** `actions/auth.ts:35`, `actions/auth.ts:167`, `actions/reset-password.ts:40`, `app/api/profile/change-password/route.ts:44`
- **Issue:** All password hashing uses `bcrypt.hash(password, 10)` — cost factor 10
- **Impact:** Cost factor 10 is borderline acceptable for early-stage apps but is too low for production. Modern hardware can perform ~500M bcrypt operations/second at cost factor 10, making brute-force attacks feasible.
- **Fix:** Increase cost factor to 12:
  ```typescript
  const hashedPassword = await bcrypt.hash(password, 12)
  ```
  Cost factor 12 provides ~4x more work than cost factor 10 and is the current industry recommendation for production applications.
- **Source:** [bcrypt cost factor recommendations](https://security.stackexchange.com/questions/39889/bcrypt-work-factor-for-2020)

#### 5. Forgot Password Reveals User Existence
- **File:** `actions/forgot-password.ts:84`
- **Issue:** The success message is: `"If an account exists with that email, a password reset link has been sent."`
- **Impact:** While this is better than saying "Account not found" or "Email sent", it still confirms whether an account exists with that email address. An attacker can submit emails and observe whether the success message is shown (vs. an error).
- **Fix:** Use a completely generic success message that doesn't reference account existence:
  ```typescript
  redirect("/forgot-password?success=A+reset+link+has+been+sent+if+an+account+matches+your+input")
  ```
  Or better yet, always show the same success message regardless of whether the email exists:
  ```typescript
  // Always redirect to success even if user doesn't exist
  redirect("/forgot-password?success=If+an+account+exists+with+that+email,+you+will+receive+a+reset+link.")
  ```
- **Source:** [OWASP — Information Leakage](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/02-Application_Fingerprinting_Tests/04-Test_Error_Handling_for_Information_Leakage)

#### 6. Route Protection Gap — No middleware.ts
- **File:** `proxy.ts:18-19`
- **Issue:** Route protection is implemented in `proxy.ts` with matcher only for `/dashboard/:path*`. This means:
  - The `/profile` route is NOT protected by middleware — it relies solely on per-page `auth()` check
  - Any new protected routes added under `/dashboard` must be manually added to the matcher
  - If `proxy.ts` is removed or the matcher is changed, all protected routes become public
- **Impact:** 
  - The `/profile` page has a per-page `auth()` check (`app/profile/page.tsx:12-16`) which is correct, but this is a manual per-page check that can be forgotten
  - No centralized route protection means new routes can accidentally be left unprotected
- **Fix:** Use NextAuth v5's built-in `authorized` callback with the proxy pattern:
  ```typescript
  // proxy.ts
  import { auth } from "@/lib/auth"
  
  export const proxy = auth((req) => {
    if (!req.auth && !req.nextUrl.pathname.startsWith("/api/auth")) {
      const signInUrl = new URL("/sign-in", req.nextUrl.origin)
      signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
      return Response.redirect(signInUrl)
    }
  })
  
  export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
  }
  ```
  And in `auth.ts`:
  ```typescript
  export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    ...overrideProviders,
    callbacks: {
      authorized: async ({ auth }) => !!auth,
    },
  })
  ```
  This provides centralized, automatic route protection for all pages.
- **Source:** [Auth.js docs — Protecting Resources](https://authjs.dev/getting-started/session-management/protecting)

---

### 🟢 Medium

#### 7. Verification Token Not Deleted After API Verification
- **File:** `app/api/auth/verify/route.ts:57-60`
- **Issue:** The `/api/auth/verify` route marks the user's email as verified but does NOT delete the verification token from the database. The token remains usable.
- **Impact:** While the `verifyToken` function in `lib/verification-token.ts` deletes tokens, this API route bypasses that function and directly updates the user. The token is never deleted, allowing potential reuse.
- **Fix:** Delete the token after successful verification:
  ```typescript
  // After line 59 (updating emailVerified):
  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: existingToken.identifier,
        token: hashedToken,
      },
    },
  })
  ```
- **Source:** [OWASP — Token Reuse](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/04-Authentication_Testing/09-Testing_for_Weak_Token_Implementation)

#### 8. Resend Verification Reveals User Existence
- **File:** `actions/resend-verification.ts:15-21`
- **Issue:** The `handleResendVerification` action checks if the user exists and is unverified. If the user doesn't exist or is already verified, it redirects to `/sign-in` (which is a different response than the success path).
- **Impact:** An attacker can call this endpoint with different emails and observe whether the response differs (verified vs. unverified vs. not found).
- **Fix:** Always return the same response regardless of user state:
  ```typescript
  export async function handleResendVerification(email: string) {
    // Always attempt to create a token (even if user doesn't exist)
    const token = await createVerificationToken(email)
    // ... send email ...
    redirect("/sign-in?success=resent")
  }
  ```
  Or better: check if the user exists first, and if not, still show the same success message.

#### 9. Dashboard Shows "Not signed in" Instead of Redirecting
- **File:** `app/dashboard/page.tsx:28-30`
- **Issue:** When unauthenticated, the dashboard page renders `<div>Not signed in</div>` instead of redirecting to `/sign-in`.
- **Impact:** 
  - The page still loads and fetches dashboard data (via `prisma.user.findUnique`) even for unauthenticated users
  - This wastes server resources and exposes the dashboard UI to unauthenticated users
  - The `proxy.ts` middleware should redirect, but the matcher only covers `/dashboard/:path*` — the root `/dashboard` path may not be covered
- **Fix:** Either:
  1. Add `/dashboard` to the proxy matcher, OR
  2. Change the page to redirect:
  ```typescript
  if (!session?.user?.id) {
    redirect('/sign-in')
  }
  ```
- **Source:** [Auth.js docs — Protecting Resources](https://authjs.dev/getting-started/session-management/protecting)

---

### ℹ️ Low

#### 10. Email Exposed in Password Reset URL
- **Files:** `actions/forgot-password.ts:33`, `actions/resend-verification.ts:25`
- **Issue:** Password reset and verification links include the email address in the URL query parameter:
  - `/reset-password?token=${token}&email=${email}`
  - `/verify-email?token=${token}`
- **Impact:** 
  - The email is visible in browser history, server logs, and email headers
  - This is a privacy concern but not a security vulnerability (the token is the secret, not the email)
  - The email is a public identifier, not a secret
- **Fix:** Remove email from the URL. Use the token alone as the secret:
  ```typescript
  const resetLink = `${process.env.AUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`
  ```
  And in the reset-password page, look up the email from the token:
  ```typescript
  const verifiedEmail = await verifyToken(token)
  ```
  This eliminates email exposure in URLs while maintaining security.

#### 11. Seed File Uses Cost Factor 12 (Correct)
- **File:** `prisma/seed.ts:439`
- **Status:** `bcrypt.hash(demoUser.password, 12)` — cost factor 12 is correct for the seed file. This is noted as a positive finding.

---

## Summary

| Severity | Count | Description |
|----------|-------|-------------|
| 🔴 Critical | 3 | Secrets in repo, no rate limiting, email enumeration |
| 🟡 High | 3 | Low bcrypt cost, info leakage, route protection gap |
| 🟢 Medium | 2 | Token reuse, user existence via resend |
| ℹ️ Low | 2 | Email in URL, dashboard redirect |
| **Total** | **10** | |

### Priority Recommendations

1. **IMMEDIATE:** Rotate all production credentials and remove `.env` files from git
2. **IMMEDIATE:** Implement rate limiting on all auth endpoints
3. **HIGH:** Increase bcrypt cost factor to 12 across all password hashing
4. **HIGH:** Fix email enumeration in sign-in flow
5. **MEDIUM:** Add `authorized` callback to proxy for centralized route protection
6. **MEDIUM:** Delete verification tokens after API verification
7. **LOW:** Remove email from password reset URLs
