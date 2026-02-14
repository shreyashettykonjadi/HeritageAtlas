import mongoose from "mongoose";

const userProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
    },
    placeId: {
      type: String,
      required: true,
      trim: true,
    },
    visited: {
      type: Boolean,
      default: false,
    },
    bucket: {
      type: Boolean,
      default: false,
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

// Prevent duplicate progress per user per place
userProgressSchema.index(
  { userId: 1, placeId: 1 },
  { unique: true }
);

const UserProgress = mongoose.model("UserProgress", userProgressSchema);

export default UserProgress;
