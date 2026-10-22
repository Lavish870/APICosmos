const mongoose = require("mongoose");

const apiSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "API name is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "API description is required"],
      trim: true,
    },

    category: {
      type: String,
      required: [true, "API category is required"],
      trim: true,
    },

    auth: {
      type: String,
      required: [true, "Authentication type is required"],
      trim: true,
    },

    pricing: {
      type: String,
      required: [true, "Pricing information is required"],
      trim: true,
    },

    url: {
      type: String,
      required: [true, "Documentation URL is required"],
      trim: true,
    },

    website: {
      type: String,
      trim: true,
      default: "",
    },

    color: {
      type: String,
      trim: true,
      default: "API",
    },
    
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

apiSchema.index(
  { name: 1 },
  {
    unique: true,
    collation: {
      locale: "en",
      strength: 2,
    },
  }
);

module.exports = mongoose.model("Api", apiSchema);
