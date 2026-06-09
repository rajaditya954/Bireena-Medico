// src/pages/admin/AdminSettings.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Globe,
  Bell,
  Shield,
  Database,
  Download,
  Trash2,
  RefreshCw,
  Smartphone,
  Clock,
  CalendarDays,
  Languages,
  Lock,
  Server,
  Activity,
  Stethoscope,
  GraduationCap,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "../components/common/Button";
import { useAuth } from "../hooks/useAuth";

// ==================== Mock API ====================
const saveAdminSettings = async (data) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("Admin settings saved:", data);
  return { success: true };
};

// ==================== Password Validator ====================
const validatePassword = (password) => ({
  minLength: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /[0-9]/.test(password),
  specialChar: /[!@#$%^&*]/.test(password),
});

const isPasswordValid = (errors) => Object.values(errors).every(Boolean);

// ==================== Main Component ====================
export default function AdminSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Profile State
  const [profile, setProfile] = useState({
    name: user?.name || "Admin User",
    email: user?.email || "admin@careplus.com",
    phone: user?.phone || "+91 98765 43210",
    role: user?.role || "Administrator",
  });

  // Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Preferences State
  const [preferences, setPreferences] = useState({
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    language: "English",
  });

  // Notifications State
  const [notifications, setNotifications] = useState({
    emailAppointmentReminders: true,
    emailLabReports: true,
    emailBillingAlerts: true,
    smsAppointmentReminders: false,
    systemAnnouncements: true,
    inventoryAlerts: true,
  });

  // Security State
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
  });

  // UI State
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [showClearLogsConfirm, setShowClearLogsConfirm] = useState(false);

  const passwordErrors = validatePassword(passwordForm.newPassword);
  const newPasswordValid = isPasswordValid(passwordErrors);
  const passwordsMatch = passwordForm.newPassword === passwordForm.confirmPassword;

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    setPasswordError("");
  };

  const handlePreferenceChange = (field, value) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotificationToggle = (field) => {
    setNotifications((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSecurityChange = (field, value) => {
    setSecurity((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Validate password change if any field is filled
    if (passwordForm.newPassword || passwordForm.currentPassword || passwordForm.confirmPassword) {
      if (!passwordForm.currentPassword) {
        setPasswordError("Current password is required to change password.");
        return;
      }
      if (!newPasswordValid) {
        setPasswordError("New password does not meet security requirements.");
        return;
      }
      if (!passwordsMatch) {
        setPasswordError("New passwords do not match.");
        return;
      }
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const payload = {
        profile,
        password: passwordForm.newPassword
          ? { current: passwordForm.currentPassword, new: passwordForm.newPassword }
          : null,
        preferences,
        notifications,
        security,
      };
      await saveAdminSettings(payload);
      setSaveMessage({ type: "success", text: "Settings saved successfully!" });
      // Clear password fields after success
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({ type: "error", text: "Failed to save settings. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    setShowExportConfirm(false);
    alert("Data export started. You will receive an email with the download link.");
  };

  const handleClearLogs = () => {
    setShowClearLogsConfirm(false);
    alert("System logs cleared successfully.");
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-black text-primary-dark tracking-tighter italic">System Settings</h1>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
          Global Configuration • {profile.role}
        </p>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full xl:w-72 flex-shrink-0">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-3 shadow-sm h-max">
            {[
              { id: "general", label: "Profile", icon: User },
              { id: "security", label: "Security", icon: Shield },
              { id: "preferences", label: "Preferences", icon: Globe },
              { id: "notifications", label: "Notifications", icon: Bell },
              { id: "data", label: "Data Management", icon: Database },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  document.getElementById(tab.id)?.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all mb-1 text-gray-400 hover:bg-gray-50 hover:text-primary"
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-8">
          {/* Profile Section */}
          <div id="general" className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-8 md:p-12 scroll-mt-8">
            <div className="max-w-3xl">
              <div className="pb-6 border-b border-gray-50">
                <h2 className="text-2xl font-black text-primary-dark tracking-tight mb-2">Account Registry</h2>
                <p className="text-gray-400 text-sm font-medium italic">Basic details associated with your admin account.</p>
              </div>
              <div className="space-y-6 mt-8">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleProfileChange("name", e.target.value)}
                    className="w-full h-14 px-6 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={profile.email}
                    className="w-full h-14 px-6 bg-gray-100 border-none rounded-2xl text-sm font-bold text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => handleProfileChange("phone", e.target.value)}
                      className="w-full h-14 pl-12 pr-6 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div id="security" className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-8 md:p-12 scroll-mt-8">
            <div className="max-w-3xl">
              <div className="pb-6 border-b border-gray-50">
                <h2 className="text-2xl font-black text-primary-dark tracking-tight mb-2">Access Security</h2>
                <p className="text-gray-400 text-sm font-medium italic">Protect your admin account with advanced authentication.</p>
              </div>
              <div className="space-y-6 mt-8">
                {/* Change Password Card */}
                <div className="p-6 bg-gray-50 rounded-[2rem] border border-transparent hover:border-primary/10 transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-primary-dark">Change Password</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Update your login credentials</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Current Password"
                        className="w-full h-12 px-4 pr-10 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                        value={passwordForm.currentPassword}
                        onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="New Password"
                        className="w-full h-12 px-4 pr-10 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                        value={passwordForm.newPassword}
                        onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm New Password"
                        className="w-full h-12 px-4 pr-10 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordForm.newPassword && (
                      <div className="bg-amber-50 rounded-xl p-3 text-xs space-y-1">
                        <p className="font-bold text-amber-700">Password Requirements:</p>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="flex items-center gap-1">
                            {passwordErrors.minLength ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <AlertCircle className="w-3 h-3 text-amber-500" />}
                            <span className={passwordErrors.minLength ? "text-emerald-700" : "text-amber-700"}>8+ characters</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {passwordErrors.uppercase ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <AlertCircle className="w-3 h-3 text-amber-500" />}
                            <span className={passwordErrors.uppercase ? "text-emerald-700" : "text-amber-700"}>Uppercase letter</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {passwordErrors.lowercase ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <AlertCircle className="w-3 h-3 text-amber-500" />}
                            <span className={passwordErrors.lowercase ? "text-emerald-700" : "text-amber-700"}>Lowercase letter</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {passwordErrors.number ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <AlertCircle className="w-3 h-3 text-amber-500" />}
                            <span className={passwordErrors.number ? "text-emerald-700" : "text-amber-700"}>Number (0-9)</span>
                          </div>
                          <div className="flex items-center gap-1 col-span-2">
                            {passwordErrors.specialChar ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <AlertCircle className="w-3 h-3 text-amber-500" />}
                            <span className={passwordErrors.specialChar ? "text-emerald-700" : "text-amber-700"}>Special character (!@#$%^&*)</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {passwordError && (
                      <div className="bg-red-50 rounded-xl p-3 text-red-700 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> {passwordError}
                      </div>
                    )}
                  </div>
                </div>

                {/* Two-Factor Authentication */}
                <div className="p-6 bg-gray-50 rounded-[2rem] flex items-center justify-between border border-transparent hover:border-emerald-100 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-primary-dark">Two-Factor Authentication (2FA)</p>
                      <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSecurityChange("twoFactorAuth", !security.twoFactorAuth)}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all relative",
                      security.twoFactorAuth ? "bg-emerald-600" : "bg-gray-200"
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                        security.twoFactorAuth ? "left-7" : "left-1"
                      )}
                    />
                  </button>
                </div>

                {/* Session Timeout */}
                <div className="p-6 bg-gray-50 rounded-[2rem] border border-transparent">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-primary-dark">Session Timeout</p>
                      <p className="text-xs text-gray-500">Automatically log out after inactivity</p>
                    </div>
                  </div>
                  <select
                    className="w-full md:w-64 h-12 px-4 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                    value={security.sessionTimeout}
                    onChange={(e) => handleSecurityChange("sessionTimeout", parseInt(e.target.value))}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div id="preferences" className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-8 md:p-12 scroll-mt-8">
            <div className="max-w-3xl">
              <div className="pb-6 border-b border-gray-50">
                <h2 className="text-2xl font-black text-primary-dark tracking-tight mb-2">System Preferences</h2>
                <p className="text-gray-400 text-sm font-medium italic">Regional and display settings for the portal.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Timezone</label>
                  <select
                    className="w-full h-14 px-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5"
                    value={preferences.timezone}
                    onChange={(e) => handlePreferenceChange("timezone", e.target.value)}
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date Format</label>
                  <select
                    className="w-full h-14 px-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5"
                    value={preferences.dateFormat}
                    onChange={(e) => handlePreferenceChange("dateFormat", e.target.value)}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Language</label>
                  <select
                    className="w-full h-14 px-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5"
                    value={preferences.language}
                    onChange={(e) => handlePreferenceChange("language", e.target.value)}
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div id="notifications" className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-8 md:p-12 scroll-mt-8">
            <div className="max-w-3xl">
              <div className="pb-6 border-b border-gray-50">
                <h2 className="text-2xl font-black text-primary-dark tracking-tight mb-2">Notification Center</h2>
                <p className="text-gray-400 text-sm font-medium italic">Configure which activities trigger alerts.</p>
              </div>
              <div className="space-y-4 mt-8">
                {[
                  { key: "emailAppointmentReminders", label: "Email – Appointment Reminders", desc: "Send email alerts for new/modified appointments" },
                  { key: "emailLabReports", label: "Email – Lab Reports Ready", desc: "Notify when diagnostic reports are uploaded" },
                  { key: "emailBillingAlerts", label: "Email – Billing Alerts", desc: "Invoice generation and payment confirmation" },
                  { key: "smsAppointmentReminders", label: "SMS – Appointment Reminders", desc: "Text message notifications for patients" },
                  { key: "inventoryAlerts", label: "Inventory – Low Stock Warnings", desc: "Critical alerts for pharmacy stock levels" },
                  { key: "systemAnnouncements", label: "System – Announcements & Updates", desc: "Platform upgrades and feature releases" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="p-6 bg-gray-50 rounded-[2rem] flex items-center justify-between border border-transparent hover:border-gray-200 transition-all"
                  >
                    <div>
                      <p className="text-sm font-black text-primary-dark">{item.label}</p>
                      <p className="text-xs font-medium text-gray-400 italic">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle(item.key)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-all relative",
                        notifications[item.key] ? "bg-primary" : "bg-gray-200"
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                          notifications[item.key] ? "left-7" : "left-1"
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Data Management Section */}
          <div id="data" className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-8 md:p-12 scroll-mt-8">
            <div className="max-w-3xl">
              <div className="pb-6 border-b border-gray-50">
                <h2 className="text-2xl font-black text-primary-dark tracking-tight mb-2">Data Management</h2>
                <p className="text-gray-400 text-sm font-medium italic">Export, backup, and maintenance tools.</p>
              </div>
              <div className="space-y-4 mt-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowExportConfirm(true)}
                    className="flex items-center gap-2 h-12 px-6 rounded-xl"
                  >
                    <Download className="w-4 h-4" /> Export All Data
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowClearLogsConfirm(true)}
                    className="flex items-center gap-2 h-12 px-6 rounded-xl text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" /> Clear System Logs
                  </Button>
                </div>
                <p className="text-xs text-gray-400">
                  Export data in JSON/CSV format. Logs older than 30 days will be permanently deleted.
                </p>
              </div>
            </div>
          </div>

          {/* Save Message & Button */}
          <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-gray-100 sticky bottom-4 backdrop-blur-sm bg-white/90">
            <div>
              {saveMessage && (
                <div
                  className={cn(
                    "flex items-center gap-2 text-sm font-bold",
                    saveMessage.type === "success" ? "text-emerald-600" : "text-red-600"
                  )}
                >
                  {saveMessage.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  {saveMessage.text}
                </div>
              )}
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="h-14 px-10 rounded-2xl flex items-center gap-3 shadow-xl shadow-primary/20 active:scale-95 transition-all"
            >
              {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSaving ? "Persisting..." : "Save Configuration"}
            </Button>
          </div>
        </div>
      </div>

      {/* Export Confirmation Modal */}
      {showExportConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowExportConfirm(false)} />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Export System Data</h3>
            <p className="text-sm text-gray-500 mb-6">
              This will export all patient records, appointments, billing, and lab reports. The process may take a few minutes.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowExportConfirm(false)}>Cancel</Button>
              <Button onClick={handleExportData}>Confirm Export</Button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Logs Confirmation Modal */}
      {showClearLogsConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowClearLogsConfirm(false)} />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Clear System Logs</h3>
            <p className="text-sm text-gray-500 mb-6">
              This action will permanently delete all audit logs older than 30 days. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowClearLogsConfirm(false)}>Cancel</Button>
              <Button onClick={handleClearLogs} className="bg-red-600 hover:bg-red-700">Clear Logs</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}