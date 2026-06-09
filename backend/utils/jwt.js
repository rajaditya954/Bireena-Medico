import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    config.jwtSecret,
    { expiresIn: config.jwtExpire }
  );
};

export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    config.jwtSecret,
    { expiresIn: "30d" }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    return null;
  }
};

export const decodeToken = (token) => {
  return jwt.decode(token);
};
