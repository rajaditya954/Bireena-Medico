import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar, Search, Clock, User, Loader2,
  CheckCircle, XCircle, ChevronLeft, ChevronRight,
  Stethoscope, FlaskConical, RefreshCw, Filter, X
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
            className="flex items-center gap-2 h-11 px-4 text-sm font-bold text-[#0F5C3A] border border-[#0F5C3A]/30 rounded-xl hover:bg-[#0F5C3A] hover:text-white transition-all bg-white"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total History", value: appointments.length, color: "bg-gray-50 text-gray-700 border-gray-100" },
          { label: "Completed", value: appointments.filter(a => a.status === "completed").length, color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
          { label: "Cancelled", value: appointments.filter(a => a.status === "cancelled").length, color: "bg-red-50 text-red-600 border-red-100" },
          { label: "Waiting / Sched.", value: appointments.filter(a => a.status === "waiting" || a.status === "scheduled").length, color: "bg-amber-50 text-amber-700 border-amber-100" },
          { label: "In Progress", value: appointments.filter(a => a.status === "in-progress").length, color: "bg-blue-50 text-blue-700 border-blue-100" },
        ].map(s => (
          <div key={s.label} className={cn("bg-white border rounded-2xl p-4 text-center shadow-sm", s.color)}>
            <div className="text-2xl font-black">{s.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider opacity-70 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Main Panel */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between border-b border-gray-50 pb-5">
          {/* Tab buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold transition-all border",
                  activeTab === tab.id
                    ? "bg-[#0F5C3A] text-white border-[#0F5C3A] shadow-sm"
                    : "bg-white text-gray-500 border-gray-100 hover:border-[#0F5C3A] hover:text-[#0F5C3A]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Actionable inputs */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-initial min-w-[200px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search patient, phone, ID..."
                className="w-full h-11 pl-10 pr-4 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0F5C3A]/15 font-medium transition-all"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>

            {/* Doctor Select */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 h-11 text-xs text-gray-600 font-bold border-none">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">Doctor:</span>
              <select
                className="bg-transparent border-none outline-none text-xs font-bold text-[#0F5C3A] cursor-pointer focus:ring-0"
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
            </div>

            {/* Date Picker */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 h-11 border-none">
              <Calendar className="w-4 h-4 text-[#0F5C3A]" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
                className="bg-transparent border-none outline-none text-xs font-bold text-gray-600 focus:ring-0"
              />
            </div>

            {/* Clear Button */}
            {(searchTerm || selectedDoctorId !== "all" || filterDate) && (
              <button
                onClick={clearFilters}
                className="h-11 px-4 bg-red-50 text-red-600 rounded-xl font-bold text-xs hover:bg-red-100 transition flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Content list */}
        <div>
          {/* Table headers (Desktop) */}
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
            <div className="space-y-2 mt-3">
              {paginated.map((a) => (
                <div
                  key={a._id}
                  className="border border-gray-100 rounded-2xl px-4 py-3.5 grid grid-cols-12 gap-4 items-center hover:border-[#0F5C3A]/25 hover:shadow-sm transition-all group"
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
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {a.doctorName || "Unassigned"}
                    </span>
                  </div>

                  {/* Type */}
                  <div className="col-span-2 text-sm text-gray-500 font-semibold capitalize">
                    {a.type || a.appointmentType || "walk-in"}
                  </div>

                  {/* Status */}
                  <div className="col-span-1 text-right">
                    {getStatusBadge(a.status)}
                  </div>
                </div>
              ))}
            </div>
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
                className="p-2 rounded-xl hover:bg-gray-50 border border-gray-100 disabled:opacity-30 transition-all"
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
                        "w-8 h-8 rounded-xl text-xs font-bold transition-all border",
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
                className="p-2 rounded-xl hover:bg-gray-50 border border-gray-100 disabled:opacity-30 transition-all"
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
