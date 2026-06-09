import { v2 as cloudinary } from "cloudinary";
import { config } from "./env.js";

if (config.cloudinaryName && config.cloudinaryKey && config.cloudinarySecret) {
  cloudinary.config({
    cloud_name: config.cloudinaryName,
    api_key: config.cloudinaryKey,
    api_secret: config.cloudinarySecret,
  });
}

export default cloudinary;
