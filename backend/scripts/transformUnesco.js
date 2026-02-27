import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeCategory(raw) {
  if (!raw || typeof raw !== "string") return null;

  const value = raw.trim().toLowerCase();

  if (value === "cultural") return "Cultural";
  if (value === "natural") return "Natural";
  if (value === "mixed") return "Mixed";

  return null;
}

function parseCoordinates(raw) {
  if (!raw || typeof raw !== "string") return null;

  const cleaned = raw.replace(/['"]/g, "").trim();
  if (!cleaned) return null;

  let lat;
  let lng;

  // Try comma-separated first: "27.1751, 78.0421"
  if (cleaned.includes(",")) {
    const parts = cleaned.split(",");
    if (parts.length !== 2) return null;

    lat = parseFloat(parts[0].trim());
    lng = parseFloat(parts[1].trim());
  } else {
    // Fall back to space-separated: "27.1751 78.0421"
    const parts = cleaned.split(/\s+/);
    if (parts.length !== 2) return null;

    lat = parseFloat(parts[0]);
    lng = parseFloat(parts[1]);
  }

  if (isNaN(lat) || isNaN(lng)) return null;
  if (lat < -90 || lat > 90) return null;
  if (lng < -180 || lng > 180) return null;

  return { lat, lng };
}

function isValidUrl(str) {
  return str.startsWith("http://") || str.startsWith("https://");
}

function parseImages(raw) {
  if (!raw || typeof raw !== "string") return [];

  return raw
    .split(",")
    .map(function (url) { return url.trim(); })
    .filter(function (url) { return url.length > 0 && isValidUrl(url); })
    .slice(0, 5);
}

function parseMainImage(mainImageRaw, images) {
  if (mainImageRaw && typeof mainImageRaw === "string") {
    const trimmed = mainImageRaw.trim();
    if (trimmed.length > 0 && isValidUrl(trimmed)) {
      return trimmed;
    }
  }

  if (images.length > 0) {
    return images[0];
  }

  return null;
}

function toBool(raw) {
  if (!raw || typeof raw !== "string") return false;
  return raw.trim().toLowerCase() === "true";
}

function toFloat(raw) {
  if (!raw || typeof raw !== "string") return null;
  const num = parseFloat(raw.trim());
  return isNaN(num) ? null : num;
}

function trimOrNull(raw) {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function transform() {
  const inputPath = path.resolve("data/unesco_raw.csv");
  const outputPath = path.resolve("data/unesco_clean.json");

  const fileContent = fs.readFileSync(inputPath, "utf-8");

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });

  console.log("Total CSV rows:", records.length);

  const cleaned = [];
  let skipped = 0;

  for (const row of records) {
    const name = row["Name EN"];
    const category = normalizeCategory(row["Category"]);
    const coordinates = parseCoordinates(row["Coordinates"]);

    if (!name || !name.trim()) {
      skipped++;
      continue;
    }

    if (!category) {
      skipped++;
      continue;
    }

    if (!coordinates) {
      skipped++;
      continue;
    }

    const year = parseInt(row["Date inscribed"], 10);
    const images = parseImages(row["Images"]);
    const mainImage = parseMainImage(row["Main Image"], images);

    cleaned.push({
      name: name.trim(),
      slug: slugify(name),
      country: row["States Names"] ? row["States Names"].trim() : "",
      isoCodes: trimOrNull(row["ISO Codes"]),
      category,
      year: isNaN(year) ? null : year,
      region: trimOrNull(row["Region"]),
      regionCode: trimOrNull(row["Region Code"]),
      transboundary: toBool(row["Transboundary"]),
      areaHectares: toFloat(row["Area hectares"]),
      criteria: trimOrNull(row["Criteria"]),
      shortDescription: trimOrNull(row["Short Description EN"]),
      description: trimOrNull(row["Description EN"]),
      justification: trimOrNull(row["Justification EN"]),
      danger: toBool(row["Danger"]),
      location: {
        type: "Point",
        coordinates: [coordinates.lng, coordinates.lat],
      },
      mainImage,
      images,
    });
  }

  fs.writeFileSync(outputPath, JSON.stringify(cleaned, null, 2));

  console.log("Transformed:", cleaned.length, "Skipped:", skipped);
}

transform();