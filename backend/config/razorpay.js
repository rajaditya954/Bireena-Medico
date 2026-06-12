import Razorpay from "razorpay";
import { config } from "./env.js";

const razorpay = new Razorpay({
  key_id: config.razorpayKey,
  key_secret: config.razorpaySecret,
});

export default razorpay;