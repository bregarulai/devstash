export const SAFE_RETURN_PATH_REGEX = /^\/(?!\/|\\)[^\s]*$/;

export function getSafeReturnPath(
  value: string | undefined | null,
): string | null {
  if (!value) return null;
  return SAFE_RETURN_PATH_REGEX.test(value) ? value : null;
}
