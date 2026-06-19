import { useState, useEffect, useContext } from "react";
import {
  Calendar,
  Users,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  User,
  BarChart3,
  Settings,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  FileText,
  RefreshCw,
  Stethoscope,
} from "lucide-react";
import { api } from "../../lib/api";
import { AuthContext } from "../../context/AuthContext";

// Status badge component mapping DB statuses to styled badges
const StatusBadge = ({ status }) => {
  const upper = (status || "").toUpperCase();
  const variants = {
    WAITING: "bg-amber-50 text-amber-700 border-amber-200",
    ARRIVED: "bg-blue-50 text-blue-700 border-blue-200",
    IN_PROGRESS: "bg-emerald-50 text-emerald-700 border-emerald-200",
    IN_CONSULTATION: "bg-emerald-50 text-emerald-700 border-emerald-200",
    COMPLETED: "bg-green-50 text-green-700 border-green-200",
    SCHEDULED: "bg-gray-50 text-gray-600 border-gray-200",
    CANCELLED: "bg-red-50 text-red-700 border-red-200",
    NO_SHOW: "bg-gray-100 text-gray-500 border-gray-300",
  };
  
  const labelMap = {
    WAITING: "Waiting",
    ARRIVED: "Arrived",
    IN_PROGRESS: "In Progress",
    IN_CONSULTATION: "In Consultation",
    COMPLETED: "Completed",
    SCHEDULED: "Scheduled",
    CANCELLED: "Cancelled",
    NO_SHOW: "No Show",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
        variants[upper] || "bg-gray-50 text-gray-600 border-gray-200"
      }`}
    >
      {labelMap[upper] || status}
    </span>
  );
};

// Stat card component for key metrics
const StatCard = ({ label, value, icon: Icon, delta, tone = "default" }) => {
  const toneColors = {
    default: "from-emerald-50 to-white border-emerald-100",
    info: "from-blue-50 to-white border-blue-100",
    warning: "from-amber-50 to-white border-amber-100",
    success: "from-emerald-50 to-white border-emerald-100",
  };
  const iconColors = {
    default: "bg-emerald-100 text-emerald-700",
    info: "bg-blue-100 text-blue-700",
    warning: "bg-amber-100 text-amber-700",
    success: "bg-emerald-100 text-emerald-700",
  };
  return (
    <div
      className={`bg-gradient-to-br ${toneColors[tone]} rounded-xl border p-5 shadow-sm transition-all hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p className="text-2xl font-bold text-[#0f281e] mt-1.5">{value}</p>
        </div>
        <div className={`rounded-lg p-2.5 ${iconColors[tone]}`}>
          <Icon className="size-4" />
        </div>
      </div>
      {delta && (
        <div className="flex items-center gap-1.5 mt-3 text-xs font-medium">
          <span
            className={
              delta.direction === "up" ? "text-emerald-600" : "text-amber-600"
            }
          >
            {delta.direction === "up" ? "↑" : "↓"} {delta.value}
          </span>
          <span className="text-slate-400">from yesterday</span>
        </div>
      )}
    </div>
  );
};

// Calculate patient age from date of birth
const calculateAge = (dobString) => {
  if (!dobString) return "N/A";
  const dob = new Date(dobString);
  const diffMs = Date.now() - dob.getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

export default function DoctorDashboard() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin" || user?.role === "ADMIN";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Date selector state
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  // Admin select doctor state
  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("all");

  // Load all doctors if the user is an administrator
  useEffect(() => {
    if (isAdmin) {
      api.getDoctors()
        .then((res) => {
          setDoctorsList(res.data.data || []);
        })
        .catch((err) => {
          console.error("Failed to load doctors list for dropdown:", err);
        });
    }
  }, [isAdmin]);

  // Fetch dashboard data on load and when dependency changes
  useEffect(() => {
    let active = true;
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");
      try {
        const params = { date: selectedDate };
        if (isAdmin) {
          params.doctorId = selectedDoctorId;
        }
        const res = await api.getDoctorDashboard(params);
        if (active) {
          setData(res.data.data);
        }
      } catch (err) {
        if (active) {
          setError(
            err.message || "Failed to load dashboard metrics. Ensure you are logged in as a Doctor or Admin."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();
    return () => {
      active = false;
    };
  }, [selectedDate, selectedDoctorId, isAdmin]);

  // Extract variables
  const doctor = data?.doctor || {};
  const stats = data?.stats || {
    totalAppointments: 0,
    patientsSeen: 0,
    avgConsultationTime: "15m",
    todayRevenue: 0,
    remainingPatients: 0,
    cancelled: 0,
    noShow: 0,
  };
  const appointmentsList = data?.appointments || [];

  // Filter appointments by search query
  const filteredAppointments = appointmentsList.filter((apt) => {
    const patientName = apt.patientId?.fullName || apt.patientName || "";
    return patientName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Helper to format date in header
  const formatReadableDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F9F6] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-semibold">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F2F9F6] p-8 flex items-center justify-center">
        <div className="bg-white rounded-3xl border border-red-100 p-8 shadow-sm max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Dashboard Error</h2>
          <p className="text-sm text-slate-500">{error}</p>
          <div className="pt-2">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F9F6] font-sans antialiased">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0f281e] tracking-tight">
              {isAdmin ? "Clinic Operations Control" : "Doctor's Dashboard"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {isAdmin ? (
                <span>Consolidated views and scheduling audits for hospital administrators.</span>
              ) : (
                <span>
                  Hello {doctor.name || "Doctor"}, you have{" "}
                  <span className="font-semibold text-emerald-700">
                    {stats.remainingPatients} patients
                  </span>{" "}
                  remaining today.
                </span>
              )}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Admin Selector Dropdown */}
            {isAdmin && (
              <div className="relative inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all">
                <Stethoscope className="size-4 text-emerald-600 animate-pulse" />
                <select
                  className="bg-transparent border-none outline-none font-semibold text-slate-700 cursor-pointer focus:ring-0 text-sm py-0.5"
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                >
                  <option value="all">All Doctors (Summary)</option>
                  {doctorsList.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.name} ({doc.specialization})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              <Users className="size-4 text-emerald-600" />
              Queue
              <span className="ml-0.5 rounded-full bg-emerald-600 px-1.5 py-0.5 text-xs text-white">
                {stats.remainingPatients}
              </span>
            </div>
            
            {/* Interactive Date Selector */}
            <div className="relative inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all">
              <Calendar className="size-4 text-emerald-600" />
              <input
                type="date"
                className="bg-transparent border-none outline-none font-semibold text-slate-700 cursor-pointer focus:ring-0 text-sm"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            label={isAdmin ? "Total Clinic Appointments" : "Total Appointments"}
            value={stats.totalAppointments}
            icon={Calendar}
            tone="default"
          />
          <StatCard
            label="Patients Seen"
            value={stats.patientsSeen}
            icon={Users}
            tone="info"
          />
          <StatCard
            label="Avg. Consultation Time"
            value={stats.avgConsultationTime || "18m"}
            icon={Clock}
            tone="warning"
          />
          <StatCard
            label={isAdmin ? "Total Clinic Revenue" : "Today's Revenue"}
            value={`₹${stats.todayRevenue.toLocaleString("en-IN")}`}
            icon={DollarSign}
            tone="success"
          />
        </div>

        {/* Main Two-Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
          
          {/* Left Column: Schedule Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            
            {/* Table Header with Filters */}
            <div className="border-b border-slate-100 bg-white px-5 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-[#0f281e]">
                    {isAdmin ? "Combined Schedule Logs" : "Today's Schedule"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatReadableDate(selectedDate)}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search patient..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-9 w-48 rounded-lg border border-slate-200 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-300"
                    />
                  </div>
                  <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50">
                    <Filter className="size-3.5" />
                    Filter
                  </button>
                </div>
              </div>
            </div>

            {/* Schedule Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3">Time / Slot</th>
                    <th className="px-5 py-3">Patient</th>
                    <th className="px-5 py-3">Reason</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="size-8 text-slate-300" />
                          <p className="text-sm text-slate-500">
                            No appointments listed for this selection or date.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((apt) => {
                      const patient = apt.patientId || {};
                      const patientName = patient.fullName || apt.patientName || "Unknown Patient";
                      const gender = patient.gender || "M";
                      const initials = patientName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase();
                      const age = calculateAge(patient.dob);
                      
                      // Deterministic color assignment for initials avatar
                      const colors = [
                        { bg: "#dcfce7", color: "#16a34a" },
                        { bg: "#dbeafe", color: "#2563eb" },
                        { bg: "#fce7f3", color: "#db2777" },
                        { bg: "#ffedd5", color: "#ea580c" },
                        { bg: "#ede9fe", color: "#7c3aed" },
                      ];
                      const colorIndex = patientName.charCodeAt(0) % colors.length;
                      const avatarBg = colors[colorIndex].bg;
                      const avatarColor = colors[colorIndex].color;

                      return (
                        <tr
                          key={apt._id}
                          className="transition-colors hover:bg-slate-50/80"
                        >
                          <td className="whitespace-nowrap px-5 py-4">
                            <div className="text-sm font-semibold text-slate-700">
                              {apt.slot || "Walk-in"}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold"
                                style={{
                                  background: avatarBg,
                                  color: avatarColor,
                                }}
                              >
                                {initials}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-[#0f281e]">
                                    {patientName}
                                  </span>
                                  <span
                                    className={
                                      gender === "Female" || gender === "F"
                                        ? "text-pink-500"
                                        : "text-blue-500"
                                    }
                                  >
                                    {gender === "Female" || gender === "F" ? "♀" : "♂"}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-500 flex flex-col items-start gap-0.5">
                                  <span>{age} Y, {gender}</span>
                                  {/* Show doctor sub-tag for admin summary views */}
                                  {isAdmin && selectedDoctorId === "all" && (
                                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full mt-0.5">
                                      Dr. {apt.doctorId?.name || apt.doctorName || "General"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                            {apt.reason || "General Examination"}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4">
                            <StatusBadge status={apt.status} />
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-right">
                            <button
                              className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
                                ["WAITING", "ARRIVED", "IN_CONSULTATION", "IN_PROGRESS"].includes(
                                  (apt.status || "").toUpperCase()
                                )
                                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              {["WAITING", "ARRIVED", "IN_CONSULTATION", "IN_PROGRESS"].includes(
                                (apt.status || "").toUpperCase()
                              )
                                ? "Open"
                                : "View"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="border-t border-slate-100 bg-white px-5 py-3 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing {filteredAppointments.length} of {appointmentsList.length}{" "}
                appointments
              </span>
            </div>
          </div>

          {/* Right Column: Doctor Profile & Summary */}
          <div className="space-y-5">
            {/* Doctor Profile Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 text-5xl shadow-sm">
                  {isAdmin && selectedDoctorId === "all" ? "🏥" : "👨‍⚕️"}
                </div>
                <h3 className="text-xl font-semibold text-[#0f281e]">
                  {doctor.name || "Doctor Profile"}
                </h3>
                <span className="mt-1.5 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                  {doctor.specialization || "General Medicine"}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Qualification
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {doctor.qualification || "MBBS, MD"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Experience
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {doctor.experience ? `${doctor.experience} Years` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Reg. No.
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {doctor.registrationNumber || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Room No.
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {doctor.roomNumber || "—"}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2">
                <button className="flex flex-col items-center gap-1.5 rounded-lg bg-slate-50 py-2.5 transition-all hover:bg-emerald-50">
                  <div className="rounded-full bg-white p-2 shadow-sm">
                    <User className="size-4 text-slate-600" />
                  </div>
                  <span className="text-xs font-medium text-slate-600">
                    Profile
                  </span>
                </button>
                <button className="flex flex-col items-center gap-1.5 rounded-lg bg-slate-50 py-2.5 transition-all hover:bg-emerald-50">
                  <div className="rounded-full bg-white p-2 shadow-sm">
                    <BarChart3 className="size-4 text-slate-600" />
                  </div>
                  <span className="text-xs font-medium text-slate-600">
                    Stats
                  </span>
                </button>
                <button className="flex flex-col items-center gap-1.5 rounded-lg bg-slate-50 py-2.5 transition-all hover:bg-emerald-50">
                  <div className="rounded-full bg-white p-2 shadow-sm">
                    <Settings className="size-4 text-slate-600" />
                  </div>
                  <span className="text-xs font-medium text-slate-600">
                    Settings
                  </span>
                </button>
              </div>
            </div>

            {/* Today's Summary Card */}
            <div className="rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-900 p-5 text-white shadow-sm">
              <h4 className="text-sm font-semibold opacity-90">
                Today's Summary
              </h4>
              <div className="mt-3 space-y-2.5">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-sm opacity-80">Completed</span>
                  <span className="text-lg font-bold">{stats.patientsSeen}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-sm opacity-80">Remaining</span>
                  <span className="text-lg font-bold">{stats.remainingPatients}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-sm opacity-80">Cancelled</span>
                  <span className="text-lg font-bold">{stats.cancelled}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm opacity-80">No-Show</span>
                  <span className="text-lg font-bold">{stats.noShow}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap');
        
        * {
          font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        h1, h2, h3, h4, .heading {
          letter-spacing: -0.01em;
        }
        
        .tabular-nums {
          font-feature-settings: 'tnum';
          font-variant-numeric: tabular-nums;
        }
      `}} />
    </div>
  );
}