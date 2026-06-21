import { describe, it, expect } from 'vitest';
import { FREE_TIER_LIMITS, PRO_ONLY_ITEM_TYPES, isProOnlyItemType } from './limits';

describe('FREE_TIER_LIMITS', () => {
  it('limits items to 50', () => {
    expect(FREE_TIER_LIMITS.maxItems).toBe(50);
  });

  it('limits collections to 3', () => {
    expect(FREE_TIER_LIMITS.maxCollections).toBe(3);
  });
});

describe('PRO_ONLY_ITEM_TYPES', () => {
  it('contains exactly file and image', () => {
    expect(PRO_ONLY_ITEM_TYPES).toEqual(['file', 'image']);
  });

  it.each(['snippet', 'prompt', 'command', 'note', 'link'])(
    'does not contain %s',
    (type) => {
      expect(PRO_ONLY_ITEM_TYPES as readonly string[]).not.toContain(type);
    },
  );
});

describe('isProOnlyItemType', () => {
  it.each(['file', 'image'])('returns true for %s', (type) => {
    expect(isProOnlyItemType(type)).toBe(true);
  });

  it.each(['snippet', 'prompt', 'command', 'note', 'link'])(
    'returns false for %s',
    (type) => {
      expect(isProOnlyItemType(type)).toBe(false);
    },
  );

  it('returns false for empty string', () => {
    expect(isProOnlyItemType('')).toBe(false);
  });

  it('returns false for unknown type', () => {
    expect(isProOnlyItemType('custom')).toBe(false);
  });

  it('is case-sensitive', () => {
    expect(isProOnlyItemType('File')).toBe(false);
    expect(isProOnlyItemType('IMAGE')).toBe(false);
  });
});
