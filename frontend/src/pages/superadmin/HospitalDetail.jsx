import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Building2,
  ArrowLeft,
  Loader2,
  Settings2,
  UserPlus,
  Shield,
  Save,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Users,
  Search,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function HospitalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit Hospital Fields
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");
  const [maxUsers, setMaxUsers] = useState(50);
  const [subscriptionPlan, setSubscriptionPlan] = useState("basic");
  const [saving, setSaving] = useState(false);

  // Active Modules Toggle States (to fill blank space elegantly)
  const [enablePharmacy, setEnablePharmacy] = useState(true);
  const [enableLaboratory, setEnableLaboratory] = useState(true);
  const [enableReception, setEnableReception] = useState(true);
  const [enableBilling, setEnableBilling] = useState(true);

  // Admin Account Creation/Update States
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminPhone, setAdminPhone] = useState("");
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [adminSuccess, setAdminSuccess] = useState("");
  const [adminError, setAdminError] = useState("");

  // Post-creation credentials view state
  const [createdAdmin, setCreatedAdmin] = useState(null);
  const [showCreatedPassword, setShowCreatedPassword] = useState(false);

  // Hospital Users Section States
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchHospital = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("aarogya_token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await axios.get(`${apiUrl}/superadmin/hospitals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = response.data.data.hospitals || [];
      const found = list.find((h) => h._id === id);
      if (!found) {
        throw new Error("Hospital not found");
      }
      setHospital(found);
      
      // Initialize edit hospital fields
      setName(found.name || "");
      setAddress(found.address || "");
      setCity(found.city || "");
      setState(found.state || "");
      setPincode(found.pincode || "");
      setPhone(found.phone || "");
      setMaxUsers(found.maxUsers || 50);
      setSubscriptionPlan(found.subscriptionPlan || "basic");

      // Initialize active modules toggles
      setEnablePharmacy(found.settings?.enablePharmacy !== false);
      setEnableLaboratory(found.settings?.enableLaboratory !== false);
      setEnableReception(found.settings?.enableReception !== false);
      setEnableBilling(found.settings?.enableBilling !== false);

      // Initialize admin user fields from settings if they exist
      setAdminName(found.settings?.adminName || "");
      setAdminEmail(found.settings?.adminEmail || found.email || "");
      setAdminPassword(found.settings?.adminPassword || "");
      setAdminPhone(found.settings?.adminPhone || "");
    } catch (err) {
      setError(err.message || "Failed to load hospital details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem("aarogya_token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await axios.get(`${apiUrl}/superadmin/hospitals/${id}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.data.users || []);
    } catch (err) {
      console.error("Failed to load hospital users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchHospital();
    fetchUsers();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    setError("");
    try {
      const token = localStorage.getItem("aarogya_token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      
      const updatedSettings = {
        ...(hospital?.settings || {}),
        enablePharmacy,
        enableLaboratory,
        enableReception,
        enableBilling
      };

      await axios.put(
        `${apiUrl}/superadmin/hospitals/${id}`,
        {
          name,
          address,
          city,
          state,
          pincode,
          phone,
          maxUsers,
          subscriptionPlan,
          settings: updatedSettings
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Hospital configurations updated successfully.");
      toast.success("Settings saved successfully.");
      fetchHospital();
    } catch (err) {
      setError(err.message || "Failed to save hospital settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateOrUpdateAdmin = async (e) => {
    e.preventDefault();
    setCreatingAdmin(true);
    setAdminSuccess("");
    setAdminError("");
    setCreatedAdmin(null);
    try {
      const token = localStorage.getItem("aarogya_token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      await axios.post(
        `${apiUrl}/superadmin/hospitals/${id}/admin`,
        { name: adminName, email: adminEmail, password: adminPassword, phone: adminPhone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdminSuccess("Administrator credentials successfully configured/updated.");
      toast.success("Admin credentials saved!");
      
      // Store created credentials to show under the form as requested
      setCreatedAdmin({
        email: adminEmail,
        password: adminPassword,
      });

      fetchHospital();
      fetchUsers();
    } catch (err) {
      setAdminError(err.response?.data?.error || err.message || "Failed to register/update admin.");
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleToggleUserActive = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem("aarogya_token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      await axios.patch(
        `${apiUrl}/superadmin/hospitals/${id}/users/${userId}/active`,
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("User status toggled successfully.");
      fetchUsers();
    } catch (err) {
      toast.error(err.message || "Failed to update user status.");
    }
  };

  // Maps roles to virtual departments for visual display as requested
  const getDepartment = (user) => {
    if (user.role === "DOCTOR") {
      return "OPD / Medical";
    }
    const map = {
      ADMIN: "Administration",
      BILLING: "Billing & Finance",
      LAB: "Laboratory",
      LAB_ASSISTANT: "Laboratory",
      PHARMACY: "Pharmacy",
      DISPENSARY_STAFF: "Pharmacy",
      RECEPTIONIST: "Front Desk / Reception",
    };
    return map[user.role] || "General";
  };

  const getRoleBadgeStyle = (role) => {
    const map = {
      ADMIN: "bg-red-100 text-red-800",
      DOCTOR: "bg-blue-100 text-blue-800",
      LAB: "bg-cyan-100 text-cyan-800",
      LAB_ASSISTANT: "bg-teal-100 text-teal-800",
      PHARMACY: "bg-purple-100 text-purple-800",
      RECEPTIONIST: "bg-amber-100 text-amber-800",
      BILLING: "bg-orange-100 text-orange-800",
    };
    return map[role] || "bg-gray-100 text-gray-800";
  };

  // Search & Filters Logic
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Search by Name or Employee ID
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = u.name?.toLowerCase().includes(query);
        const empIdMatch = u.employeeId?.toLowerCase().includes(query);
        if (!nameMatch && !empIdMatch) return false;
      }
      // Filter by Role
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      // Filter by Department
      if (deptFilter !== "all" && getDepartment(u) !== deptFilter) return false;
      // Filter by Status
      if (statusFilter !== "all") {
        const isActiveValue = statusFilter === "active";
        if (u.isActive !== isActiveValue) return false;
      }
      return true;
    });
  }, [users, searchQuery, roleFilter, deptFilter, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F9F6] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#0B4B34]" />
        <span className="text-sm text-slate-500">Loading configurations...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F9F6] text-[#0f281e] flex flex-col font-sans">
      {/* ── TOP NAV BAR (DARK GREEN) ── */}
      <header className="bg-[#0B4B34] text-white px-4 sm:px-8 py-4 flex flex-row items-center justify-between border-b border-[#063323] shadow-md z-40 flex-wrap sm:flex-nowrap gap-4 min-h-[5rem]">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/superadmin/hospitals"
            className="p-2 bg-white/10 hover:bg-white/15 text-white rounded-xl transition border border-white/10 shrink-0"
            title="Go back to Hospital List"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold tracking-tight flex items-center gap-2 truncate sm:whitespace-normal">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300 shrink-0" />
              <span className="truncate">{hospital?.name}</span>
            </h1>
            <p className="text-[10px] sm:text-[11px] text-emerald-100/70 truncate sm:whitespace-normal">Instance settings, user limits, and hospital administrator credentials</p>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-200">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* ── EDIT HOSPITAL INFO ── */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0f281e] flex items-center gap-2 mb-6 border-b border-gray-100 pb-3">
                <Settings2 className="w-5 h-5 text-[#0B4B34]" />
                <span>Hospital Instance Settings</span>
              </h2>

              {success && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>{success}</span>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleUpdate} className="space-y-4 text-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wide">
                      Hospital Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2 text-[#0f281e] text-xs focus:ring-1 focus:ring-[#0B4B34] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wide">
                      Phone Line
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2 text-[#0f281e] text-xs focus:ring-1 focus:ring-[#0B4B34] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wide">
                    Physical Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2 text-[#0f281e] text-xs focus:ring-1 focus:ring-[#0B4B34] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wide">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2 text-[#0f281e] text-xs focus:ring-1 focus:ring-[#0B4B34] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wide">
                      State
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2 text-[#0f281e] text-xs focus:ring-1 focus:ring-[#0B4B34] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wide">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2 text-[#0f281e] text-xs focus:ring-1 focus:ring-[#0B4B34] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wide">
                      Max Allocated Users
                    </label>
                    <input
                      type="number"
                      required
                      value={maxUsers}
                      onChange={(e) => setMaxUsers(parseInt(e.target.value, 10))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2 text-[#0f281e] text-xs focus:ring-1 focus:ring-[#0B4B34] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wide">
                      Subscription Tier
                    </label>
                    <select
                      value={subscriptionPlan}
                      onChange={(e) => setSubscriptionPlan(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2 text-[#0f281e] text-xs focus:ring-1 focus:ring-[#0B4B34] focus:outline-none"
                    >
                      <option value="basic">Basic Plan</option>
                      <option value="pro">Pro Plan</option>
                      <option value="enterprise">Enterprise Plan</option>
                    </select>
                  </div>
                </div>

                {/* ── FEATURE MODULE ACCESS CONTROL (Fills vertical blank space) ── */}
                <div className="border-t border-gray-100 my-6 pt-6">
                  <h3 className="text-xs font-bold text-[#0f281e] uppercase tracking-wider mb-3">
                    Feature Module Access Control
                  </h3>
                  <p className="text-[11px] text-slate-500 mb-4">Enable or disable specific system modules for this tenant instance.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Pharmacy Card */}
                    <div
                      onClick={() => setEnablePharmacy(!enablePharmacy)}
                      className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer select-none ${
                        enablePharmacy
                          ? "border-emerald-200 bg-emerald-50/15"
                          : "border-gray-200 bg-white hover:bg-gray-50/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={enablePharmacy}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-[#0B4B34] focus:ring-[#0B4B34] w-4 h-4 shrink-0"
                      />
                      <div>
                        <span className="text-xs font-bold text-[#0f281e] block leading-tight">Pharmacy & Inventory</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 leading-snug">Dispensary billing, inventory tracking & medicine dispensing logs.</span>
                      </div>
                    </div>

                    {/* Laboratory Card */}
                    <div
                      onClick={() => setEnableLaboratory(!enableLaboratory)}
                      className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer select-none ${
                        enableLaboratory
                          ? "border-emerald-200 bg-emerald-50/15"
                          : "border-gray-200 bg-white hover:bg-gray-50/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={enableLaboratory}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-[#0B4B34] focus:ring-[#0B4B34] w-4 h-4 shrink-0"
                      />
                      <div>
                        <span className="text-xs font-bold text-[#0f281e] block leading-tight">Laboratory & Reports</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 leading-snug">Report lifecycle flow, PDF results upload, and metrics graphs.</span>
                      </div>
                    </div>

                    {/* Reception Card */}
                    <div
                      onClick={() => setEnableReception(!enableReception)}
                      className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer select-none ${
                        enableReception
                          ? "border-emerald-200 bg-emerald-50/15"
                          : "border-gray-200 bg-white hover:bg-gray-50/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={enableReception}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-[#0B4B34] focus:ring-[#0B4B34] w-4 h-4 shrink-0"
                      />
                      <div>
                        <span className="text-xs font-bold text-[#0f281e] block leading-tight">Reception & OPD</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 leading-snug">Appointment schedules, consulting ticket queues, doctor assignment.</span>
                      </div>
                    </div>

                    {/* Billing Card */}
                    <div
                      onClick={() => setEnableBilling(!enableBilling)}
                      className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer select-none ${
                        enableBilling
                          ? "border-emerald-200 bg-emerald-50/15"
                          : "border-gray-200 bg-white hover:bg-gray-50/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={enableBilling}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-[#0B4B34] focus:ring-[#0B4B34] w-4 h-4 shrink-0"
                      />
                      <div>
                        <span className="text-xs font-bold text-[#0f281e] block leading-tight">Billing & Invoicing</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 leading-snug">Centralized invoices, payment collection, and revenue auditing logs.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#0B4B34] hover:bg-[#063323] disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all w-full sm:w-auto justify-center"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving configurations...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ── CREATE/UPDATE ADMIN ACCOUNT ── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm h-fit">
            <h2 className="text-base font-bold text-[#0f281e] flex items-center gap-2 mb-6 border-b border-gray-100 pb-3">
              <UserPlus className="w-5 h-5 text-[#0B4B34]" />
              <span>Manage Admin Credentials</span>
            </h2>

            {adminSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
                <p className="font-semibold">{adminSuccess}</p>
              </div>
            )}

            {adminError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {adminError}
              </div>
            )}

            <form onSubmit={handleCreateOrUpdateAdmin} className="space-y-4 text-slate-700">
              <div>
                <label className="block text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wide">
                  Admin Name
                </label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2 text-[#0f281e] text-xs focus:ring-1 focus:ring-[#0B4B34] focus:outline-none"
                  placeholder="Hospital Admin Name"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wide">
                  Login Email
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2 text-[#0f281e] text-xs focus:ring-1 focus:ring-[#0B4B34] focus:outline-none"
                  placeholder="admin@hospitaldomain.com"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showAdminPassword ? "text" : "password"}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-3.5 pr-10 py-2 text-[#0f281e] text-xs focus:ring-1 focus:ring-[#0B4B34] focus:outline-none"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-[#0f281e]"
                  >
                    {showAdminPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wide">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2 text-[#0f281e] text-xs focus:ring-1 focus:ring-[#0B4B34] focus:outline-none"
                  placeholder="9876543210"
                />
              </div>

              <button
                type="submit"
                disabled={creatingAdmin}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#0B4B34] hover:bg-[#063323] disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all shadow-sm mt-6"
              >
                {creatingAdmin ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Configuring Admin...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Configure Admin Account</span>
                  </>
                )}
              </button>
            </form>

            {/* Generated admin credentials display */}
            {createdAdmin && (
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-4 animate-in fade-in duration-200">
                <h3 className="font-bold text-xs text-[#0B4B34] uppercase tracking-wider">
                  Admin Account Created Successfully
                </h3>
                
                <div className="space-y-3.5 text-xs text-slate-700">
                  <div>
                    <span className="text-slate-500 block mb-0.5 uppercase tracking-wide text-[10px] font-semibold">Admin ID</span>
                    <span className="text-[#0f281e] font-semibold select-all">{createdAdmin.email}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-0.5 uppercase tracking-wide text-[10px] font-semibold">Password</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#0f281e] font-mono font-semibold select-all">
                        {showCreatedPassword ? createdAdmin.password : "••••••••••"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowCreatedPassword(!showCreatedPassword)}
                        className="text-slate-400 hover:text-[#0B4B34]"
                      >
                        {showCreatedPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-0.5 uppercase tracking-wide text-[10px] font-semibold">Status</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── HOSPITAL USERS SECTION ── */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          {/* Table/Card Header with Search & Filters */}
          <div className="px-4 sm:px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-bold text-base text-[#0f281e] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0B4B34]" />
                <span>Hospital Users</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {filteredUsers.length} user{filteredUsers.length === 1 ? "" : "s"} found
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center w-full md:w-auto">
              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search by name or employee ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-[#0f281e] text-xs focus:ring-1 focus:ring-[#0B4B34] focus:outline-none"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              {/* Filters list */}
              <div className="flex flex-row flex-wrap gap-3 items-center w-full sm:w-auto">
                <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wide">Role:</span>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-[#0B4B34] focus:outline-none font-semibold text-[#0f281e] w-full sm:w-auto"
                  >
                    <option value="all">All</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="DOCTOR">DOCTOR</option>
                    <option value="LAB">LAB</option>
                    <option value="LAB_ASSISTANT">LAB_ASSISTANT</option>
                    <option value="PHARMACY">PHARMACY</option>
                    <option value="RECEPTIONIST">RECEPTIONIST</option>
                    <option value="BILLING">BILLING</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wide">Dept:</span>
                  <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-[#0B4B34] focus:outline-none font-semibold text-[#0f281e] w-full sm:w-auto"
                  >
                    <option value="all">All</option>
                    <option value="Administration">Admin</option>
                    <option value="OPD / Medical">Medical</option>
                    <option value="Laboratory">Lab</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Billing & Finance">Billing</option>
                    <option value="Front Desk / Reception">Reception</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wide">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-[#0B4B34] focus:outline-none font-semibold text-[#0f281e] w-full sm:w-auto"
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          {loadingUsers ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#0B4B34]" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No users match the search criteria or filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left whitespace-nowrap sm:whitespace-normal">
                <thead>
                  <tr className="text-slate-400 uppercase font-semibold border-b border-gray-100 bg-gray-50/20">
                    <th className="py-3 px-4 sm:px-6">Name</th>
                    <th className="py-3 px-4 sm:px-6">Employee ID</th>
                    <th className="py-3 px-4 sm:px-6">Role</th>
                    <th className="py-3 px-4 sm:px-6">Department</th>
                    <th className="py-3 px-4 sm:px-6 text-center">Status</th>
                    <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-semibold text-[#0f281e]">{u.name}</td>
                      <td className="py-3.5 px-4 sm:px-6 text-slate-500 font-mono">{u.employeeId || "—"}</td>
                      <td className="py-3.5 px-4 sm:px-6">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getRoleBadgeStyle(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-slate-500">{getDepartment(u)}</td>
                      <td className="py-3.5 px-4 sm:px-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.isActive
                            ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                            : "bg-red-50 border border-red-200 text-red-800"
                        }`}>
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <button
                          onClick={() => handleToggleUserActive(u._id, u.isActive)}
                          className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition-all border ${
                            u.isActive
                              ? "bg-red-50 border-red-150 text-red-700 hover:bg-red-100"
                              : "bg-emerald-50 border-emerald-150 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {u.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
