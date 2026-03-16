import jwt from "jsonwebtoken";
import User from "../models/User.js";

function throwUnauthorized() {
  const err = new Error("Unauthorized");
  err.status = 401;
  throw err;
}

export async function requireAuth(req, res, next) {
  const token = req.cookies?.auth_token;

  if (!token) {
    throwUnauthorized();
  }

  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throwUnauthorized();
  }

  if (!payload?.sub) {
    throwUnauthorized();
  }

  // Lightweight auth path: trust verified token payload and avoid a DB lookup.
  req.user = {
    _id: payload.sub,
  };

  return next();
}

export async function requireAuthWithUser(req, res, next) {
  const token = req.cookies?.auth_token;

  if (!token) {
    throwUnauthorized();
  }

  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throwUnauthorized();
  }

  if (!payload?.sub) {
    throwUnauthorized();
  }

  const user = await User.findById(payload.sub).select("_id email createdAt updatedAt");

  if (!user) {
    throwUnauthorized();
  }

  req.user = user;
  return next();
}
