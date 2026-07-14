import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Building2,
  Users,
  UserCheck,
  TrendingUp,
  LogOut,
  ShieldCheck,
  Plus,
  RefreshCw,
  Globe,
  Settings2,
  ChevronRight,
  Loader2,
} from "lucide-react";
import axios from "axios";

export default function SuperAdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchMetrics = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("aarogya_token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await axios.get(`${apiUrl}/superadmin/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMetrics(response.data.data);
    } catch (err) {
      setError(err.message || "Failed to load SaaS analytics.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitals = async () => {
    setLoadingHospitals(true);
    try {
      const token = localStorage.getItem("aarogya_token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await axios.get(`${apiUrl}/superadmin/hospitals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHospitals(response.data.data.hospitals || []);
    } catch (err) {
      console.error("Failed to load hospitals for dashboard:", err);
    } finally {
      setLoadingHospitals(false);
    }
  };

  const loadAll = () => {
    fetchMetrics();
    fetchHospitals();
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("aarogya_token");
    localStorage.removeItem("medico_session");
    navigate("/superadmin/login");
  };

  return (
    <div className="min-h-screen bg-[#F2F9F6] text-[#0f281e] flex flex-col font-sans">
      {/* ── TOP NAV BAR (DARK GREEN) ── */}
      <header className="bg-[#0B4B34] text-white px-8 h-20 flex items-center justify-between border-b border-[#063323] shadow-md z-40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/10 rounded-xl border border-white/20">
            <ShieldCheck className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Bireena Medico Control Panel
            </h1>
            <p className="text-[11px] text-emerald-100/70">Platform-wide overview and tenant control</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={loadAll}
            className="p-2 bg-white/10 hover:bg-white/15 text-white rounded-xl transition border border-white/10"
            title="Refresh metrics & tenants"
          >
            <RefreshCw className={`w-4 h-4 ${loading || loadingHospitals ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600/90 hover:bg-red-700 text-white rounded-xl transition font-semibold text-xs border border-red-700/50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-8 space-y-8">
        {/* ── ERROR MESSAGE ── */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm shadow-sm flex items-center gap-2">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        {/* ── STATS CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Hospitals (Tenants)</span>
              <div className="p-2.5 bg-[#0B4B34]/10 rounded-xl text-[#0B4B34]">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[#0f281e] mb-1">
              {loading ? "..." : metrics?.hospitalCount || 0}
            </div>
            <p className="text-[11px] text-slate-500">
              <span className="text-[#0B4B34] font-bold">{metrics?.activeHospitals || 0}</span> active in production
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Platform Staff</span>
              <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[#0f281e] mb-1">
              {loading ? "..." : metrics?.totalUsers || 0}
            </div>
            <p className="text-[11px] text-slate-500">Hospital admins & medical staff</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Patients</span>
              <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[#0f281e] mb-1">
              {loading ? "..." : metrics?.totalPatients || 0}
            </div>
            <p className="text-[11px] text-slate-500">
              <span className="text-emerald-600 font-bold">{metrics?.totalAppointments || 0}</span> appointments scheduled
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Gross Billings</span>
              <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[#0f281e] mb-1">
              {loading ? "..." : `₹${metrics?.totalRevenue || 0}`}
            </div>
            <p className="text-[11px] text-slate-500">Aggregated gross tenant revenue</p>
          </div>
        </div>

        {/* ── INTERFACE OPTIONS / CONTROL TILES ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Hospital Management Tile */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6 border-b border-gray-150 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-[#0f281e]">Tenant Registry</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Configure subscription scopes, credentials, and settings</p>
                </div>
                <Link
                  to="/superadmin/hospitals"
                  className="flex items-center gap-1.5 px-4.5 py-2 bg-[#0B4B34] hover:bg-[#063323] text-white font-bold text-xs rounded-xl transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Manage Hospitals</span>
                </Link>
              </div>

              {loadingHospitals ? (
                <div className="bg-gray-50/50 rounded-xl border border-gray-100 p-8 flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0B4B34]" />
                  <span className="text-xs text-slate-500 mt-2">Loading registered tenants...</span>
                </div>
              ) : hospitals.length === 0 ? (
                <div className="bg-gray-50/50 rounded-xl border border-gray-100 p-8 flex flex-col items-center justify-center text-center">
                  <Building2 className="w-12 h-12 text-slate-300 mb-4" />
                  <h3 className="text-sm font-bold text-[#0f281e] mb-2">Configure active hospital instances</h3>
                  <p className="text-xs text-slate-500 max-w-sm mb-6">
                    Create sandbox systems, activate/deactivate accounts, manage user allocation limits, and add hospital admins.
                  </p>
                  <Link
                    to="/superadmin/hospitals"
                    className="px-5 py-2.5 bg-white hover:bg-gray-50 text-slate-700 font-semibold text-xs rounded-xl border border-gray-200 shadow-sm transition-all"
                  >
                    Open Hospital Manager
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {hospitals.slice(0, 4).map((h) => (
                    <div
                      key={h._id}
                      className="flex items-center justify-between p-4.5 bg-gray-50/40 border border-gray-100 rounded-xl hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#0B4B34]/10 rounded-lg text-[#0B4B34]">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#0f281e]">{h.name}</h4>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1.5 font-mono mt-0.5">
                            <Globe className="w-3.5 h-3.5 text-[#0B4B34]" />
                            <span>slug: {h.slug}</span>
                            {h.settings?.adminEmail && (
                              <span className="ml-1 text-slate-400 select-all font-semibold bg-gray-100 px-1.5 py-0.5 rounded">
                                Admin: {h.settings.adminEmail}
                              </span>
                            )}
                            {h.settings?.adminPassword && (
                              <span className="ml-1 text-[#0B4B34] select-all font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                                Pass: {h.settings.adminPassword}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            h.isActive
                              ? "bg-emerald-50 border-emerald-250 text-emerald-800"
                              : "bg-red-50 border-red-250 text-red-800"
                          }`}
                        >
                          {h.isActive ? "Active" : "Inactive"}
                        </span>
                        <Link
                          to={`/superadmin/hospitals/${h._id}`}
                          className="p-2 bg-white border border-gray-200 text-slate-600 hover:text-[#0B4B34] hover:border-[#0B4B34] rounded-lg transition shadow-sm"
                          title="Configure tenant settings"
                        >
                          <Settings2 className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}

                  {hospitals.length > 4 && (
                    <div className="text-center pt-2">
                      <Link
                        to="/superadmin/hospitals"
                        className="text-xs text-[#0B4B34] font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <span>View all {hospitals.length} registered hospitals</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Info Sidebar Panel */}
          <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
            <h2 className="text-lg font-bold text-[#0f281e] mb-4 border-b border-gray-150 pb-4">Platform Details</h2>
            
            <div className="space-y-4">
              <div className="p-4.5 bg-gray-50/50 rounded-xl border border-gray-100 flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Database Engine</span>
                <span className="text-sm text-slate-700 font-bold">Supabase PostgreSQL</span>
              </div>

              <div className="p-4.5 bg-gray-50/50 rounded-xl border border-gray-100 flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SaaS Framework</span>
                <span className="text-sm text-slate-700 font-bold">Shared Database + RLS isolation</span>
              </div>

              <div className="p-4.5 bg-gray-50/50 rounded-xl border border-gray-100 flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Authorization Scope</span>
                <span className="text-sm text-slate-700 font-bold">Stateless JWT claims</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
