import UnescoSite from "../models/UnescoSite.js";

function parseDangerFilter(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  if (["true", "1", "yes"].includes(normalized)) {
    return true;
  }

  if (["false", "0", "no"].includes(normalized)) {
    return false;
  }

  return null;
}

function parseLimit(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 8;
  }

  return Math.min(parsed, 8);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET /sites/search
export async function searchSites(req, res) {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const category = typeof req.query.category === "string" ? req.query.category.trim() : "";
  const country = typeof req.query.country === "string" ? req.query.country.trim() : "";
  const danger = parseDangerFilter(req.query.danger);
  const limit = parseLimit(req.query.limit);

  if (!q && !category && !country && danger === null) {
    return res.status(200).json({ sites: [] });
  }

  if (!q) {
    return res.status(200).json({ sites: [] });
  }

  const escapedQuery = escapeRegex(q);
  const searchRegex = new RegExp(escapedQuery, "i");
  const prefixRegex = new RegExp(`^${escapedQuery}`, "i");
  const containsRegex = new RegExp(escapedQuery, "i");

  const match = {
    $or: [{ name: searchRegex }, { country: searchRegex }, { slug: searchRegex }],
  };

  if (category) {
    match.category = category;
  }

  if (country) {
    match.country = country;
  }

  if (danger !== null) {
    match.danger = danger;
  }

  const sites = await UnescoSite.aggregate([
    { $match: match },
    {
      $addFields: {
        startsWithName: { $cond: [{ $regexMatch: { input: "$name", regex: prefixRegex } }, 1, 0] },
        startsWithCountry: { $cond: [{ $regexMatch: { input: "$country", regex: prefixRegex } }, 1, 0] },
        startsWithSlug: { $cond: [{ $regexMatch: { input: "$slug", regex: prefixRegex } }, 1, 0] },
        containsName: { $cond: [{ $regexMatch: { input: "$name", regex: containsRegex } }, 1, 0] },
        nameLength: { $strLenCP: "$name" },
      },
    },
    {
      $sort: {
        startsWithName: -1,
        startsWithCountry: -1,
        startsWithSlug: -1,
        containsName: -1,
        nameLength: 1,
        name: 1,
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        slug: 1,
        country: 1,
        category: 1,
        danger: 1,
        location: 1,
        mainImage: 1,
      },
    },
    { $limit: limit },
  ]);

  return res.status(200).json({ sites: sites || [] });
}
