import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import UnescoSite from "../models/UnescoSite.js";

function isHttpUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value.trim());
}

const MIN_WIDTH = 640;
const MIN_HEIGHT = 480;
const TARGET_GALLERY_COUNT = 8;
const SEARCH_RESULTS_PER_QUERY = 10;
const MAX_BULK_OPERATIONS = 25;
const METADATA_BATCH_SIZE = 10;
const MIN_REQUEST_INTERVAL_MS = 1200;
const MAX_REQUEST_INTERVAL_MS = 8000;
const SUCCESS_RECOVERY_THRESHOLD = 50;
const MIN_EXISTING_GALLERY_IMAGES = 6;

const searchCache = new Map();
const metadataCache = new Map();
const wikimediaScheduler = createWikimediaScheduler();

function isWikimediaRateLimitError(error) {
  return error?.code === "WIKIMEDIA_RATE_LIMITED";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryAfterMs(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const seconds = Number.parseFloat(trimmed);
  if (Number.isFinite(seconds)) {
    return Math.max(0, Math.round(seconds * 1000));
  }

  const parsedDate = Date.parse(trimmed);
  if (Number.isNaN(parsedDate)) {
    return null;
  }

  return Math.max(0, parsedDate - Date.now());
}

function createWikimediaScheduler() {
  let currentIntervalMs = MIN_REQUEST_INTERVAL_MS;
  let nextAllowedAt = 0;
  let successStreak = 0;

  return {
    async waitTurn() {
      const now = Date.now();
      if (now < nextAllowedAt) {
        await sleep(nextAllowedAt - now);
      }

      nextAllowedAt = Date.now() + currentIntervalMs;
    },
    recordSuccess() {
      successStreak += 1;

      if (successStreak >= SUCCESS_RECOVERY_THRESHOLD && currentIntervalMs > MIN_REQUEST_INTERVAL_MS) {
        const previousInterval = currentIntervalMs;
        currentIntervalMs = Math.max(MIN_REQUEST_INTERVAL_MS, Math.floor(currentIntervalMs / 2));
        successStreak = 0;
        console.log(`Stable again. Reducing Wikimedia interval: ${previousInterval} ms → ${currentIntervalMs} ms`);
      }
    },
    recordRateLimit(retryAfterMs = null) {
      successStreak = 0;

      const previousInterval = currentIntervalMs;
      const nextInterval = Math.min(
        MAX_REQUEST_INTERVAL_MS,
        Math.max(currentIntervalMs * 2, MIN_REQUEST_INTERVAL_MS)
      );

      currentIntervalMs = nextInterval;

      if (typeof retryAfterMs === "number" && retryAfterMs > 0) {
        nextAllowedAt = Date.now() + retryAfterMs;
        console.log(`Respecting Retry-After: waiting ${retryAfterMs} ms before the next Wikimedia request`);
      }

      if (previousInterval !== currentIntervalMs) {
        console.log(`Rate limited. Increasing Wikimedia interval: ${previousInterval} ms → ${currentIntervalMs} ms`);
      }
    },
    getInterval() {
      return currentIntervalMs;
    },
  };
}

function parseCliArgs(argv) {
  const args = {
    force: false,
    resumeFrom: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === "--force") {
      args.force = true;
      continue;
    }

    if (value === "--resume-from") {
      args.resumeFrom = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (value.startsWith("--resume-from=")) {
      args.resumeFrom = value.split("=", 2)[1] || null;
    }
  }

  return args;
}

function normalizeSiteName(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function shouldSkipAsAlreadyEnriched(site, force) {
  if (force) {
    return false;
  }

  const galleryCount = Array.isArray(site?.galleryImages) ? site.galleryImages.length : 0;
  return Boolean(site?.imagesLastUpdated) && galleryCount >= MIN_EXISTING_GALLERY_IMAGES;
}

function resolveResumeIndex(sites, resumeFrom) {
  if (resumeFrom == null || resumeFrom === "") {
    return 0;
  }

  const numeric = Number.parseInt(resumeFrom, 10);
  if (Number.isInteger(numeric) && String(numeric) === String(resumeFrom).trim()) {
    return Math.max(0, Math.min(numeric, sites.length));
  }

  const target = normalizeSiteName(resumeFrom);
  if (!target) {
    return 0;
  }

  const index = sites.findIndex((site) => normalizeSiteName(site.name) === target);
  return index >= 0 ? index : 0;
}

async function throttleRequests() {
  await wikimediaScheduler.waitTurn();
}

function stripHtml(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanSearchText(value) {
  return stripHtml(value)
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function addUniqueTerm(terms, value) {
  if (typeof value !== "string") {
    return;
  }

  const term = cleanSearchText(value);
  if (!term || term.length < 2) {
    return;
  }

  if (!terms.includes(term)) {
    terms.push(term);
  }
}

function normalizeKey(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .toLowerCase()
    .replace(/https?:\/\/[^/]+\//g, "")
    .replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "")
    .replace(/(?:\s|_|-)?\(?\d+\)?$/g, "")
    .replace(/\.(jpg|jpeg|png|gif|webp|tif|tiff|svg)$/g, "")
    .replace(/\s+/g, " ");
}

function getOriginalMainImage(site) {
  const mainImage = site?.mainImage;

  if (typeof mainImage === "string" && isHttpUrl(mainImage)) {
    return mainImage.trim();
  }

  if (mainImage && typeof mainImage === "object" && isHttpUrl(mainImage.originalUrl)) {
    return mainImage.originalUrl.trim();
  }

  return null;
}

function simplifySearchName(name) {
  const cleaned = cleanSearchText(name);
  if (!cleaned) {
    return "";
  }

  let simplified = cleaned
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s*:\s*.*$/g, " ")
    .replace(/\s*;\s*.*$/g, " ")
    .replace(/\s*,\s*.*$/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const slashParts = simplified
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

  if (slashParts.length > 1) {
    const preferred = slashParts.find((part) => /[a-z]/i.test(part) && part.length >= 4) || slashParts[0];
    simplified = preferred;
  }

  const ofMatch = simplified.match(/\bof\s+(.+)$/i);
  if (ofMatch) {
    const tail = ofMatch[1].trim();
    if (tail.length > 0 && tail.length <= 80) {
      simplified = tail;
    }
  }

  return simplified.replace(/\s+/g, " ").trim();
}

function firstSearchPhrase(name) {
  const cleaned = cleanSearchText(name);
  if (!cleaned) {
    return "";
  }

  const splitters = ["/", ",", ":", ";"];
  let phrase = cleaned;

  for (const splitter of splitters) {
    const index = phrase.indexOf(splitter);
    if (index > 0) {
      phrase = phrase.slice(0, index);
    }
  }

  phrase = phrase.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
  return phrase;
}

function getCloudinaryWidthForGallery(width, height) {
  return 800;
}

function buildSearchTerms(site) {
  const terms = [];
  const primary = cleanSearchText(site?.name);
  const simplified = simplifySearchName(primary);
  const focused = firstSearchPhrase(primary);

  addUniqueTerm(terms, primary);
  addUniqueTerm(terms, simplified);
  addUniqueTerm(terms, focused);

  return terms;
}

async function fetchJson(url) {
  await throttleRequests();

  const response = await fetch(url, {
    headers: {
      "User-Agent": "HeritageAtlas/1.0 (image enrichment)",
      Connection: "keep-alive",
    },
  });

  if (response.ok) {
    wikimediaScheduler.recordSuccess();
    return response.json();
  }

  if (response.status === 429) {
    const retryAfterMs = parseRetryAfterMs(response.headers.get("retry-after"));
    wikimediaScheduler.recordRateLimit(retryAfterMs);
    const error = new Error(`Rate limited with HTTP 429${retryAfterMs ? ` (Retry-After: ${retryAfterMs}ms)` : ""}`);
    error.code = "WIKIMEDIA_RATE_LIMITED";
    throw error;
  }

  throw new Error(`Request failed with status ${response.status}`);
}

async function searchWikimediaTitles(term) {
  const cached = searchCache.get(term);
  if (cached) {
    return cached;
  }

  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.search = new URLSearchParams({
    action: "query",
    list: "search",
    srsearch: term,
    srnamespace: "6",
    srlimit: String(SEARCH_RESULTS_PER_QUERY),
    format: "json",
    origin: "*",
  }).toString();

  const data = await fetchJson(url.toString());
  const results = data?.query?.search || [];
  const titles = results
    .map((entry) => entry.title)
    .filter((title) => typeof title === "string" && title.length > 0);

  searchCache.set(term, titles);
  return titles;
}

async function fetchImageMetadata(titles) {
  if (!titles.length) {
    return [];
  }

  const cacheKey = titles.join("|");
  const cached = metadataCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.search = new URLSearchParams({
    action: "query",
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    titles: titles.join("|"),
    format: "json",
    origin: "*",
  }).toString();

  const data = await fetchJson(url.toString());
  const pages = data?.query?.pages || {};

  const metadata = Object.values(pages)
    .map((page) => {
      const imageInfo = page?.imageinfo?.[0];

      if (!page || !imageInfo || !isHttpUrl(imageInfo.url)) {
        return null;
      }

      const extMetadata = imageInfo.extmetadata || {};
      const artist = stripHtml(extMetadata.Artist?.value || "");
      const credit = stripHtml(extMetadata.Credit?.value || "");
      const license = stripHtml(extMetadata.LicenseShortName?.value || "");
      const attribution = artist || credit || license || "Wikimedia Commons";
      const title = typeof page.title === "string" ? page.title.replace(/^File:/i, "") : "";

      return {
        pageTitle: page.title || "",
        title,
        originalUrl: imageInfo.url,
        width: imageInfo.width || 0,
        height: imageInfo.height || 0,
        mime: imageInfo.mime || "",
        attribution,
        filenameKey: normalizeKey(page.title || imageInfo.url),
        urlKey: normalizeKey(imageInfo.url),
      };
    })
    .filter(Boolean);

  metadataCache.set(cacheKey, metadata);
  return metadata;
}

async function fetchImageMetadataBatched(titles) {
  const results = [];

  for (let index = 0; index < titles.length; index += METADATA_BATCH_SIZE) {
    const batch = titles.slice(index, index + METADATA_BATCH_SIZE);
    const metadata = await fetchImageMetadata(batch);
    results.push(...metadata);
  }

  return results;
}

function scoreCandidate(candidate, site) {
  const width = candidate.width || 0;
  const height = candidate.height || 0;
  const landscapeBonus = width >= height ? 150000 : 0;
  const sizeScore = width * height;
  const titleScore = normalizeKey(candidate.title).includes(normalizeKey(site.name)) ? 75000 : 0;

  return landscapeBonus + sizeScore + titleScore;
}

function filterCandidates(candidates, site) {
  const seenUrls = new Set();
  const seenTitles = new Set();
  const seenFiles = new Set();
  const seenBases = new Set();

  return candidates
    .filter((candidate) => {
      if (!candidate || !isHttpUrl(candidate.originalUrl)) {
        return false;
      }

      if (!candidate.width || !candidate.height) {
        return false;
      }

      if (candidate.width < MIN_WIDTH || candidate.height < MIN_HEIGHT) {
        return false;
      }

      const normalizedUrl = normalizeKey(candidate.originalUrl);
      const normalizedTitle = normalizeKey(candidate.title);
      const normalizedFile = normalizeKey(candidate.pageTitle);
      const normalizedBase = normalizeKey(candidate.pageTitle || candidate.title);

      if (seenUrls.has(normalizedUrl) || seenTitles.has(normalizedTitle) || seenFiles.has(normalizedFile) || seenBases.has(normalizedBase)) {
        return false;
      }

      seenUrls.add(normalizedUrl);
      seenTitles.add(normalizedTitle);
      seenFiles.add(normalizedFile);
      seenBases.add(normalizedBase);

      return true;
    })
    .sort((left, right) => scoreCandidate(right, site) - scoreCandidate(left, site));
}

function buildGalleryImages(candidates) {
  return candidates
    .slice(0, TARGET_GALLERY_COUNT)
    .map((candidate) => {
      if (!candidate.originalUrl) {
        return null;
      }

      return {
        originalUrl: candidate.originalUrl,
        title: candidate.title,
        attribution: candidate.attribution,
        source: "wikimedia",
      };
    })
    .filter(Boolean);
}

async function enrichSite(site) {
  const originalMainImage = getOriginalMainImage(site);
  const mainImage = originalMainImage
    ? {
        originalUrl: originalMainImage,
        source: "unesco",
      }
    : null;

  const searchTerms = buildSearchTerms(site);
  const candidateTitles = new Set();
  let searchLimited = false;

  for (let index = 0; index < searchTerms.length; index += 1) {
    const term = searchTerms[index];
    if (!term) {
      continue;
    }

    try {
      const titles = await searchWikimediaTitles(term);
      titles.forEach((title) => candidateTitles.add(title));
    } catch (error) {
      if (isWikimediaRateLimitError(error)) {
        searchLimited = true;
        console.log(`[rate-limit] Search abandoned for ${site.name}: ${error.message}`);
        break;
      }

      throw error;
    }

    if (candidateTitles.size > 0) {
      break;
    }
  }

  const candidateTitleList = Array.from(candidateTitles).slice(0, 30);
  let metadata = [];
  let metadataLimited = false;
  try {
    metadata = await fetchImageMetadataBatched(candidateTitleList);
  } catch (error) {
    if (isWikimediaRateLimitError(error)) {
      metadataLimited = true;
      console.log(`[rate-limit] Metadata abandoned for ${site.name}: ${error.message}`);
      metadata = [];
    } else {
      throw error;
    }
  }
  const filtered = filterCandidates(metadata, site);
  const galleryImages = buildGalleryImages(filtered);
  const skipReason = searchLimited && candidateTitles.size === 0
    ? "Skipped because Wikimedia rate-limited requests."
    : metadataLimited && galleryImages.length === 0
      ? "Skipped because Wikimedia rate-limited requests."
      : candidateTitles.size === 0
        ? "No Wikimedia results"
        : galleryImages.length === 0
          ? "No Wikimedia results after fallback"
          : null;

  return {
    mainImage,
    galleryImages,
    imagesLastUpdated: new Date(),
    skipped: galleryImages.length === 0,
    skipReason,
  };
}

async function main() {
  const { force, resumeFrom } = parseCliArgs(process.argv.slice(2));
  await connectDB();

  const databaseName = mongoose.connection?.name || "unknown";
  const collectionName = UnescoSite.collection?.name || "unknown";
  const documentCount = await UnescoSite.countDocuments();

  console.log(`Database: ${databaseName}`);
  console.log(`Collection: ${collectionName}`);
  console.log(`Documents found: ${documentCount}`);

  const sites = await UnescoSite.find({}, { _id: 1, slug: 1, name: 1, country: 1, mainImage: 1, galleryImages: 1, imagesLastUpdated: 1 })
    .sort({ name: 1 })
    .lean();
  console.log("Sites to enrich:", sites.length);

  const startIndex = resolveResumeIndex(sites, resumeFrom);
  if (startIndex > 0) {
    console.log(`Resuming from index ${startIndex} (${resumeFrom})`);
  }

  let bulkOperations = [];
  let updated = 0;
  let skipped = 0;
  let failed = 0;
  let processed = 0;
  const startedAt = Date.now();

  const sitesToProcess = sites.slice(startIndex);

  for (let offset = 0; offset < sitesToProcess.length; offset += 1) {
    const site = sitesToProcess[offset];
    const progressIndex = startIndex + offset + 1;

    if (shouldSkipAsAlreadyEnriched(site, force)) {
      skipped += 1;
      processed += 1;
      console.log(`[${progressIndex}/${sites.length}] [skip] ${site.name} (already enriched)`);
      continue;
    }

    try {
      const result = await enrichSite(site);
      const hasNewGallery = Array.isArray(result.galleryImages) && result.galleryImages.length > 0;
      const updateDoc = {
        $set: {
          imagesLastUpdated: result.imagesLastUpdated,
        },
      };

      if (result.mainImage) {
        updateDoc.$set.mainImage = result.mainImage;
      }

      if (hasNewGallery) {
        updateDoc.$set.galleryImages = result.galleryImages;
      }

      bulkOperations.push({
        updateOne: {
          filter: { _id: site._id },
          update: updateDoc,
        },
      });

      if (result.skipped) {
        skipped += 1;
        console.log(`[${progressIndex}/${sites.length}] [skip] ${site.name} (${result.skipReason || "No Wikimedia results"})`);
      } else {
        updated += 1;
        console.log(`[${progressIndex}/${sites.length}] [ok] ${site.name}`);
      }

      processed += 1;

      if (bulkOperations.length >= MAX_BULK_OPERATIONS) {
        await UnescoSite.bulkWrite(bulkOperations, { ordered: false });
        bulkOperations = [];
      }
    } catch (error) {
      failed += 1;
      processed += 1;
      console.log(`[${progressIndex}/${sites.length}] [fail] ${site.name} (${error.message})`);
    }
  }

  if (bulkOperations.length > 0) {
    await UnescoSite.bulkWrite(bulkOperations, { ordered: false });
  }

  console.log("");
  console.log("Completed");
  console.log(`Elapsed time: ${Math.round((Date.now() - startedAt) / 1000)}s`);
  console.log(`Processed: ${processed}`);
  console.log(`${updated} updated`);
  console.log(`${skipped} skipped`);
  console.log(`${failed} failed`);

  await mongoose.connection.close();
  process.exit(0);
}

main().catch(async (error) => {
  console.error("Image enrichment failed:", error.message);
  await mongoose.connection.close().catch(function () {});
  process.exit(1);
});
