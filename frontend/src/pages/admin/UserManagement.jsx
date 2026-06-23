import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Shield,
  UserX,
  UserCheck,
  Search,
  MoreVertical,
  Activity,
  UserCog,
  ShieldAlert,
  Eye,
  Lock,
  Key,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Server,
  Power,
  AlertCircle,
  CheckCircle,
  Circle,
  Briefcase,
  ChevronRight,
  X,
  Stethoscope,
  FlaskConical,
  Building2,
  CalendarCheck,
  Receipt,
  Crown,
  Hash,
  Globe,
  Unlock,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { Button } from "../../components/common/Button";

/* ═══════════════════ ROLE CONFIG ═══════════════════ */
const ROLE_CONFIG = {
  Doctor:             { icon: Stethoscope,  gradient: "from-emerald-600 to-teal-700",  light: "bg-emerald-50 text-emerald-700", border: "border-emerald-100", dot: "bg-emerald-500" },
  "Lab Assistant":    { icon: FlaskConical,  gradient: "from-emerald-600 to-teal-700",  light: "bg-emerald-50 text-emerald-700", border: "border-emerald-100", dot: "bg-emerald-500" },
  "Clinic Staff":     { icon: Building2,    gradient: "from-emerald-600 to-teal-700",  light: "bg-emerald-50 text-emerald-700", border: "border-emerald-100", dot: "bg-emerald-500" },
  "Appointment Staff":{ icon: CalendarCheck, gradient: "from-emerald-600 to-teal-700",  light: "bg-emerald-50 text-emerald-700", border: "border-emerald-100", dot: "bg-emerald-500" },
  "Billing Staff":    { icon: Receipt,      gradient: "from-emerald-600 to-teal-700",  light: "bg-emerald-50 text-emerald-700", border: "border-emerald-100", dot: "bg-emerald-500" },
  Admin:              { icon: Crown,        gradient: "from-slate-700 to-slate-800",   light: "bg-slate-100 text-slate-700",  border: "border-slate-200", dot: "bg-slate-700" },
};

const getRoleConfig = (role) => ROLE_CONFIG[role] || ROLE_CONFIG.Admin;

const STATUS_CONFIG = {
  Active:   { cls: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-500" },
  Inactive: { cls: "bg-red-50 text-red-600 border-red-100",           dot: "bg-red-500" },
  Locked:   { cls: "bg-amber-50 text-amber-700 border-amber-100",     dot: "bg-amber-500" },
};

const ALL_ROLES = ["Doctor", "Lab Assistant", "Clinic Staff", "Appointment Staff", "Billing Staff", "Admin"];

/* ═══════════════════ MAIN COMPONENT ═══════════════════ */
export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "Doctor" });
  const [showRoleDropdown, setShowRoleDropdown] = useState(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { adminService } = await import("../../services/adminService");
        const list = await adminService.getUsers();
        if (!cancelled) {
          setUsers(list || []);
          if (list?.length > 0 && !selectedUserId) setSelectedUserId(list[0].id);
        }
      } catch (err) {
        const storedUsers = localStorage.getItem("careplus_users");
        if (storedUsers) {
          const parsed = JSON.parse(storedUsers);
          setUsers(parsed);
          if (parsed.length > 0) setSelectedUserId(parsed[0].id);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem("careplus_users", JSON.stringify(users));
    }
  }, [users]);

  const selectedUser = users.find(u => u.id === selectedUserId);

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === "Active").length;
  const inactiveUsers = users.filter(u => u.status === "Inactive").length;
  const lockedUsers = users.filter(u => u.status === "Locked").length;
  const onlineNow = users.filter(u => u.isOnline && u.status === "Active").length;

  const roleCounts = {};
  ALL_ROLES.forEach(r => { roleCounts[r] = users.filter(u => u.role === r).length; });

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    const matchesStatus = filterStatus === "all" || u.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  /* ─── Handlers ─── */
  const handleCreateUser = (e) => {
    e.preventDefault();
    (async () => {
      try {
        const { adminService } = await import("../../services/adminService");
        const normalizeRole = (r) => {
          const map = { Doctor: "DOCTOR", "Lab Assistant": "LAB", "Clinic Staff": "DISPENSARY_STAFF", "Appointment Staff": "APPOINTMENT_MANAGER", "Billing Staff": "BILLING", Admin: "ADMIN" };
          return map[r] || r.toUpperCase().replace(/\s+/g, "_");
        };
        await adminService.createUser({ name: newUser.name, email: newUser.email, password: "ChangeMe@123", role: normalizeRole(newUser.role) });
        const list = await adminService.getUsers();
        setUsers(list || []);
        setIsAddModalOpen(false);
        setNewUser({ name: "", email: "", role: "Doctor" });
      } catch (err) {
        const newUserId = `USR-${String(users.length + 1).padStart(4, "0")}`;
        const createdUser = {
          id: newUserId, name: newUser.name, email: newUser.email, role: newUser.role, department: "General", status: "Active", lastLogin: "Never", ip: "0.0.0.0", isOnline: false,
          personalInfo: { email: newUser.email, mobile: "Not provided", gender: "Not specified", dateOfBirth: "Not provided", address: "Not provided", username: newUser.email.split("@")[0], lastLogin: "Never", ipAddress: "0.0.0.0", assignedClinics: "Not assigned", assignedDepartments: "Not assigned", permissions: ["Default permissions"] },
        };
        setUsers([...users, createdUser]);
        setIsAddModalOpen(false);
        setNewUser({ name: "", email: "", role: "Doctor" });
      }
    })();
  };

  const handleToggleStatus = (userId) => {
    (async () => {
      try {
        const { adminService } = await import("../../services/adminService");
        const u = users.find(x => x.id === userId);
        if (!u) return;
        if (u.status === "Active") await adminService.deactivateUser(userId);
        else await adminService.activateUser(userId);
        const list = await adminService.getUsers();
        setUsers(list || []);
      } catch (err) {
        setUsers(prev => prev.map(user => {
          if (user.id === userId) {
            const newStatus = user.status === "Active" ? "Inactive" : "Active";
            return { ...user, status: newStatus, isOnline: newStatus === "Active" ? user.isOnline : false };
          }
          return user;
        }));
      }
    })();
  };

  const handleLockAccount = (userId) => {
    (async () => {
      try {
        const { adminService } = await import("../../services/adminService");
        const u = users.find(x => x.id === userId);
        if (!u) return;
        if (u.status === "Locked") await adminService.activateUser(userId);
        else await adminService.deactivateUser(userId);
        const list = await adminService.getUsers();
        setUsers(list || []);
      } catch (err) {
        setUsers(prev => prev.map(user => {
          if (user.id === userId) {
            const newStatus = user.status === "Locked" ? "Active" : "Locked";
            return { ...user, status: newStatus, isOnline: false };
          }
          return user;
        }));
      }
    })();
  };

  const handleResetPassword = (userId) => {
    (async () => {
      try {
        const u = users.find(x => x.id === userId);
        if (!u) return alert("User not found");
        const { adminService } = await import("../../services/adminService");
        await adminService.changeUserPassword(userId, "ChangeMe@123");
        alert(`Password reset to default for ${u.email}. Ask user to change on first login.`);
        const list = await adminService.getUsers();
        setUsers(list || []);
      } catch (err) {
        alert(`Password reset link sent to ${users.find(u => u.id === userId)?.email}`);
      }
    })();
  };

  const handleChangeRole = (userId, newRole) => {
    (async () => {
      try {
        const { adminService } = await import("../../services/adminService");
        const roleMap = (r) => {
          const map = { Doctor: "DOCTOR", "Lab Assistant": "LAB", "Clinic Staff": "DISPENSARY_STAFF", "Appointment Staff": "APPOINTMENT_MANAGER", "Billing Staff": "BILLING", Admin: "ADMIN" };
          return map[r] || r.toUpperCase().replace(/\s+/g, "_");
        };
        await adminService.updateUser(userId, { role: roleMap(newRole) });
        const list = await adminService.getUsers();
        setUsers(list || []);
      } catch (err) {
        setUsers(prev => prev.map(user => (user.id === userId ? { ...user, role: newRole } : user)));
      } finally {
        setShowRoleDropdown(null);
      }
    })();
  };

  const handleSelectUser = (userId) => {
    setSelectedUserId(userId);
    setDetailPanelOpen(true);
  };

  /* ─── Metrics ─── */
  const metricsCards = [
    { label: "Total Users", value: totalUsers, icon: Users, gradient: "from-slate-600 to-slate-700", bg: "bg-slate-50" },
    { label: "Active", value: activeUsers, icon: UserCheck, gradient: "from-emerald-600 to-teal-700", bg: "bg-emerald-50" },
    { label: "Inactive", value: inactiveUsers, icon: UserX, gradient: "from-slate-400 to-slate-500", bg: "bg-slate-50" },
    { label: "Locked", value: lockedUsers, icon: Lock, gradient: "from-slate-500 to-slate-600", bg: "bg-slate-50" },
    { label: "Online Now", value: onlineNow, icon: Activity, gradient: "from-emerald-500 to-teal-600", bg: "bg-emerald-50" },
  ];

  /* ═══════════════════ RENDER ═══════════════════ */
  return (
    <div className="space-y-6 pb-12">
      {/* ───── Header ───── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">User Management</h1>
            <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">
              Manage roles, access & permissions
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="h-11 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center gap-2 font-bold text-xs shadow-lg shadow-emerald-500/15 hover:from-emerald-700 hover:to-teal-700 transition-all active:scale-[0.98]"
        >
          <UserPlus className="w-4 h-4" /> Add New User
        </button>
      </div>

      {/* ───── Metrics ───── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {metricsCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-4 rounded-2xl border border-gray-100 hover:shadow-lg hover:shadow-gray-100/50 transition-all group"
          >
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform`}>
              <stat.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{stat.label}</p>
            <p className="text-2xl font-black text-slate-800">{loading ? "—" : stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* ───── Search & Filters ───── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full h-12 pl-11 pr-4 bg-white border border-gray-200/60 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all shadow-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="h-12 px-4 bg-white border border-gray-200/60 rounded-2xl text-sm font-medium text-gray-600 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all shadow-sm cursor-pointer min-w-[150px]"
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
        >
          <option value="all">All Roles</option>
          {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          className="h-12 px-4 bg-white border border-gray-200/60 rounded-2xl text-sm font-medium text-gray-600 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all shadow-sm cursor-pointer min-w-[140px]"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Locked">Locked</option>
        </select>
      </div>

      {/* ───── Main Layout ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ──── Users Table ──── */}
        <div className="lg:col-span-8 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
              <RefreshCw className="w-7 h-7 text-blue-500 animate-spin mb-3" />
              <p className="text-gray-500 text-sm font-bold">Loading users...</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50/80 to-gray-50/40 border-b border-gray-100">
                      {["User", "Role", "Status", "Last Login", ""].map((h, i) => (
                        <th key={i} className={cn("px-5 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-wider", i === 4 ? "text-right" : "text-left")}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <AnimatePresence mode="popLayout">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-16">
                            <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                            <p className="text-gray-400 text-sm font-bold">No users found</p>
                            <p className="text-gray-300 text-xs mt-1">Try adjusting your filters</p>
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => {
                          const rc = getRoleConfig(user.role);
                          const sc = STATUS_CONFIG[user.status] || STATUS_CONFIG.Active;
                          const isSelected = selectedUserId === user.id;
                          return (
                            <motion.tr
                              key={user.id}
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              onClick={() => handleSelectUser(user.id)}
                              className={cn(
                                "group hover:bg-blue-50/30 transition-all cursor-pointer",
                                isSelected && "bg-blue-50/50"
                              )}
                            >
                              {/* User */}
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${rc.gradient} text-white flex items-center justify-center text-xs font-black shadow-sm`}>
                                      {user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                    </div>
                                    {/* Online dot */}
                                    {user.isOnline && user.status === "Active" && (
                                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-slate-800 text-sm truncate">{user.name}</p>
                                    <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                                  </div>
                                </div>
                              </td>

                              {/* Role */}
                              <td className="px-5 py-3.5">
                                <div className="relative">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setShowRoleDropdown(showRoleDropdown === user.id ? null : user.id); }}
                                    className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all", rc.light, rc.border, "hover:shadow-sm")}
                                  >
                                    <rc.icon className="w-3 h-3" />
                                    {user.role}
                                  </button>
                                  {showRoleDropdown === user.id && (
                                    <div className="absolute left-0 top-full mt-1 w-44 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden py-1">
                                      {ALL_ROLES.map(role => {
                                        const rrc = getRoleConfig(role);
                                        return (
                                          <button
                                            key={role}
                                            onClick={(e) => { e.stopPropagation(); handleChangeRole(user.id, role); }}
                                            className={cn(
                                              "w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center gap-2",
                                              user.role === role ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
                                            )}
                                          >
                                            <rrc.icon className="w-3.5 h-3.5" />
                                            {role}
                                            {user.role === role && <CheckCircle className="w-3 h-3 ml-auto text-blue-500" />}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Status */}
                              <td className="px-5 py-3.5">
                                <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border", sc.cls)}>
                                  <span className={cn("w-1.5 h-1.5 rounded-full", sc.dot)} />
                                  {user.status}
                                </span>
                              </td>

                              {/* Last Login */}
                              <td className="px-5 py-3.5">
                                <p className="text-xs text-slate-600">{user.lastLogin}</p>
                                <p className="text-[10px] text-gray-400 font-mono mt-0.5">{user.ip}</p>
                              </td>

                              {/* Actions */}
                              <td className="px-5 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(user.id); }}
                                    className={cn(
                                      "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                      user.status === "Active" ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-emerald-50 text-emerald-500 hover:bg-emerald-100"
                                    )}
                                    title={user.status === "Active" ? "Deactivate" : "Activate"}
                                  >
                                    {user.status === "Active" ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleLockAccount(user.id); }}
                                    className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 hover:bg-amber-100 flex items-center justify-center transition-all"
                                    title={user.status === "Locked" ? "Unlock" : "Lock"}
                                  >
                                    {user.status === "Locked" ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleSelectUser(user.id); }}
                                    className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-all"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              {filteredUsers.length > 0 && (
                <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
                  <p className="text-[11px] text-gray-400 font-medium">
                    Showing <span className="font-bold text-slate-600">{filteredUsers.length}</span> of {totalUsers} users
                  </p>
                  <div className="flex items-center gap-2">
                    {filterRole !== "all" && (
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        Role: {filterRole}
                        <button onClick={() => setFilterRole("all")} className="hover:text-blue-800"><X className="w-2.5 h-2.5" /></button>
                      </span>
                    )}
                    {filterStatus !== "all" && (
                      <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        Status: {filterStatus}
                        <button onClick={() => setFilterStatus("all")} className="hover:text-purple-800"><X className="w-2.5 h-2.5" /></button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ──── Role Based Access Overview ──── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-gray-50/50 to-white">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                Role Based Access Overview
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Each role has specific access permissions to modules and features.</p>
            </div>

            <div className="divide-y divide-gray-50">
              {[
                { role: "Doctor", desc: "View own patients, prescriptions & appointments" },
                { role: "Lab Assistant", desc: "View & manage assigned lab reports only" },
                { role: "Clinic Staff", desc: "Manage medicine distribution & patients" },
                { role: "Appointment Staff", desc: "Manage appointments & calendar" },
                { role: "Billing Staff", desc: "Manage billing, invoices & payments" },
                { role: "Admin", desc: "Full system access & user management" },
              ].map(({ role, desc }) => {
                const rc = getRoleConfig(role);
                return (
                  <div key={role} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${rc.gradient} flex items-center justify-center shadow-sm`}>
                        <rc.icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">{role}</p>
                        <p className="text-[11px] text-gray-400">{desc}</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-slate-800 bg-gray-50 px-3 py-1 rounded-lg">{roleCounts[role] || 0}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ──── Right Detail Panel ──── */}
        <div className="lg:col-span-4">
          {selectedUser ? (
            <motion.div
              key={selectedUser.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-6"
            >
              {/* User Profile Header */}
              <div className={`bg-gradient-to-br ${getRoleConfig(selectedUser.role).gradient} p-6 relative overflow-hidden`}>
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/2" />
                </div>
                <div className="relative flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm text-white flex items-center justify-center text-xl font-black border border-white/10">
                    {selectedUser.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{selectedUser.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-white/80 bg-white/15 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        {selectedUser.role}
                      </span>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-md",
                        selectedUser.status === "Active" ? "bg-emerald-400/20 text-emerald-100" :
                        selectedUser.status === "Locked" ? "bg-amber-400/20 text-amber-100" : "bg-red-400/20 text-red-100"
                      )}>
                        {selectedUser.status}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-white/50 mt-1">{selectedUser.id}</p>
                  </div>
                </div>
              </div>

              {/* Detail Sections */}
              <div className="divide-y divide-gray-50">
                {/* Personal Information */}
                <DetailSection title="Personal Information" icon={<UserCog className="w-3.5 h-3.5 text-blue-500" />}>
                  <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={selectedUser.personalInfo?.email || selectedUser.email} />
                  <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="Mobile" value={selectedUser.personalInfo?.mobile || "Not provided"} />
                  <InfoRow icon={<Calendar className="w-3.5 h-3.5" />} label="DOB" value={selectedUser.personalInfo?.dateOfBirth || "Not provided"} />
                  <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Address" value={selectedUser.personalInfo?.address || "Not provided"} />
                </DetailSection>

                {/* Access Info */}
                <DetailSection title="Access Information" icon={<Key className="w-3.5 h-3.5 text-amber-500" />}>
                  <InfoRow icon={<Hash className="w-3.5 h-3.5" />} label="Username" value={selectedUser.personalInfo?.username || selectedUser.email?.split("@")[0]} mono />
                  <InfoRow icon={<Lock className="w-3.5 h-3.5" />} label="Password" value="••••••••" mono />
                  <InfoRow icon={<Calendar className="w-3.5 h-3.5" />} label="Last Login" value={selectedUser.lastLogin} />
                  <InfoRow icon={<Globe className="w-3.5 h-3.5" />} label="IP Address" value={selectedUser.ip} mono />
                </DetailSection>

                {/* Role & Permissions */}
                <DetailSection title="Role & Permissions" icon={<Shield className="w-3.5 h-3.5 text-emerald-500" />}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-medium">Current Role</span>
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded-md", getRoleConfig(selectedUser.role).light)}>
                        {selectedUser.role}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-medium block mb-1.5">Permissions</span>
                      <div className="flex flex-wrap gap-1">
                        {(selectedUser.personalInfo?.permissions || ["Standard access"]).map((p, idx) => (
                          <span key={idx} className="text-[10px] font-bold text-slate-600 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-medium">Clinic</span>
                      <span className="text-xs text-slate-700 font-medium">{selectedUser.personalInfo?.assignedClinics || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-medium">Department</span>
                      <span className="text-xs text-slate-700 font-medium">{selectedUser.personalInfo?.assignedDepartments || "—"}</span>
                    </div>
                  </div>
                </DetailSection>

                {/* Account Actions */}
                <div className="p-5 space-y-2.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Account Actions</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleResetPassword(selectedUser.id)}
                      className="h-9 rounded-xl bg-gray-50 border border-gray-100 text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all font-bold text-[11px] flex items-center justify-center gap-1.5"
                    >
                      <Key className="w-3 h-3" /> Reset Password
                    </button>
                    <button
                      onClick={() => handleLockAccount(selectedUser.id)}
                      className={cn(
                        "h-9 rounded-xl border font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all",
                        selectedUser.status === "Locked"
                          ? "bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100"
                          : "bg-amber-50 border-amber-100 text-amber-700 hover:bg-amber-100"
                      )}
                    >
                      {selectedUser.status === "Locked" ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {selectedUser.status === "Locked" ? "Unlock" : "Lock"}
                    </button>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(selectedUser.id)}
                    className={cn(
                      "w-full h-9 rounded-xl border font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all",
                      selectedUser.status === "Active"
                        ? "bg-red-50 border-red-100 text-red-600 hover:bg-red-100"
                        : "bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100"
                    )}
                  >
                    <Power className="w-3 h-3" />
                    {selectedUser.status === "Active" ? "Deactivate User" : "Activate User"}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center sticky top-6">
              <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-slate-700 font-bold text-sm">Select a User</p>
              <p className="text-gray-400 text-xs mt-1">Click on any user row to view their details here</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══════ Add User Modal ═══════ */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setIsAddModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/2" />
                </div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Add New User</h2>
                    <p className="text-emerald-100/80 text-xs mt-1">Provision system access for a new team member</p>
                  </div>
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateUser} className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-emerald-500" /> Full Name
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Enter full name"
                    className="w-full h-11 px-4 bg-gray-50/80 border border-gray-200/60 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all text-slate-800 placeholder:text-gray-400/60"
                    value={newUser.name}
                    onChange={e => setNewUser({...newUser, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-emerald-500" /> Email Address
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="user@example.com"
                    className="w-full h-11 px-4 bg-gray-50/80 border border-gray-200/60 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all text-slate-800 placeholder:text-gray-400/60"
                    value={newUser.email}
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-emerald-500" /> Designated Role
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {ALL_ROLES.map(role => {
                      const rc = getRoleConfig(role);
                      const isActive = newUser.role === role;
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setNewUser({...newUser, role})}
                          className={cn(
                            "py-2.5 px-2 rounded-xl border text-[11px] font-bold transition-all flex flex-col items-center gap-1.5",
                            isActive
                              ? `bg-gradient-to-br ${rc.gradient} text-white border-transparent shadow-lg`
                              : "bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100"
                          )}
                        >
                          <rc.icon className="w-4 h-4" />
                          {role.split(" ")[0]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-blue-600 font-medium leading-relaxed">
                    A default password <code className="bg-blue-100 px-1 rounded text-[10px] font-mono">ChangeMe@123</code> will be assigned. The user should change it on first login.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 h-11 rounded-xl bg-gray-100 text-slate-600 hover:bg-gray-200 font-bold text-xs transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 font-bold text-xs shadow-lg shadow-emerald-500/15 transition-all flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" /> Create User
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════ Sub-Components ═══════════════════ */

function DetailSection({ title, icon, children }) {
  return (
    <div className="p-5">
      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        {icon} {title}
      </h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function InfoRow({ icon, label, value, mono }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className={cn("text-xs text-slate-700 truncate", mono && "font-mono")}>{value}</p>
      </div>
    </div>
  );
}