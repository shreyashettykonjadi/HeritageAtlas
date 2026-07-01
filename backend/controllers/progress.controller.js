import UserProgress from "../models/UserProgress.js";
import UnescoSite from "../models/UnescoSite.js";

const IMAGE_PREVIEW_LIMIT = 5;
const PLACE_ID_REGEX = /^[a-z0-9-]+$/;

function sanitizePlaceId(rawPlaceId) {
  if (typeof rawPlaceId !== "string") {
    const err = new Error("placeId must be a string");
    err.status = 400;
    throw err;
  }

  const placeId = rawPlaceId.trim();

  if (!placeId) {
    const err = new Error("placeId is required");
    err.status = 400;
    throw err;
  }

  if (!PLACE_ID_REGEX.test(placeId)) {
    const err = new Error("Invalid placeId format");
    err.status = 400;
    throw err;
  }

  return placeId;
}

// POST /progress
export async function createOrUpdateProgress(req, res) {
  const userId = req.user._id;
  const placeId = sanitizePlaceId(req.body?.placeId);

  // Resolve slug → ObjectId
  const site = await UnescoSite.findOne({ slug: placeId });
  if (!site) {
    const err = new Error("Site not found");
    err.status = 404;
    throw err;
  }

  // Fetch existing record (if any)
  const existing = await UserProgress.findOne({ user: userId, site: site._id });

  // Start from existing values if present
  const current = existing ? existing.toObject() : {};

  // Build updated state by merging
  const updatedState = {
    status: current.status || undefined,
    rating: current.rating,
    notes: current.notes,
    visitDate: current.visitDate,
  };

  // Apply incoming fields only if defined
  if ("status" in req.body) {
    updatedState.status = req.body.status === "none" ? undefined : req.body.status;
  }

  if ("rating" in req.body) {
    updatedState.rating = req.body.rating;
  }

  if ("notes" in req.body) {
    updatedState.notes = req.body.notes;
  }

  if ("visitDate" in req.body) {
    updatedState.visitDate = req.body.visitDate || null;
  }

  // Determine if record is empty
  const isEmpty =
    (!updatedState.status) &&
    (updatedState.rating === undefined || updatedState.rating === null) &&
    (!updatedState.notes || updatedState.notes.trim() === "") &&
    !updatedState.visitDate;


  if (isEmpty) {
    await UserProgress.findOneAndDelete({ user: userId, site: site._id });
    return res.status(200).json({ message: "Progress removed" });
  }

  // Upsert with $set
  const updated = await UserProgress.findOneAndUpdate(
    { user: userId, site: site._id },
    { $set: updatedState },
    { returnDocument: "after", upsert: true, runValidators: true }
  );

  return res.status(200).json(updated);
}

// GET /progress
export async function getUserProgress(req, res) {
  const userId = req.user._id;

  const progress = await UserProgress.find({ user: userId })
    .populate("site", "slug name category country mainImage galleryImages")
    .sort({ updatedAt: -1 });

  const mapped = progress.map(function (doc) {
    const obj = doc.toObject();
    if (obj.site) {
      obj.site.galleryImages = obj.site.galleryImages?.slice(0, IMAGE_PREVIEW_LIMIT) || [];
    }
    return obj;
  });

  return res.status(200).json(mapped);
}

// GET /progress/:slug
export async function getSingleProgress(req, res) {
  const userId = req.user._id;
  const slug = req.params.slug;

  if (!slug) {
    const err = new Error("slug is required");
    err.status = 400;
    throw err;
  }

  // Resolve slug → ObjectId
  const site = await UnescoSite.findOne({ slug });
  if (!site) {
    return res.status(200).json(null);
  }

  const progress = await UserProgress.findOne({ user: userId, site: site._id });

  // IMPORTANT: return null if not found (NOT 404)
  return res.status(200).json(progress || null);
}

// DELETE /progress/:slug
export async function deleteProgress(req, res) {
  const { slug } = req.params;
  const userId = req.user._id;

  const site = await UnescoSite.findOne({ slug });

  if (!site) {
    const err = new Error("Site not found");
    err.status = 404;
    throw err;
  }

  await UserProgress.findOneAndDelete({
    user: userId,
    site: site._id
  });

  return res.status(204).end();
}

