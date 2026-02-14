import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import progressRoutes from "./routes/progress.routes.js";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);


app.use("/progress", progressRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", function (req, res) {
  res.json({ message: "HeritageAtlas Backend Running" });
});

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
