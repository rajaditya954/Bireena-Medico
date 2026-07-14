import express from "express";
import * as superadminController from "../controllers/superadmin.controller.js";
import { authenticateSuperAdmin } from "../middlewares/superadmin.middleware.js";

const router = express.Router();

// Public Super Admin endpoint
router.post("/login", superadminController.login);

// Secure Super Admin endpoints
router.use(authenticateSuperAdmin);

router.get("/hospitals", superadminController.getHospitals);
router.post("/hospitals", superadminController.createHospital);
router.put("/hospitals/:id", superadminController.updateHospital);
router.delete("/hospitals/:id", superadminController.deleteHospital);
router.patch("/hospitals/:id/active", superadminController.toggleHospitalActive);
router.post("/hospitals/:hospitalId/admin", superadminController.createHospitalAdmin);
router.get("/hospitals/:hospitalId/users", superadminController.getHospitalUsers);
router.post("/hospitals/:hospitalId/users", superadminController.createHospitalUser);
router.patch("/hospitals/:hospitalId/users/:userId/active", superadminController.toggleHospitalUserActive);
router.delete("/hospitals/:hospitalId/users/:userId", superadminController.deleteHospitalUser);
router.get("/analytics", superadminController.getSaasAnalytics);

export default router;
