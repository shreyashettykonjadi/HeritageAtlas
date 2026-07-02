import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import UnescoSite from "../models/UnescoSite.js";

const MIN_WIDTH = 640;
const MIN_HEIGHT = 480;
const TARGET_GALLERY_COUNT = 8;
const SEARCH_RESULTS_PER_QUERY = 10;
const METADATA_BATCH_SIZE = 10;

function isHttpUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value.trim());
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
  const response = await fetch(url, {
    headers: {
      "User-Agent": "HeritageAtlas/1.0 (Agra gallery rebuild)",
      Connection: "keep-alive",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

async function searchWikimediaTitles(term) {
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
  return results
    .map((entry) => entry.title)
    .filter((title) => typeof title === "string" && title.length > 0);
}

async function fetchImageMetadata(titles) {
  if (!titles.length) {
    return [];
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

  return Object.values(pages)
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

async function main() {
  await connectDB();

  const site = await UnescoSite.findOne({ slug: "agra-fort" }).lean();
  if (!site) {
    throw new Error("Site not found for slug: agra-fort");
  }

  const searchTerms = buildSearchTerms(site);
  const candidateTitles = new Set();

  for (const term of searchTerms) {
    const titles = await searchWikimediaTitles(term);
    titles.forEach((title) => candidateTitles.add(title));
  }

  const candidateTitleList = Array.from(candidateTitles);
  const metadata = await fetchImageMetadataBatched(candidateTitleList);
  const filtered = filterCandidates(metadata, site);
  const galleryImages = buildGalleryImages(filtered);

  console.log(`Found ${filtered.length} candidates`);
  console.log(`Selected ${galleryImages.length} gallery images`);

  if (galleryImages.length === 0) {
    console.log("No gallery images found. Database left unchanged.");
    await mongoose.connection.close();
    return;
  }

  await UnescoSite.updateOne(
    { _id: site._id },
    {
      $set: {
        galleryImages,
        imagesLastUpdated: new Date(),
      },
    }
  );

  console.log("Updated Agra Fort successfully");

  await mongoose.connection.close();
}

main().catch(async (error) => {
  console.error("Agra gallery rebuild failed:", error.message);
  await mongoose.connection.close().catch(function () {});
  process.exit(1);
});
