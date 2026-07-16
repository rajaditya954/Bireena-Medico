import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Settings,
  LogOut,
  ClipboardList,
  Pill,
  ReceiptIndianRupee,
  BarChart3,
  ShieldCheck,
  FileText,
  ChevronDown,
  Plus,
  History,
  Microscope,
  Upload,
  Calendar,
  Receipt,
  UserPlus,
} from "lucide-react";

import { cn } from "../../lib/utils";
import { Role } from "../../types";

const logoBireena = "/logo.png";

export default function Sidebar({ user, isSidebarOpen, handleLogout }) {
  const location = useLocation();
  const [openDropdowns, setOpenDropdowns] = useState({});

  const toggleDropdown = (name) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const getMenuItems = () => {
    if (!user) return [];

    switch (user.role) {
      case Role.DOCTOR:
        return [
          { name: "Doctor Dashboard", path: "/doctor/dashboard", icon: LayoutDashboard },
          {
            name: "My Patients", path: "/doctor/patients", icon: Users
          },
          {
            name: "Patient", path: "/doctor/patients", icon: Users,
            hasSubmenu: true,
            submenu: [
              { name: "Add Prescription", path: "/doctor/prescriptions", icon: Plus },
              { name: "Reports", path: "/doctor/reports", icon: FileText },
              { name: "Patient History", path: "/doctor/history", icon: History },
            ],
          },

        ];

      case Role.LAB:
        return [
          { name: "Lab Dashboard", path: "/lab/dashboard", icon: LayoutDashboard },
          { name: "All Reports", path: "/lab/reports", icon: Microscope },
          { name: "Upload Reports", path: "/lab/upload", icon: Upload },
        ];

      case Role.APPOINTMENT:
        return [
          { name: "Appointment Dashboard", path: "/appointment/dashboard", icon: LayoutDashboard },
          { name: "Add Appointment", path: "/appointment/add", icon: Plus },
          {
            name: "Patients",
            icon: Users,
            hasSubmenu: true,
            submenu: [
              { name: "All Patients", path: "/appointment/patients" },
              { name: "Add Patient", path: "/appointment/add-patient" },
            ],
          },
          { name: "Billing", path: "/appointment/billing", icon: ReceiptIndianRupee },
          { name: "Appointment History", path: "/appointment/history", icon: History },
        ];

      case Role.CLINIC:
        return [
          { name: "Clinic Dashboard", path: "/clinic/dashboard", icon: LayoutDashboard },
          { name: "Add Medicine", path: "/clinic/add-medicine", icon: Pill },
          { name: "Patients / Dispense", path: "/clinic/patients", icon: Users },
          { name: "Billing", path: "/clinic/billing", icon: Receipt },
          { name: "Stocks", path: "/clinic/stocks", icon: BarChart3 },
          { name: "History", path: "/clinic/history", icon: History },
        ];

      case Role.ADMIN:
      default:
        return [
          { name: "Admin Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
          { name: "Doctor Dashboard", path: "/doctor/dashboard", icon: LayoutDashboard },
          { name: "Doctor Management", path: "/admin/doctors", icon: Stethoscope },
          { name: "All Patients", path: "/patients", icon: Users },
          { name: "Appointment Dashboard", path: "/appointment/dashboard", icon: LayoutDashboard },
          {
            name: "Lab Dashboard", path: "/lab/dashboard", icon: LayoutDashboard, hasSubmenu: true, submenu: [
              { name: "Lab Dashboard", path: "/lab/dashboard" },
              { name: "Test Catalog", path: "/lab/tests" },
              { name: "Add Lab Test", path: "/lab/add-test" },
            ]
          },

          {
            name: "Dispensary",
            icon: Pill,
            hasSubmenu: true,
            submenu: [
              { name: "Medicine Inventory", path: "/clinic/dashboard" },
              { name: "Add Medicine", path: "/clinic/add-medicine" },
              { name: "Expired Medicines", path: "/clinic/expired-medicines" },
              { name: "Stocks", path: "/clinic/stocks", icon: BarChart3 },

            ],
          },
          { name: "User Management", path: "/admin/users", icon: ShieldCheck },
          { name: "Add User", path: "/admin/roles", icon: UserPlus },
          { name: "Settings", path: "/settings", icon: Settings },
        ];
    }
  };

  const menuItems = getMenuItems();

  useEffect(() => {
    if (!user || !menuItems.length) return;
    setOpenDropdowns((prev) => {
      const updated = { ...prev };
      menuItems.forEach((item) => {
        if (item.hasSubmenu && item.submenu) {
          const hasActiveSub = item.submenu.some(
            (sub) => location.pathname === sub.path || location.pathname.startsWith(sub.path + "/")
          );
          // Force open if a child is active; never force close a manually opened dropdown
          if (hasActiveSub) {
            updated[item.name] = true;
          }
        }
      });
      return updated;
    });
  }, [location.pathname, user]);

  // Split menu into sections — first item is dashboard, rest is "manage"
  const dashboardItem = menuItems[0];
  const manageItems = menuItems.slice(1);

  return (
    <aside
      className={cn(
        "w-[280px] sm:w-64 h-screen flex flex-col flex-shrink-0 transition-all duration-300 z-50",
        "fixed md:relative",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
      style={{ backgroundColor: "#1a3c2e" }}
    >
      {/* LOGO */}
      <div className="h-14 sm:h-16 md:h-20 flex items-center gap-3 px-4 sm:px-6 border-b border-gray-100">

        <img
          src={logoBireena}
          alt="Logo"
          className="
      h-14
      object-contain
      rounded-xl
      brightness-0
      invert
    "
        />

      </div>

      {/* MENU */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        {/* Dashboard item */}
        {dashboardItem && (
          <Link
            to={dashboardItem.path}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all",
              location.pathname === dashboardItem.path
                ? "bg-white/15 text-white"
                : "text-white/60 hover:bg-white/8 hover:text-white/90"
            )}
          >
            <dashboardItem.icon
              className={cn(
                "w-5 h-5",
                location.pathname === dashboardItem.path ? "text-white" : "text-white/50"
              )}
            />
            <span className="font-semibold text-sm">{dashboardItem.name}</span>
          </Link>
        )}

        {/* MANAGE section */}
        {manageItems.length > 0 && (
          <div className="mt-4 mb-2">
            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] px-3 mb-2">
              Manage
            </p>
            <div className="space-y-0.5">
              {manageItems.map((item) =>
                item.hasSubmenu ? (
                  <div key={item.name}>
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-white/60 hover:bg-white/8 hover:text-white/90 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-white/50" />
                        <span className="font-semibold text-sm">{item.name}</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 text-white/30 transition-transform",
                          openDropdowns[item.name] && "rotate-180"
                        )}
                      />
                    </button>
                    {openDropdowns[item.name] && (
                      <div className="ml-8 mt-0.5 space-y-0.5">
                        {item.submenu.map((sub) => (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all",
                              location.pathname === sub.path
                                ? "bg-white/15 text-white font-bold"
                                : "text-white/50 hover:bg-white/8 hover:text-white/80"
                            )}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
                      location.pathname === item.path
                        ? "bg-white/15 text-white"
                        : "text-white/60 hover:bg-white/8 hover:text-white/90"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-5 h-5",
                        location.pathname === item.path ? "text-white" : "text-white/50"
                      )}
                    />
                    <span className="font-semibold text-sm">{item.name}</span>
                  </Link>
                )
              )}
            </div>
          </div>
        )}
      </nav>

      {/* FOOTER — Log Out */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-bold text-sm">Log Out</span>
        </button>
      </div>

      {/* Decorative leaf/nature bottom */}
      <div
        className="absolute bottom-16 left-0 right-0 h-32 pointer-events-none overflow-hidden opacity-20 hidden md:block"
        aria-hidden="true"
      >
        <svg viewBox="0 0 256 128" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 80 Q40 20 80 60 Q120 100 160 40 Q200 -20 256 50 L256 128 L0 128Z" fill="#4ade80" opacity="0.4" />
          <path d="M0 100 Q50 50 100 80 Q150 110 200 60 Q230 30 256 70 L256 128 L0 128Z" fill="#22c55e" opacity="0.5" />
        </svg>
      </div>
    </aside>
  );
}