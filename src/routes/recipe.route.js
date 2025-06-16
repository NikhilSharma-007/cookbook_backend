import { Router } from "express";
import {
  createRecipe,
  getAllRecipes,
  getUserRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  addToFavorites,
  removeFromFavorites,
  getFavoriteRecipes,
} from "../controllers/recipe.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// auth middleware to ALL routes
router.use(verifyJwt);

router.route("/favorites").get(getFavoriteRecipes);
router.route("/:recipeId/add-favorite").post(addToFavorites);
router.route("/:recipeId/remove-favorite").delete(removeFromFavorites);

router.route("/").get(getAllRecipes);
router.route("/user-recipes").get(getUserRecipes);
router.route("/create").post(upload.single("thumbnailImage"), createRecipe);

router.route("/:recipeId").get(getRecipeById);
router
  .route("/:recipeId/update")
  .patch(upload.single("thumbnailImage"), updateRecipe);
router.route("/:recipeId/delete").delete(deleteRecipe);

export default router;
