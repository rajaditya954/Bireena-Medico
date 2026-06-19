import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Users,
  MapPin,
  Key,
  Shield,
  FileText,
  CheckSquare,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";
import { Button } from "../../components/common/Button";

// ==================== Mock Data ====================
// Role values should match UserManagement
const UserRoles = [
  "Doctor",
  "Lab Assistant",
  "Clinic Staff",
  "Appointment Staff",
  "Billing Staff",
  "Admin",
];

// ==================== Mock Data ====================

const availableLabsClinics = [
  "Cardiology Clinic",
  "Pathology Lab",
  "Neurology Clinic",
  "Radiology Lab",
  "Main Clinic",
  "Reception",
  "Billing Department",
  "Pharmacy",
];

const availableReportTypes = [
  "Hematology Reports",
  "Microbiology Reports",
  "Immunology Reports",
  "Pathology (General)",
  "Biochemistry Reports",
  "Radiology Reports",
];

const departments = [
  "Cardiology",
  "Neurology",
  "Pathology",
  "Radiology",
  "General Medicine",
  "Pediatrics",
  "Orthopedics",
  "Reception",
  "Billing",
  "Pharmacy",
];

const reportingManagers = [
  "Dr. Sarah Miller",
  "Dr. John Doe",
  "Admin User",
  "Dr. Emily Clarke",
];

const languages = ["English", "Spanish", "French", "German", "Hindi", "Arabic"];

// ==================== Password Validator ====================
const validatePassword = (password) => ({
  minLength: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /[0-9]/.test(password),
  specialChar: /[!@#$%^&*]/.test(password),
});

const isPasswordValid = (errors) =>
  Object.values(errors).every(Boolean);

// ==================== Main Component ====================
export default function AddNewUser() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    mobileCountryCode: "+91",
    dateOfBirth: "",
    gender: "",
    language: "",
    address: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "Doctor",
    department: "",
    reportingTo: "",
    labClinicAccess: "all",
    selectedLabsClinics: [],
    reportAccess: "all",
    selectedReportTypes: [],
    permissions: [],
    sendCredentials: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const passwordErrors = validatePassword(formData.password);
  const passwordValid = isPasswordValid(passwordErrors);
  const passwordsMatch = formData.password === formData.confirmPassword;

  const isFormValid = () => {
    return (
      formData.fullName.trim() !== "" &&
      formData.email.trim() !== "" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
      formData.mobile.trim() !== "" &&
      formData.username.trim() !== "" &&
      passwordValid &&
      passwordsMatch &&
      formData.role !== "" &&
      formData.department !== ""
    );
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Toggle a permission string in the permissions array
  const togglePermission = (perm) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const handleLabClinicToggle = (item) => {
    setFormData((prev) => ({
      ...prev,
      selectedLabsClinics: prev.selectedLabsClinics.includes(item)
        ? prev.selectedLabsClinics.filter((i) => i !== item)
        : [...prev.selectedLabsClinics, item],
    }));
  };

  const handleReportTypeToggle = (item) => {
    setFormData((prev) => ({
      ...prev,
      selectedReportTypes: prev.selectedReportTypes.includes(item)
        ? prev.selectedReportTypes.filter((i) => i !== item)
        : [...prev.selectedReportTypes, item],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      setSubmitError("Please fill all required fields correctly.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const { adminService } = await import("../../services/adminService");
      const roleMap = (r) => {
        const map = {
          Doctor: "DOCTOR",
          "Lab Assistant": "LAB",
          "Clinic Staff": "DISPENSARY_STAFF",
          "Appointment Staff": "APPOINTMENT_MANAGER",
          "Billing Staff": "BILLING",
          Admin: "ADMIN",
        };
        return map[r] || r.toUpperCase().replace(/\s+/g, "_");
      };

      const payload = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password || "ChangeMe@123",
        role: roleMap(formData.role),
        phone: formData.mobileCountryCode + formData.mobile,
      };

      await adminService.createUser(payload);
      navigate("/admin/users");
    } catch (error) {
      setSubmitError("Failed to create user. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Role description mapping (used for UI hint)
  const roleDescription = {
    Doctor: "Can manage patients, prescriptions, appointments & reports",
    "Lab Assistant": "Can view & manage lab reports based on access",
    "Clinic Staff": "Can manage medicine distribution & patients",
    "Appointment Staff": "Can manage appointments & calendar",
    "Billing Staff": "Can manage billing, invoices & payments",
    Admin: "Full system access & user management",
  };

  return (
    <div className="min-h-screen bg-gray-50/40 py-8 px-4 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with back button */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/users")}
            className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">Back to User Management</span>
          </button>
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tight">
              Add New User
            </h1>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
              User Management &gt; Add New User
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ===== Basic Information ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 bg-linear-to-r from-primary/5 to-transparent">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Basic Information
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    className="w-24 h-12 px-2 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.mobileCountryCode}
                    onChange={(e) =>
                      handleChange("mobileCountryCode", e.target.value)
                    }
                  >
                    <option value="+91">+91 (IND)</option>
                    <option value="+1">+1 (USA)</option>
                    <option value="+44">+44 (UK)</option>
                  </select>
                  <input
                    type="tel"
                    placeholder="Enter mobile number"
                    className="flex-1 h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.mobile}
                    onChange={(e) => handleChange("mobile", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  Date of Birth
                </label>
                <input
                  type="date"
                  className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  Gender
                </label>
                <select
                  className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  Language
                </label>
                <select
                  className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.language}
                  onChange={(e) => handleChange("language", e.target.value)}
                >
                  <option value="">Select language</option>
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  Address
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter full address"
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
              </div>
            </div>
          </motion.div>

          {/* ===== Account Information ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 bg-linear-to-r from-primary/5 to-transparent">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                Account Information
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter username"
                  className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create password"
                    className="w-full h-12 px-4 pr-10 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    className="w-full h-12 px-4 pr-10 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Policy Checklist */}
            <div className="px-6 pb-6">
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-xs font-black text-amber-700 uppercase tracking-wider mb-2">
                  Password Policy
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    {passwordErrors.minLength ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                    <span className={passwordErrors.minLength ? "text-emerald-700" : "text-amber-700"}>
                      Minimum 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {passwordErrors.uppercase ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                    <span className={passwordErrors.uppercase ? "text-emerald-700" : "text-amber-700"}>
                      At least one uppercase letter (A-Z)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {passwordErrors.lowercase ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                    <span className={passwordErrors.lowercase ? "text-emerald-700" : "text-amber-700"}>
                      At least one lowercase letter (a-z)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {passwordErrors.number ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                    <span className={passwordErrors.number ? "text-emerald-700" : "text-amber-700"}>
                      At least one number (0-9)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 col-span-full">
                    {passwordErrors.specialChar ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                    <span className={passwordErrors.specialChar ? "text-emerald-700" : "text-amber-700"}>
                      At least one special character (!@#$%^&*)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ===== Role & Department ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 bg-linear-to-r from-primary/5 to-transparent">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Role & Department
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  Select Role <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                >
                  <option value="Doctor">Doctor</option>
                  <option value="Lab Assistant">Lab Assistant</option>
                  <option value="Clinic Staff">Clinic Staff</option>
                  <option value="Appointment Staff">Appointment Staff</option>
                  <option value="Billing Staff">Billing Staff</option>
                  <option value="Admin">Admin</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">{roleDescription[formData.role]}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  Department / Lab / Clinic <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                >
                  <option value="">Select department, lab or clinic</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  Reporting To
                </label>
                <select
                  className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.reportingTo}
                  onChange={(e) => handleChange("reportingTo", e.target.value)}
                >
                  <option value="">Select reporting manager</option>
                  {reportingManagers.map((manager) => (
                    <option key={manager} value={manager}>
                      {manager}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* ===== Access & Permissions ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 bg-linear-to-r from-primary/5 to-transparent">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Access & Permissions
              </h2>
            </div>
            <div className="p-6 space-y-8">
              {/* Lab / Clinic Access */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3">Lab / Clinic Access</h3>
                <div className="flex flex-wrap gap-6 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="labClinicAccess"
                      checked={formData.labClinicAccess === "all"}
                      onChange={() => handleChange("labClinicAccess", "all")}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">All Labs / Clinics</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="labClinicAccess"
                      checked={formData.labClinicAccess === "specific"}
                      onChange={() => handleChange("labClinicAccess", "specific")}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">Specific Lab / Clinics</span>
                  </label>
                </div>
                {formData.labClinicAccess === "specific" && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {availableLabsClinics.map((item) => (
                        <label key={item} className="flex items-center gap-2 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={formData.selectedLabsClinics.includes(item)}
                            onChange={() => handleLabClinicToggle(item)}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          {item}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {formData.labClinicAccess === "all"
                    ? "User can access all labs / clinics"
                    : "User can access only selected labs / clinics"}
                </p>
              </div>

              {/* Lab Report Access (only for Lab Assistant) */}
              {formData.role === "Lab Assistant" && (
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3">Lab Report Access</h3>
                  <div className="flex flex-wrap gap-6 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="reportAccess"
                        checked={formData.reportAccess === "all"}
                        onChange={() => handleChange("reportAccess", "all")}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium text-gray-700">All Report Types</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="reportAccess"
                        checked={formData.reportAccess === "specific"}
                        onChange={() => handleChange("reportAccess", "specific")}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium text-gray-700">Specific Report Types</span>
                    </label>
                  </div>
                  {formData.reportAccess === "specific" && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {availableReportTypes.map((report) => (
                          <label key={report} className="flex items-center gap-2 cursor-pointer text-sm">
                            <input
                              type="checkbox"
                              checked={formData.selectedReportTypes.includes(report)}
                              onChange={() => handleReportTypeToggle(report)}
                              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            {report}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {formData.reportAccess === "all"
                      ? "Can access all types of lab reports"
                      : "Can access only selected report types"}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* ===== Additional Permissions ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 bg-linear-to-r from-primary/5 to-transparent">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-primary" />
                Additional Permissions
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  "View Patients",
                  "Create / Edit Patients",
                  "View Appointments",
                  "Manage Prescriptions",
                  "View Reports",
                  "Manage Billing",
                  "Manage Inventory",
                ].map((perm) => (
                  <label key={perm} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(perm)}
                      onChange={() => togglePermission(perm)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">{perm}</span>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ===== Send Credentials & Note ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6"
          >
            <label className="flex items-center gap-3 cursor-pointer mb-6">
              <input
                type="checkbox"
                checked={formData.sendCredentials}
                onChange={(e) => handleChange("sendCredentials", e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700">
                Send login credentials to user via email / SMS
              </span>
            </label>

            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800">
                  The user will be able to login after creation. Make sure to assign the appropriate role and permissions.
                </p>
              </div>
            </div>
          </motion.div>

          {submitError && (
            <div className="bg-red-50 rounded-xl p-4 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {submitError}
            </div>
          )}

          {/* ===== Form Actions ===== */}
          <div className="flex gap-4 justify-end sticky bottom-4 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 shadow-lg">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/users")}
              className="h-12 px-6 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !isFormValid()}
              className="h-12 px-8 rounded-xl shadow-lg shadow-primary/20"
            >
              {isSubmitting ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}