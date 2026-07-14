import SaasAdmin from "../models/SaasAdmin.js";
import Hospital from "../models/Hospital.js";
import User from "../models/User.js";
import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import Billing from "../models/Billing.js";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { clearTenantContext } from "../config/db-client.js";
import { generateResponse, generateError } from "../utils/response.js";
import authService from "../services/auth.service.js";

// Helper to wrap block and temporarily clear tenant context for global SaaS scope queries
const runGlobal = async (fn) => {
  clearTenantContext();
  try {
    return await fn();
  } finally {
    clearTenantContext();
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json(generateError("Email and password are required"));
    }

    const admin = await runGlobal(() => SaasAdmin.findOne({ email: email.toLowerCase() }));
    if (!admin) {
      return res.status(401).json(generateError("Invalid Super Admin credentials"));
    }

    if (!admin.isActive) {
      return res.status(403).json(generateError("Super Admin account is deactivated"));
    }

    const isPasswordValid = await admin.checkPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json(generateError("Invalid Super Admin credentials"));
    }

    // Update last login
    admin.lastLogin = new Date();
    await runGlobal(() => admin.save());

    // Sign Super Admin token (does not contain a hospitalId, has isSuperAdmin: true)
    const token = jwt.sign(
      { id: admin._id, name: admin.name, email: admin.email, isSuperAdmin: true },
      config.jwtSecret,
      { expiresIn: config.jwtExpire }
    );

    res.json(
      generateResponse(
        {
          token,
          user: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: "SUPER_ADMIN",
          },
        },
        "Super Admin authentication successful"
      )
    );
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const getHospitals = async (req, res) => {
  try {
    const hospitals = await runGlobal(() => Hospital.find().sort({ createdAt: -1 }));
    res.json(generateResponse({ hospitals }, "Hospitals retrieved successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const createHospital = async (req, res) => {
  try {
    const { name, slug, address, city, state, pincode, phone, email, maxUsers, subscriptionPlan } = req.body;
    if (!name || !slug) {
      return res.status(400).json(generateError("Name and unique slug are required"));
    }

    const existing = await runGlobal(() => Hospital.findOne({ slug: slug.toLowerCase() }));
    if (existing) {
      return res.status(400).json(generateError("A hospital with this slug already exists"));
    }

    const hospital = new Hospital({
      name,
      slug: slug.toLowerCase(),
      address,
      city,
      state,
      pincode,
      phone,
      email,
      maxUsers: maxUsers || 50,
      subscriptionPlan: subscriptionPlan || "basic",
      subscriptionStatus: "active",
      isActive: true,
    });

    await runGlobal(() => hospital.save());
    res.status(201).json(generateResponse({ hospital }, "Hospital registered successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const updateHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const hospital = await runGlobal(() => Hospital.findByIdAndUpdate(id, updates, { new: true }));
    if (!hospital) {
      return res.status(404).json(generateError("Hospital not found"));
    }

    res.json(generateResponse({ hospital }, "Hospital settings updated successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const toggleHospitalActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const hospital = await runGlobal(() => Hospital.findById(id));
    if (!hospital) {
      return res.status(404).json(generateError("Hospital not found"));
    }

    hospital.isActive = isActive;
    await runGlobal(() => hospital.save());

    res.json(generateResponse({ hospital }, `Hospital status updated to ${isActive ? "Active" : "Inactive"}`));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const createHospitalAdmin = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json(generateError("Name, email, and password are required"));
    }

    const hospital = await runGlobal(() => Hospital.findById(hospitalId));
    if (!hospital) {
      return res.status(404).json(generateError("Hospital does not exist"));
    }

    // Check if an admin user already exists for this hospital
    let adminUser = await runGlobal(() => User.findOne({ hospital_id: hospitalId, role: "ADMIN" }));

    if (adminUser) {
      // Check email uniqueness if email is changing
      if (adminUser.email !== email.toLowerCase()) {
        const emailCheck = await runGlobal(() => User.findOne({ email: email.toLowerCase() }));
        if (emailCheck) {
          return res.status(400).json(generateError("Email already in use by another user"));
        }
      }
      adminUser.name = name;
      adminUser.email = email.toLowerCase();
      adminUser.phone = phone;
      await adminUser.setPassword(password);
      await runGlobal(() => adminUser.save());
    } else {
      // Check email uniqueness globally
      const emailCheck = await runGlobal(() => User.findOne({ email: email.toLowerCase() }));
      if (emailCheck) {
        return res.status(400).json(generateError("Email already registered"));
      }
      adminUser = new User({
        name,
        email: email.toLowerCase(),
        phone,
        role: "ADMIN",
        isActive: true,
        hospital_id: hospitalId
      });
      await adminUser.setPassword(password);
      await runGlobal(() => adminUser.save());
    }

    // Save plain-text admin details to Hospital document for SuperAdmin convenience
    hospital.email = email.toLowerCase();
    if (!hospital.settings) hospital.settings = {};
    hospital.settings.adminEmail = email.toLowerCase();
    hospital.settings.adminPassword = password;
    hospital.settings.adminName = name;
    hospital.settings.adminPhone = phone || "";
    await runGlobal(() => hospital.save());

    res.status(201).json(generateResponse(
      { 
        user: adminUser.toSafeJSON ? adminUser.toSafeJSON() : adminUser,
        hospital
      }, 
      "Hospital Admin account created/updated successfully"
    ));
  } catch (error) {
    res.status(400).json(generateError(error.message));
  }
};

export const getSaasAnalytics = async (req, res) => {
  try {
    const metrics = await runGlobal(async () => {
      const hospitalCount = await Hospital.countDocuments();
      const activeHospitals = await Hospital.countDocuments({ isActive: true });
      const totalUsers = await User.countDocuments();
      const totalPatients = await Patient.countDocuments();
      const totalAppointments = await Appointment.countDocuments();
      
      const billings = await Billing.find();
      const totalRevenue = billings.reduce((sum, b) => sum + (Number(b.total) || 0), 0);

      return {
        hospitalCount,
        activeHospitals,
        totalUsers,
        totalPatients,
        totalAppointments,
        totalRevenue,
      };
    });

    res.json(generateResponse(metrics, "SaaS metrics retrieved successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const getHospitalUsers = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const users = await runGlobal(async () => {
      const all = await User.find({ hospital_id: hospitalId });
      return all
        .filter(u => u.role !== "PATIENT")
        .map(u => u.toSafeJSON ? u.toSafeJSON() : u);
    });
    res.json(generateResponse({ users }, "Hospital users retrieved successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const createHospitalUser = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json(generateError("Name, email, password, and role are required"));
    }
    const result = await authService.register(name, email, password, role, phone, hospitalId);
    res.status(201).json(generateResponse(result, "Hospital user created successfully"));
  } catch (error) {
    res.status(400).json(generateError(error.message));
  }
};

export const toggleHospitalUserActive = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;
    const user = await runGlobal(async () => {
      const u = await User.findById(userId);
      if (!u) return null;
      u.isActive = isActive;
      await u.save();
      return u.toSafeJSON ? u.toSafeJSON() : u;
    });
    if (!user) {
      return res.status(404).json(generateError("User not found"));
    }
    res.json(generateResponse({ user }, `User status updated to ${isActive ? "Active" : "Inactive"}`));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const deleteHospitalUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const deleted = await runGlobal(() => User.findByIdAndDelete(userId));
    if (!deleted) {
      return res.status(404).json(generateError("User not found"));
    }
    res.json(generateResponse({}, "User deleted successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const deleteHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await runGlobal(() => Hospital.findByIdAndDelete(id));
    if (!deleted) {
      return res.status(404).json(generateError("Hospital not found"));
    }
    // Clean up users associated with this hospital
    await runGlobal(() => User.deleteMany({ hospital_id: id }));
    res.json(generateResponse({}, "Hospital and associated users deleted successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};
