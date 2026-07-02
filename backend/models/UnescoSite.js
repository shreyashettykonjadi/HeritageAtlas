import mongoose from "mongoose";

const unescoSiteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    isoCodes: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ["Cultural", "Natural", "Mixed"],
      required: true,
    },
    year: {
      type: Number,
    },
    region: {
      type: String,
    },
    regionCode: {
      type: String,
    },
    transboundary: {
      type: Boolean,
      default: false,
    },
    areaHectares: {
      type: Number,
    },
    criteria: {
      type: String,
    },
    shortDescription: {
      type: String,
    },
    description: {
      type: String,
    },
    justification: {
      type: String,
    },
    danger: {
      type: Boolean,
      default: false,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    mainImage: {
      originalUrl: {
        type: String,
        trim: true,
      },
      source: {
        type: String,
        default: "unesco",
      },
    },
    galleryImages: {
      type: [
        {
          originalUrl: {
            type: String,
            trim: true,
          },
          thumbnailUrl: {
            type: String,
            trim: true,
          },
          title: {
            type: String,
            trim: true,
          },
          attribution: {
            type: String,
            trim: true,
          },
          source: {
            type: String,
            default: "wikimedia",
          },
        },
      ],
      default: [],
    },
    imagesLastUpdated: {
      type: Date,
    },
  },
  { timestamps: true }
);

unescoSiteSchema.index({ location: "2dsphere" });

const UnescoSite = mongoose.model("UnescoSite", unescoSiteSchema);

export default UnescoSite;
