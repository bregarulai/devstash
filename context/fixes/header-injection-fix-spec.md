# Header Injection Fix — Download Route Content-Disposition

**Phase**: 1
**Status**: Draft
**Created**: 2026-06-14
**Priority**: P0

## Overview

The `fileName` query parameter is interpolated directly into the `Content-Disposition` header without sanitization, enabling HTTP response splitting.

---

## Problem

`app/api/download/route.ts:38-44`:
```ts
const fallbackName = key.split('/').pop() ?? 'download';
const downloadName = fileName || fallbackName;

return new NextResponse(response.body, {
  headers: {
    'Content-Disposition': `attachment; filename="${downloadName}"`,
  },
});
```

An attacker can craft a filename like `test"; malicious="` to break out of the quoted filename and inject additional HTTP headers.

---

## Requirements

1. Sanitize the filename — strip all characters except safe ones.
2. Use proper encoding — RFC 5987 `filename*=UTF-8''` for non-ASCII filenames.
3. Prevent header injection — no `"` or `\r\n` characters in the filename.

---

## Implementation Details

Add a `sanitizeFilename` helper and use it before inserting into the header:

```ts
function sanitizeFilename(name: string): string {
  // Remove path separators, null bytes, and control characters
  let sanitized = name.replace(/[\/\\:*?"<>|\x00-\x1f]/g, '_');
  // Collapse multiple underscores
  sanitized = sanitized.replace(/_+/g, '_');
  // Trim leading/trailing underscores and dots
  sanitized = sanitized.replace(/^[._]+|[._]+$/g, '');
  // Fallback to 'download' if empty
  return sanitized || 'download';
}
```

Then use RFC 5987 encoding for the `Content-Disposition` header:

```ts
const sanitized = sanitizeFilename(downloadName);
const encodedName = encodeURIComponent(sanitized);

return new NextResponse(response.body, {
  headers: {
    'Content-Type': response.headers.get('Content-Type') ?? 'application/octet-stream',
    'Content-Disposition': `attachment; filename="${sanitized}"; filename*=UTF-8''${encodedName}`,
    'Content-Length': response.headers.get('Content-Length') ?? '',
  },
});
```

---

## Files to Modify

| File | Change |
|------|--------|
| `app/api/download/route.ts` | Add `sanitizeFilename` helper, sanitize before header insertion |

---

## Testing Checklist

- [ ] Normal filenames work unchanged (e.g., `photo.jpg` → `photo.jpg`)
- [ ] Filenames with `"` characters are sanitized (e.g., `test"; malicious="` → `test__ malicious_`)
- [ ] Filenames with `\r\n` are stripped
- [ ] Empty filenames fallback to `"download"`
- [ ] Non-ASCII filenames use `filename*=UTF-8''` encoding
- [ ] Path traversal sequences (`../`) are stripped

---

## References

- `app/api/download/route.ts` — Download API route
- `context/coding-standards.md` — Coding standards
- OWASP — [HTTP Response Splitting](https://owasp.org/www-community/vulnerabilities/HTTP_Response_Splitting)
- RFC 5987 — [Content-Disposition Header Encoding](https://tools.ietf.org/html/rfc5987)

## Severity

**P0** — Critical. Classic web vulnerability that can lead to response header injection and XSS.
