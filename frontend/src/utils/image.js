export function getImageUrl(image) {
  if (!image) {
    return null;
  }

  if (typeof image === "string") {
    return image;
  }

  if (typeof image === "object") {
    return image.originalUrl || null;
  }

  return null;
}

export function getImageAlt(image, fallback) {
  if (image && typeof image === "object" && typeof image.title === "string" && image.title.trim()) {
    return image.title.trim();
  }

  return fallback || "Heritage site image";
}
