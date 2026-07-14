import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Plus,
  ArrowLeft,
  Loader2,
  ChevronRight,
  Globe,
  Settings2,
  CheckCircle2,
  XCircle,
  Trash2,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function HospitalManagement() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  // New Hospital Form States
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [maxUsers, setMaxUsers] = useState(50);
  const [submitting, setSubmitting] = useState(false);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("aarogya_token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await axios.get(`${apiUrl}/superadmin/hospitals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHospitals(response.data.data.hospitals || []);
    } catch (err) {
      setError(err.message || "Failed to load hospitals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleCreateHospital = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("aarogya_token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      await axios.post(
        `${apiUrl}/superadmin/hospitals`,
        { name, slug, email, phone, city, state, maxUsers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success("Hospital registered successfully!");
      setName("");
      setSlug("");
      setEmail("");
      setPhone("");
      setCity("");
      setState("");
      setMaxUsers(50);
      setShowModal(false);
      fetchHospitals();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to create hospital.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("aarogya_token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      await axios.patch(
        `${apiUrl}/superadmin/hospitals/${id}/active`,
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Hospital status updated successfully.`);
      fetchHospitals();
    } catch (err) {
      setError(err.message || "Failed to update hospital status.");
    }
  };

  const handleDeleteHospital = async (id, hospitalName) => {
    if (!window.confirm(`⚠️ WARNING: Are you sure you want to delete "${hospitalName}"?\nThis will permanently delete the hospital registry and all registered staff/users associated with this hospital. This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem("aarogya_token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      await axios.delete(`${apiUrl}/superadmin/hospitals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Hospital "${hospitalName}" deleted successfully.`);
      fetchHospitals();
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "Failed to delete hospital.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F9F6] text-[#0f281e] flex flex-col font-sans">
      {/* ── TOP NAV BAR (DARK GREEN) — RESPONSIVE HEIGHT ── */}
      <header className="bg-[#0B4B34] text-white px-4 sm:px-8 py-4 flex flex-row items-center justify-between border-b border-[#063323] shadow-md z-40 flex-wrap sm:flex-nowrap gap-4 min-h-[5rem]">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/superadmin/dashboard"
            className="p-2 bg-white/10 hover:bg-white/15 text-white rounded-xl transition border border-white/10 shrink-0"
            title="Go back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold tracking-tight flex items-center gap-2 truncate sm:whitespace-normal">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300 shrink-0" />
              <span>Tenant Registry</span>
            </h1>
            <p className="text-[10px] sm:text-[11px] text-emerald-100/70 truncate sm:whitespace-normal">Onboard new hospital instances and configure system scopes</p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#0B4B34] hover:bg-gray-50 font-bold text-xs rounded-xl transition-all shadow-sm w-full sm:w-auto justify-center shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Hospital</span>
        </button>
      </header>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-200">
        {/* ── ERROR DISPLAY ── */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm shadow-sm">
            {error}
          </div>
        )}

        {/* ── HOSPITAL LISTING ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#0B4B34]" />
            <span className="text-sm">Loading active tenants...</span>
          </div>
        ) : hospitals.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center py-20 shadow-sm">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-[#0f281e] font-bold text-base mb-1">No Tenants Registered</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
              Register your first hospital organization instance to begin serving users in your multitenant cluster.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 bg-[#0B4B34] hover:bg-[#063323] text-white font-semibold text-xs rounded-xl transition-all shadow-sm"
            >
              Create Hospital Instance
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200">
            {hospitals.map((h) => (
              <div
                key={h._id}
                className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between mb-4 pb-3 border-b border-gray-100 gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-[#0B4B34]/10 rounded-lg text-[#0B4B34] border border-[#0B4B34]/10 shrink-0">
                        <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-[#0f281e] text-sm sm:text-base leading-tight truncate">{h.name}</h3>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 flex items-center gap-1 mt-1 font-mono truncate">
                          <Globe className="w-3.5 h-3.5 text-[#0B4B34] shrink-0" />
                          <span className="truncate">slug: {h.slug}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggleActive(h._id, h.isActive)}
                        className={`flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg border text-[9px] sm:text-[10px] font-bold tracking-wide transition-all ${
                          h.isActive
                            ? "bg-emerald-50 border-emerald-250 text-emerald-800"
                            : "bg-red-50 border-red-250 text-red-800"
                        }`}
                      >
                        {h.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteHospital(h._id, h.name)}
                        className="p-1.5 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-all shrink-0"
                        title="Delete hospital registry"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Responsive grid for card info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 py-2 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400 block mb-0.5 font-bold uppercase tracking-wider text-[9px]">Location</span>
                      <span className="text-[#0f281e] font-semibold">
                        {h.city || "—"}{h.state ? `, ${h.state}` : ""}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5 font-bold uppercase tracking-wider text-[9px]">Subscription Plan</span>
                      <span className="text-[#0f281e] font-bold uppercase tracking-wide">
                        {h.subscriptionPlan || "Basic"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5 font-bold uppercase tracking-wider text-[9px]">Max Users Limit</span>
                      <span className="text-[#0f281e] font-semibold">{h.maxUsers || 50} users</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5 font-bold uppercase tracking-wider text-[9px]">Hospital Admin</span>
                      <span className="text-[#0f281e] font-semibold truncate block">{h.settings?.adminEmail || h.email || "No admin assigned"}</span>
                    </div>
                    {h.settings?.adminPassword && (
                      <div className="col-span-1 sm:col-span-2 bg-[#0B4B34]/5 border border-[#0B4B34]/10 rounded-lg p-2.5 flex justify-between items-center mt-1">
                        <div>
                          <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider">Admin Login Password</span>
                          <span className="text-[#0B4B34] font-bold font-mono select-all text-xs">{h.settings.adminPassword}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 mt-4 pt-3 border-t border-gray-100">
                  <Link
                    to={`/superadmin/hospitals/${h._id}`}
                    className="flex items-center gap-1 text-xs text-[#0B4B34] hover:text-[#063323] font-bold transition-all"
                  >
                    <Settings2 className="w-4 h-4" />
                    <span>Configure Settings & Staff Users</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── REGISTRATION MODAL — RESPONSIVE WRAPPING ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white border border-gray-100 rounded-2xl w-full max-w-lg shadow-2xl p-5 sm:p-6 relative animate-in zoom-in-95 duration-150 text-[#0f281e] my-8">
            <h2 className="text-base sm:text-lg font-bold mb-1 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#0B4B34]" />
              <span>Register New Hospital Tenant</span>
            </h2>
            <p className="text-[11px] text-slate-500 mb-6 mt-1">Initialize a database instance partition for an organization</p>

            <form onSubmit={handleCreateHospital} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wide">
                    Hospital Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!slug) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
                      }
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2 text-[#0f281e] text-xs focus:ring-1 focus:ring-[#0B4B34] focus:outline-none"
                    placeholder="City Care Clinic"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wide">
                    Unique Domain Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9\-]+/g, ""))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2 text-[#0f281e] text-xs focus:ring-1 focus:ring-[#0B4B34] focus:outline-none"
                    placeholder="city-care"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wide">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2 text-[#0f281e] text-xs focus:ring-1 focus:ring-[#0B4B34] focus:outline-none"
                    placeholder="admin@citycare.com"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wide">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2 text-[#0f281e] text-xs focus:ring-1 focus:ring-[#0B4B34] focus:outline-none"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wide">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2 text-[#0f281e] text-xs focus:ring-1 focus:ring-[#0B4B34] focus:outline-none"
                    placeholder="Indore"
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
                    placeholder="Madhya Pradesh"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wide">
                  Max Users Allocation
                </label>
                <input
                  type="number"
                  required
                  value={maxUsers}
                  onChange={(e) => setMaxUsers(parseInt(e.target.value, 10))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2 text-[#0f281e] text-xs focus:ring-1 focus:ring-[#0B4B34] focus:outline-none"
                  placeholder="50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#0B4B34] hover:bg-[#063323] text-white font-semibold text-xs rounded-xl transition-all shadow-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Instance...</span>
                    </>
                  ) : (
                    <span>Confirm Registration</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
