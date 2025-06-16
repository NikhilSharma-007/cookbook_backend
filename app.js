import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes import
import authRouter from "./src/routes/auth.route.js";
import recipeRouter from "./src/routes/recipe.route.js";

// Routes declaration
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/recipes", recipeRouter);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running successfully",
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

export default app;
