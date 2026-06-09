import { useState } from "react";
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
} from "lucide-react";

// ============================================================
// GLOBAL TEXT FORMAT - Consistent typography system
// ============================================================

// Status badge component matching the Lab Reports pattern
const StatusBadge = ({ status }) => {
  const variants = {
    WAITING: "bg-amber-50 text-amber-700 border-amber-200",
    ARRIVED: "bg-blue-50 text-blue-700 border-blue-200",
    "IN CONSULTATION": "bg-emerald-50 text-emerald-700 border-emerald-200",
    UPCOMING: "bg-gray-50 text-gray-600 border-gray-200",
  };
  const labelMap = {
    WAITING: "Waiting",
    ARRIVED: "Arrived",
    "IN CONSULTATION": "In Consultation",
    UPCOMING: "Upcoming",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${variants[status] || variants.UPCOMING}`}
    >
      {labelMap[status] || status}
    </span>
  );
};

// Stat card component consistent with Lab Reports design
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
              delta.direction === "up"
                ? "text-emerald-600"
                : "text-amber-600"
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

// Patient data
const STATS = [
  {
    label: "Total Appointments",
    value: "28",
    icon: Calendar,
    delta: { value: "12%", direction: "up" },
    tone: "default",
  },
  {
    label: "Patients Seen",
    value: "12",
    icon: Users,
    delta: { value: "8%", direction: "up" },
    tone: "info",
  },
  {
    label: "Avg. Consultation Time",
    value: "18m",
    icon: Clock,
    delta: { value: "2m", direction: "down" },
    tone: "warning",
  },
  {
    label: "Today's Revenue",
    value: "₹18,450",
    icon: DollarSign,
    delta: { value: "15%", direction: "up" },
    tone: "success",
  },
];

const PATIENTS = [
  {
    time: "09:00",
    period: "AM",
    initials: "AC",
    name: "Alice Cooper",
    gender: "F",
    age: 34,
    reason: "General Checkup",
    status: "WAITING",
    avatarBg: "#dcfce7",
    avatarColor: "#16a34a",
  },
  {
    time: "09:30",
    period: "AM",
    initials: "JD",
    name: "John Doe",
    gender: "M",
    age: 28,
    reason: "Fever & Cold",
    status: "ARRIVED",
    avatarBg: "#dbeafe",
    avatarColor: "#2563eb",
  },
  {
    time: "10:00",
    period: "AM",
    initials: "SM",
    name: "Sarah Miller",
    gender: "F",
    age: 32,
    reason: "Headache",
    status: "IN CONSULTATION",
    avatarBg: "#fce7f3",
    avatarColor: "#db2777",
  },
  {
    time: "10:30",
    period: "AM",
    initials: "RB",
    name: "Robert Brown",
    gender: "M",
    age: 45,
    reason: "Diabetes Follow-up",
    status: "UPCOMING",
    avatarBg: "#ffedd5",
    avatarColor: "#ea580c",
  },
  {
    time: "11:00",
    period: "AM",
    initials: "ED",
    name: "Emily Davis",
    gender: "F",
    age: 29,
    reason: "Skin Allergy",
    status: "UPCOMING",
    avatarBg: "#ede9fe",
    avatarColor: "#7c3aed",
  },
  {
    time: "11:30",
    period: "AM",
    initials: "MJ",
    name: "Michael Johnson",
    gender: "M",
    age: 50,
    reason: "Blood Pressure",
    status: "UPCOMING",
    avatarBg: "#d1fae5",
    avatarColor: "#059669",
  },
  {
    time: "12:00",
    period: "PM",
    initials: "LW",
    name: "Lisa White",
    gender: "F",
    age: 38,
    reason: "Thyroid Checkup",
    status: "UPCOMING",
    avatarBg: "#fef9c3",
    avatarColor: "#ca8a04",
  },
  {
    time: "12:30",
    period: "PM",
    initials: "DW",
    name: "David Wilson",
    gender: "M",
    age: 41,
    reason: "Chest Pain",
    status: "UPCOMING",
    avatarBg: "#e0e7ff",
    avatarColor: "#4338ca",
  },
];

export default function DoctorDashboard() {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPatients = PATIENTS.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F2F9F6] font-sans antialiased">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0f281e] tracking-tight">
              Doctor's Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Hello Dr. Alexander Smith, you have{" "}
              <span className="font-semibold text-emerald-700">8 patients</span>{" "}
              remaining today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50">
              <Users className="size-4" />
              Queue
              <span className="ml-0.5 rounded-full bg-emerald-600 px-1.5 py-0.5 text-xs text-white">
                3
              </span>
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50">
              <Calendar className="size-4" />
              Tuesday, 12 May 2025
              <ChevronDown className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {STATS.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
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
                    Today's Schedule
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tuesday, 12 May 2025
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
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 transition-all hover:bg-slate-50"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3">Time</th>
                    <th className="px-5 py-3">Patient</th>
                    <th className="px-5 py-3">Reason</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="size-8 text-slate-300" />
                          <p className="text-sm text-slate-500">
                            No patients match your search
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((p) => (
                      <tr
                        key={p.name}
                        className="transition-colors hover:bg-slate-50/80"
                      >
                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="text-sm font-semibold text-slate-700">
                            {p.time}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {p.period}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold"
                              style={{
                                background: p.avatarBg,
                                color: p.avatarColor,
                              }}
                            >
                              {p.initials}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-[#0f281e]">
                                  {p.name}
                                </span>
                                <span
                                  className={
                                    p.gender === "F"
                                      ? "text-pink-500"
                                      : "text-blue-500"
                                  }
                                >
                                  {p.gender === "F" ? "♀" : "♂"}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500">
                                {p.age} Y, {p.gender === "F" ? "Female" : "Male"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                          {p.reason}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          <button
                            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
                              ["WAITING", "ARRIVED", "IN CONSULTATION"].includes(
                                p.status
                              )
                                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {["WAITING", "ARRIVED", "IN CONSULTATION"].includes(
                              p.status
                            )
                              ? "Open"
                              : "View"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="border-t border-slate-100 bg-white px-5 py-3 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing {filteredPatients.length} of {PATIENTS.length}{" "}
                appointments
              </span>
              <button className="font-semibold text-emerald-700 transition-colors hover:text-emerald-800">
                View Full Schedule →
              </button>
            </div>
          </div>

          {/* Right Column: Doctor Profile & Summary */}
          <div className="space-y-5">
            {/* Doctor Profile Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 text-5xl shadow-sm">
                  👨‍⚕️
                </div>
                <h3 className="text-xl font-semibold text-[#0f281e]">
                  Dr. Alexander Smith
                </h3>
                <span className="mt-1.5 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                  General Practitioner
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Qualification
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    MBBS, MD
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Experience
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    12 Years
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Reg. No.
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    GMC-12345
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Department
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    General Medicine
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
                  <span className="text-lg font-bold">12</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-sm opacity-80">Remaining</span>
                  <span className="text-lg font-bold">8</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-sm opacity-80">Cancelled</span>
                  <span className="text-lg font-bold">2</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm opacity-80">No-Show</span>
                  <span className="text-lg font-bold">1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
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
      `}</style>
    </div>
  );
}