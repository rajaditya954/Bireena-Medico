// src/pages/Settings.jsx
import React, { useState } from "react";
import {
  Save,
  Settings as SettingsIcon,
  Mail,
  Shield,
  Calendar,
  FlaskRound,
  Briefcase,
  CreditCard,
  Eye,
  EyeOff,
  Globe,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "../components/common/Button";

// Toggle Switch Component
const ToggleSwitch = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={cn(
      "w-10 h-5 rounded-full transition-all relative",
      checked ? "bg-emerald-600" : "bg-gray-300"
    )}
  >
    <div
      className={cn(
        "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all",
        checked ? "left-5" : "left-0.5"
      )}
    />
  </button>
);

// Setting Row Component
const SettingRow = ({ label, desc, control }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
    <div className="pr-4">
      <div className="text-sm font-bold text-slate-800">{label}</div>
      {desc && <div className="text-xs text-gray-500 mt-0.5">{desc}</div>}
    </div>
    <div className="flex-shrink-0">{control}</div>
  </div>
);

export default function Settings() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [showMailPassword, setShowMailPassword] = useState(false);

  // Form states
  const [general, setGeneral] = useState({
    siteName: "MediCare+ Clinic Management System",
    tagline: "Your Health, Our Priority",
    timezone: "Asia/Kolkata",
    dateFormat: "DD MMM YYYY",
    timeFormat: "12",
    currency: "INR",
    maintenanceMode: false,
  });

  const [emailSms, setEmailSms] = useState({
    mailDriver: "smtp",
    mailHost: "smtp.gmail.com",
    mailPort: "587",
    mailUsername: "noreply@medicare.com",
    mailPassword: "password123",
    fromName: "MediCare+ System",
    fromEmail: "noreply@medicare.com",
    smsGateway: "twilio",
  });

  const [security, setSecurity] = useState({
    enforceStrongPassword: true,
    twoFactorAuth: true,
    sessionTimeout: 30,
    loginAttemptLimit: 5,
    ipRestriction: false,
  });

  const [appointment, setAppointment] = useState({
    advanceBookingDays: 30,
    slotInterval: "30",
    allowWalkIn: true,
    autoConfirm: false,
    cancellationLimitHours: 2,
  });

  const [labReports, setLabReports] = useState({
    defaultReportFormat: "pdf",
    enableReportApproval: true,
  });

  const [pharmacy, setPharmacy] = useState({
    lowStockThreshold: 10,
    enableExpiryAlerts: true,
  });

  const [payment, setPayment] = useState({
    defaultPaymentMethod: "cash",
    enableOnlinePayments: true,
  });

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      // Save to localStorage or API
      const allSettings = { general, emailSms, security, appointment, labReports, pharmacy, payment };
      localStorage.setItem("medico_system_settings", JSON.stringify(allSettings));
      setSaveMessage({ type: "success", text: "All settings saved successfully!" });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({ type: "error", text: "Failed to save settings. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-dark tracking-tighter italic">System Settings</h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
            Manage and configure all system preferences and configuration.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="h-11 px-5 rounded-xl flex items-center gap-2 shadow-md shadow-primary/20"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>

      {/* Two column layout for main sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* General Settings Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <SettingsIcon className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-base font-black text-slate-800">General Settings</h2>
                  <p className="text-[11px] text-gray-500">Basic system information and preferences.</p>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Site Name</label>
                  <input type="text" className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm" value={general.siteName} onChange={e => setGeneral({...general, siteName: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Site Tagline</label>
                  <input type="text" className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm" value={general.tagline} onChange={e => setGeneral({...general, tagline: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Timezone</label>
                  <select className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm" value={general.timezone} onChange={e => setGeneral({...general, timezone: e.target.value})}>
                    <option value="Asia/Kolkata">(UTC+05:30) Asia/Kolkata</option>
                    <option value="America/New_York">(UTC-05:00) America/New_York</option>
                    <option value="Europe/London">(UTC+00:00) Europe/London</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Date Format</label>
                  <select className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm" value={general.dateFormat} onChange={e => setGeneral({...general, dateFormat: e.target.value})}>
                    <option value="DD MMM YYYY">DD MMM YYYY (12 May 2025)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (2025-05-12)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (05/12/2025)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Time Format</label>
                  <select className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm" value={general.timeFormat} onChange={e => setGeneral({...general, timeFormat: e.target.value})}>
                    <option value="12">12 Hour (HH:MM AM/PM)</option>
                    <option value="24">24 Hour (HH:MM)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Currency</label>
                  <select className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm" value={general.currency} onChange={e => setGeneral({...general, currency: e.target.value})}>
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                  </select>
                </div>
              </div>
              <SettingRow
                label="Maintenance Mode"
                desc="System will be unavailable for normal users."
                control={<ToggleSwitch checked={general.maintenanceMode} onChange={(val) => setGeneral({...general, maintenanceMode: val})} />}
              />
            </div>
          </div>

          {/* Email & SMS Settings Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-base font-black text-slate-800">Email & SMS Settings</h2>
                  <p className="text-[11px] text-gray-500">Configure email server and SMS gateway.</p>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Mail Driver</label>
                  <select className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm" value={emailSms.mailDriver} onChange={e => setEmailSms({...emailSms, mailDriver: e.target.value})}>
                    <option value="smtp">SMTP</option>
                    <option value="sendmail">Sendmail</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Mail Host</label>
                  <input type="text" className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm" value={emailSms.mailHost} onChange={e => setEmailSms({...emailSms, mailHost: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Mail Port</label>
                  <input type="text" className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm" value={emailSms.mailPort} onChange={e => setEmailSms({...emailSms, mailPort: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Mail Username</label>
                  <input type="text" className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm" value={emailSms.mailUsername} onChange={e => setEmailSms({...emailSms, mailUsername: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Mail Password</label>
                  <div className="relative">
                    <input type={showMailPassword ? "text" : "password"} className="w-full h-10 px-3 pr-8 bg-gray-50 rounded-xl text-sm" value={emailSms.mailPassword} onChange={e => setEmailSms({...emailSms, mailPassword: e.target.value})} />
                    <button type="button" onClick={() => setShowMailPassword(!showMailPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                      {showMailPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">From Name</label>
                  <input type="text" className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm" value={emailSms.fromName} onChange={e => setEmailSms({...emailSms, fromName: e.target.value})} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">From Email</label>
                  <input type="email" className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm" value={emailSms.fromEmail} onChange={e => setEmailSms({...emailSms, fromEmail: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">SMS Gateway</label>
                  <select className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm" value={emailSms.smsGateway} onChange={e => setEmailSms({...emailSms, smsGateway: e.target.value})}>
                    <option value="twilio">Twilio</option>
                    <option value="msg91">MSG91</option>
                    <option value="nexmo">Nexmo</option>
                  </select>
                </div>
              </div>
              <button className="text-xs font-bold text-emerald-600 border border-emerald-200 rounded-lg px-3 py-1.5 hover:bg-emerald-50 transition-all w-fit">
                Send Test Email
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Security Settings Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-base font-black text-slate-800">Security Settings</h2>
                  <p className="text-[11px] text-gray-500">Configure security preferences and policies.</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              <SettingRow
                label="Enforce Strong Password"
                desc="Require strong password for all users."
                control={<ToggleSwitch checked={security.enforceStrongPassword} onChange={(val) => setSecurity({...security, enforceStrongPassword: val})} />}
              />
              <SettingRow
                label="Two Factor Authentication"
                desc="Enable 2FA for admin and staff users."
                control={<ToggleSwitch checked={security.twoFactorAuth} onChange={(val) => setSecurity({...security, twoFactorAuth: val})} />}
              />
              <SettingRow
                label="Session Timeout (minutes)"
                desc="Automatically logout after inactivity."
                control={<input type="number" className="w-16 h-8 px-2 bg-gray-50 rounded-lg text-sm text-center" value={security.sessionTimeout} onChange={e => setSecurity({...security, sessionTimeout: parseInt(e.target.value)})} />}
              />
              <SettingRow
                label="Login Attempt Limit"
                desc="Maximum number of failed login attempts."
                control={<input type="number" className="w-16 h-8 px-2 bg-gray-50 rounded-lg text-sm text-center" value={security.loginAttemptLimit} onChange={e => setSecurity({...security, loginAttemptLimit: parseInt(e.target.value)})} />}
              />
              <SettingRow
                label="IP Restriction for Admin"
                desc="Restrict admin login to specific IP addresses."
                control={<ToggleSwitch checked={security.ipRestriction} onChange={(val) => setSecurity({...security, ipRestriction: val})} />}
              />
              <button className="mt-4 text-xs font-bold text-emerald-600 border border-emerald-200 rounded-lg px-3 py-1.5 hover:bg-emerald-50 transition-all w-fit flex items-center gap-1">
                <Shield className="w-3 h-3" /> Manage IP Whitelist
              </button>
            </div>
          </div>

          {/* Appointment Settings Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-base font-black text-slate-800">Appointment Settings</h2>
                  <p className="text-[11px] text-gray-500">Configure appointment related preferences.</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              <SettingRow
                label="Advance Booking Days"
                desc="Maximum days in advance for booking."
                control={<input type="number" className="w-16 h-8 px-2 bg-gray-50 rounded-lg text-sm text-center" value={appointment.advanceBookingDays} onChange={e => setAppointment({...appointment, advanceBookingDays: parseInt(e.target.value)})} />}
              />
              <SettingRow
                label="Appointment Slot Interval"
                desc="Interval between two appointments."
                control={<select className="w-24 h-8 px-2 bg-gray-50 rounded-lg text-sm" value={appointment.slotInterval} onChange={e => setAppointment({...appointment, slotInterval: e.target.value})}><option value="15">15 Minutes</option><option value="30">30 Minutes</option><option value="45">45 Minutes</option><option value="60">1 Hour</option></select>}
              />
              <SettingRow
                label="Allow Walk-in Appointments"
                desc="Enable walk-in appointments."
                control={<ToggleSwitch checked={appointment.allowWalkIn} onChange={(val) => setAppointment({...appointment, allowWalkIn: val})} />}
              />
              <SettingRow
                label="Auto Confirm Appointments"
                desc="Automatically confirm appointments."
                control={<ToggleSwitch checked={appointment.autoConfirm} onChange={(val) => setAppointment({...appointment, autoConfirm: val})} />}
              />
              <SettingRow
                label="Appointment Cancellation Limit"
                desc="Allow cancellation up to (hours before appointment)."
                control={<input type="number" className="w-16 h-8 px-2 bg-gray-50 rounded-lg text-sm text-center" value={appointment.cancellationLimitHours} onChange={e => setAppointment({...appointment, cancellationLimitHours: parseInt(e.target.value)})} />}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: three columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lab & Reports Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center gap-2">
              <FlaskRound className="w-4 h-4 text-primary" />
              <div>
                <h3 className="text-sm font-black text-slate-800">Lab & Reports Settings</h3>
                <p className="text-[10px] text-gray-500">Configure lab tests and reports preferences.</p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <SettingRow
              label="Default Report Format"
              control={<select className="w-24 h-8 px-2 bg-gray-50 rounded-lg text-sm" value={labReports.defaultReportFormat} onChange={e => setLabReports({...labReports, defaultReportFormat: e.target.value})}><option value="pdf">PDF</option><option value="csv">CSV</option></select>}
            />
            <SettingRow
              label="Enable Report Approval"
              desc="Reports must be approved before release."
              control={<ToggleSwitch checked={labReports.enableReportApproval} onChange={(val) => setLabReports({...labReports, enableReportApproval: val})} />}
            />
          </div>
        </div>

        {/* Pharmacy Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              <div>
                <h3 className="text-sm font-black text-slate-800">Pharmacy Settings</h3>
                <p className="text-[10px] text-gray-500">Configure pharmacy and medicine preferences.</p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <SettingRow
              label="Low Stock Alert Threshold"
              desc="Notify when stock goes below quantity."
              control={<input type="number" className="w-16 h-8 px-2 bg-gray-50 rounded-lg text-sm text-center" value={pharmacy.lowStockThreshold} onChange={e => setPharmacy({...pharmacy, lowStockThreshold: parseInt(e.target.value)})} />}
            />
            <SettingRow
              label="Enable Expiry Alerts"
              desc="Receive alerts for medicine expiry."
              control={<ToggleSwitch checked={pharmacy.enableExpiryAlerts} onChange={(val) => setPharmacy({...pharmacy, enableExpiryAlerts: val})} />}
            />
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              <div>
                <h3 className="text-sm font-black text-slate-800">Payment Settings</h3>
                <p className="text-[10px] text-gray-500">Configure payment and billing preferences.</p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <SettingRow
              label="Default Payment Method"
              control={<select className="w-24 h-8 px-2 bg-gray-50 rounded-lg text-sm" value={payment.defaultPaymentMethod} onChange={e => setPayment({...payment, defaultPaymentMethod: e.target.value})}><option value="cash">Cash</option><option value="card">Card</option><option value="upi">UPI</option></select>}
            />
            <SettingRow
              label="Enable Online Payments"
              desc="Allow online payments for invoices."
              control={<ToggleSwitch checked={payment.enableOnlinePayments} onChange={(val) => setPayment({...payment, enableOnlinePayments: val})} />}
            />
          </div>
        </div>
      </div>

      {/* Save message */}
      {saveMessage && (
        <div className={cn(
          "rounded-xl p-3 text-sm flex items-center gap-2",
          saveMessage.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
        )}>
          {saveMessage.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {saveMessage.text}
        </div>
      )}
    </div>
  );
}

// Helper import for RefreshCw (if not already in lucide-react)
import { RefreshCw } from "lucide-react";