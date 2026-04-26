const SLUG_REGEX = /^[a-z0-9-]+$/;

export function sanitizeSlug(rawSlug) {
  if (typeof rawSlug !== "string") {
    return null;
  }

  const trimmedSlug = rawSlug.trim();

  if (!trimmedSlug) {
    return null;
  }

  if (!SLUG_REGEX.test(trimmedSlug)) {
    return null;
  }

  return trimmedSlug;
}

export function toSafeSlugSegment(rawSlug) {
  const validSlug = sanitizeSlug(rawSlug);

  if (!validSlug) {
    return null;
  }

  return encodeURIComponent(validSlug);
}