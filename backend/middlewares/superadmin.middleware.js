import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export const authenticateSuperAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Access token required" });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    if (!decoded.isSuperAdmin) {
      return res.status(403).json({ error: "Super Admin access required" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired Super Admin token" });
  }
};
