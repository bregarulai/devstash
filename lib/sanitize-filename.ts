const CONTROL_CHARS_REGEX = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g;
const PATH_TRAVERSAL_REGEX = /\.\.[\/\\]/g;
const DANGEROUS_CHARS_REGEX = /["\\]/g;

export function sanitizeFilename(filename: string): string {
  let sanitized = filename;

  sanitized = sanitized.replace(PATH_TRAVERSAL_REGEX, '');
  sanitized = sanitized.replace(CONTROL_CHARS_REGEX, '');
  sanitized = sanitized.replace(DANGEROUS_CHARS_REGEX, '');
  sanitized = sanitized.replace(/\r\n?|\n/g, '');
  sanitized = sanitized.replace(/\0/g, '');

  sanitized = sanitized.trim();

  if (!sanitized) {
    return 'download';
  }

  return sanitized;
}

export function isAscii(str: string): boolean {
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 127) {
      return false;
    }
  }
  return true;
}

export function encodeRfc5987(filename: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(filename);

  let encoded = '';
  for (const byte of bytes) {
    if (
      (byte >= 0x30 && byte <= 0x39) ||
      (byte >= 0x41 && byte <= 0x5a) ||
      (byte >= 0x61 && byte <= 0x7a) ||
      byte === 0x2d ||
      byte === 0x5f ||
      byte === 0x2e ||
      byte === 0x7e
    ) {
      encoded += String.fromCharCode(byte);
    } else {
      encoded += `%${byte.toString(16).toUpperCase().padStart(2, '0')}`;
    }
  }

  return `UTF-8''${encoded}`;
}

export function buildContentDispositionHeader(filename: string): string {
  const sanitized = sanitizeFilename(filename);

  if (isAscii(sanitized)) {
    const escaped = sanitized.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `attachment; filename="${escaped}"`;
  }

  const encoded = encodeRfc5987(sanitized);
  const asciiFallback = sanitized.replace(/[^\x20-\x7e]/g, '_');
  const escapedFallback = asciiFallback.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

  return `attachment; filename="${escapedFallback}"; filename*=${encoded}`;
}
