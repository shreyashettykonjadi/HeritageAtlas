export const requireAnonymousId = (req, res, next) => {
  try {
    const anonymousId = req.headers["anonymous-id"];

    if (!anonymousId || typeof anonymousId !== "string") {
      return res.status(400).json({
        message: "anonymous-id header is required",
      });
    }

    req.userId = anonymousId;
    next();
  } catch (error) {
    return res.status(500).json({
      message: "Failed to process anonymous identity",
    });
  }
};