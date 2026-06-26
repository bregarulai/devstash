'use server';

import { openai, AI_MODEL } from '@/lib/ai/openai';
import {
  requireProUser,
  type ActionResult,
  MAX_TAG_SUGGESTIONS,
  MAX_CONTENT_CHARS,
} from './_shared';
import { autoTagsInputSchema, type AutoTagsInput } from '@/types/db';
import {
  checkRateLimit,
  createRateLimiter,
  RATE_LIMIT_CONFIGS,
  formatRetryAfter,
} from '@/lib/auth/rateLimit/rateLimit';

const SYSTEM_INSTRUCTIONS =
  'You are a developer tool assistant. Propose up to 5 concise lowercase tags (1-3 words each, kebab-case) describing the following DevStash item based on its title and content. Do not include the programming language name. Return JSON: {"tags": ["..."]}';

function parseTags(raw: string): string[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  let tags: unknown[] = [];
  if (Array.isArray(parsed)) {
    tags = parsed;
  } else if (
    parsed &&
    typeof parsed === 'object' &&
    Array.isArray((parsed as { tags?: unknown }).tags)
  ) {
    tags = (parsed as { tags: unknown[] }).tags;
  } else {
    return [];
  }

  return tags
    .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => !/[\/;:]/.test(t))
    .slice(0, MAX_TAG_SUGGESTIONS);
}

export async function generateAutoTags(
  input: AutoTagsInput,
): Promise<ActionResult<string[]>> {
  const user = await requireProUser();
  if ('error' in user) return { success: false, data: null, error: user.error };

  const result = autoTagsInputSchema.safeParse(input);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? 'Invalid input';
    return { success: false, data: null, error: firstError };
  }

  const ratelimit = createRateLimiter(RATE_LIMIT_CONFIGS.aiTags);
  const rl = await checkRateLimit(
    ratelimit,
    user.userId,
    RATE_LIMIT_CONFIGS.aiTags,
    true,
  );
  if (!rl.success) {
    return {
      success: false,
      data: null,
      error: `Too many requests. Retry in ${formatRetryAfter(rl.retryAfter ?? 0)}.`,
    };
  }

  try {
    const title = result.data.title?.trim() || '(none)';
    const truncatedContent = (result.data.content ?? '').slice(0, MAX_CONTENT_CHARS);
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTIONS },
        {
          role: 'user',
          content: `Title: ${title}\nLanguage: ${result.data.language ?? 'n/a'}\nContent:\n${truncatedContent}`,
        },
      ],
    });

    const tags = parseTags(completion.choices[0]?.message?.content ?? '');
    return { success: true, data: tags, error: null };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'AI request failed',
    };
  }
}