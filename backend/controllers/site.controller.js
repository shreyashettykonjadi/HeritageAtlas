import UnescoSite from "../models/UnescoSite.js";

// GET /sites/map
export async function getMapSites(req, res) {
  const sites = await UnescoSite.find(
    {},
    { slug: 1, name: 1, country: 1, category: 1, location: 1, danger: 1, mainImage: 1, shortDescription: 1, _id: 0 }
  );

  return res.status(200).json(sites);
}

// GET /sites/:slug
export async function getSiteBySlug(req, res) {
  const { slug } = req.params;

  const site = await UnescoSite.findOne({ slug });

  if (!site) {
    const err = new Error("Site not found");
    err.status = 404;
    throw err;
  }

  return res.status(200).json(site);
}
