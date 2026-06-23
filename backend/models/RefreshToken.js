import db from "../config/db-client.js";

const RefreshTokenSchema = new db.Schema(
  {
    userId: { type: db.Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    isRevoked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default db.model("RefreshToken", RefreshTokenSchema);
