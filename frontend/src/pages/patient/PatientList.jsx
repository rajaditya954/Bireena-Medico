import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Eye, 
  ChevronLeft,
  ChevronRight,
  User,
  Loader2,
  Calendar,
  Phone,
  Users,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

// ----------------------------------------------
// Mock data matching the image design
// ----------------------------------------------
const initialPatients = [
  {
    id: "PAT-0001",
    name: "Alice Cooper",
    age: 34,
    gender: "Female",
    phone: "9876543210",
    email: "alice.cooper@email.com",
    lastAppointment: "12 May 2025, 09:00 AM",
    nextAppointment: "19 May 2025, 09:30 AM",
    status: "Waiting",
  },
  {
    id: "PAT-0002",
    name: "John Doe",
    age: 28,
    gender: "Male",
    phone: "9123456780",
    email: "john.doe@email.com",
    lastAppointment: "11 May 2025, 10:30 AM",
    nextAppointment: "18 May 2025, 11:00 AM",
    status: "Arrived",
  },
  {
    id: "PAT-0003",
    name: "Sarah Miller",
    age: 32,
    gender: "Female",
    phone: "9988776655",
    email: "sarah.miller@email.com",
    lastAppointment: "12 May 2025, 10:00 AM",
    nextAppointment: "20 May 2025, 10:00 AM",
    status: "In Consultation",
  },
  {
    id: "PAT-0004",
    name: "Robert Brown",
    age: 45,
    gender: "Male",
    phone: "8899776655",
    email: "robert.brown@email.com",
    lastAppointment: "10 May 2025, 04:00 PM",
    nextAppointment: "17 May 2025, 04:30 PM",
    status: "Completed",
  },
  {
    id: "PAT-0005",
    name: "Emily Davis",
    age: 29,
    gender: "Female",
    phone: "9001122334",
    email: "emily.davis@email.com",
    lastAppointment: "09 May 2025, 02:30 PM",
    nextAppointment: "16 May 2025, 02:30 PM",
    status: "Completed",
  },
  {
    id: "PAT-0006",
    name: "Michael Johnson",
    age: 50,
    gender: "Male",
    phone: "9003344556",
    email: "michael.j@email.com",
    lastAppointment: "08 May 2025, 11:00 AM",
    nextAppointment: "15 May 2025, 11:30 AM",
    status: "Upcoming",
  },
  {
    id: "PAT-0007",
    name: "Lisa White",
    age: 38,
    gender: "Female",
    phone: "9122334455",
    email: "lisa.white@email.com",
    lastAppointment: "07 May 2025, 03:15 PM",
    nextAppointment: "14 May 2025, 03:15 PM",
    status: "Upcoming",
  },
  {
    id: "PAT-0008",
    name: "David Wilson",
    age: 41,
    gender: "Male",
    phone: "9012345678",
    email: "david.w@email.com",
    lastAppointment: "06 May 2025, 09:45 AM",
    nextAppointment: "13 May 2025, 09:45 AM",
    status: "No Show",
  },
];

const statusStyles = {
  Waiting: "bg-amber-50 text-amber-700 border-amber-200",
  Arrived: "bg-blue-50 text-blue-700 border-blue-200",
  "In Consultation": "bg-emerald-50 text-emerald-700 border-emerald-200",
  Completed: "bg-green-50 text-green-700 border-green-200",
  Upcoming: "bg-gray-50 text-gray-600 border-gray-200",
  "No Show": "bg-red-50 text-red-600 border-red-200",
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyles[status]}`}>
      {status}
    </span>
  );
}

// Helper to parse "DD MMM YYYY, HH:MM AM/PM" into Date object
function parseAppointmentDate(dateStr) {
  if (!dateStr) return null;
  // Format: "19 May 2025, 09:30 AM"
  const [datePart, timePart] = dateStr.split(', ');
  const [day, month, year] = datePart.split(' ');
  const monthMap = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  const monthIndex = monthMap[month];
  if (monthIndex === undefined) return null;
  let hours = parseInt(timePart.split(':')[0]);
  const minutes = parseInt(timePart.split(':')[1].split(' ')[0]);
  const ampm = timePart.split(' ')[1];
  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return new Date(year, monthIndex, parseInt(day), hours, minutes);
}

// ----------------------------------------------
// Patient List Component (Doctor View: Read-Only)
// ----------------------------------------------
export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setPatients(initialPatients);
      setLoading(false);
    }, 500);
  }, []);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortBy("name");
    setFromDate("");
    setToDate("");
  };

  // Filter and sort patients
  const filteredPatients = patients
    .filter((p) => {
      // Search filter
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone.includes(searchTerm);
      
      // Status filter
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      
      // Date range filter (based on next appointment date)
      let matchesDate = true;
      if (fromDate || toDate) {
        const appointmentDate = parseAppointmentDate(p.nextAppointment);
        if (appointmentDate) {
          if (fromDate) {
            const from = new Date(fromDate);
            from.setHours(0, 0, 0, 0);
            if (appointmentDate < from) matchesDate = false;
          }
          if (toDate && matchesDate) {
            const to = new Date(toDate);
            to.setHours(23, 59, 59, 999);
            if (appointmentDate > to) matchesDate = false;
          }
        } else {
          matchesDate = false;
        }
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "recent") {
        const dateA = parseAppointmentDate(a.nextAppointment);
        const dateB = parseAppointmentDate(b.nextAppointment);
        return (dateA?.getTime() || 0) - (dateB?.getTime() || 0);
      } else if (sortBy === "oldest") {
        const dateA = parseAppointmentDate(a.nextAppointment);
        const dateB = parseAppointmentDate(b.nextAppointment);
        return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
      }
      return 0;
    });

  const uniqueStatuses = ["all", ...new Set(patients.map((p) => p.status))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#06402B] tracking-tight">Patients</h1>
        <p className="text-gray-500">Manage and monitor all registered patients.</p>
      </div>

      {/* Main Card */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading records...</p>
          </div>
        ) : (
          <>
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search by Name, Patient ID or Phone..."
                  className="w-full h-12 pl-12 pr-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "h-12 px-4 rounded-2xl transition-all flex items-center gap-2 font-semibold",
                    showFilters
                      ? "bg-[#06402B] text-white shadow-lg shadow-emerald-600/20"
                      : "bg-gray-50 text-gray-600 hover:bg-emerald-50"
                  )}
                >
                  <Filter className={cn("w-4 h-4 transition-transform", showFilters && "rotate-180")} />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </button>
                {(statusFilter !== "all" || fromDate || toDate || searchTerm || sortBy !== "name") && (
                  <button
                    onClick={clearFilters}
                    className="h-12 px-4 rounded-2xl bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all flex items-center gap-2 font-semibold"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Expandable Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 pb-2 border-t border-gray-100 mt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Status Filter */}
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                        <select
                          className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500/20 outline-none mt-1"
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          {uniqueStatuses.map((s) => (
                            <option key={s} value={s}>
                              {s === "all" ? "All Statuses" : s}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Sort By */}
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sort By</label>
                        <select
                          className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500/20 outline-none mt-1"
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                        >
                          <option value="name">Name (A-Z)</option>
                          <option value="recent">Next Appointment (Soonest)</option>
                          <option value="oldest">Next Appointment (Latest)</option>
                        </select>
                      </div>

                      {/* From Date */}
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">From Date</label>
                        <input
                          type="date"
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                          className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500/20 outline-none mt-1"
                        />
                      </div>

                      {/* To Date */}
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">To Date</label>
                        <input
                          type="date"
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                          className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500/20 outline-none mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Patients Table - Read Only */}
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Patient ID</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Patient Name</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Age/Gender</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Phone</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Last Appointment</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Next Appointment</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-gray-500">{patient.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                            {patient.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 uppercase tracking-tight">{patient.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono">{patient.email || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-500">
                        {patient.age}Y · {patient.gender}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {patient.phone}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {patient.lastAppointment}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {patient.nextAppointment}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={patient.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPatients.length === 0 && (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-inner">
                    <Users className="w-10 h-10 text-gray-200" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">No patients found</h3>
                  <p className="text-sm text-gray-400">Try adjusting your search or filters.</p>
                </div>
              )}
            </div>

            {/* Pagination (static placeholder) */}
            <div className="flex items-center justify-between p-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Showing {filteredPatients.length} of {patients.length} patients
              </p>
              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-xl border border-gray-100 text-gray-400 hover:text-emerald-600 flex items-center justify-center">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-10 h-10 rounded-xl border border-emerald-200 text-emerald-600 shadow-sm shadow-emerald-600/5 flex items-center justify-center font-bold">
                  1
                </button>
                <button className="w-10 h-10 rounded-xl border border-gray-100 text-gray-400 hover:text-emerald-600 flex items-center justify-center">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}