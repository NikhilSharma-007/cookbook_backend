import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
} from "../controllers/auth.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

router.route("/logout").post(verifyJwt, logoutUser);
router.route("/current-user").get(verifyJwt, getCurrentUser);

export default router;
