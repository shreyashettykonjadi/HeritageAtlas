import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import UnescoSite from "../models/UnescoSite.js";

const TARGET_SLUG = "agra-fort";
const THUMBNAIL_WIDTH = 800;

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

async function fetchThumbnailUrl(filename) {
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

  const response = await fetch(apiUrl.toString(), {
    headers: {
      "User-Agent": "HeritageAtlas/1.0 (Agra thumbnail update)",
    },
  });

  if (!response.ok) {
    throw new Error(`MediaWiki API request failed with status ${response.status}`);
  }

  const data = await response.json();
  const pages = data?.query?.pages || {};
  const page = Object.values(pages)[0];
  const imageInfo = page?.imageinfo?.[0];

  return imageInfo?.thumburl || imageInfo?.thumburls?.[0]?.url || null;
}

async function main() {
  await connectDB();

  const site = await UnescoSite.collection.findOne({ slug: TARGET_SLUG });
  if (!site) {
    throw new Error(`Site not found for slug: ${TARGET_SLUG}`);
  }

  const galleryImages = Array.isArray(site.galleryImages) ? site.galleryImages : [];
  if (galleryImages.length === 0) {
    console.log("No gallery images found. Aborting.");
    await mongoose.connection.close();
    return;
  }

  console.log("Agra Fort");

  const nextGalleryImages = [];
  let thumbnailCount = 0;
  let failureCount = 0;

  for (let index = 0; index < galleryImages.length; index += 1) {
    const image = galleryImages[index];
    const imageNumber = index + 1;
    const filename = extractWikimediaFilename(image?.originalUrl);
    let nextImage = { ...image };
    let thumbnailUrl = null;

    if (typeof image?.thumbnailUrl === "string" && image.thumbnailUrl.trim()) {
      thumbnailCount += 1;
      console.log(`Image ${imageNumber} already has thumbnail. Skipping.`);
      nextGalleryImages.push(image);
      continue;
    }

    if (!filename) {
      failureCount += 1;
    } else {
      try {
        thumbnailUrl = await fetchThumbnailUrl(filename);
        if (thumbnailUrl) {
          nextImage = {
            ...image,
            thumbnailUrl,
          };
          thumbnailCount += 1;
        } else {
          failureCount += 1;
        }
      } catch (error) {
        failureCount += 1;
        console.log(`Image ${imageNumber} failed`);
        console.log(`Original: ${image?.originalUrl || ""}`);
        console.log(error.message);
      }
    }

    console.log(`Image ${imageNumber}`);
    console.log("Original:");
    console.log(image?.originalUrl || "");
    console.log("Thumbnail:");
    console.log(thumbnailUrl || "");

    nextGalleryImages.push(nextImage);
  }

  if (nextGalleryImages.length !== galleryImages.length) {
    throw new Error("Gallery image count mismatch. Aborting without saving.");
  }

  await UnescoSite.collection.updateOne(
    { _id: site._id },
    {
      $set: {
        galleryImages: nextGalleryImages,
      },
    }
  );

  console.log(`Existing images: ${galleryImages.length}`);
  console.log(`Thumbnail URLs generated: ${thumbnailCount}`);
  console.log(`Thumbnail failures: ${failureCount}`);
  console.log("Saved successfully.");

  await mongoose.connection.close();
}

main().catch(async (error) => {
  console.error("Agra thumbnail update failed:", error.message);
  await mongoose.connection.close().catch(function () {});
  process.exit(1);
});
