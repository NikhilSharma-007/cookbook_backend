import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Recipe } from "../models/receipe.model.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createRecipe = asyncHandler(async (req, res) => {
  const { name, instructions, ingredients } = req.body;

  if (!name || !instructions || !ingredients) {
    throw new ApiError(400, "Name, instructions, and ingredients are required");
  }

  const thumbnailImageLocalPath = req.file?.path;
  if (!thumbnailImageLocalPath) {
    throw new ApiError(400, "Thumbnail image file is required");
  }

  const thumbnailImage = await uploadOnCloudinary(thumbnailImageLocalPath);
  if (!thumbnailImage) {
    throw new ApiError(400, "Error while uploading thumbnail image");
  }

  let parsedIngredients;
  try {
    parsedIngredients =
      typeof ingredients === "string" ? JSON.parse(ingredients) : ingredients;
  } catch (error) {
    throw new ApiError(400, "Invalid ingredients format");
  }

  const recipe = await Recipe.create({
    name,
    instructions,
    ingredients: parsedIngredients,
    thumbnailImage,
    postedBy: req.user._id,
  });

  const createdRecipe = await Recipe.findById(recipe._id).populate(
    "postedBy",
    "username fullName"
  );
  if (!createdRecipe) {
    throw new ApiError(500, "Something went wrong while creating the recipe");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdRecipe, "Recipe created successfully"));
});

const getAllRecipes = asyncHandler(async (req, res) => {
  const { search } = req.query;
  let query = {};

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  const recipes = await Recipe.find(query)
    .populate("postedBy", "username fullName")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, { recipes }, "Recipes fetched successfully"));
});

const getUserRecipes = asyncHandler(async (req, res) => {
  const recipes = await Recipe.find({ postedBy: req.user._id })
    .populate("postedBy", "username fullName")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { recipes }, "User recipes fetched successfully")
    );
});

const getRecipeById = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;

  const recipe = await Recipe.findById(recipeId).populate(
    "postedBy",
    "username fullName"
  );
  if (!recipe) {
    throw new ApiError(404, "Recipe not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, recipe, "Recipe fetched successfully"));
});

const updateRecipe = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;
  const { name, instructions, ingredients } = req.body;

  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    throw new ApiError(404, "Recipe not found");
  }

  if (recipe.postedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only update your own recipes");
  }

  let thumbnailImage = recipe.thumbnailImage;
  if (req.file?.path) {
    const newThumbnailImage = await uploadOnCloudinary(req.file.path);
    if (newThumbnailImage) {
      thumbnailImage = newThumbnailImage;
    }
  }

  let parsedIngredients = ingredients;
  if (typeof ingredients === "string") {
    try {
      parsedIngredients = JSON.parse(ingredients);
    } catch (error) {
      throw new ApiError(400, "Invalid ingredients format");
    }
  }

  const updatedRecipe = await Recipe.findByIdAndUpdate(
    recipeId,
    {
      name: name || recipe.name,
      instructions: instructions || recipe.instructions,
      ingredients: parsedIngredients || recipe.ingredients,
      thumbnailImage,
    },
    { new: true }
  ).populate("postedBy", "username fullName");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedRecipe, "Recipe updated successfully"));
});

const deleteRecipe = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;

  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    throw new ApiError(404, "Recipe not found");
  }

  if (recipe.postedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own recipes");
  }

  await User.updateMany(
    { favoriteRecipes: recipeId },
    { $pull: { favoriteRecipes: recipeId } }
  );

  await Recipe.findByIdAndDelete(recipeId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Recipe deleted successfully"));
});

const addToFavorites = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;

  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    throw new ApiError(404, "Recipe not found");
  }

  const user = await User.findById(req.user._id);
  if (user.favoriteRecipes.includes(recipeId)) {
    throw new ApiError(400, "Recipe is already in favorites");
  }

  user.favoriteRecipes.push(recipeId);
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Recipe added to favorites"));
});

const removeFromFavorites = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;

  const user = await User.findById(req.user._id);
  if (!user.favoriteRecipes.includes(recipeId)) {
    throw new ApiError(400, "Recipe is not in favorites");
  }

  user.favoriteRecipes = user.favoriteRecipes.filter(
    (id) => id.toString() !== recipeId
  );
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Recipe removed from favorites"));
});

const getFavoriteRecipes = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "favoriteRecipes",
    populate: {
      path: "postedBy",
      select: "username fullName",
    },
    options: {
      sort: { createdAt: -1 },
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { recipes: user.favoriteRecipes },
        "Favorite recipes fetched successfully"
      )
    );
});

export {
  createRecipe,
  getAllRecipes,
  getUserRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  addToFavorites,
  removeFromFavorites,
  getFavoriteRecipes,
};
