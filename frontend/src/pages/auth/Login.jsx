import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, Link } from "react-router-dom";
import {
  Lock,
  Loader2,
  AlertCircle,
  ChevronDown,
  ShieldCheck,
  Stethoscope,
  User as UserIcon,
  FlaskConical,
  Pill,
  Calendar,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import "./Login.css";

const logoBireena = "/src/assets/logo.png";

const ROLES = [
  { key: "Admin",                   label: "Admin Portal",        icon: ShieldCheck },
  { key: "Doctor",                  label: "Doctor Portal",       icon: Stethoscope },
  { key: "Lab Assistant",           label: "Lab Assistant Portal",icon: FlaskConical },
  { key: "Appointment",             label: "Appointment Portal",  icon: Calendar },
  { key: "Dispensory / Clinicians", label: "Dispensory Portal",   icon: Pill },
];

const getDemoCredentials = (r) => {
  const map = {
    "Admin":                   { email: "admin.medico",             password: "medicouseradmin" },
    "Doctor":                  { email: "doctor@hospital.com",      password: "Doctor@123" },
    "Lab Assistant":           { email: "lab.medico",               password: "medicouserlab" },
    "Appointment":             { email: "scheduler@hospital.com",   password: "Schedule@123" },
    "Dispensory / Clinicians": { email: "dispensary@hospital.com",  password: "Dispense@123" },
  };
  return map[r] || { email: "", password: "" };
};

export default function Login() {
  const [role, setRole]               = useState("Admin");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail]             = useState("admin.medico");
  const [password, setPassword]       = useState("medicouseradmin");
  const [error, setError]             = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { login, user: authenticatedUser } = useAuth();

  useEffect(() => {
    if (authenticatedUser) navigate("/dashboard");
  }, [authenticatedUser, navigate]);

  const handleRoleSelect = (r) => {
    setRole(r);
    const c = getDemoCredentials(r);
    setEmail(c.email);
    setPassword(c.password);
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRole = ROLES.find((r) => r.key === role);
  const SelectedIcon = selectedRole?.icon || ShieldCheck;
  const demoCreds = getDemoCredentials(role);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ backgroundColor: "#eef7f2" }}
    >

      {/* ── BACKGROUND DECORATION ── */}

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

      {/* Dot clusters */}
      {[
        { top: "32%", left: "8%" },
        { bottom: "30%", right: "6%" },
      ].map((pos, i) => (
        <div key={i} className="absolute pointer-events-none opacity-25" style={pos} aria-hidden="true">
          <div className="grid grid-cols-4 gap-1.5">
            {Array.from({ length: 16 }).map((_, j) => (
              <div key={j} className="w-1 h-1 rounded-full" style={{ backgroundColor: "#3a9e62" }} />
            ))}
          </div>
        </div>
      ))}

      {/* LEFT large leaf */}
      <div className="fixed left-0 bottom-0 w-72 h-96 pointer-events-none opacity-60" aria-hidden="true">
        <svg viewBox="0 0 280 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* stem */}
          <path d="M60 370 Q80 260 160 180" stroke="#6abf8a" strokeWidth="3" strokeLinecap="round" fill="none"/>
          {/* big leaf 1 */}
          <ellipse cx="100" cy="290" rx="70" ry="28" fill="#a8d8b9" opacity="0.7" transform="rotate(-40 100 290)"/>
          {/* big leaf 2 */}
          <ellipse cx="140" cy="230" rx="80" ry="30" fill="#7ec99a" opacity="0.65" transform="rotate(-55 140 230)"/>
          {/* big leaf 3 */}
          <ellipse cx="80" cy="340" rx="60" ry="22" fill="#b8e2c8" opacity="0.5" transform="rotate(-25 80 340)"/>
          {/* wave blob bottom */}
          <path d="M0 340 Q60 300 130 330 Q180 350 280 310 L280 380 L0 380Z" fill="#b8e4c9" opacity="0.5"/>
          <path d="M0 360 Q80 330 160 350 Q220 365 280 340 L280 380 L0 380Z" fill="#d0eedb" opacity="0.6"/>
        </svg>
      </div>

      {/* RIGHT large leaf */}
      <div className="fixed right-0 bottom-0 w-72 h-96 pointer-events-none opacity-60" aria-hidden="true">
        <svg viewBox="0 0 280 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M220 370 Q200 260 120 180" stroke="#6abf8a" strokeWidth="3" strokeLinecap="round" fill="none"/>
          <ellipse cx="180" cy="290" rx="70" ry="28" fill="#a8d8b9" opacity="0.7" transform="rotate(40 180 290)"/>
          <ellipse cx="140" cy="230" rx="80" ry="30" fill="#7ec99a" opacity="0.65" transform="rotate(55 140 230)"/>
          <ellipse cx="200" cy="340" rx="60" ry="22" fill="#b8e2c8" opacity="0.5" transform="rotate(25 200 340)"/>
          <path d="M280 340 Q220 300 150 330 Q100 350 0 310 L0 380 L280 380Z" fill="#b8e4c9" opacity="0.5"/>
          <path d="M280 360 Q200 330 120 350 Q60 365 0 340 L0 380 L280 380Z" fill="#d0eedb" opacity="0.6"/>
        </svg>
      </div>

      {/* Bottom wave */}
      <div className="fixed bottom-0 left-0 right-0 pointer-events-none opacity-40" aria-hidden="true">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 60 Q360 0 720 60 Q1080 120 1440 60 L1440 120 L0 120Z" fill="#a8d8b9" opacity="0.5"/>
          <path d="M0 80 Q400 30 800 80 Q1100 120 1440 70 L1440 120 L0 120Z" fill="#c5e8d2" opacity="0.5"/>
        </svg>
      </div>

      {/* ── LOGO ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 mb-8"
      >
        <Link to="/">
          <img
            src={logoBireena}
            alt="Bireena Medico"
            className="h-16 object-contain"
          />
        </Link>
      </motion.div>

      {/* ── LOGIN CARD ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-xl border border-white overflow-hidden"
      >
        <div className="px-10 pt-10 pb-6">

          {/* Welcome header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h2>
            <p className="text-sm text-gray-400">Sign in to continue to your account</p>
          </div>

          {/* ROLE SELECTOR */}
          <div className="relative mb-5">
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full h-14 px-5 flex items-center justify-between bg-gray-50 border border-gray-200 rounded-2xl hover:border-green-400 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#e6f4ec" }}>
                  <SelectedIcon className="w-4 h-4" style={{ color: "#1a6b3a" }} />
                </div>
                <span className="font-semibold text-gray-600 text-sm">Login Options</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  {ROLES.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => handleRoleSelect(key)}
                      className={`w-full px-5 py-3.5 flex items-center gap-3 text-sm transition-colors text-left border-b border-gray-50 last:border-0 ${
                        role === key ? "font-bold" : "text-gray-600 hover:bg-gray-50"
                      }`}
                      style={role === key ? { backgroundColor: "#f0faf4", color: "#1a6b3a" } : {}}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: role === key ? "#d4ede0" : "#f3f4f6" }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: role === key ? "#1a6b3a" : "#9ca3af" }} />
                      </div>
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Selected portal label */}
          <p className="text-sm text-gray-500 mb-6">
            Selected Portal:{" "}
            <strong className="font-bold" style={{ color: "#1a6b3a" }}>{role}</strong>
          </p>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3.5 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            {/* USERNAME */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block">Username / ID</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your username or ID"
                  className="w-full h-14 pl-12 pr-4 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block">Security Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-14 pl-12 pr-20 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 outline-none transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60 mt-2"
              style={{ background: "linear-gradient(135deg, #1a6b3a 0%, #1a5c32 100%)" }}
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Login
                </>
              )}
            </button>
          </form>
        </div>

        {/* CARD FOOTER */}
        <div className="mx-6 mb-6 px-5 py-4 rounded-2xl flex items-center gap-4" style={{ backgroundColor: "#f5faf7" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#e0f0e8" }}>
            <ShieldCheck className="w-4 h-4" style={{ color: "#1a6b3a" }} />
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Staff access only. For new accounts, please{" "}
            <span className="font-bold cursor-pointer" style={{ color: "#1a6b3a" }}>Contact Admin</span>
          </p>
        </div>
      </motion.div>

      {/* DEMO ACCESS */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 mt-6 flex flex-col items-center gap-2"
      >
        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.25em]">Demo Access</p>
        <div className="flex gap-3 flex-wrap justify-center">
          <code className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-500 shadow-sm">
            {demoCreds.email}
          </code>
          <code className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-500 shadow-sm">
            {demoCreds.password}
          </code>
        </div>
      </motion.div>

    </div>
  );
}