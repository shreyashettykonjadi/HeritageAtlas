import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import UnescoSite from "../models/UnescoSite.js";

const THUMBNAIL_WIDTH = 800;
const MIN_REQUEST_INTERVAL_MS = 300;
const MAX_REQUEST_INTERVAL_MS = 5000;
const SUCCESS_RECOVERY_THRESHOLD = 15;
const MAX_THUMBNAIL_ATTEMPTS = 6;
const COOLDOWN_THRESHOLD = 5;
const COOLDOWN_MS = 5 * 60 * 1000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractWikimediaFilename(originalUrl) {
  if (typeof originalUrl !== "string" || !originalUrl.trim()) {
    return null;
  }

  try {
    const parsed = new URL(originalUrl.trim());
    if (parsed.hostname !== "upload.wikimedia.org") {
      return null;
    }

    const pathname = decodeURIComponent(parsed.pathname);
    const filename = pathname.split("/").filter(Boolean).at(-1);
    return filename || null;
  } catch {
    return null;
  }
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
        console.log(`Stable again. Reducing Wikimedia interval: ${previousInterval} ms -> ${currentIntervalMs} ms`);
      }
    },
    recordRateLimit(retryAfterMs = null) {
      successStreak = 0;

      const previousInterval = currentIntervalMs;
      currentIntervalMs = Math.min(MAX_REQUEST_INTERVAL_MS, Math.max(currentIntervalMs * 2, MIN_REQUEST_INTERVAL_MS));

      if (typeof retryAfterMs === "number" && retryAfterMs > 0) {
        nextAllowedAt = Date.now() + retryAfterMs;
        console.log(`Respecting Retry-After: waiting ${retryAfterMs} ms before the next Wikimedia request`);
      }

      if (previousInterval !== currentIntervalMs) {
        console.log(`Rate limited. Increasing Wikimedia interval: ${previousInterval} ms -> ${currentIntervalMs} ms`);
      }
    },
    getInterval() {
      return currentIntervalMs;
    },
    setCooldown(ms) {
      nextAllowedAt = Date.now() + ms;
    },
  };
}

function buildThumbnailApiUrl(filename) {
  const apiUrl = new URL("https://commons.wikimedia.org/w/api.php");
  apiUrl.search = new URLSearchParams({
    action: "query",
    prop: "imageinfo",
    titles: `File:${filename}`,
    iiprop: "url|thumburls|size",
    iiurlwidth: String(THUMBNAIL_WIDTH),
    format: "json",
    origin: "*",
  }).toString();

  return apiUrl.toString();
}

async function fetchThumbnailUrl(filename, scheduler) {
  await scheduler.waitTurn();

  const response = await fetch(buildThumbnailApiUrl(filename), {
    headers: {
      "User-Agent": "HeritageAtlas/1.0 (gallery thumbnail migration)",
    },
  });

  if (response.ok) {
    scheduler.recordSuccess();
    const data = await response.json();
    const pages = data?.query?.pages || {};
    const page = Object.values(pages)[0];
    const imageInfo = page?.imageinfo?.[0];

    return {
      thumbnailUrl: imageInfo?.thumburl || imageInfo?.thumburls?.[0]?.url || null,
      rateLimited: false,
      retryAfterMs: null,
    };
  }

  if (response.status === 429) {
    const retryAfterMs = parseRetryAfterMs(response.headers.get("retry-after"));
    scheduler.recordRateLimit(retryAfterMs);
    return {
      thumbnailUrl: null,
      rateLimited: true,
      retryAfterMs,
    };
  }

  throw new Error(`MediaWiki API request failed with status ${response.status}`);
}

async function fetchThumbnailWithRetries(filename, scheduler) {
  for (let attempt = 1; attempt <= MAX_THUMBNAIL_ATTEMPTS; attempt += 1) {
    const result = await fetchThumbnailUrl(filename, scheduler);

    if (result.thumbnailUrl) {
      if (attempt > 1) {
        console.log("Recovered after retry.");
      }

      return {
        thumbnailUrl: result.thumbnailUrl,
        rateLimited: result.rateLimited,
        attempts: attempt,
      };
    }

    console.log("[429]");
    console.log(`Attempt ${attempt}/${MAX_THUMBNAIL_ATTEMPTS}`);
    console.log(`Current Wikimedia interval: ${scheduler.getInterval()} ms`);
    console.log("Retrying...");

    if (attempt === MAX_THUMBNAIL_ATTEMPTS) {
      return {
        thumbnailUrl: null,
        rateLimited: true,
        attempts: attempt,
      };
    }
  }

  return {
    thumbnailUrl: null,
    rateLimited: false,
    attempts: MAX_THUMBNAIL_ATTEMPTS,
  };
}

function parseResumeFrom(argv) {
  let resumeFrom = null;

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === "--resume-from") {
      resumeFrom = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (value.startsWith("--resume-from=")) {
      resumeFrom = value.split("=", 2)[1] || null;
    }
  }

  return resumeFrom;
}

function resolveStartIndex(sites, resumeFrom) {
  if (resumeFrom == null || resumeFrom === "") {
    return 0;
  }

  const numeric = Number.parseInt(resumeFrom, 10);
  if (Number.isInteger(numeric) && String(numeric) === String(resumeFrom).trim()) {
    return Math.max(0, Math.min(numeric, sites.length));
  }

  const target = String(resumeFrom).trim().toLowerCase();
  if (!target) {
    return 0;
  }

  const index = sites.findIndex((site) => typeof site.name === "string" && site.name.trim().toLowerCase() === target);
  return index >= 0 ? index : 0;
}

async function main() {
  await connectDB();

  const scheduler = createWikimediaScheduler();
  const startedAt = Date.now();
  const resumeFrom = parseResumeFrom(process.argv.slice(2));

  const sites = await UnescoSite.collection
    .find({}, { projection: { _id: 1, name: 1, galleryImages: 1 } })
    .sort({ name: 1 })
    .toArray();

  const startIndex = resolveStartIndex(sites, resumeFrom);
  const sitesToProcess = sites.slice(startIndex);

  let processedSites = 0;
  let skippedImages = 0;
  let generatedThumbnails = 0;
  let recoveredAfterRetries = 0;
  let cooldownsTriggered = 0;
  let failures = 0;

  for (let offset = 0; offset < sitesToProcess.length; offset += 1) {
    const site = sitesToProcess[offset];
    const progressIndex = startIndex + offset + 1;
    const galleryImages = Array.isArray(site.galleryImages) ? site.galleryImages : [];

    console.log(`[${progressIndex}/${sites.length}] ${site.name}`);
    console.log(`Gallery images: ${galleryImages.length}`);

    if (galleryImages.length === 0) {
      console.log("Generated: 0");
      console.log("Skipped: 0");
      console.log("Failed: 0");
      processedSites += 1;
      continue;
    }

    const nextGalleryImages = [];
    let generatedForSite = 0;
    let skippedForSite = 0;
    let failedForSite = 0;
    let consecutive429Images = 0;

    for (const image of galleryImages) {
      const nextImage = { ...image };

      if (typeof image?.thumbnailUrl === "string" && image.thumbnailUrl.trim()) {
        nextGalleryImages.push(nextImage);
        skippedForSite += 1;
        skippedImages += 1;
        continue;
      }

      const filename = extractWikimediaFilename(image?.originalUrl);
      if (!filename) {
        nextGalleryImages.push(nextImage);
        failedForSite += 1;
        failures += 1;
        console.log(`Thumbnail failed for ${site.name}: ${image?.originalUrl || ""}`);
        console.log("Reason: Unsupported or invalid Wikimedia original URL");
        continue;
      }

      const result = await fetchThumbnailWithRetries(filename, scheduler);
      if (result.thumbnailUrl) {
        nextImage.thumbnailUrl = result.thumbnailUrl;
        generatedForSite += 1;
        generatedThumbnails += 1;
        if (result.rateLimited) {
          recoveredAfterRetries += 1;
        }
        consecutive429Images = 0;
      } else {
        failedForSite += 1;
        failures += 1;
        consecutive429Images += 1;
        console.log(`Thumbnail failed for ${site.name}: ${image?.originalUrl || ""}`);
        console.log("Reason: MediaWiki API returned no thumbnail URL after retries");
      }

      if (consecutive429Images >= COOLDOWN_THRESHOLD) {
        cooldownsTriggered += 1;
        console.log("=================================================");
        console.log("Wikimedia rate limit detected.");
        console.log("Cooling down for 5 minutes...");
        console.log("=================================================");
        await sleep(COOLDOWN_MS);
        scheduler.setCooldown(0);
        consecutive429Images = 0;
        console.log("Resuming thumbnail generation...");
      }

      nextGalleryImages.push(nextImage);
    }

    console.log(`Generated: ${generatedForSite}`);
    console.log(`Skipped: ${skippedForSite}`);
    console.log(`Failed: ${failedForSite}`);

    if (nextGalleryImages.length !== galleryImages.length) {
      throw new Error("Gallery image count mismatch. Aborting without saving.");
    }

    if (generatedForSite === 0) {
      processedSites += 1;
      continue;
    }

    await UnescoSite.collection.updateOne(
      { _id: site._id },
      {
        $set: {
          galleryImages: nextGalleryImages,
        },
      }
    );

    processedSites += 1;
  }

  console.log("");
  console.log("Completed");
  console.log(`Processed sites: ${processedSites}`);
  console.log(`Skipped images: ${skippedImages}`);
  console.log(`Generated thumbnails: ${generatedThumbnails}`);
  console.log(`Recovered after retries: ${recoveredAfterRetries}`);
  console.log(`Cooldowns triggered: ${cooldownsTriggered}`);
  console.log(`Failures: ${failures}`);
  console.log(`Final Wikimedia interval: ${scheduler.getInterval()} ms`);
  console.log(`Elapsed time: ${Math.round((Date.now() - startedAt) / 1000)}s`);

  await mongoose.connection.close();
}

main().catch(async (error) => {
  console.error("Gallery thumbnail migration failed:", error.message);
  await mongoose.connection.close().catch(function () {});
  process.exit(1);
});
