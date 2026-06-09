// src/pages/admin/UserAdd.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Key,
  Shield,
  FileText,
  CheckSquare,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Save,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../../components/common/Button";

// ==================== Constants ====================
const ROLES = {
  DOCTOR: "Doctor",
  LAB_ASSISTANT: "Lab Assistant",
  CLINIC_STAFF: "Clinic Staff",
  APPOINTMENT_STAFF: "Appointment Staff",
  BILLING_STAFF: "Billing Staff",
  ADMIN: "Admin",
};

const departments = [
  "Cardiology", "Neurology", "Pathology", "Radiology",
  "General Medicine", "Pediatrics", "Orthopedics", "Reception", "Billing", "Pharmacy"
];

const labsClinics = [
  "Cardiology Clinic", "Pathology Lab", "Neurology Clinic", "Radiology Lab",
  "Main Clinic", "Reception", "Billing Department", "Pharmacy"
];

const reportTypes = [
  "Hematology Reports", "Biochemistry Reports", "Microbiology Reports",
  "Immunology Reports", "Pathology (General) Reports"
];

const reportingManagers = ["Dr. Sarah Miller", "Dr. John Doe", "Admin User", "Dr. Emily Clarke"];
const languages = ["English", "Spanish", "French", "German", "Hindi"];
const permissionOptions = [
  "View Patients", "Create / Edit Patients", "View Appointments",
  "Manage Prescriptions", "View Reports", "Manage Billing", "Manage Inventory"
];

// ==================== Password Validator ====================
const validatePassword = (password) => ({
  minLength: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /[0-9]/.test(password),
  specialChar: /[!@#$%^&*]/.test(password),
});

// ==================== Main Component ====================
export default function UserAdd() {
  const navigate = useNavigate();

  // Form state
  const [basicInfo, setBasicInfo] = useState({
    fullName: "", email: "", mobile: "", mobileCode: "+91",
    dateOfBirth: "", gender: "", language: "", address: ""
  });
  const [accountInfo, setAccountInfo] = useState({
    username: "", password: "", confirmPassword: ""
  });
  const [roleDept, setRoleDept] = useState({
    role: ROLES.DOCTOR, department: "", reportingTo: ""
  });
  const [access, setAccess] = useState({
    labClinicAccess: "all",
    selectedLabsClinics: [],
    reportAccess: "all",
    selectedReportTypes: [],
  });
  const [additionalPerms, setAdditionalPerms] = useState([]);
  const [sendCredentials, setSendCredentials] = useState(true);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const passwordErrors = validatePassword(accountInfo.password);
  const passwordValid = Object.values(passwordErrors).every(Boolean);
  const passwordsMatch = accountInfo.password === accountInfo.confirmPassword;

  const roleDescription = {
    [ROLES.DOCTOR]: "Can manage patients, prescriptions, appointments & reports",
    [ROLES.LAB_ASSISTANT]: "Can view & manage lab reports based on access",
    [ROLES.CLINIC_STAFF]: "Can manage medicine distribution & patients",
    [ROLES.APPOINTMENT_STAFF]: "Can manage appointments & calendar",
    [ROLES.BILLING_STAFF]: "Can manage billing, invoices & payments",
    [ROLES.ADMIN]: "Full system access & user management",
  };

  const handleBasicChange = (field, value) => setBasicInfo(prev => ({ ...prev, [field]: value }));
  const handleAccountChange = (field, value) => setAccountInfo(prev => ({ ...prev, [field]: value }));
  const handleRoleDeptChange = (field, value) => setRoleDept(prev => ({ ...prev, [field]: value }));

  const toggleLabClinic = (item) => {
    setAccess(prev => ({
      ...prev,
      selectedLabsClinics: prev.selectedLabsClinics.includes(item)
        ? prev.selectedLabsClinics.filter(i => i !== item)
        : [...prev.selectedLabsClinics, item]
    }));
  };

  const toggleReportType = (item) => {
    setAccess(prev => ({
      ...prev,
      selectedReportTypes: prev.selectedReportTypes.includes(item)
        ? prev.selectedReportTypes.filter(i => i !== item)
        : [...prev.selectedReportTypes, item]
    }));
  };

  const togglePermission = (perm) => {
    setAdditionalPerms(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const isFormValid = () => {
    if (!basicInfo.fullName.trim()) return false;
    if (!basicInfo.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(basicInfo.email)) return false;
    if (!basicInfo.mobile.trim()) return false;
    if (!accountInfo.username.trim()) return false;
    if (!accountInfo.password) return false;
    if (!passwordValid) return false;
    if (!passwordsMatch) return false;
    if (!roleDept.department) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      setSubmitError("Please fill all required fields correctly.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newUser = {
        id: `USR-${Date.now()}`,
        name: basicInfo.fullName,
        email: basicInfo.email,
        role: roleDept.role,
        department: roleDept.department,
        status: "Active",
        lastLogin: "Never",
        ip: "0.0.0.0",
        isOnline: false,
        personalInfo: {
          email: basicInfo.email,
          mobile: basicInfo.mobileCode + basicInfo.mobile,
          gender: basicInfo.gender || "Not specified",
          dateOfBirth: basicInfo.dateOfBirth || "Not provided",
          address: basicInfo.address || "Not provided",
          username: accountInfo.username,
          lastLogin: "Never",
          ipAddress: "0.0.0.0",
          assignedClinics: access.labClinicAccess === "all" ? "All Clinics/Labs" : access.selectedLabsClinics.join(", "),
          assignedDepartments: roleDept.department,
          permissions: additionalPerms.length ? additionalPerms : ["Default permissions"],
        },
      };

      const existingUsers = JSON.parse(localStorage.getItem("careplus_users") || "[]");
      localStorage.setItem("careplus_users", JSON.stringify([...existingUsers, newUser]));

      setSubmitSuccess("User created successfully!");
      setTimeout(() => navigate("/admin/users"), 1500);
    } catch (error) {
      setSubmitError("Failed to create user. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <button onClick={() => navigate("/admin/users")} className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-3 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-medium">Back to User Management</span>
        </button>
        <h1 className="text-3xl font-black text-primary-dark tracking-tighter italic">Add New User</h1>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">User Management &gt; Add New User</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Two column layout - more compact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> Basic Information
                </h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Full Name <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="Enter full name" className="w-full h-11 px-4 bg-gray-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20" value={basicInfo.fullName} onChange={e => handleBasicChange("fullName", e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Email Address <span className="text-red-500">*</span></label>
                    <input type="email" placeholder="Enter email address" className="w-full h-11 px-4 bg-gray-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20" value={basicInfo.email} onChange={e => handleBasicChange("email", e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Mobile Number <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      <select className="w-24 h-11 px-2 bg-gray-50 rounded-xl text-sm" value={basicInfo.mobileCode} onChange={e => handleBasicChange("mobileCode", e.target.value)}>
                        <option value="+91">+91 (IND)</option><option value="+1">+1 (USA)</option><option value="+44">+44 (UK)</option>
                      </select>
                      <input type="tel" placeholder="Enter mobile number" className="flex-1 h-11 px-4 bg-gray-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20" value={basicInfo.mobile} onChange={e => handleBasicChange("mobile", e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Date of Birth</label>
                    <input type="date" className="w-full h-11 px-4 bg-gray-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20" value={basicInfo.dateOfBirth} onChange={e => handleBasicChange("dateOfBirth", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Gender</label>
                    <select className="w-full h-11 px-4 bg-gray-50 rounded-xl text-sm" value={basicInfo.gender} onChange={e => handleBasicChange("gender", e.target.value)}>
                      <option value="">Select gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Language</label>
                    <select className="w-full h-11 px-4 bg-gray-50 rounded-xl text-sm" value={basicInfo.language} onChange={e => handleBasicChange("language", e.target.value)}>
                      <option value="">Select language</option>{languages.map(lang => <option key={lang}>{lang}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Address</label>
                    <textarea rows={2} placeholder="Enter full address" className="w-full px-4 py-2 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none" value={basicInfo.address} onChange={e => handleBasicChange("address", e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2"><Key className="w-4 h-4 text-primary" /> Account Information</h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Username <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="Enter username" className="w-full h-11 px-4 bg-gray-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20" value={accountInfo.username} onChange={e => handleAccountChange("username", e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} placeholder="Enter password" className="w-full h-11 px-4 pr-10 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" value={accountInfo.password} onChange={e => handleAccountChange("password", e.target.value)} required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                    </div>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Confirm Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input type={showConfirm ? "text" : "password"} placeholder="Confirm password" className="w-full h-11 px-4 pr-10 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" value={accountInfo.confirmPassword} onChange={e => handleAccountChange("confirmPassword", e.target.value)} required />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                    </div>
                  </div>
                </div>
                {accountInfo.password && (
                  <div className="bg-amber-50 rounded-xl p-3 text-[11px] space-y-1">
                    <p className="font-bold text-amber-700">Password Policy</p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                      <div className="flex items-center gap-1">{passwordErrors.minLength ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <AlertCircle className="w-3 h-3 text-amber-500" />}<span>8+ characters</span></div>
                      <div className="flex items-center gap-1">{passwordErrors.uppercase ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <AlertCircle className="w-3 h-3 text-amber-500" />}<span>Uppercase (A-Z)</span></div>
                      <div className="flex items-center gap-1">{passwordErrors.lowercase ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <AlertCircle className="w-3 h-3 text-amber-500" />}<span>Lowercase (a-z)</span></div>
                      <div className="flex items-center gap-1">{passwordErrors.number ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <AlertCircle className="w-3 h-3 text-amber-500" />}<span>Number (0-9)</span></div>
                      <div className="flex items-center gap-1 col-span-2">{passwordErrors.specialChar ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <AlertCircle className="w-3 h-3 text-amber-500" />}<span>Special character (!@#$%^&*)</span></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Role & Department Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Role & Department</h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Select Role <span className="text-red-500">*</span></label>
                  <select className="w-full h-11 px-4 bg-gray-50 rounded-xl text-sm" value={roleDept.role} onChange={e => handleRoleDeptChange("role", e.target.value)}>
                    {Object.values(ROLES).map(role => <option key={role}>{role}</option>)}
                  </select>
                  <p className="text-[11px] text-gray-500">{roleDescription[roleDept.role]}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Department / Lab / Clinic <span className="text-red-500">*</span></label>
                  <select className="w-full h-11 px-4 bg-gray-50 rounded-xl text-sm" value={roleDept.department} onChange={e => handleRoleDeptChange("department", e.target.value)} required>
                    <option value="">Select department, lab or clinic</option>
                    {departments.map(dept => <option key={dept}>{dept}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Reporting To <span className="text-gray-400">(Optional)</span></label>
                  <select className="w-full h-11 px-4 bg-gray-50 rounded-xl text-sm" value={roleDept.reportingTo} onChange={e => handleRoleDeptChange("reportingTo", e.target.value)}>
                    <option value="">Select reporting manager</option>
                    {reportingManagers.map(mgr => <option key={mgr}>{mgr}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Access & Permissions Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Access & Permissions</h2>
              </div>
              <div className="p-5 space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-2">Lab / Clinic Access</h3>
                  <div className="flex gap-4 mb-2">
                    <label className="flex items-center gap-1.5 cursor-pointer text-sm"><input type="radio" name="labClinicAccess" checked={access.labClinicAccess === "all"} onChange={() => setAccess(prev => ({ ...prev, labClinicAccess: "all" }))} className="w-3.5 h-3.5" /> All Labs / Clinics</label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-sm"><input type="radio" name="labClinicAccess" checked={access.labClinicAccess === "specific"} onChange={() => setAccess(prev => ({ ...prev, labClinicAccess: "specific" }))} className="w-3.5 h-3.5" /> Specific Lab / Clinics</label>
                  </div>
                  {access.labClinicAccess === "specific" && (
                    <div className="bg-gray-50 rounded-xl p-3 mb-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {labsClinics.map(item => <label key={item} className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={access.selectedLabsClinics.includes(item)} onChange={() => toggleLabClinic(item)} className="w-3.5 h-3.5 rounded" />{item}</label>)}
                      </div>
                    </div>
                  )}
                  <p className="text-[11px] text-gray-400">{access.labClinicAccess === "all" ? "User can access all labs / clinics" : "User can access only selected labs / clinics"}</p>
                </div>

                {roleDept.role === ROLES.LAB_ASSISTANT && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-2">Lab Report Access</h3>
                    <div className="flex gap-4 mb-2">
                      <label className="flex items-center gap-1.5 cursor-pointer text-sm"><input type="radio" name="reportAccess" checked={access.reportAccess === "all"} onChange={() => setAccess(prev => ({ ...prev, reportAccess: "all" }))} className="w-3.5 h-3.5" /> All Report Types</label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-sm"><input type="radio" name="reportAccess" checked={access.reportAccess === "specific"} onChange={() => setAccess(prev => ({ ...prev, reportAccess: "specific" }))} className="w-3.5 h-3.5" /> Specific Report Types</label>
                    </div>
                    {access.reportAccess === "specific" && (
                      <div className="bg-gray-50 rounded-xl p-3 mb-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {reportTypes.map(type => <label key={type} className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={access.selectedReportTypes.includes(type)} onChange={() => toggleReportType(type)} className="w-3.5 h-3.5 rounded" />{type}</label>)}
                        </div>
                      </div>
                    )}
                    <p className="text-[11px] text-gray-400">{access.reportAccess === "all" ? "Can access all types of lab reports" : "Can access only selected report types"}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Permissions Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2"><CheckSquare className="w-4 h-4 text-primary" /> Additional Permissions</h2>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {permissionOptions.map(perm => <label key={perm} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={additionalPerms.includes(perm)} onChange={() => togglePermission(perm)} className="w-4 h-4 rounded border-gray-300 text-primary" /><span>{perm}</span></label>)}
                </div>
              </div>
            </div>

            {/* Send Credentials & Note Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <label className="flex items-center gap-3 cursor-pointer mb-4 text-sm">
                <input type="checkbox" checked={sendCredentials} onChange={e => setSendCredentials(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary" />
                Send login credentials to user via email / SMS
              </label>
              <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-800 flex gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                The user will be able to login after creation. Make sure to assign the appropriate role and permissions.
              </div>
            </div>
          </div>
        </div>

        {/* Role & Access Information Summary - compact grid */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-black text-slate-800 mb-3">Role & Access Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {Object.entries(roleDescription).map(([role, desc]) => (
              <div key={role} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <div><p className="font-bold text-primary-dark">{role}</p><p className="text-gray-500 text-[11px]">{desc}</p></div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Messages */}
        {submitError && <div className="bg-red-50 rounded-xl p-3 text-red-700 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{submitError}</div>}
        {submitSuccess && <div className="bg-emerald-50 rounded-xl p-3 text-emerald-700 text-sm flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{submitSuccess}</div>}

        {/* Form Actions */}
        <div className="flex gap-3 justify-end bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/users")} className="h-10 px-5 rounded-lg text-sm">Cancel</Button>
          <Button type="submit" disabled={isSubmitting} className="h-10 px-6 rounded-lg flex items-center gap-2 shadow-md shadow-primary/20 text-sm">
            {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSubmitting ? "Creating..." : "Create User"}
          </Button>
        </div>
      </form>
    </div>
  );
}

// Add RefreshCw import
import { RefreshCw } from "lucide-react";