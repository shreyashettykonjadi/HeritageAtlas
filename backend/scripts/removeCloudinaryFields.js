import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import UnescoSite from "../models/UnescoSite.js";

async function main() {
  await connectDB();

  const result = await UnescoSite.updateMany(
    {},
    {
      $unset: {
        "mainImage.cloudinaryUrl": "",
        "galleryImages.$[].cloudinaryUrl": "",
      },
    }
  );

  console.log("MongoDB connected");
  console.log(`Matched: ${result.matchedCount ?? result.nMatched ?? 0}`);
  console.log(`Modified: ${result.modifiedCount ?? result.nModified ?? 0}`);

  await mongoose.connection.close();
  process.exit(0);
}

main().catch(async (error) => {
  console.error("Cloudinary field removal failed:", error.message);
  await mongoose.connection.close().catch(function () {});
  process.exit(1);
});
