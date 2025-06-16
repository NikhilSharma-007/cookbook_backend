import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) {
    console.error("No file path provided for upload.");
    return null;
  }

  try {
    const normalizedPath = path.normalize(localFilePath).replace(/\\/g, "/");
    console.log("Uploading file to Cloudinary:", normalizedPath);

    const response = await cloudinary.uploader.upload(normalizedPath, {
      resource_type: "auto",
    });

    console.log("File uploaded successfully:", response.secure_url);

    fs.unlinkSync(localFilePath);

    return response.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error.message);

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};

export { uploadOnCloudinary };
