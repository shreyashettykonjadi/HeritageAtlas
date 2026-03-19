import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import siteRoutes from "./routes/site.routes.js";
import rateLimit from "express-rate-limit";
import { errorMiddleware } from "./middleware/error.middleware.js";

dotenv.config();

const app = express();

app.set("trust proxy", 1); 

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  })
);
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);


app.use("/auth", authRoutes);
app.use("/progress", progressRoutes);
app.use("/sites", siteRoutes);    

const PORT = process.env.PORT || 5000;

app.get("/", function (req, res) {
  res.json({ message: "HeritageAtlas Backend Running" });
});

// 404 catch-all (must be AFTER all routes)
app.use(function (req, res, next) {
  const err = new Error("Route not found");
  err.status = 404;
  next(err);
});

// Global error handler (must be LAST middleware)
app.use(errorMiddleware);

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, function () {
      console.log("Server running on port " + PORT);
    });

  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
