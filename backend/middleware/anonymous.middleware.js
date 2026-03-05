export const requireAnonymousId = (req, res, next) => {
  const anonymousId = req.headers["anonymous-id"];

  if (!anonymousId || typeof anonymousId !== "string") {
    const err = new Error("anonymous-id header is required");
    err.status = 400;
    throw err;
  }

  req.userId = anonymousId;
  next();
};