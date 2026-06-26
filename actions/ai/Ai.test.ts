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
  RATE_LIMIT_CONFIGS: { aiTags: { limit: 20, duration: 3600 } },
  formatRetryAfter: (s: number) => `${s}s`,
}));

describe('generateAutoTags', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrismaUserFindUnique.mockResolvedValue({ isPro: true });
    mockCheckRateLimit.mockResolvedValue({
      success: true,
      remaining: 19,
      limit: 20,
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
      limit: 20,
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