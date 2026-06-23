import Razorpay from "razorpay";
import { config } from "./env.js";

let razorpay = null;

if (config.razorpayKey && config.razorpaySecret) {
  razorpay = new Razorpay({
    key_id: config.razorpayKey,
    key_secret: config.razorpaySecret,
  });
}

export default razorpay;
