# API Routes Cleanup — Phase 3: Update Coding Standards

## Overview

Enhance the `context/coding-standards.md` file to provide clearer decision criteria for when to use API routes vs server actions, based on the patterns established by Phases 1 and 2.

| Item | Detail |
|------|--------|
| Complexity | Low |
| Risk | None |
| Files to modify | 1 |

> **IMPORTANT**: When implementing these fixes, you MUST NOT break any existing functionality or user flow. Always double-check your work by verifying that affected features still work as expected after each change.

---

## Problem

The current coding standards (lines 43-50) list when to use API routes but don't provide explicit decision rules or examples. This led to the redundancies cleaned up in Phases 1 and 2:
- An unused API route that duplicated a server action
- A direct `fetch` call to an API route when a server action existed

---

## Change

Update `context/coding-standards.md` lines 43-50 to add explicit decision rules:

**Current text (lines 43-50):**
```markdown
- Use Server Actions for form submissions and simple mutations
- Use API routes when you need:
  - Webhooks (Stripe, GitHub, etc.)
  - File uploads with progress tracking
  - Long-running operations
  - Specific HTTP status codes or headers
  - Endpoints for future mobile/CLI clients
  - Third-party integrations
- Otherwise, fetch data directly in server components
```

**Replace with:**
```markdown
- Use Server Actions for form submissions and simple mutations
- Use API routes when you need:
  - Webhooks (Stripe, GitHub, etc.)
  - File uploads with progress tracking (requires XMLHttpRequest for progress events)
  - Streaming responses (file downloads, SSE)
  - Specific HTTP status codes or custom headers
  - Endpoints for future mobile/CLI clients
  - Third-party integrations requiring HTTP endpoints
- Decision rules:
  - If the operation is triggered by a user form or button click and doesn't need HTTP-specific features, use a Server Action
  - If the operation is triggered by client-side code that needs progress tracking or streaming, use an API Route
  - Never duplicate the same mutation as both a server action and an API route — pick one
- Otherwise, fetch data directly in server components
```

---

## Verification

1. Read the updated file and confirm the changes are correct
2. No build/test needed — documentation only
