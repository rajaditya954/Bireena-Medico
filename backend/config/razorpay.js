// backend/config/razorpay.js
import Razorpay from "razorpay";
import { config } from "./env.js";

if (!(config.razorpayKey && config.razorpaySecret) && !config.razorpayOauthToken) {
  console.warn(
    "[Razorpay] WARNING: RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET or RAZORPAY_OAUTH_TOKEN is not set in .env. " +
    "Online payments will fail."
  );
}

// Export a single Razorpay instance used across the app.
// Null-safe: if keys are missing the instance is still created but orders will throw.
const razorpayConfig = config.razorpayOauthToken
  ? { oauthToken: config.razorpayOauthToken }
  : { key_id: config.razorpayKey, key_secret: config.razorpaySecret };

const razorpayInstance = new Razorpay(razorpayConfig);

export default razorpayInstance;