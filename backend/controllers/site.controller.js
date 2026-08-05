import UnescoSite from "../models/UnescoSite.js";
import redisClient from "../config/redis.js";

// GET /sites/map
export async function getMapSites(req, res) {
  const cacheKey = "sites:map";

  // 1. Check Redis first
  const cachedData = await redisClient.get(cacheKey);

  // 2. Cache hit - return without querying MongoDB
  if (cachedData) {
    console.log("CACHE HIT: sites:map");
    return res.status(200).json(JSON.parse(cachedData));
  }

  console.log("CACHE MISS: sites:map");

  // 3. Cache miss - query MongoDB
  const sites = await UnescoSite.find(
    {},
    {
      slug: 1,
      name: 1,
      country: 1,
      category: 1,
      location: 1,
      danger: 1,
      mainImage: 1,
      shortDescription: 1,
      _id: 0,
    }
  );

  // 4. Store result in Redis for 1 hour
  await redisClient.setEx(
    cacheKey,
    3600,
    JSON.stringify(sites)
  );

  // 5. Return response
  return res.status(200).json(sites);
}

// GET /sites/:slug
export async function getSiteBySlug(req, res) {
  const { slug } = req.params;

  const cacheKey = `site:${slug}`;

  // 1. Check Redis
  const cachedSite = await redisClient.get(cacheKey);

  // 2. Cache hit
  if (cachedSite) {
    console.log(`CACHE HIT: ${cacheKey}`);
    return res.status(200).json(JSON.parse(cachedSite));
  }

  console.log(`CACHE MISS: ${cacheKey}`);

  // 3. Cache miss - query MongoDB
  const site = await UnescoSite.findOne({ slug });

  if (!site) {
    const err = new Error("Site not found");
    err.status = 404;
    throw err;
  }

  // 4. Cache successful result for 1 hour
  await redisClient.setEx(
    cacheKey,
    3600,
    JSON.stringify(site)
  );

  // 5. Return response
  return res.status(200).json(site);
}
