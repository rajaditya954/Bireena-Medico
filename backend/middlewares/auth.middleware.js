import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { setTenantContext, clearTenantContext } from "../config/db-client.js";

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: "Access token required" });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;

    if (decoded.hospitalId) {
      req.hospitalId = decoded.hospitalId;
      setTenantContext(decoded.hospitalId);
    } else {
      clearTenantContext();
    }

    // Clear context on request end to prevent cross-request leakage
    res.on("finish", () => {
      clearTenantContext();
    });

    next();
  } catch (error) {
    clearTenantContext();
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = decoded;
      if (decoded.hospitalId) {
        req.hospitalId = decoded.hospitalId;
        setTenantContext(decoded.hospitalId);
      }
    }
    
    res.on("finish", () => {
      clearTenantContext();
    });
    
    next();
  } catch (error) {
    clearTenantContext();
    next();
  }
};
