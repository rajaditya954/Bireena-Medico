import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "default-secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "default-refresh-secret";

// Role enumeration
const Role = {
  ADMIN: "ADMIN",
  DOCTOR: "DOCTOR",
  PATIENT: "PATIENT",
  RECEPTIONIST: "RECEPTIONIST",
  LAB: "LAB",
  PHARMACY: "PHARMACY"
};

// In-memory DB for demo
const users = [
  {
    id: "admin-1",
    name: "Admin User",
    email: "admin.medico",
    phone: "1234567890",
    passwordHash: bcrypt.hashSync("medicouseradmin", 10),
    role: Role.ADMIN,
    isActive: true,
    lastLoginAt: null
  },
  {
    id: "doctor-1",
    name: "Dr. Smith",
    email: "doctor.medico",
    phone: "0987654321",
    passwordHash: bcrypt.hashSync("medicouserdoctor", 10),
    role: Role.DOCTOR,
    isActive: true,
    lastLoginAt: null
  },
  {
    id: "patient-1",
    name: "John Doe",
    email: "patient.medico",
    phone: "5551234567",
    passwordHash: bcrypt.hashSync("medicouserpatient", 10),
    role: Role.PATIENT,
    isActive: true,
    lastLoginAt: null
  }
];

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Too many login attempts, please try again later." }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy for express-rate-limit to work correctly behind a load balancer/proxy
  app.set("trust proxy", 1);

  app.use(helmet({
    contentSecurityPolicy: false // Disable CSP for Vite dev mode
  }));
  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());

  // Auth Middleware
  const authenticateToken = (req, res, next) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: "Forbidden" });
      req.user = user;
      next();
    });
  };

  const authorizeRoles = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      next();
    };
  };

  // API Routes
  app.post("/api/auth/login", loginLimiter, (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid credentials or account inactive" });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    user.lastLoginAt = new Date();

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("accessToken", accessToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out" });
  });

  app.get("/api/auth/me", authenticateToken, (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  });

  // Admin only: create staff
  app.post("/api/admin/users", authenticateToken, authorizeRoles(Role.ADMIN), (req, res) => {
    const schema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      phone: z.string(),
      role: z.string(), // Use string for simplicity in JS
      password: z.string().min(8)
    });

    const validated = schema.safeParse(req.body);
    if (!validated.success) return res.status(400).json(validated.error);

    const { name, email, phone, role, password } = validated.data;

    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      phone,
      passwordHash: bcrypt.hashSync(password, 10),
      role,
      isActive: true,
      lastLoginAt: null
    };

    users.push(newUser);
    res.status(201).json({ message: "User created successfully", userId: newUser.id });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
