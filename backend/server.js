import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

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
