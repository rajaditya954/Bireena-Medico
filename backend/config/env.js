export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || process.env.mongo_uri,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || "7d",
  corsOrigin: (process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:8080")
    .split(",")
    .map((s) => s.trim()),
  nodeEnv: process.env.NODE_ENV || "development",
  razorpayKey: process.env.RAZORPAY_KEY,
  razorpaySecret: process.env.RAZORPAY_SECRET,
  cloudinaryName: process.env.CLOUDINARY_NAME,
  cloudinaryKey: process.env.CLOUDINARY_KEY,
  cloudinarySecret: process.env.CLOUDINARY_SECRET,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
  supabaseBucket: process.env.SUPABASE_BUCKET || "lab-reports",
  emailService: process.env.EMAIL_SERVICE,
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
};
