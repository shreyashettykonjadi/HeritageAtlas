import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import UnescoSite from "../models/UnescoSite.js";

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI not defined");
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");

    const filePath = path.resolve("data/unesco_clean.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const sites = JSON.parse(raw);

    console.log("Records to seed:", sites.length);

    await UnescoSite.deleteMany({});
    console.log("Cleared existing UnescoSite documents");

    const result = await UnescoSite.insertMany(sites);
    console.log("Inserted:", result.length);

    await mongoose.connection.close();
    console.log("MongoDB connection closed");

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    await mongoose.connection.close().catch(function () {});
    process.exit(1);
  }
}

seed();
