import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2, AlertCircle, ShieldAlert, Eye, EyeOff } from "lucide-react";
import axios from "axios";

export default function SuperAdminLogin() {
  const [email, setEmail] = useState("superadmin@bireena.com");
  const [password, setPassword] = useState("SuperAdmin@123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await axios.post(`${apiUrl}/superadmin/login`, { email, password });
      
      const { token, user } = response.data.data;
      
      localStorage.setItem("aarogya_token", token);
      localStorage.setItem("medico_session", JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: "SUPER_ADMIN",
        hospitalId: null,
      }));

      // Force a custom event or redirect to sync AuthContext state
      window.dispatchEvent(new Event("storage"));
      navigate("/superadmin/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to authenticate as Super Admin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ backgroundColor: "#eef7f2" }}
    >
      {/* Subtle hex grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.18]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='92' viewBox='0 0 80 92'%3E%3Cpolygon points='40,2 78,22 78,62 40,82 2,62 2,22' fill='none' stroke='%2334a86a' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: "90px 104px",
        }}
        aria-hidden="true"
      />

      {/* Plus cross marks */}
      {[
        { top: "8%", left: "18%", size: 22 },
        { top: "26%", left: "6%", size: 16 },
        { top: "14%", right: "14%", size: 20 },
        { top: "38%", right: "5%", size: 14 },
        { bottom: "22%", left: "10%", size: 16 },
        { bottom: "10%", right: "18%", size: 18 },
      ].map((s, i) => (
        <svg
          key={i}
          className="absolute pointer-events-none opacity-30"
          style={{ top: s.top, left: s.left, right: s.right, bottom: s.bottom, width: s.size, height: s.size }}
          viewBox="0 0 20 20" fill="none" aria-hidden="true"
        >
          <line x1="10" y1="0" x2="10" y2="20" stroke="#2d8a55" strokeWidth="2" strokeLinecap="round"/>
          <line x1="0" y1="10" x2="20" y2="10" stroke="#2d8a55" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ))}

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl p-8">
          {/* Logo / Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="p-4 bg-[#0B4B34]/10 rounded-2xl border border-[#0B4B34]/20 mb-4">
              <ShieldAlert className="w-10 h-10 text-[#0B4B34]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0f281e] text-center">
              Medico SaaS Control Panel
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Super Admin Authorization Required
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Super Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[#0f281e] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B4B34]/50 focus:border-transparent transition-all"
                placeholder="superadmin@bireena.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Access Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 py-3 text-[#0f281e] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B4B34]/50 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-[#0f281e]"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0B4B34] hover:bg-[#063323] disabled:opacity-50 text-white font-medium rounded-xl py-3.5 flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#0B4B34]/20 mt-8"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Log In to Control Panel</span>
              )}
            </button>
          </form>

          {/* Demo Credentials Alert */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-slate-500">
            <span className="font-semibold text-[#0B4B34]">Demo Access: </span>
            <code>superadmin@bireena.com</code> / <code>SuperAdmin@123</code>
          </div>
        </div>
      </div>
    </div>
  );
}
