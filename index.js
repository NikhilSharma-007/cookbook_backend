import app from "./app.js";
import connectDB from "./src/db/index.js";
import dotenv from "dotenv";

dotenv.config();

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 9000, (req, res) => {
      console.log("App is running on port: ", process.env.PORT);
    });
  })
  .catch((err) => {
    console.log("Mongodb connection failed!!! ", err);
  });
