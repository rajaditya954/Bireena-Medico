import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar, Search, Clock, User, Loader2,
  CheckCircle, XCircle, ChevronLeft, ChevronRight, ChevronDown,
  Stethoscope, FlaskConical, RefreshCw, Filter, X, Activity
} from "lucide-react";
import { cn } from "../../lib/utils";
import { format } from "date-fns";
import { api } from "../../lib/api";
import toast, { Toaster } from "react-hot-toast";

const TABS = [
  { id: "all", label: "All" },
  { id: "scheduled", label: "Scheduled / Waiting" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
  { id: "in-progress", label: "In Progress" },
];

export default function AppointmentHistory() {
  const [activeTab, setActiveTab] = useState("all");
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  // Load doctors list
  useEffect(() => {
    api.getDoctors()
      .then((res) => {
        setDoctors(res.data?.data || []);
      })
      .catch((err) => console.error("Failed to load doctors:", err));
  }, []);

  // Fetch appointments (with history: "true" to fetch all dates)
  const fetchAppointments = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      
      const res = await api.getAppointments({ history: "true" });
      setAppointments(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch appointment history:", err);
      toast.error("Failed to load appointment history");
      setAppointments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Helpers
  const getStatusBadge = (status) => {
    const map = {
      waiting: "apt-badge apt-badge-waiting",
      "in-progress": "apt-badge apt-badge-in-progress",
      completed: "apt-badge apt-badge-completed",
      cancelled: "apt-badge apt-badge-cancelled",
      scheduled: "apt-badge apt-badge-upcoming",
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

  // Filter logic
  const filtered = appointments.filter((a) => {
    // Tab filter
    let matchesTab = true;
    if (activeTab === "scheduled") matchesTab = a.status === "waiting" || a.status === "scheduled";
    else if (activeTab === "completed") matchesTab = a.status === "completed";
    else if (activeTab === "cancelled") matchesTab = a.status === "cancelled";
    else if (activeTab === "in-progress") matchesTab = a.status === "in-progress";

    // Doctor filter
    let matchesDoctor = true;
    if (selectedDoctorId !== "all") {
      matchesDoctor = a.doctorId === selectedDoctorId || a.doctorId?._id === selectedDoctorId;
    }

    // Date filter
    let matchesDate = true;
    if (filterDate) {
      matchesDate = a.date === filterDate;
    }

    // Search filter
    const matchesSearch = !searchTerm ||
      a.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.patientPhone?.includes(searchTerm) ||
      a.tokenNumber?.toString() === searchTerm ||
      a.appointmentId?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesDoctor && matchesDate && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDoctorId("all");
    setFilterDate("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#06402B] tracking-tight">Appointment History</h1>
          <p className="text-gray-500 text-sm mt-1">View and query all past and upcoming appointments.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchAppointments(true)}
            disabled={refreshing}
            className="flex items-center gap-2 h-11 px-4 text-sm font-bold text-[#0F5C3A] border border-[#0F5C3A]/30 rounded-xl hover:bg-[#0F5C3A] hover:text-white transition-all bg-white cursor-pointer active:scale-98"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { 
            label: "Total History", 
            value: appointments.length, 
            borderColor: "border-l-slate-400", 
            iconBg: "bg-slate-50", 
            iconColor: "text-slate-500", 
            icon: Calendar 
          },
          { 
            label: "Completed", 
            value: appointments.filter(a => a.status === "completed").length, 
            borderColor: "border-l-emerald-500", 
            iconBg: "bg-emerald-50", 
            iconColor: "text-emerald-600", 
            icon: CheckCircle 
          },
          { 
            label: "Cancelled", 
            value: appointments.filter(a => a.status === "cancelled").length, 
            borderColor: "border-l-rose-500", 
            iconBg: "bg-rose-50", 
            iconColor: "text-rose-600", 
            icon: XCircle 
          },
          { 
            label: "Waiting / Sched.", 
            value: appointments.filter(a => a.status === "waiting" || a.status === "scheduled").length, 
            borderColor: "border-l-amber-500", 
            iconBg: "bg-amber-50", 
            iconColor: "text-amber-600", 
            icon: Clock 
          },
          { 
            label: "In Progress", 
            value: appointments.filter(a => a.status === "in-progress").length, 
            borderColor: "border-l-blue-500", 
            iconBg: "bg-blue-50", 
            iconColor: "text-blue-600", 
            icon: Activity 
          },
        ].map(s => {
          const IconComponent = s.icon;
          return (
            <div 
              key={s.label} 
              className={cn(
                "bg-white border border-gray-100 border-l-4 rounded-2xl p-4 flex items-center gap-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300",
                s.borderColor
              )}
            >
              <div className={cn("p-2.5 rounded-xl shrink-0", s.iconBg)}>
                <IconComponent className={cn("w-5 h-5", s.iconColor, s.label === "In Progress" && "animate-pulse")} />
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-black text-gray-800 tracking-tight">{s.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 truncate mt-0.5">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Panel */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        
        {/* Filters and Search controls */}
        <div className="flex flex-col gap-4 border-b border-gray-100 pb-5">
          {/* Top Row: Tabs list and Clear filters button */}
          <div className="flex items-center justify-between gap-4">
            {/* Tabs list with horizontal scrolling on mobile/tablet */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar whitespace-nowrap pb-1 max-w-full -mx-4 px-4 sm:mx-0 sm:px-0">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-bold transition-all border shrink-0 cursor-pointer",
                    activeTab === tab.id
                      ? "bg-[#0F5C3A] text-white border-[#0F5C3A] shadow-sm"
                      : "bg-white text-gray-500 border-gray-200 hover:border-[#0F5C3A] hover:text-[#0F5C3A]"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            {/* Clear Button next to tabs */}
            {(searchTerm || selectedDoctorId !== "all" || filterDate) && (
              <button
                onClick={clearFilters}
                className="shrink-0 h-8 px-3 bg-red-50 text-red-600 rounded-full font-bold text-xs hover:bg-red-100 transition flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>

          {/* Bottom Row: Inputs inside a modern grid container */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search patient, phone, ID..."
                className="w-full h-11 pl-10 pr-4 bg-gray-50/50 border border-gray-100 rounded-xl text-xs outline-none focus:border-[#0F5C3A] focus:ring-4 focus:ring-[#0F5C3A]/8 font-medium transition-all"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>

            {/* Doctor Select with Chevron icon and absolute text prefix */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 uppercase tracking-wider font-bold">Doctor:</span>
              <select
                className="w-full h-11 pl-16 pr-10 bg-gray-50/50 border border-gray-100 rounded-xl text-xs font-bold text-[#0F5C3A] outline-none cursor-pointer focus:border-[#0F5C3A] focus:ring-4 focus:ring-[#0F5C3A]/8 transition-all appearance-none"
                value={selectedDoctorId}
                onChange={(e) => { setSelectedDoctorId(e.target.value); setCurrentPage(1); }}
              >
                <option value="all">All Doctors</option>
                {doctors.map(d => (
                  <option key={d.id || d._id} value={d.id || d._id}>
                    {d.name} ({d.specialization})
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {/* Date Picker Input */}
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0F5C3A]" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
                className="w-full h-11 pl-10 pr-4 bg-gray-50/50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 outline-none focus:border-[#0F5C3A] focus:ring-4 focus:ring-[#0F5C3A]/8 transition-all cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Content list */}
        <div>
          {/* Table headers (Desktop Only) */}
          {filtered.length > 0 && !loading && (
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
              <div className="col-span-2">Date / Time</div>
              <div className="col-span-1">Token</div>
              <div className="col-span-3">Patient</div>
              <div className="col-span-3">Doctor / Consultant</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-1 text-right">Status</div>
            </div>
          )}

          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 text-[#0F5C3A] animate-spin" />
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading history...</p>
            </div>
          ) : paginated.length > 0 ? (
            <>
              {/* Desktop View (Table style) */}
              <div className="hidden md:block space-y-2 mt-3">
                {paginated.map((a) => (
                  <div
                    key={a._id}
                    className="border border-gray-100 rounded-2xl px-4 py-3.5 grid grid-cols-12 gap-4 items-center hover:border-[#0F5C3A]/25 hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all duration-200 group bg-white"
                  >
                    {/* Date & Time */}
                    <div className="col-span-2">
                      <div className="text-sm font-bold text-gray-800">
                        {a.date ? format(new Date(a.date), "dd MMM yyyy") : "--"}
                      </div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-300" /> {a.scheduledTime || a.slot || "Walk-in"}
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
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
                        style={{ backgroundColor: getInitialColor(a.patientName) }}
                      >
                        {getInitials(a.patientName)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-gray-800 text-sm truncate">{a.patientName}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{a.patientPhone || "—"}</div>
                      </div>
                    </div>

                    {/* Doctor */}
                    <div className="col-span-3 flex items-center gap-2 min-w-0">
                      {a.consultantType === "lab"
                        ? <FlaskConical className="w-4 h-4 text-purple-500 shrink-0" />
                        : <Stethoscope className="w-4 h-4 text-[#0F5C3A] shrink-0" />}
                      <span className="text-sm font-semibold text-gray-700 truncate">
                        {a.doctorName || "Unassigned"}
                      </span>
                    </div>

                    {/* Type */}
                    <div className="col-span-2 text-sm text-gray-500 font-bold capitalize">
                      {a.type || a.appointmentType || "walk-in"}
                    </div>

                    {/* Status */}
                    <div className="col-span-1 text-right">
                      {getStatusBadge(a.status)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile View (Cards style) */}
              <div className="block md:hidden space-y-3 mt-3">
                {paginated.map((a) => (
                  <div
                    key={a._id}
                    className="border border-gray-100 rounded-2xl p-4 bg-white hover:border-[#0F5C3A]/20 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-3.5"
                  >
                    {/* Top section: Token & Status */}
                    <div className="flex items-center justify-between pb-3 border-b border-gray-50">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0F5C3A]/10 text-[#0F5C3A] text-xs font-black">
                        Token #{a.tokenNumber}
                      </span>
                      {getStatusBadge(a.status)}
                    </div>

                    {/* Middle section: Patient Info */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
                        style={{ backgroundColor: getInitialColor(a.patientName) }}
                      >
                        {getInitials(a.patientName)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-gray-800 text-sm truncate">{a.patientName}</div>
                        <div className="text-[11px] text-gray-400 font-bold uppercase mt-0.5">{a.patientPhone || "—"}</div>
                      </div>
                    </div>

                    {/* Bottom section: Details Grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                      <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Doctor / Consultant</div>
                        <div className="flex items-center gap-1.5 mt-1 font-semibold text-gray-700">
                          {a.consultantType === "lab"
                            ? <FlaskConical className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            : <Stethoscope className="w-3.5 h-3.5 text-[#0F5C3A] shrink-0" />}
                          <span className="truncate">{a.doctorName || "Unassigned"}</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Date & Time</div>
                        <div className="flex flex-col gap-0.5 mt-1 text-gray-700 font-semibold">
                          <div>{a.date ? format(new Date(a.date), "dd MMM yyyy") : "--"}</div>
                          <div className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-300" /> {a.scheduledTime || a.slot || "Walk-in"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Row: Type */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-gray-50 text-[11px]">
                      <span className="text-gray-400 font-bold uppercase tracking-wider">Type</span>
                      <span className="font-bold text-gray-600 capitalize bg-gray-50 px-2 py-0.5 rounded-md">
                        {a.type || a.appointmentType || "walk-in"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-20 text-center text-gray-400 border-dashed border-2 border-gray-100 rounded-3xl">
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-bold text-xs uppercase tracking-widest opacity-50">No matching appointments found</p>
              <p className="text-xs mt-1 opacity-40">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-50">
            <span>
              Showing {paginated.length ? (currentPage - 1) * perPage + 1 : 0} to{" "}
              {Math.min(currentPage * perPage, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-2 rounded-xl hover:bg-gray-50 border border-gray-100 disabled:opacity-30 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-2 text-gray-300">…</span>}
                    <button
                      onClick={() => setCurrentPage(p)}
                      className={cn(
                        "w-8 h-8 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                        currentPage === p
                          ? "bg-[#0F5C3A] text-white border-[#0F5C3A] shadow-sm"
                          : "bg-white border-gray-100 hover:bg-gray-50"
                      )}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-2 rounded-xl hover:bg-gray-50 border border-gray-100 disabled:opacity-30 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
