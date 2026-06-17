import { describe, it, expect } from 'vitest';
import {
  sanitizeFilename,
  isAscii,
  encodeRfc5987,
  buildContentDispositionHeader,
} from './sanitize-filename';

describe('sanitizeFilename', () => {
  it('removes path traversal sequences', () => {
    expect(sanitizeFilename('../../etc/passwd')).toBe('etc/passwd');
    expect(sanitizeFilename('../../../secret.txt')).toBe('secret.txt');
    expect(sanitizeFilename('..\\..\\windows\\system32')).toBe('windowssystem32');
  });

  it('removes control characters', () => {
    expect(sanitizeFilename('file\x00name')).toBe('filename');
    expect(sanitizeFilename('file\x01name')).toBe('filename');
    expect(sanitizeFilename('file\x1fname')).toBe('filename');
    expect(sanitizeFilename('file\x7fname')).toBe('filename');
  });

  it('removes double quotes', () => {
    expect(sanitizeFilename('file"name')).toBe('filename');
    expect(sanitizeFilename('"filename"')).toBe('filename');
  });

  it('removes backslashes', () => {
    expect(sanitizeFilename('file\\name')).toBe('filename');
  });

  it('removes newlines', () => {
    expect(sanitizeFilename('file\r\nname')).toBe('filename');
    expect(sanitizeFilename('file\nname')).toBe('filename');
    expect(sanitizeFilename('file\rname')).toBe('filename');
  });

  it('removes null bytes', () => {
    expect(sanitizeFilename('file\0name')).toBe('filename');
  });

  it('trims whitespace', () => {
    expect(sanitizeFilename('  filename  ')).toBe('filename');
  });

  it('returns "download" for empty input', () => {
    expect(sanitizeFilename('')).toBe('download');
  });

  it('returns "download" for dangerous-only input', () => {
    expect(sanitizeFilename('\x00\x01\x02')).toBe('download');
    expect(sanitizeFilename('../../')).toBe('download');
    expect(sanitizeFilename('""')).toBe('download');
  });

  it('preserves safe characters', () => {
    expect(sanitizeFilename('my-file_v2.txt')).toBe('my-file_v2.txt');
    expect(sanitizeFilename('image (1).png')).toBe('image (1).png');
  });
});

describe('isAscii', () => {
  it('returns true for ASCII strings', () => {
    expect(isAscii('hello')).toBe(true);
    expect(isAscii('file.txt')).toBe(true);
    expect(isAscii('ABC123')).toBe(true);
  });

  it('returns false for non-ASCII strings', () => {
    expect(isAscii('文件.txt')).toBe(false);
    expect(isAscii('café')).toBe(false);
    expect(isAscii('日本語')).toBe(false);
  });
});

describe('encodeRfc5987', () => {
  it('encodes non-ASCII characters', () => {
    expect(encodeRfc5987('文件.txt')).toBe("UTF-8''%E6%96%87%E4%BB%B6.txt");
    expect(encodeRfc5987('café')).toBe("UTF-8''caf%C3%A9");
  });

  it('preserves safe ASCII characters', () => {
    expect(encodeRfc5987('hello')).toBe("UTF-8''hello");
    expect(encodeRfc5987('file-name_v2.txt')).toBe("UTF-8''file-name_v2.txt");
  });
});

describe('buildContentDispositionHeader', () => {
  it('returns simple header for ASCII filenames', () => {
    expect(buildContentDispositionHeader('test.txt')).toBe(
      'attachment; filename="test.txt"',
    );
  });

  it('sanitizes double quotes in ASCII filenames', () => {
    expect(buildContentDispositionHeader('file"name')).toBe(
      'attachment; filename="filename"',
    );
  });

  it('returns RFC 5987 header for non-ASCII filenames', () => {
    const header = buildContentDispositionHeader('文件.txt');
    expect(header).toContain('filename="');
    expect(header).toContain('filename*=UTF-8\'\'%E6%96%87%E4%BB%B6.txt');
  });

  it('sanitizes dangerous input before building header', () => {
    expect(buildContentDispositionHeader('../../etc/passwd')).toBe(
      'attachment; filename="etc/passwd"',
    );
  });

  it('uses fallback for empty dangerous input', () => {
    expect(buildContentDispositionHeader('\x00\x01')).toBe(
      'attachment; filename="download"',
    );
  });

  it('sanitizes and escapes complex injection attempts', () => {
    const malicious = 'test"; malicious="true';
    expect(buildContentDispositionHeader(malicious)).toBe(
      'attachment; filename="test; malicious=true"',
    );
  });
});
