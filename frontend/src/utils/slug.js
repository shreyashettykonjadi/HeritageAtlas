const SLUG_REGEX = /^[a-z0-9-]+$/;

export function isValidSlug(slug) {
  return typeof slug === "string" && SLUG_REGEX.test(slug.trim());
}

export function sanitizeSlug(rawSlug) {
  if (!isValidSlug(rawSlug)) {
    return null;
  }

  return rawSlug.trim();
}

export function toSafeSlugSegment(rawSlug) {
  const validSlug = sanitizeSlug(rawSlug);

  if (!validSlug) {
    return null;
  }

  return encodeURIComponent(validSlug);
}