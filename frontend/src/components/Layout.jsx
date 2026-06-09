import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  Search,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  UserCircle,
  LogOut,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../hooks/useAuth";
import { cn } from "../lib/utils";
import Breadcrumbs from "./Breadcrumbs";
import Sidebar from "./layout/Sidebar";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: "#f0f7f4" }}>
      {/* Sidebar Backdrop for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <Sidebar user={user} isSidebarOpen={isSidebarOpen} handleLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 flex-shrink-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all md:hidden"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            {/* Search */}
            <div className="relative hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-gray-50 border border-gray-200 rounded-full pl-10 pr-6 h-10 w-72 text-sm focus:ring-2 focus:ring-green-200 focus:bg-white transition-all outline-none text-gray-700"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Bell */}
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </button>

            <div className="w-px h-7 bg-gray-200" />

            {/* User */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 py-1 group"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-800 leading-none">{user?.name || "User"}</p>
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400 mt-0.5">
                    {user?.role || "Guest"}
                  </p>
                </div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: "#1a3c2e" }}
                >
                  <UserIcon className="w-5 h-5" />
                </div>
                <ChevronDown
                  className={cn("w-4 h-4 text-gray-400 transition-transform", isProfileOpen ? "rotate-180" : "")}
                />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account</p>
                    </div>
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <UserCircle className="w-4 h-4" />
                      <span className="font-semibold">Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-semibold">Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto relative">
          {/* Decorative background leaves — bottom right */}
          <div
            className="fixed bottom-0 right-0 w-72 h-64 pointer-events-none z-0 opacity-30"
            aria-hidden="true"
          >
            <svg viewBox="0 0 300 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <ellipse cx="220" cy="180" rx="90" ry="40" fill="#86efac" opacity="0.5" transform="rotate(-30 220 180)" />
              <ellipse cx="250" cy="200" rx="70" ry="30" fill="#4ade80" opacity="0.4" transform="rotate(-15 250 200)" />
              <ellipse cx="180" cy="220" rx="100" ry="35" fill="#86efac" opacity="0.35" transform="rotate(-45 180 220)" />
              <ellipse cx="270" cy="230" rx="60" ry="25" fill="#22c55e" opacity="0.3" transform="rotate(10 270 230)" />
              <ellipse cx="150" cy="240" rx="80" ry="28" fill="#4ade80" opacity="0.3" transform="rotate(-60 150 240)" />
            </svg>
          </div>

          {/* Decorative dots background */}
          <div
            className="absolute inset-0 z-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle, #166534 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 p-6 md:p-8">
            <Breadcrumbs />
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}