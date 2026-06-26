# DevStash — AI Integration Plan

> **Model**: OpenAI Go "DeepSeek V4 Flash" (e.g. `opencode-go/glm-5.2`)
> via the OpenAI SDK.
> **Scope**: Auto-tagging, AI summaries, code explanation, prompt optimizer — all Pro-gated.
> **Output of this document**: architecture, patterns, schemas, prompts, gating, and UI guidance. This is **documentation only** — no source files are modified.

---

## 0. Model note

The DevStash overview (`context/project-overview.md`) lists "OpenAI GPT-4o Mini" as the planned AI provider, with `lib/openai.ts` and `app/api/ai/` in the suggested structure. Nothing in that structure is wired up yet — the OpenAI package is **not** currently in `package.json`, and there is no `lib/openai.ts` or `app/api/ai/` route.

The research prompt requests the **Opencode Go "DeepSeek V4 Flash"** model. That model is OpenAI-API-compatible (it is accessed through the OpenAI Node SDK by setting `baseURL` to the provider gateway). All patterns below therefore use the official **`openai`** Node SDK with a configurable `baseURL`/`apiKey`, so the same code works whether you later switch to OpenAI, Azure, OpenRouter, a self-hosted gateway, or an OpenAI-compatible endpoint like DeepSeek. Use `process.env.OPENAI_API_KEY` and `process.env.OPENAI_BASE_URL` exclusively.

---

## 1. SDK setup and configuration

### 1.1 Install

```bash
npm install openai
```

> The repo already uses `@upstash/ratelimit` + `@upstash/redis` for rate limiting and **zod** everywhere, so no additional runtime deps are needed. `react-markdown`/`remark-gfm` are already present for rendering AI explanations.

### 1.2 Environment

`.env.example` already contains `OPENAI_API_KEY`. Add the optional base URL and a usage table config:

```env
# OpenAI-compatible AI provider
OPENAI_API_KEY=
# Optional — set to route to DeepSeek V4 Flash gateway or alternate provider
OPENAI_BASE_URL=
# Model id (default targets the cost-optimized flash model on the gateway)
OPENAI_MODEL=deepseek-v4-flash
```

Note: `.env.example` flags everything as secret. Do **not** prefix with `NEXT_PUBLIC_` anywhere.

### 1.3 `lib/ai/openai.ts` — singleton client

Follow the existing pattern of small, single-responsibility modules (see `lib/prisma/prisma.ts`, `lib/r2.ts`, `lib/auth/rateLimit/rateLimit.ts`).

```ts
import OpenAI from 'openai';
import { z } from 'zod';

const envSchema = z.object({
  apiKey: z.string().min(1, 'OPENAI_API_KEY is required'),
  baseURL: z.string().url().optional(),
  model: z.string().default('deepseek-v4-flash'),
});

const parsed = envSchema.parse({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
  model: process.env.OPENAI_MODEL,
});

export const openai = new OpenAI({
  apiKey: parsed.apiKey,
  baseURL: parsed.baseURL, // undefined → defaults to api.openai.com
});

export const AI_MODEL = parsed.model;
```

Why this shape:

- **Module-level singleton** (matches `lib/prisma/prisma.ts`). Reusing the client across server actions avoids re-handshaking TLS per request.
- **Zod-validated env** (matches the project's zod-everywhere convention; cf. action validation in `actions/items/Items.ts:29`).
- **Never instantiated on the client.** This file is imported only by `'use server'` modules and Route Handlers under `app/api/ai/`.

---

## 2. Server action patterns for AI calls

### 2.1 Reuse the existing `ActionResult` discriminated union

Every existing action (`actions/items/Items.ts`, `actions/collections/Collections.ts`) returns:

```ts
type ActionResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: string };
```

AI actions should follow the identical shape. New file: `actions/ai/Ai.ts` with exports surfaced through `actions/index.ts`:

```ts
export {
  suggestTagsAction,
  generateSummaryAction,
  explainCodeAction,
  optimizePromptAction,
} from './ai/Ai';
```

### 2.2 Shared auth + Pro check helper

Existing actions repeat `requireAuth()` per file and a Pro check inline. Extract one helper (do not change existing actions yet — add alongside and let them migrate later):

```ts
// actions/ai/_shared.ts
import { auth } from '@/lib/auth/auth/auth';
import { prisma } from '@/lib/prisma/prisma';

export async function requireProUser(): Promise<{ userId: string } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPro: true },
  });
  if (!dbUser?.isPro) return { error: 'AI features require a Pro plan.' };
  return { userId: session.user.id };
}
```

This mirrors the exact pattern from `actions/items/Items.ts:36-53` and `actions/collections/Collections.ts:35-50`.

### 2.3 Non-streaming example — auto-tag suggestions

```ts
// actions/ai/Ai.ts
'use server';

import { z } from 'zod';
import { openai, AI_MODEL } from '@/lib/ai/openai';
import { requireProUser } from './_shared';
import { checkRateLimit, createRateLimiter, RATE_LIMIT_CONFIGS } from '@/lib/auth/rateLimit/rateLimit';

type ActionResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: string };

const tagSchema = z.object({
  itemId: z.string().cuid(),
  title: z.string().min(1).max(200),
  content: z.string().max(20_000),
  language: z.string().optional(),
});

export async function suggestTagsAction(input: z.infer<typeof tagSchema>): Promise<ActionResult<string[]>> {
  const user = await requireProUser();
  if ('error' in user) return { success: false, data: null, error: user.error };

  const parsed = tagSchema.safeParse(input);
  if (!parsed.success) return { success: false, data: null, error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  // Rate limit per user (see §4.2)
  const rl = createRateLimiter(RATE_LIMIT_CONFIGS.aiTags);
  const res = await checkRateLimit(rl, user.userId, RATE_LIMIT_CONFIGS.aiTags, true);
  if (!res.success) return { success: false, data: null, error: `Too many requests. Retry in ${Math.ceil((res.retryAfter ?? 0))}s.` };

  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      temperature: 0.2,
      max_tokens: 200,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'tag_suggestions',
          strict: true,
          schema: {
            type: 'object',
            properties: { tags: { type: 'array', items: { type: 'string' }, maxItems: 8 } },
            required: ['tags'],
            additionalProperties: false,
          },
        },
      },
      messages: [
        { role: 'system', content: 'Propose up to 8 concise lowercase tags (1-3 words, kebab-case) describing the following DevStash item. Do not include the language name.' },
        { role: 'user', content: `Title: ${parsed.data.title}\nLanguage: ${parsed.data.language ?? 'n/a'}\nContent:\n${parsed.data.content}` },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? '{"tags":[]}';
    const tags = (JSON.parse(raw).tags ?? []) as string[];
    return { success: true, data: tags, error: null };
  } catch (err) {
    return { success: false, data: null, error: err instanceof Error ? err.message : 'AI request failed' };
  }
}
```

Key reuse points from the existing codebase:

- `'use server'` top directive (consistency with all `actions/**/*.ts`).
- `safeParse` → first issue message (identical to `actions/items/Items.ts:29`).
- Try/catch returning `ActionResult` with `err instanceof Error ? err.message : '…'` (same pattern in every existing action).
- Rate limiter using the project's `createRateLimiter`/`checkRateLimit` API (`lib/auth/rateLimit/rateLimit.ts`).

---

## 3. Streaming vs non-streaming — when and how

| Feature | Mode | Rationale |
| --- | --- | --- |
| Auto-tag suggestions | Non-streaming | Small structured JSON; need the full payload to apply tags. |
| AI summaries | Non-streaming (initial) | Short output, persisted alongside the item; user accepts/rejects before save. Could upgrade to streaming later. |
| Code explanation | **Streaming** | Can be long; live token stream improves perceived latency. |
| Prompt optimizer | **Streaming** | Same rationale; the rewrite is rendered in place for accept/reject. |

### 3.1 Streaming over the wire — Route Handler, not server action

Server actions in Next.js 16 cannot `yield` chunks to a client component; they return once. Use a **Route Handler** that returns a `Response` with a `ReadableStream`. Place under `app/api/ai/<feature>/route.ts` — this matches the folder layout in `context/project-overview.md` (`app/api/ai/`).

```ts
// app/api/ai/explain/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth/auth';
import { prisma } from '@/lib/prisma/prisma';
import { openai, AI_MODEL } from '@/lib/ai/openai';
import { checkRateLimit, createRateLimiter, RATE_LIMIT_CONFIGS } from '@/lib/auth/rateLimit/rateLimit';

export const runtime = 'nodejs'; // OpenAI SDK needs Node, not Edge

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPro: true },
  });
  if (!dbUser?.isPro) return new Response('Pro required', { status: 403 });

  const rl = createRateLimiter(RATE_LIMIT_CONFIGS.aiExplain);
  const res = await checkRateLimit(rl, session.user.id, RATE_LIMIT_CONFIGS.aiExplain, true);
  if (!res.success) return new Response('Too many requests', { status: 429, headers: { 'Retry-After': String(res.retryAfter ?? 60) } });

  const body = await req.json();
  const content = String(body.content ?? '').slice(0, 20_000);

  const stream = await openai.chat.completions.create({
    model: AI_MODEL,
    stream: true,
    temperature: 0.1,
    messages: [
      { role: 'system', content: 'Explain the following code for a developer. Use Markdown. Be concise; flag edge cases and pitfalls.' },
      { role: 'user', content },
    ],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content ?? '';
          if (delta) controller.enqueue(encoder.encode(delta));
        }
      } catch (e) {
        controller.enqueue(encoder.encode(`\n\n> Error: ${e instanceof Error ? e.message : 'stream failed'}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
    },
  });
}
```

### 3.2 Client consumption

```tsx
'use client';
const res = await fetch('/api/ai/explain', { method: 'POST', body: JSON.stringify({ content }), headers: { 'Content-Type': 'application/json' } });
const reader = res.body!.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  setExplanation(prev => prev + decoder.decode(value));
}
```

---

## 4. Error handling and rate limiting

### 4.1 Error categories and responses

| Category | Detection | Client UX |
| --- | --- | --- |
| Auth missing | `requireProUser()` returns `{ error }` | 401 / surface "Sign in" |
| Not Pro | `dbUser.isPro === false` | 403 / upsell card with "Upgrade to Pro" CTA |
| Input invalid | `safeParse` failure | Inline form error |
| Rate limited | `checkRateLimit` → `success: false` | Toast with `formatRetryAfter(res.retryAfter)` (functions exist in `rateLimit.ts:162`) |
| Provider error | OpenAI throws (`APIError`, `RateLimitError`, `BadRequestError`) | Toast "AI is busy — try again in a moment" |
| JSON parse failure (structured) | `JSON.parse(...)` throws | Fallback to `[]`/empty + log; never crash the action |
| Stream mid-flight failure | catch inside `ReadableStream.start` | Enqueue error marker; UI shows partial result + error line |

Wrap provider calls in `try/catch` and **never leak** provider error bodies to the client. Sanitize: `err instanceof Error ? err.message : 'AI request failed'` — but for provider errors, prefer a generic message in production and log full detail server-side.

### 4.2 Rate-limit configs

Extend `RATE_LIMIT_CONFIGS` in `lib/auth/rateLimit/rateLimit.ts` (do not duplicate the limiter infrastructure):

```ts
aiTags: { limit: 20, duration: 60 * 60 },      // 20/hour
aiSummary: { limit: 20, duration: 60 * 60 },
aiExplain: { limit: 30, duration: 60 * 60 },   // explanation streamed; allow a bit more
aiOptimize: { limit: 30, duration: 60 * 60 },
```

Keyed on `userId` (string). Use `failClosed: true` for all AI routes — they are expensive and we want to bound cost even if Upstash is unreachable (contrast: auth endpoints use fail-closed selectively — see `docs/audit-results/AUTH_SECURITY_REVIEW.md`).

### 4.3 Provider retry/timeout

```ts
const completion = await openai.chat.completions.create(
  { model: AI_MODEL, /* … */ },
  { timeout: 15_000, maxRetries: 2 },
);
```

Use `maxRetries: 2` (default is 2) for transient 5xx/network; do **not** retry on 4xx.

---

## 5. Pro user gating patterns

All four features are gated **Pro only** per `context/project-overview.md` §F and the monetization feature-comparison table (rows "AI Auto-tagging", "AI Code Explanation", "AI Prompt Optimizer").

Pattern (mirroring `actions/items/Items.ts:36-53`):

```ts
const dbUser = await prisma.user.findUnique({
  where: { id: userId },
  select: { isPro: true },
});
if (!dbUser?.isPro) {
  return { success: false, data: null, error: 'AI features require a Pro plan.' };
}
```

- **During development**: per project notes, all users may access all features before launch — gate behind an `ENABLE_AI_PRO_GATE` flag in `.env` (default `false` during dev, `true` pre-launch).
- **No usage table yet**: `lib/usage-limits.ts` is referenced by the research brief but does not exist; the existing gating lives in `lib/constants/limits.ts`. Treat the Pro check as the gate. A usage/credits table can be added later for per-feature quota without changing the gating shape.
- **Upsell UX**: when the action returns `success: false` with a Pro error, the client should open the existing Stripe checkout (`createCheckoutAction` in `actions/stripe/stripe.ts`).

---

## 6. Cost optimization strategies

| Leverage | How | Where |
| --- | --- | --- |
| Cheap model | Default to `deepseek-v4-flash` (or `gpt-4o-mini`-class) for all 4 features. Never the flagship model. | `lib/ai/openai.ts` `AI_MODEL` |
| Short outputs | `max_tokens` capped (tags: 200, summary: 400, explain/optimize: 1200) | each action |
| Low temperature | Tags 0.2, summary 0.3, explain 0.1, optimize 0.4 — deterministic enough to cache | per call |
| Input truncation | `content.slice(0, 20_000)` to bound tokens per request | server-side validation |
| Rate limits per user | Limits countdown to a budget cap | `RATE_LIMIT_CONFIGS.ai*` |
| Cache identical inputs | Hash `(model, prompt, content first 4KB)` → store result in a new `AiCache` table or Upstash. Reuse for 24h. | future enhancement |
| Dedupe tag requests | Only call AI when `item.updatedAt` changed since last suggestion | future; store `tagsAiSuggestedAt` |
| Lazy trigger | Generate on explicit button press, never on render | UI rules in §8 |
| Stream-cancel | User can abort a long explanation; backend closes the upstream stream | `AbortController` on fetch |

Estimated cost frame (illustrative, flash-tier pricing):

- Tags: ~250 input tokens + ~50 output tokens per call → cheapest feature.
- Summary: ~1k input + ~250 output.
- Explain: up to ~6k input + ~1k output (capped by `max_tokens`).
- Optimize: ~1.5k input + ~600 output.

At a typical flash price band, 1000 active Pro users × 20 calls/day ≈ tens of dollars/day — well within the $8/mo Pro margin.

---

## 7. UI patterns for AI features

Existing UI stack available: shadcn/ui, `sonner` (toasts), `react-markdown` + `remark-gfm`, `cmdk`, `@monaco-editor/react`, `lucide-react` icons (`Sparkles` for prompts is already mapped in `lib/constants.ts:8`).

### 7.1 Loading states

- **Skeleton/inline spinner**: shadcn `Skeleton` while awaiting tags/summary.
- **Streaming text**: render into a `react-markdown` block as tokens arrive. Disable "Accept" until the stream closes.
- **Button state**: while pending, show `Loader2` (lucide) spinning + disabled; prevent double submit.

### 7.2 Accept / reject suggestions

A small reusable component (do not hand-roll — use shadcn primitives):

```tsx
<ai-suggestions-panel>
  <ai-suggestions header="AI tags" items={tags} loading={isLoading}>
    {/* each chip: */}
    <Badge><Check/> {tag} <X/></Badge>  // X removes, Check toggles selected
  </ai-suggestions-panel>
  <Button variant="default" disabled={!hasChanges || streaming}>Apply</Button>
  <Button variant="ghost">Discard</Button>
</ai-suggestions-panel>
```

- **Tags**: chips rendered as `<Badge>`; click toggles inclusion. "Apply" writes the union (existing + accepted) via `updateItemAction`.
- **Summary**: rendered in a `<Card>` with `react-markdown`; two buttons — "Replace description" / "Append to description" / "Discard".
- **Explanation**: rendered read-only in a modal/drawer (`useDrawer` pattern already used for item edit per design doc) with streaming progress. "Insert as note item" optional.
- **Prompt optimizer**: side-by-side diff (Code Mirror Monaco in diff mode for the prompt text). "Use this version", "Keep original", "Regenerate".

### 7.3 Entry points

Feature surfaces (per the data model — items already support `snippet`, `prompt`, `note`, etc.):

- **Auto-tag**: item editor drawer → "Suggest tags" button (appear when `tags.length === 0` or after content edits).
- **Summary**: item editor drawer → "Generate summary" button for any text `contentType`.
- **Explain**: detail view of `snippet`/`command` items → "Explain" action.
- **Optimize**: detail view of `prompt` items → "Optimize prompt" action.

### 7.4 Error + empty states

- **Rate limited**: `sonner` toast `"Slow down — try again in N minutes"` using `formatRetryAfter` from `rateLimit.ts:162`.
- **Not Pro**: a centered empty-state card with `Sparkles` icon, message, and an "Upgrade to Pro" button wired to `createCheckoutAction`.
- **No content**: disabled button + tooltip "Add content first".
- **AI temporarily unavailable**: toast + benign blank suggestion panel (no crash on partial stream).

---

## 8. Security considerations

### 8.1 API key handling

- **Never** prefix `OPENAI_API_KEY` with `NEXT_PUBLIC_`. Server-only.
- Single source of truth: `lib/ai/openai.ts` (singleton). Do not import `openai` from client components.
- Rotate via the secrets vault, never commit to repo. `.env.example` is the only file in repo referencing the key name.
- Gate all routes behind NextAuth `auth()` (existing pattern, `actions/*`).

### 8.2 Input sanitization

- **Server-side truncation**: `content.slice(0, 20_000)` after zod parse. Reject `> 20_000` early to bound cost.
- **No user-controlled system prompt**: the system message is hardcoded in each action/route. User content only ever goes in the `user` role message. This prevents prompt-injection exfiltration of secrets or hidden instructions from changing model behavior at the system level.
- **Strip markdown exec vectors**: AI outputs are rendered via `react-markdown` (already in deps); do not pass raw AI text to `dangerouslySetInnerHTML`.
- **Tag normalization**: lowercase + `kebab-case` + length ≤ 24 chars before write; reject tags that look like code (`/` or `;` disallowed). Validate against `Tag` model uniqueness (`@unique` in `prisma/schema.prisma:158`).
- **Do not echo secrets**: if explanation content references environment variables, the model can only see the snippet the user provided — never server environment values. Confirm by never injecting server-side env vars into prompts.

### 8.3 Output validation

- Use OpenAI SDK `response_format: { type: 'json_schema', strict: true }` for tags (and any future structured feature) so the SDK guarantees shape. See `docs` snippet in §2.3 — strict mode rejects extra fields.
- Re-parse with a small zod schema on the result so a malicious provider response fails closed rather than poisoning state.
- For free-text streaming outputs (explain, optimize), rely on `react-markdown` sanitization; do not store untouched model output into privileged fields without escaping.

### 8.4 Abuse resilience

- **One rate limiter per feature** keyed on `userId` (§4.2).
- **Fail closed** for AI routes (`failClosed: true`) — unlike auth, AI calls cost money.
- **Concurrency cap**: optional `ai_concurrency` semaphore limiting global in-flight AI calls to (say) 5 per server instance to flatten cost spikes. Implement when usage grows.
- **Audit log**: future — append `(userId, feature, promptTokenCount, completionTokenCount, model)` to an `AiUsage` table for billing reconciliation and abuse forensics. Not blocking for v1.

### 8.5 Streaming-specific concerns

- Verify the `AbortController` signal on the client reaches the server so abandoned requests free server resources — pass `signal` into `openai.chat.completions.create({ ..., signal })` (the SDK forwards it to `fetch`).
- Do not enable caching headers on streaming responses (`Cache-Control: no-cache, no-transform` as shown).

---

## 9. Data model deltas (for later, not part of this research)

The tag model already exists (`prisma/schema.prisma:156`). AI features need no schema change for v1 except optionally:

```prisma
model AiUsage {
  id        String   @id @default(cuid())
  userId    String
  feature   String   // 'tags' | 'summary' | 'explain' | 'optimize'
  model     String
  promptTokens     Int
  completionTokens Int
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId, createdAt])
  @@map("ai_usages")
}
```

Adding a `tagsAiSuggestedAt DateTime?` on `Item` and `summaryAiGenerated Boolean @default(false)` enables avoiding repeat AI calls when content hasn't changed.

---

## 10. Prompt templates (v1)

### 10.1 Auto-tag (system, hard-coded)

> Propose up to 8 concise lowercase tags (1–3 words each, kebab-case) describing the following DevStash item. Do not include the programming language name. Return JSON: `{"tags":[...]}`.

### 10.2 Summary (system)

> Summarize the following item in 2–3 sentences for a developer's quick-scan library. Use Markdown. Highlight purpose and notable APIs/commands. Do not editorialize.

### 10.3 Explain (system)

> Explain the following code for a working developer. Use Markdown with fenced code blocks where helpful. Cover: what it does, key idioms, edge cases, pitfalls, and one suggested improvement. Be concise — 3–6 short sections.

### 10.4 Prompt optimizer (system)

> You are a prompt-engineering expert. Improve the user's prompt for clarity, specificity, and reliability with modern LLMs. Keep the user's intent. Output the rewritten prompt only (Markdown), followed by a "Changes:" bullet list explaining each edit.

### 10.5 Looming pitfalls to avoid in prompt construction

- Never interpolate user content into the system message (prompt-injection risk).
- Always place user content as a separate `user` role message.
- Cap user content via `slice` before interpolation in case zod length limits are bypassed upstream.

---

## 11. File layout (proposed)

```
lib/ai/
  openai.ts                  // singleton client + AI_MODEL
  prompts.ts                 // feature system-prompt constants
  schemas.ts                 // zod schemas for structured outputs
actions/ai/
  Ai.ts                      // suggestTagsAction, generateSummaryAction, optimizePromptAction
  _shared.ts                 // requireProUser, ActionResult<T>
  Ai.test.ts                 // vitest (see repo vitest.config.ts setup)
app/api/ai/
  explain/route.ts           // streaming
  optimize/route.ts          // streaming (alt: action)
components/ai/
  AiSuggestionsPanel.tsx     // accept/reject chips
  AiSummaryCard.tsx
  AiExplainDrawer.tsx        // streaming consumer
  AiOptimizeDiff.tsx
  ProUpsellCard.tsx          // upgrade CTA wrapper for non-Pro
```

AI component styling follows the dark-first, flat, tonal-layer system in `DESIGN.md` — no shadows, `ring-1 ring-foreground/10`, prompt-purple `#8b5cf6` accent for the AI affordance (lines 176/199 referenced).

---

## 12. Acceptance checklist (for implementation phase)

- [ ] `openai` added to `package.json` deps.
- [ ] `lib/ai/openai.ts` validates env via zod and exports the singleton.
- [ ] All four endpoints check Pro via `requireProUser` / inline `isPro` select.
- [ ] Rate-limit configs `aiTags`, `aiSummary`, `aiExplain`, `aiOptimize` added to `RATE_LIMIT_CONFIGS` with `failClosed: true`.
- [ ] Streaming routes set `runtime = 'nodejs'` and `Cache-Control: no-cache`.
- [ ] No `OPENAI_API_KEY` exposure client-side (no `NEXT_PUBLIC_`).
- [ ] Structured outputs use `response_format: { type: 'json_schema', strict: true }` + zod re-parse.
- [ ]-ui surfaces: skeleton/spinner, accept/reject, Pro upsell card, `sonner` toasts via `formatRetryAfter`.
- [ ] Markdown rendered with `react-markdown` + `remark-gfm` (already installed).
- [ ] `npm run lint` clean; `npm run build` passes.

---

## 13. Open questions for the implementer

1. Confirm the exact base URL / model identifier for "DeepSeek V4 Flash" on the OpenCode Go gateway — set via `OPENAI_BASE_URL` + `OPENAI_MODEL` (no code change needed).
2. Decide whether summaries live on `Item.description` directly (Pro feature) or a new persisted field; the schema currently has `description String? @db.Text` (`prisma/schema.prisma:89`) — sufficient for v1.
3. Choose between streaming Route Handlers vs server actions for the two text features post-v1 — both work; Route Handlers chosen here for streaming benefits.

---

## 14. Sources consulted

- Codebase: `actions/items/Items.ts`, `actions/collections/Collections.ts`, `actions/index.ts`, `actions/search.ts`, `lib/constants/limits.ts`, `lib/constants.ts`, `lib/auth/rateLimit/rateLimit.ts`, `prisma/schema.prisma`, `package.json`, `.env.example`, `context/project-overview.md`, `DESIGN.md`.
- OpenAI Node SDK structured outputs, streaming, and tool-calling patterns: developers.openai.com (via Context7) — streaming `delta.content` iteration, `response_format: { type: 'json_schema', strict: true }`, and `stream: true` with function/tool calls all confirmed against current docs.