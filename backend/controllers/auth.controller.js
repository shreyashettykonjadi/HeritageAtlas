import bcrypt from "bcrypt";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

const AUTH_COOKIE_NAME = "auth_token";
const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// POST /auth/register
export async function registerUser(req, res) {
  const emailInput = req.body?.email;
  const password = req.body?.password;

  if (!emailInput || !password) {
    const err = new Error("Email and password are required");
    err.status = 400;
    throw err;
  }

  const email = emailInput.trim().toLowerCase();

  if (password.length < 8) {
    const err = new Error("Password must be at least 8 characters long");
    err.status = 400;
    throw err;
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const err = new Error("User already exists");
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    passwordHash,
  });

  const token = generateToken(user._id);

  res.cookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);

  return res.status(201).json({
    _id: user._id,
    email: user.email,
  });
}

// POST /auth/login
export async function loginUser(req, res) {
  const emailInput = req.body?.email;
  const password = req.body?.password;

  if (!emailInput || !password) {
    const err = new Error("Email and password are required");
    err.status = 400;
    throw err;
  }

  const email = emailInput.trim().toLowerCase();

  const user = await User.findOne({ email });
  const isValid = user ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!isValid) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  const token = generateToken(user._id);

  res.cookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);

  return res.status(200).json({
    _id: user._id,
    email: user.email,
  });
}

// GET /auth/me
export async function getCurrentUser(req, res) {
  return res.status(200).json(req.user || null);
}

// POST /auth/logout
export async function logoutUser(req, res) {
  res.clearCookie(AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS);
  return res.status(200).json({ message: "Logged out" });
}
