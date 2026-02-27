import UnescoSite from "../models/UnescoSite.js";

// GET /sites/map
export async function getMapSites(req, res) {
  try {
    const sites = await UnescoSite.find(
      {},
      { slug: 1, name: 1, country: 1, category: 1, location: 1, _id: 0 }
    );

    return res.status(200).json(sites);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// GET /sites/:slug
export async function getSiteBySlug(req, res) {
  try {
    const { slug } = req.params;

    const site = await UnescoSite.findOne({ slug });

    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }

    return res.status(200).json(site);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
