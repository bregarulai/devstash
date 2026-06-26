import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAuth = vi.fn();
const mockPrismaUserFindUnique = vi.fn();
const mockChatCompletionsCreate = vi.fn();
const mockCheckRateLimit = vi.fn();

vi.mock('@/lib/auth/auth/auth', () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}));

vi.mock('@/lib/prisma/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockPrismaUserFindUnique(...args),
    },
  },
}));

vi.mock('@/lib/ai/openai', () => ({
  openai: {
    chat: {
      completions: {
        create: (...args: unknown[]) => mockChatCompletionsCreate(...args),
      },
    },
  },
  AI_MODEL: 'deepseek-v4-flash',
}));

vi.mock('@/lib/auth/rateLimit/rateLimit', () => ({
  createRateLimiter: vi.fn(() => ({})),
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
  RATE_LIMIT_CONFIGS: { aiTags: { limit: 15, duration: 3600 }, aiDescription: { limit: 10, duration: 3600 }, aiExplain: { limit: 10, duration: 3600 } },
  formatRetryAfter: (s: number) => `${s}s`,
}));

const mockGetItemExplanation = vi.fn();
const mockPersistItemExplanation = vi.fn();

vi.mock('@/lib/db/items/items', () => ({
  getItemExplanation: (...args: unknown[]) => mockGetItemExplanation(...args),
  persistItemExplanation: (...args: unknown[]) => mockPersistItemExplanation(...args),
}));

describe('generateAutoTags', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrismaUserFindUnique.mockResolvedValue({ isPro: true });
    mockCheckRateLimit.mockResolvedValue({
      success: true,
      remaining: 14,
      limit: 15,
      reset: Date.now() + 3600_000,
    });
  });

  it('returns error when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const { generateAutoTags } = await import('./Ai');
    const result = await generateAutoTags({
      title: 'Test',
      content: 'code',
    });

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Unauthorized',
    });
  });

  it('returns error when user is not Pro', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrismaUserFindUnique.mockResolvedValue({ isPro: false });

    const { generateAutoTags } = await import('./Ai');
    const result = await generateAutoTags({
      title: 'Test',
      content: 'code',
    });

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'AI features require a Pro plan.',
    });
  });

  it('returns validation error when neither title nor content provided', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });

    const { generateAutoTags } = await import('./Ai');
    const result = await generateAutoTags({
      title: '',
      content: '',
    });

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Title or content is required',
    });
  });

  it('generates tags from content alone when title is empty', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockChatCompletionsCreate.mockResolvedValue({
      choices: [{ message: { content: '{"tags": ["algorithm", "sorting"]}' } }],
    });

    const { generateAutoTags } = await import('./Ai');
    const result = await generateAutoTags({
      title: '',
      content: 'function quickSort(arr) { /* ... */ }',
      language: 'typescript',
    });

    expect(result).toEqual({
      success: true,
      data: ['algorithm', 'sorting'],
      error: null,
    });
    expect(mockChatCompletionsCreate).toHaveBeenCalled();
  });

  it('generates tags from title alone when content is empty', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockChatCompletionsCreate.mockResolvedValue({
      choices: [{ message: { content: '{"tags": ["react", "hooks"]}' } }],
    });

    const { generateAutoTags } = await import('./Ai');
    const result = await generateAutoTags({
      title: 'React useEffect Hook',
      content: '',
    });

    expect(result).toEqual({
      success: true,
      data: ['react', 'hooks'],
      error: null,
    });
    expect(mockChatCompletionsCreate).toHaveBeenCalled();
  });

  it('returns rate limit error when limited', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockCheckRateLimit.mockResolvedValue({
      success: false,
      remaining: 0,
      limit: 15,
      reset: Date.now() + 3600_000,
      retryAfter: 3600,
    });

    const { generateAutoTags } = await import('./Ai');
    const result = await generateAutoTags({
      title: 'Test',
      content: 'code',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Retry in');
    expect(mockChatCompletionsCreate).not.toHaveBeenCalled();
  });

  it('parses {"tags": [...]} response format and lowercases', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockChatCompletionsCreate.mockResolvedValue({
      choices: [{ message: { content: '{"tags": ["React", "USE-State", "Hook"]}' } }],
    });

    const { generateAutoTags } = await import('./Ai');
    const result = await generateAutoTags({
      title: 'React Hook',
      content: 'const [x, setX] = useState(0)',
      language: 'tsx',
    });

    expect(result).toEqual({
      success: true,
      data: ['react', 'use-state', 'hook'],
      error: null,
    });
  });

  it('parses [...] response format', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockChatCompletionsCreate.mockResolvedValue({
      choices: [{ message: { content: '["CSS", "Flexbox"]' } }],
    });

    const { generateAutoTags } = await import('./Ai');
    const result = await generateAutoTags({
      title: 'Flexbox',
      content: 'display: flex',
    });

    expect(result).toEqual({
      success: true,
      data: ['css', 'flexbox'],
      error: null,
    });
  });

  it('returns empty array when JSON parse fails', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockChatCompletionsCreate.mockResolvedValue({ choices: [{ message: { content: 'not valid json' } }] });

    const { generateAutoTags } = await import('./Ai');
    const result = await generateAutoTags({
      title: 'Test',
      content: 'code',
    });

    expect(result).toEqual({
      success: true,
      data: [],
      error: null,
    });
  });

  it('rejects tags with disallowed characters', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockChatCompletionsCreate.mockResolvedValue({
      choices: [{ message: { content: '{"tags": ["good", "bad/tag", "evil;tag"]}' } }],
    });

    const { generateAutoTags } = await import('./Ai');
    const result = await generateAutoTags({
      title: 'Test',
      content: 'code',
    });

    expect(result).toEqual({
      success: true,
      data: ['good'],
      error: null,
    });
  });

  it('limits to 5 tags', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockChatCompletionsCreate.mockResolvedValue({
      choices: [{ message: { content: '{"tags": ["a","b","c","d","e","f","g"]}' } }],
    });

    const { generateAutoTags } = await import('./Ai');
    const result = await generateAutoTags({
      title: 'Test',
      content: 'code',
    });

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(5);
  });

  it('truncates content to 2000 chars before API call', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockChatCompletionsCreate.mockResolvedValue({ choices: [{ message: { content: '{"tags": []}' } }] });

    const { generateAutoTags } = await import('./Ai');
    await generateAutoTags({
      title: 'Test',
      content: 'x'.repeat(5000),
    });

    const callArgs = mockChatCompletionsCreate.mock.calls[0][0];
    const userContent = callArgs.messages[1].content;
    const inputContent = userContent.split('Content:\n')[1];
    expect(inputContent.length).toBe(2000);
  });

  it('returns error when OpenAI throws', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockChatCompletionsCreate.mockRejectedValue(new Error('AI service unavailable'));

    const { generateAutoTags } = await import('./Ai');
    const result = await generateAutoTags({
      title: 'Test',
      content: 'code',
    });

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'AI service unavailable',
    });
  });

  it('returns generic error for non-Error exceptions', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockChatCompletionsCreate.mockRejectedValue('unknown failure');

    const { generateAutoTags } = await import('./Ai');
    const result = await generateAutoTags({
      title: 'Test',
      content: 'code',
    });

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'AI request failed',
    });
  });
});

describe('generateDescription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrismaUserFindUnique.mockResolvedValue({ isPro: true });
    mockCheckRateLimit.mockResolvedValue({
      success: true,
      remaining: 9,
      limit: 10,
      reset: Date.now() + 3600_000,
    });
  });

  it('returns error when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const { generateDescription } = await import('./Ai');
    const result = await generateDescription({ title: 'Test', content: 'code' });

    expect(result).toEqual({ success: false, data: null, error: 'Unauthorized' });
  });

  it('returns error when user is not Pro', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrismaUserFindUnique.mockResolvedValue({ isPro: false });

    const { generateDescription } = await import('./Ai');
    const result = await generateDescription({ title: 'Test', content: 'code' });

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'AI features require a Pro plan.',
    });
  });

  it('returns validation error when no fields provided', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });

    const { generateDescription } = await import('./Ai');
    const result = await generateDescription({ title: '', content: '' });

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Title, content, URL, or file is required',
    });
  });

  it('returns validation error when only whitespace fields provided', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });

    const { generateDescription } = await import('./Ai');
    const result = await generateDescription({ title: '   ', url: '   ' });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Title, content, URL, or file is required');
  });

  it('generates description from content alone when title is empty', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockChatCompletionsCreate.mockResolvedValue({
      choices: [{ message: { content: 'A quick sort implementation in TypeScript.' } }],
    });

    const { generateDescription } = await import('./Ai');
    const result = await generateDescription({
      title: '',
      content: 'function quickSort(arr) { /* ... */ }',
      language: 'typescript',
    });

    expect(result).toEqual({
      success: true,
      data: 'A quick sort implementation in TypeScript.',
      error: null,
    });
    expect(mockChatCompletionsCreate).toHaveBeenCalled();
  });

  it('generates description from title alone when content is empty', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockChatCompletionsCreate.mockResolvedValue({
      choices: [{ message: { content: 'A React useEffect hook reference.' } }],
    });

    const { generateDescription } = await import('./Ai');
    const result = await generateDescription({ title: 'React useEffect Hook', content: '' });

    expect(result).toEqual({
      success: true,
      data: 'A React useEffect hook reference.',
      error: null,
    });
  });

  it('generates description from url for link type', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockChatCompletionsCreate.mockResolvedValue({
      choices: [{ message: { content: 'A link to the Next.js documentation site.' } }],
    });

    const { generateDescription } = await import('./Ai');
    const result = await generateDescription({ title: 'Next.js Docs', url: 'https://nextjs.org/docs' });

    expect(result.success).toBe(true);
    expect(result.data).toBe('A link to the Next.js documentation site.');
    const callArgs = mockChatCompletionsCreate.mock.calls[0][0];
    expect(callArgs.messages[1].content).toContain('URL: https://nextjs.org/docs');
  });

  it('generates description from fileName and fileSize for file type', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockChatCompletionsCreate.mockResolvedValue({
      choices: [{ message: { content: 'A 1024-byte PDF report.' } }],
    });

    const { generateDescription } = await import('./Ai');
    const result = await generateDescription({ fileName: 'report.pdf', fileSize: 1024 });

    expect(result.success).toBe(true);
    expect(result.data).toBe('A 1024-byte PDF report.');
    const callArgs = mockChatCompletionsCreate.mock.calls[0][0];
    expect(callArgs.messages[1].content).toContain('File: report.pdf (1024 bytes)');
  });

  it('returns rate limit error when limited', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockCheckRateLimit.mockResolvedValue({
      success: false,
      remaining: 0,
      limit: 10,
      reset: Date.now() + 3600_000,
      retryAfter: 3600,
    });

    const { generateDescription } = await import('./Ai');
    const result = await generateDescription({ title: 'Test', content: 'code' });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Retry in');
    expect(mockChatCompletionsCreate).not.toHaveBeenCalled();
  });

  it('strips markdown code fences from response', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockChatCompletionsCreate.mockResolvedValue({
      choices: [{ message: { content: '```text\nA fenced description.\n```' } }],
    });

    const { generateDescription } = await import('./Ai');
    const result = await generateDescription({ title: 'Test', content: 'code' });

    expect(result).toEqual({ success: true, data: 'A fenced description.', error: null });
  });

  it('truncates content to 2000 chars before API call', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockChatCompletionsCreate.mockResolvedValue({
      choices: [{ message: { content: 'desc' } }],
    });

    const { generateDescription } = await import('./Ai');
    await generateDescription({ title: 'Test', content: 'x'.repeat(5000) });

    const callArgs = mockChatCompletionsCreate.mock.calls[0][0];
    const userContent = callArgs.messages[1].content;
    const inputContent = userContent.split('Content:\n')[1];
    expect(inputContent.length).toBe(2000);
  });

  it('clamps description to 500 chars', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    const longDescription = 'a'.repeat(800);
    mockChatCompletionsCreate.mockResolvedValue({
      choices: [{ message: { content: longDescription } }],
    });

    const { generateDescription } = await import('./Ai');
    const result = await generateDescription({ title: 'Test', content: 'code' });

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(500);
  });

  it('returns success with empty string when model returns whitespace', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockChatCompletionsCreate.mockResolvedValue({
      choices: [{ message: { content: '   \n  ' } }],
    });

    const { generateDescription } = await import('./Ai');
    const result = await generateDescription({ title: 'Test', content: 'code' });

    expect(result).toEqual({ success: true, data: '', error: null });
  });

  it('returns error when OpenAI throws', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockChatCompletionsCreate.mockRejectedValue(new Error('AI service unavailable'));

    const { generateDescription } = await import('./Ai');
    const result = await generateDescription({ title: 'Test', content: 'code' });

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'AI service unavailable',
    });
  });

  it('returns generic error for non-Error exceptions', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockChatCompletionsCreate.mockRejectedValue('unknown failure');

    const { generateDescription } = await import('./Ai');
    const result = await generateDescription({ title: 'Test', content: 'code' });

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'AI request failed',
    });
  });
});

describe('explainCode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrismaUserFindUnique.mockResolvedValue({ isPro: true });
    mockCheckRateLimit.mockResolvedValue({
      success: true,
      remaining: 9,
      limit: 10,
      reset: Date.now() + 3600_000,
    });
  });

  it('returns error when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const { explainCode } = await import('./Ai');
    const result = await explainCode({ content: 'code' });

    expect(result).toEqual({ success: false, data: null, error: 'Unauthorized' });
  });

  it('returns error when user is not Pro', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockPrismaUserFindUnique.mockResolvedValue({ isPro: false });

    const { explainCode } = await import('./Ai');
    const result = await explainCode({ content: 'code' });

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'AI features require a Pro plan.',
    });
  });

  it('returns validation error when content is empty', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });

    const { explainCode } = await import('./Ai');
    const result = await explainCode({ content: '' });

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Content is required',
    });
  });

  it('generates explanation from content and language', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockChatCompletionsCreate.mockResolvedValue({
      choices: [{ message: { content: 'A quick sort implementation.' } }],
    });

    const { explainCode } = await import('./Ai');
    const result = await explainCode({
      title: 'Quicksort',
      content: 'function quickSort(arr) { /* ... */ }',
      language: 'typescript',
    });

    expect(result).toEqual({
      success: true,
      data: 'A quick sort implementation.',
      error: null,
    });
    const callArgs = mockChatCompletionsCreate.mock.calls[0][0];
    expect(callArgs.messages[1].content).toContain('Title: Quicksort');
    expect(callArgs.messages[1].content).toContain('Language: typescript');
    expect(callArgs.messages[1].content).toContain('Code:\n');
  });

  it('omits title/language lines when not provided', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockChatCompletionsCreate.mockResolvedValue({
      choices: [{ message: { content: 'explain' } }],
    });

    const { explainCode } = await import('./Ai');
    await explainCode({ content: 'ls -la' });

    const callArgs = mockChatCompletionsCreate.mock.calls[0][0];
    expect(callArgs.messages[1].content).not.toContain('Title:');
    expect(callArgs.messages[1].content).not.toContain('Language:');
    expect(callArgs.messages[1].content).toContain('Code:\nls -la');
  });

  it('returns rate limit error when limited', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockCheckRateLimit.mockResolvedValue({
      success: false,
      remaining: 0,
      limit: 10,
      reset: Date.now() + 3600_000,
      retryAfter: 3600,
    });

    const { explainCode } = await import('./Ai');
    const result = await explainCode({ content: 'code' });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Retry in');
    expect(mockChatCompletionsCreate).not.toHaveBeenCalled();
  });

  it('strips markdown code fences from response', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockChatCompletionsCreate.mockResolvedValue({
      choices: [{ message: { content: '```markdown\nSorted explanation.\n```' } }],
    });

    const { explainCode } = await import('./Ai');
    const result = await explainCode({ content: 'code' });

    expect(result).toEqual({ success: true, data: 'Sorted explanation.', error: null });
  });

  it('truncates content to 2000 chars before API call', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockChatCompletionsCreate.mockResolvedValue({
      choices: [{ message: { content: 'explain' } }],
    });

    const { explainCode } = await import('./Ai');
    await explainCode({ content: 'x'.repeat(5000) });

    const callArgs = mockChatCompletionsCreate.mock.calls[0][0];
    const inputContent = callArgs.messages[1].content.split('Code:\n')[1];
    expect(inputContent.length).toBe(2000);
  });

  it('clamps explanation to 2000 chars', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    const longExplanation = 'a'.repeat(3000);
    mockChatCompletionsCreate.mockResolvedValue({
      choices: [{ message: { content: longExplanation } }],
    });

    const { explainCode } = await import('./Ai');
    const result = await explainCode({ content: 'code' });

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2000);
  });

  it('returns error when OpenAI throws', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockChatCompletionsCreate.mockRejectedValue(new Error('AI service unavailable'));

    const { explainCode } = await import('./Ai');
    const result = await explainCode({ content: 'code' });

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'AI service unavailable',
    });
  });

  it('returns generic error for non-Error exceptions', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockChatCompletionsCreate.mockRejectedValue('unknown failure');

    const { explainCode } = await import('./Ai');
    const result = await explainCode({ content: 'code' });

    expect(result).toEqual({
      success: false,
      data: null,
      error: 'AI request failed',
    });
  });

  it('returns cached explanation when itemId provided and content matches', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockGetItemExplanation.mockResolvedValue({
      explanation: 'Cached explanation.',
      explanationUpdatedAt: new Date(),
      explanationModel: 'deepseek-v4-flash',
      content: 'code',
      language: 'typescript',
    });

    const { explainCode } = await import('./Ai');
    const result = await explainCode({
      itemId: 'item-1',
      content: 'code',
      language: 'typescript',
    });

    expect(result).toEqual({
      success: true,
      data: 'Cached explanation.',
      error: null,
    });
    expect(mockChatCompletionsCreate).not.toHaveBeenCalled();
    expect(mockPersistItemExplanation).not.toHaveBeenCalled();
  });

  it('regenerates and persists when forceRegenerate is true', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockGetItemExplanation.mockResolvedValue({
      explanation: 'Old explanation.',
      explanationUpdatedAt: new Date(),
      explanationModel: 'deepseek-v4-flash',
      content: 'code',
      language: 'typescript',
    });
    mockChatCompletionsCreate.mockResolvedValue({
      choices: [{ message: { content: 'New explanation.' } }],
    });
    mockPersistItemExplanation.mockResolvedValue(undefined);

    const { explainCode } = await import('./Ai');
    const result = await explainCode({
      itemId: 'item-1',
      content: 'code',
      language: 'typescript',
      forceRegenerate: true,
    });

    expect(result).toEqual({
      success: true,
      data: 'New explanation.',
      error: null,
    });
    expect(mockChatCompletionsCreate).toHaveBeenCalled();
    expect(mockPersistItemExplanation).toHaveBeenCalledWith(
      'item-1',
      'user-1',
      'New explanation.',
      'deepseek-v4-flash',
    );
  });

  it('persists explanation after generation when itemId provided', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockGetItemExplanation.mockResolvedValue(null);
    mockChatCompletionsCreate.mockResolvedValue({
      choices: [{ message: { content: 'Fresh explanation.' } }],
    });
    mockPersistItemExplanation.mockResolvedValue(undefined);

    const { explainCode } = await import('./Ai');
    const result = await explainCode({
      itemId: 'item-1',
      content: 'code',
      language: 'typescript',
    });

    expect(result).toEqual({
      success: true,
      data: 'Fresh explanation.',
      error: null,
    });
    expect(mockChatCompletionsCreate).toHaveBeenCalled();
    expect(mockPersistItemExplanation).toHaveBeenCalledWith(
      'item-1',
      'user-1',
      'Fresh explanation.',
      'deepseek-v4-flash',
    );
  });

  it('does not return cache when stored content differs', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockGetItemExplanation.mockResolvedValue({
      explanation: 'Stale explanation.',
      explanationUpdatedAt: new Date(),
      explanationModel: 'deepseek-v4-flash',
      content: 'old code',
      language: 'typescript',
    });
    mockChatCompletionsCreate.mockResolvedValue({
      choices: [{ message: { content: 'Fresh explanation.' } }],
    });
    mockPersistItemExplanation.mockResolvedValue(undefined);

    const { explainCode } = await import('./Ai');
    const result = await explainCode({
      itemId: 'item-1',
      content: 'new code',
      language: 'typescript',
    });

    expect(result).toEqual({
      success: true,
      data: 'Fresh explanation.',
      error: null,
    });
    expect(mockChatCompletionsCreate).toHaveBeenCalled();
  });

  it('does not return cache when stored language differs', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } });
    mockGetItemExplanation.mockResolvedValue({
      explanation: 'Stale explanation.',
      explanationUpdatedAt: new Date(),
      explanationModel: 'deepseek-v4-flash',
      content: 'code',
      language: 'javascript',
    });
    mockChatCompletionsCreate.mockResolvedValue({
      choices: [{ message: { content: 'Fresh explanation.' } }],
    });
    mockPersistItemExplanation.mockResolvedValue(undefined);

    const { explainCode } = await import('./Ai');
    const result = await explainCode({
      itemId: 'item-1',
      content: 'code',
      language: 'typescript',
    });

    expect(result).toEqual({
      success: true,
      data: 'Fresh explanation.',
      error: null,
    });
    expect(mockChatCompletionsCreate).toHaveBeenCalled();
  });
});
