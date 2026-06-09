import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import {
  Calendar, Search, ChevronRight, Clock, User, Loader2,
  X, CheckCircle, XCircle, ChevronLeft, PlayCircle,
  Stethoscope, FlaskConical, RefreshCw, AlertTriangle, Plus
} from "lucide-react";
import { cn } from "../../lib/utils";
import { format } from "date-fns";
import * as api from "../../services/appointmentApi";
import QueuePanel from "./QueuePanel";
import AddAppointment from "./AddAppointment";

const TABS = [
  { id: "all", label: "All" },
  { id: "doctor", label: "Doctor" },
  { id: "lab", label: "Lab Consultant" },
  { id: "live-queue", label: "Live Queue" },
  { id: "scheduled", label: "Scheduled" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

export default function AppointmentListNew() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [searchTerm, setSearchTerm] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 15;
  const intervalRef = useRef(null);

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const session = JSON.parse(localStorage.getItem("medico_session"));
      if (session && (session.role === "Admin" || session.role === "SYSTEM ADMIN" || session.role === "admin" || session.role === "ADMIN")) {
        setIsAdmin(true);
      }
    } catch (e) { }
  }, []);

  // ── Stats ──────────────────────────────────────────────────
  const stats = {
    total: (appointments || []).length,
    waiting: (appointments || []).filter(a => a.status === "waiting" || a.status === "scheduled").length,
    inProgress: (appointments || []).filter(a => a.status === "in-progress").length,
    completed: (appointments || []).filter(a => a.status === "completed").length,
    cancelled: (appointments || []).filter(a => a.status === "cancelled").length,
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.getDoctors();
        const docs = res.data?.data || [];
        setDoctors(docs);
        setSelectedDoctor({ id: "all", name: "All Doctors" });
      } catch (err) { console.error("Failed to load doctors"); }
    };
    fetchDoctors();
  }, []);

  const fetchAppointments = useCallback(async (silent = false) => {
    if (!selectedDoctor?.id) return;
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      const res = await api.getTodayAppointments(selectedDoctor.id);
      setAppointments(res.data?.data || []);
    } catch (err) { console.error("Fetch error:", err); setAppointments([]); }
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDoctor?.id]);

  // Initial load
  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  // Auto-refresh every 20 seconds (silent background poll)
  useEffect(() => {
    intervalRef.current = setInterval(() => { fetchAppointments(true); }, 20000);
    return () => clearInterval(intervalRef.current);
  }, [fetchAppointments]);

  const filtered = (appointments || []).filter((a) => {
    const matchesSearch = !searchTerm ||
      a.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.tokenNumber?.toString() === searchTerm;
    let matchesTab = true;
    if (activeTab === "doctor") matchesTab = a.consultantType !== "lab";
    else if (activeTab === "lab") matchesTab = a.consultantType === "lab";
    else if (activeTab === "scheduled") matchesTab = a.status === "waiting" || a.status === "scheduled";
    else if (activeTab === "completed") matchesTab = a.status === "completed";
    else if (activeTab === "cancelled") matchesTab = a.status === "cancelled";
    return matchesSearch && matchesTab;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleStatusChangeAction = async (id, action) => {
    try {
      if (action === "start") { await api.startAppointment(id); toast.success("Patient called in"); }
      else if (action === "complete") { await api.completeAppointment(id); toast.success("Appointment completed ✅"); }
      else if (action === "cancel") { await api.cancelAppointment(id); toast.success("Appointment cancelled"); }
      fetchAppointments(true);
    } catch (err) { toast.error(err.response?.data?.message || "Action failed"); }
  };

  const getStatusBadge = (status) => {
    const map = {
      waiting: "apt-badge apt-badge-waiting",
      "in-progress": "apt-badge apt-badge-in-progress",
      completed: "apt-badge apt-badge-completed",
      cancelled: "apt-badge apt-badge-cancelled",
      scheduled: "apt-badge apt-badge-upcoming"
    };
    return <span className={map[status] || "apt-badge apt-badge-upcoming"}>{status}</span>;
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  };
  const getInitialColor = (name) => {
    const colors = ["#0F5C3A", "#B45309", "#7C3AED", "#DC2626", "#0369A1", "#C2410C", "#4338CA", "#0F766E"];
    let hash = 0;
    for (let i = 0; i < (name || "").length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const displayDate = (() => { try { return format(new Date(date), "EEEE, dd MMMM yyyy"); } catch { return date; } })();

  return (
    <div className={cn("flex gap-6 items-start w-full transition-all duration-300", isAdmin ? "max-w-full" : "max-w-7xl mx-auto")}>
      <div className={cn("space-y-6 flex-1 min-w-0")}>
        <Toaster position="top-right" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-[#0A3E2A] tracking-tight">Appointment & Consultant</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchAppointments(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#0F5C3A] border border-[#0F5C3A]/30 rounded-lg hover:bg-[#0F5C3A] hover:text-white transition-all"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
              Refresh
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Total", value: stats.total, color: "bg-gray-100 text-gray-700" },
            { label: "Waiting", value: stats.waiting, color: "bg-amber-50 text-amber-700" },
            { label: "In Progress", value: stats.inProgress, color: "bg-blue-50 text-blue-700" },
            { label: "Completed", value: stats.completed, color: "bg-emerald-50 text-emerald-700" },
            { label: "Cancelled", value: stats.cancelled, color: "bg-red-50 text-red-600" },
          ].map(s => (
            <div key={s.label} className={cn("apt-card px-4 py-3 text-center", s.color)}>
              <div className="text-2xl font-black">{s.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs + Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
              className={cn("px-4 py-2 rounded-full text-sm font-semibold transition-all border",
                activeTab === tab.id
                  ? "bg-[#0F5C3A] text-white border-[#0F5C3A] shadow-md"
                  : "bg-white text-gray-500 border-gray-200 hover:border-[#0F5C3A] hover:text-[#0F5C3A]"
              )}>{tab.label}</button>
          ))}
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 shadow-sm">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Doctor/Lab:</span>
              <select
                className="bg-transparent border-none outline-none text-xs font-bold text-[#0F5C3A] cursor-pointer focus:ring-0"
                value={selectedDoctor?.id || "all"}
                onChange={(e) => {
                  if (e.target.value === "all") setSelectedDoctor({ id: "all", name: "All Doctors" });
                  else setSelectedDoctor(doctors.find(d => d.id === e.target.value));
                }}
              >
                <option value="all">All Doctors</option>
                {(doctors || []).map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 shadow-sm">
              <Calendar className="w-4 h-4 text-[#0F5C3A]" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-medium"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-2">
          {activeTab === "live-queue" ? (
            <QueuePanel doctorId={selectedDoctor?.id} date={date} onStatusChange={() => fetchAppointments(true)} />
          ) : (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <input
                  type="text"
                  placeholder="Search by Name or Token ID"
                  className="apt-input py-2.5 text-sm"
                  style={{ paddingLeft: "2.5rem" }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* List header */}
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#0A3E2A]">
                  Today's Appointments{" "}
                  <span className="text-gray-400 text-sm font-normal">({displayDate})</span>
                  <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#0F5C3A] text-white text-xs font-bold">
                    {filtered.length}
                  </span>
                </h2>
                {refreshing && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Syncing...
                  </span>
                )}
              </div>

              {/* Table header */}
              {!loading && filtered.length > 0 && (
                <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <div className="col-span-1">Time</div>
                  <div className="col-span-1">Token</div>
                  <div className="col-span-3">Patient</div>
                  <div className="col-span-3">Doctor / Consultant</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>
              )}

              {loading ? (
                <div className="flex justify-center py-24">
                  <Loader2 className="w-8 h-8 text-[#0F5C3A] animate-spin" />
                </div>
              ) : paginated.length > 0 ? (
                <div className="space-y-2">
                  {paginated.map((a) => (
                    <div
                      key={a._id}
                      className="apt-card px-4 py-3.5 grid grid-cols-12 gap-4 items-center hover:border-[#0F5C3A]/30 hover:shadow-md transition-all group cursor-pointer"
                    >
                      {/* Time */}
                      <div className="col-span-1">
                        <div className="text-sm font-bold text-gray-800">{a.scheduledTime || "--:--"}</div>
                        <div className="text-[10px] text-gray-400 uppercase font-bold">
                          {a.type === "walk-in" ? "Walk-in" : "Sched."}
                        </div>
                      </div>

                      {/* Token */}
                      <div className="col-span-1">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#0F5C3A]/10 text-[#0F5C3A] text-xs font-black">
                          #{a.tokenNumber}
                        </span>
                      </div>

                      {/* Patient */}
                      <div className="col-span-3 flex items-center gap-3 min-w-0">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ backgroundColor: getInitialColor(a.patientName) }}
                        >
                          {getInitials(a.patientName)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-gray-800 text-sm truncate">{a.patientName}</div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase">{a.patientPhone || "—"}</div>
                        </div>
                      </div>

                      {/* Doctor */}
                      <div className="col-span-3 flex items-center gap-2 min-w-0">
                        {a.consultantType === "lab"
                          ? <FlaskConical className="w-4 h-4 text-purple-500 shrink-0" />
                          : <Stethoscope className="w-4 h-4 text-[#0F5C3A] shrink-0" />}
                        <span className="text-sm font-medium text-gray-700 truncate">
                          {a.doctorName || "Unassigned"}
                        </span>
                      </div>

                      {/* Type + Status */}
                      <div className="col-span-2 flex items-center gap-2 flex-wrap">
                        {a.consultantType === "lab" && (
                          <span className="apt-badge bg-purple-100 text-purple-700">Lab</span>
                        )}
                        {getStatusBadge(a.status)}
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        {(a.status === "waiting" || a.status === "scheduled") && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleStatusChangeAction(a._id, "start"); }}
                              className="p-2 bg-emerald-100 text-[#0F5C3A] rounded-lg hover:bg-[#0F5C3A] hover:text-white transition-all"
                              title="Call Patient"
                            >
                              <PlayCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleStatusChangeAction(a._id, "cancel"); }}
                              className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                              title="Cancel"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {a.status === "in-progress" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleStatusChangeAction(a._id, "complete"); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F5C3A] text-white rounded-lg hover:bg-[#0A3E2A] transition-all text-xs font-bold"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Complete
                          </button>
                        )}
                        {(a.status === "completed" || a.status === "cancelled") && (
                          <ChevronRight className="w-4 h-4 text-gray-300" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="apt-card p-20 text-center text-gray-400 border-dashed border-2">
                  <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-bold text-xs uppercase tracking-widest opacity-50">No appointments found</p>
                  <p className="text-xs mt-1 opacity-40">
                    {searchTerm ? "Try a different search term" : "Appointments added from 'Add Appointment' will appear here automatically"}
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                  <span>
                    Showing {paginated.length ? (currentPage - 1) * perPage + 1 : 0} to{" "}
                    {Math.min(currentPage * perPage, filtered.length)} of {filtered.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={cn("w-7 h-7 rounded text-xs font-bold", currentPage === p ? "bg-[#0F5C3A] text-white" : "hover:bg-gray-100")}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Admin Book Appointment Section */}
      {isAdmin && (
        <div className="w-[450px] shrink-0 hidden xl:block pb-10">
          <AddAppointment isEmbedded={true} />
        </div>
      )}
    </div>
  );
}
