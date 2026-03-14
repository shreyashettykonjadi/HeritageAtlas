import mongoose from "mongoose";

const userProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UnescoSite",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["visited", "bucket"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    notes: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    visitDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Prevent duplicate progress per user per place compound index key
userProgressSchema.index(
  { user: 1, site: 1 },
  { unique: true }
);

const UserProgress = mongoose.model("UserProgress", userProgressSchema);

export default UserProgress;
