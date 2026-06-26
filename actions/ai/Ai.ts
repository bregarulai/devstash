'use server';

import { openai, AI_MODEL } from '@/lib/ai/openai';
import {
  requireProUser,
  type ActionResult,
  MAX_TAG_SUGGESTIONS,
  MAX_CONTENT_CHARS,
} from './_shared';
import { autoTagsInputSchema, type AutoTagsInput, descriptionInputSchema, type DescriptionInput, explainCodeInputSchema, type ExplainCodeInput, optimizePromptInputSchema, type OptimizePromptInput } from '@/types/db';
import {
  checkRateLimit,
  createRateLimiter,
  RATE_LIMIT_CONFIGS,
  formatRetryAfter,
} from '@/lib/auth/rateLimit/rateLimit';
import { getItemExplanation, persistItemExplanation } from '@/lib/db/items/items';

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

const DESCRIPTION_INSTRUCTIONS =
  'You are a developer tool assistant. Write a concise description (1-3 sentences) summarizing the following DevStash item based on whatever fields are provided (title, content, language, URL, file name/size). Draw on the available information for this item type and handle minimal input gracefully. Do not use markdown, code fences, or bullet lists. Return only the description text.';

const MAX_DESCRIPTION_CHARS = 500;

function cleanDescription(raw: string): string {
  let text = raw.trim();
  const fenceMatch = text.match(/^```[a-zA-Z]*\n?([\s\S]*?)\n?```$/);
  if (fenceMatch) text = fenceMatch[1].trim();
  return text.slice(0, MAX_DESCRIPTION_CHARS);
}

function buildDescriptionUserMessage(data: DescriptionInput): string {
  const parts: string[] = [];
  const title = data.title?.trim();
  if (title) parts.push(`Title: ${title}`);
  const language = data.language?.trim();
  if (language) parts.push(`Language: ${language}`);
  const url = data.url?.trim();
  if (url) parts.push(`URL: ${url}`);
  const fileName = data.fileName?.trim();
  if (fileName) {
    parts.push(
      data.fileSize != null ? `File: ${fileName} (${data.fileSize} bytes)` : `File: ${fileName}`,
    );
  }
  const content = (data.content ?? '').trim();
  if (content) {
    parts.push(`Content:\n${content.slice(0, MAX_CONTENT_CHARS)}`);
  }
  return parts.join('\n');
}

export async function generateDescription(
  input: DescriptionInput,
): Promise<ActionResult<string>> {
  const user = await requireProUser();
  if ('error' in user) return { success: false, data: null, error: user.error };

  const result = descriptionInputSchema.safeParse(input);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? 'Invalid input';
    return { success: false, data: null, error: firstError };
  }

  const ratelimit = createRateLimiter(RATE_LIMIT_CONFIGS.aiDescription);
  const rl = await checkRateLimit(
    ratelimit,
    user.userId,
    RATE_LIMIT_CONFIGS.aiDescription,
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
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      temperature: 0.4,
      messages: [
        { role: 'system', content: DESCRIPTION_INSTRUCTIONS },
        { role: 'user', content: buildDescriptionUserMessage(result.data) },
      ],
    });

    const description = cleanDescription(completion.choices[0]?.message?.content ?? '');
    return { success: true, data: description, error: null };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'AI request failed',
    };
  }
}

const EXPLAIN_INSTRUCTIONS =
  'You are a developer tool assistant explaining code to another developer. Write a concise explanation (~200-300 words) of what the following code does and the key concepts it uses. Use markdown with short sections and bullet points where helpful. Do not repeat the code back. Do not use code fences unless showing a tiny inline snippet is essential.';

const MAX_EXPLANATION_CHARS = 2000;

function cleanExplanation(raw: string): string {
  let text = raw.trim();
  const fenceMatch = text.match(/^```[a-zA-Z]*\n?([\s\S]*?)\n?```$/);
  if (fenceMatch) text = fenceMatch[1].trim();
  return text.slice(0, MAX_EXPLANATION_CHARS);
}

function buildExplainUserMessage(data: ExplainCodeInput): string {
  const parts: string[] = [];
  const title = data.title?.trim();
  if (title) parts.push(`Title: ${title}`);
  const language = data.language?.trim();
  if (language) parts.push(`Language: ${language}`);
  parts.push(`Code:\n${data.content.slice(0, MAX_CONTENT_CHARS)}`);
  return parts.join('\n');
}

export async function explainCode(
  input: ExplainCodeInput,
): Promise<ActionResult<string>> {
  const user = await requireProUser();
  if ('error' in user) return { success: false, data: null, error: user.error };

  const result = explainCodeInputSchema.safeParse(input);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? 'Invalid input';
    return { success: false, data: null, error: firstError };
  }

  if (result.data.itemId && !result.data.forceRegenerate) {
    const cached = await getItemExplanation(result.data.itemId, user.userId);
    if (
      cached?.explanation &&
      cached.content === result.data.content &&
      (cached.language ?? null) === (result.data.language ?? null)
    ) {
      return { success: true, data: cached.explanation, error: null };
    }
  }

  const ratelimit = createRateLimiter(RATE_LIMIT_CONFIGS.aiExplain);
  const rl = await checkRateLimit(
    ratelimit,
    user.userId,
    RATE_LIMIT_CONFIGS.aiExplain,
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
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      temperature: 0.3,
      messages: [
        { role: 'system', content: EXPLAIN_INSTRUCTIONS },
        { role: 'user', content: buildExplainUserMessage(result.data) },
      ],
    });

    const explanation = cleanExplanation(completion.choices[0]?.message?.content ?? '');

    if (result.data.itemId) {
      await persistItemExplanation(result.data.itemId, user.userId, explanation, AI_MODEL);
    }

    return { success: true, data: explanation, error: null };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'AI request failed',
    };
  }
}

const OPTIMIZE_INSTRUCTIONS =
  'You are a developer tool assistant helping a developer refine prompts they save in their stash. Given the current prompt (and title if any), return an improved, clearer, more effective version. Preserve the author\'s intent, variables/placeholders, and constraints. Tighten wording, fix ambiguity, improve structure, and add brief context only where it materially helps. If the prompt is already well-structured, return it largely unchanged or with only minor clarity tweaks — do not over-engineer or invent new requirements. Return ONLY the optimized prompt text, no preamble, no markdown code fences, no commentary.';

const MAX_OPTIMIZED_CHARS = 4000;

function cleanOptimizedPrompt(raw: string, original: string): string {
  let text = raw.trim();
  const fenceMatch = text.match(/^```[a-zA-Z]*\n?([\s\S]*?)\n?```$/);
  if (fenceMatch) text = fenceMatch[1].trim();
  if (!text) return original.trim();
  return text.slice(0, MAX_OPTIMIZED_CHARS);
}

function buildOptimizeUserMessage(data: OptimizePromptInput): string {
  const parts: string[] = [];
  const title = data.title?.trim();
  if (title) parts.push(`Title: ${title}`);
  parts.push(`Prompt:\n${data.content.slice(0, MAX_CONTENT_CHARS)}`);
  return parts.join('\n');
}

export async function optimizePrompt(
  input: OptimizePromptInput,
): Promise<ActionResult<string>> {
  const user = await requireProUser();
  if ('error' in user) return { success: false, data: null, error: user.error };

  const result = optimizePromptInputSchema.safeParse(input);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? 'Invalid input';
    return { success: false, data: null, error: firstError };
  }

  const ratelimit = createRateLimiter(RATE_LIMIT_CONFIGS.aiOptimize);
  const rl = await checkRateLimit(
    ratelimit,
    user.userId,
    RATE_LIMIT_CONFIGS.aiOptimize,
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
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      temperature: 0.3,
      messages: [
        { role: 'system', content: OPTIMIZE_INSTRUCTIONS },
        { role: 'user', content: buildOptimizeUserMessage(result.data) },
      ],
    });

    const optimized = cleanOptimizedPrompt(
      completion.choices[0]?.message?.content ?? '',
      result.data.content,
    );
    return { success: true, data: optimized, error: null };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'AI request failed',
    };
  }
}