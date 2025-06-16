import mongoose, { Schema } from "mongoose";

const recipeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    instructions: {
      type: String,
      required: true,
    },
    thumbnailImage: {
      type: String,
      required: true,
    },
    ingredients: [
      {
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: String,
          required: true,
        },
        unit: {
          type: String,
          required: true,
        },
      },
    ],
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for text search on recipe name
recipeSchema.index({ name: "text" });

export const Recipe = mongoose.model("Recipe", recipeSchema);
