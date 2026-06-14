import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Eye, 
  Edit,
  ChevronLeft,
  ChevronRight,
  User,
  Loader2,
  Calendar,
  Phone,
  Users,
  X,
  Plus,
  Heart,
  FileText,
  ShieldAlert,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";
import { api } from "../../lib/api";
import toast, { Toaster } from "react-hot-toast";
import { format } from "date-fns";

const statusStyles = {
  "New Patient": "bg-blue-50 text-blue-700 border-blue-200",
  Completed: "bg-green-50 text-green-700 border-green-200",
  Upcoming: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function StatusBadge({ status }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border",
      statusStyles[status] || "bg-gray-50 text-gray-600 border-gray-200"
    )}>
      {status}
    </span>
  );
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const MARITAL_STATUSES = ["Single", "Married", "Divorced", "Widowed"];
const GENDERS = ["Male", "Female", "Other"];

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [showFilters, setShowFilters] = useState(false);

  // Edit Modal state
  const [editingPatient, setEditingPatient] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    phone: "",
    dob: "",
    age: "",
    gender: "",
    bloodGroup: "",
    maritalStatus: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    referredBy: "",
    allergies: "",
    chronicDiseases: "",
    emergencyContactName: "",
    emergencyContactRelation: "",
    emergencyContactPhone: "",
    insuranceProvider: "",
    insurancePolicyNumber: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resPatients, resAppointments] = await Promise.all([
        api.getPatients(),
        api.getAppointments({ history: "true" })
      ]);

      const patientData = resPatients.data?.data || [];
      const appointmentData = resAppointments.data?.data || [];
      
      setAppointments(appointmentData);
      setPatients(patientData);
    } catch (err) {
      console.error("Failed to load patient records:", err);
      toast.error("Failed to fetch patient records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditClick = (patient) => {
    setEditingPatient(patient);
    setEditForm({
      fullName: patient.fullName || patient.name || "",
      phone: patient.phone || "",
      dob: patient.dob ? patient.dob.split("T")[0] : "",
      age: patient.age || "",
      gender: patient.gender || "",
      bloodGroup: patient.bloodGroup || "",
      maritalStatus: patient.maritalStatus || "",
      email: patient.email || "",
      address: patient.address || "",
      city: patient.city || "",
      state: patient.state || "",
      pincode: patient.pincode || "",
      referredBy: patient.referredBy || "",
      allergies: Array.isArray(patient.allergies) ? patient.allergies.join(", ") : "",
      chronicDiseases: Array.isArray(patient.chronicDiseases) ? patient.chronicDiseases.join(", ") : "",
      emergencyContactName: patient.emergencyContact?.name || "",
      emergencyContactRelation: patient.emergencyContact?.relation || "",
      emergencyContactPhone: patient.emergencyContact?.phone || "",
      insuranceProvider: patient.insuranceInfo?.provider || "",
      insurancePolicyNumber: patient.insuranceInfo?.policyNumber || "",
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.fullName || !editForm.phone) {
      return toast.error("Full Name and Phone are required");
    }

    try {
      setSaving(true);
      const payload = {
        fullName: editForm.fullName,
        phone: editForm.phone,
        dob: editForm.dob ? new Date(editForm.dob) : undefined,
        age: editForm.age ? Number(editForm.age) : undefined,
        gender: editForm.gender || undefined,
        bloodGroup: editForm.bloodGroup || undefined,
        maritalStatus: editForm.maritalStatus || undefined,
        email: editForm.email || undefined,
        address: editForm.address || undefined,
        city: editForm.city || undefined,
        state: editForm.state || undefined,
        pincode: editForm.pincode || undefined,
        referredBy: editForm.referredBy || undefined,
        allergies: editForm.allergies ? editForm.allergies.split(",").map(s => s.trim()).filter(Boolean) : [],
        chronicDiseases: editForm.chronicDiseases ? editForm.chronicDiseases.split(",").map(s => s.trim()).filter(Boolean) : [],
        emergencyContact: {
          name: editForm.emergencyContactName,
          relation: editForm.emergencyContactRelation,
          phone: editForm.emergencyContactPhone,
        },
        insuranceInfo: {
          provider: editForm.insuranceProvider,
          policyNumber: editForm.insurancePolicyNumber,
        }
      };

      await api.updatePatient(editingPatient._id || editingPatient.id, payload);
      toast.success("Patient details updated successfully ✅");
      setEditingPatient(null);
      fetchData();
    } catch (err) {
      console.error("Failed to update patient:", err);
      toast.error(err.response?.data?.message || "Failed to update patient details");
    } finally {
      setSaving(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortBy("name");
  };

  // Dynamically calculate last and next appointments based on real database records
  const processedPatients = (() => {
    const now = new Date();
    const items = patients.map(p => {
      // Find appointments matching this patient
      const pApts = appointments.filter(a => 
        a.patientId === p._id || a.patientId?._id === p._id || a.patientId === p.id || a.patientId?._id === p.id
      );

      // Sort appointments chronologically
      const sorted = pApts.sort((a, b) => {
        const dateA = new Date(a.date + "T" + (a.scheduledTime || "00:00"));
        const dateB = new Date(b.date + "T" + (b.scheduledTime || "00:00"));
        return dateA - dateB;
      });

      const past = sorted.filter(a => new Date(a.date + "T" + (a.scheduledTime || "00:00")) <= now);
      const future = sorted.filter(a => new Date(a.date + "T" + (a.scheduledTime || "00:00")) > now);

      const lastApt = past.length > 0 ? past[past.length - 1] : null;
      const nextApt = future.length > 0 ? future[0] : null;

      return {
        ...p,
        lastAppointment: lastApt ? `${format(new Date(lastApt.date), "dd MMM yyyy")} (${lastApt.scheduledTime || "Walk-in"})` : "—",
        nextAppointment: nextApt ? `${format(new Date(nextApt.date), "dd MMM yyyy")} (${nextApt.scheduledTime || "Walk-in"})` : "—",
        status: nextApt ? "Upcoming" : (lastApt ? "Completed" : "New Patient")
      };
    });

    return items;
  })();

  // Filter and sort patients
  const filteredPatients = processedPatients
    .filter((p) => {
      const nameVal = p.fullName || p.name || "";
      const idVal = p.patientId || p.id || "";
      const phoneVal = p.phone || "";

      // Search filter
      const matchesSearch =
        nameVal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idVal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        phoneVal.includes(searchTerm);
      
      // Status filter
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const nameA = a.fullName || a.name || "";
      const nameB = b.fullName || b.name || "";
      if (sortBy === "name") {
        return nameA.localeCompare(nameB);
      }
      return 0;
    });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <Toaster position="top-right" />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#06402B] tracking-tight">Patients Management</h1>
        <p className="text-gray-500 text-sm mt-1">Manage and update records for all registered patients.</p>
      </div>

      {/* Main Card */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
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
                    "h-12 px-4 rounded-2xl transition-all flex items-center gap-2 font-semibold border border-gray-100",
                    showFilters
                      ? "bg-[#06402B] text-white shadow-lg shadow-emerald-600/20"
                      : "bg-white text-gray-600 hover:bg-emerald-50"
                  )}
                >
                  <Filter className={cn("w-4 h-4 transition-transform", showFilters && "rotate-180")} />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </button>
                {(statusFilter !== "all" || searchTerm || sortBy !== "name") && (
                  <button
                    onClick={clearFilters}
                    className="h-12 px-4 rounded-2xl bg-red-50 text-red-500 hover:bg-red-100 transition-all flex items-center gap-2 font-semibold"
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
                  <div className="pt-4 pb-2 border-t border-gray-50 mt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Status Filter */}
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                        <select
                          className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500/20 outline-none mt-1"
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          <option value="all">All Statuses</option>
                          <option value="New Patient">New Patient</option>
                          <option value="Upcoming">Upcoming Appointment</option>
                          <option value="Completed">Completed Appointment</option>
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
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Patients Table */}
            <div className="overflow-x-auto rounded-2xl border border-gray-100 mt-2">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap">Patient ID</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap">Patient Name</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap">Age/Gender</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap">Phone</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap">Last Appointment</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap">Next Appointment</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredPatients.map((patient) => (
                    <tr key={patient._id || patient.id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-gray-500">{patient.patientId || patient._id || patient.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                            {(patient.fullName || patient.name || "?").split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 uppercase tracking-tight">{patient.fullName || patient.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono">{patient.email || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-500 whitespace-nowrap">
                        {patient.age ? `${patient.age}Y` : "—"} · {patient.gender || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {patient.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {patient.lastAppointment}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {patient.nextAppointment}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={patient.status} />
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEditClick(patient)}
                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                            title="Edit Details"
                          >
                            <Edit className="w-4 h-4" />
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

            {/* Pagination summary */}
            <div className="flex items-center justify-between p-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Showing {filteredPatients.length} of {patients.length} patients
              </p>
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      {createPortal(
        <AnimatePresence>
          {editingPatient && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs text-left" style={{ zIndex: 9999 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl w-full max-w-4xl shadow-xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col"
              >
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-black text-[#0A3E2A] text-lg">Edit Patient Profile</h2>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">UHID: {editingPatient.patientId || editingPatient._id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingPatient(null)}
                    className="p-1.5 hover:bg-emerald-100 rounded-lg text-gray-500 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
                  
                  {/* 1. Core Profile Details */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
                      <Activity className="w-3.5 h-3.5" /> Core Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600">Full Name *</label>
                        <input
                          type="text"
                          required
                          className="apt-input py-2 text-sm"
                          value={editForm.fullName}
                          onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600">Phone *</label>
                        <input
                          type="text"
                          required
                          className="apt-input py-2 text-sm"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600">Email Address</label>
                        <input
                          type="email"
                          className="apt-input py-2 text-sm"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600">Age</label>
                        <input
                          type="number"
                          min="0"
                          className="apt-input py-2 text-sm"
                          value={editForm.age}
                          onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600">Date of Birth</label>
                        <input
                          type="date"
                          className="apt-input py-2 text-sm"
                          value={editForm.dob}
                          onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600">Gender</label>
                        <select
                          className="apt-input py-2 text-sm"
                          value={editForm.gender}
                          onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                        >
                          <option value="">Select</option>
                          {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600">Blood Group</label>
                        <select
                          className="apt-input py-2 text-sm"
                          value={editForm.bloodGroup}
                          onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                        >
                          <option value="">Select</option>
                          {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600">Marital Status</label>
                        <select
                          className="apt-input py-2 text-sm"
                          value={editForm.maritalStatus}
                          onChange={(e) => setEditForm({ ...editForm, maritalStatus: e.target.value })}
                        >
                          <option value="">Select</option>
                          {MARITAL_STATUSES.map(ms => <option key={ms} value={ms}>{ms}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 2. Address & Referred Doctor */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
                      <User className="w-3.5 h-3.5" /> Address & Referral
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-gray-600">Street Address</label>
                        <input
                          type="text"
                          className="apt-input py-2 text-sm"
                          value={editForm.address}
                          onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600">Referred Doctor / Channel</label>
                        <input
                          type="text"
                          className="apt-input py-2 text-sm"
                          value={editForm.referredBy}
                          onChange={(e) => setEditForm({ ...editForm, referredBy: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600">City</label>
                        <input
                          type="text"
                          className="apt-input py-2 text-sm"
                          value={editForm.city}
                          onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600">State</label>
                        <input
                          type="text"
                          className="apt-input py-2 text-sm"
                          value={editForm.state}
                          onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600">Pincode</label>
                        <input
                          type="text"
                          className="apt-input py-2 text-sm"
                          value={editForm.pincode}
                          onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Medical Info */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
                      <Heart className="w-3.5 h-3.5" /> Medical Conditions & History
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600">Allergies (comma-separated)</label>
                        <input
                          type="text"
                          placeholder="e.g. Penicillin, Peanuts"
                          className="apt-input py-2 text-sm"
                          value={editForm.allergies}
                          onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-600">Chronic Diseases (comma-separated)</label>
                        <input
                          type="text"
                          placeholder="e.g. Asthma, Hypertension"
                          className="apt-input py-2 text-sm"
                          value={editForm.chronicDiseases}
                          onChange={(e) => setEditForm({ ...editForm, chronicDiseases: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. Emergency Contact & Insurance */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
                        <ShieldAlert className="w-3.5 h-3.5" /> Emergency Contact
                      </h3>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-600">Contact Name</label>
                          <input
                            type="text"
                            className="apt-input py-2 text-sm"
                            value={editForm.emergencyContactName}
                            onChange={(e) => setEditForm({ ...editForm, emergencyContactName: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600">Relation</label>
                            <input
                              type="text"
                              className="apt-input py-2 text-sm"
                              value={editForm.emergencyContactRelation}
                              onChange={(e) => setEditForm({ ...editForm, emergencyContactRelation: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600">Phone</label>
                            <input
                              type="text"
                              className="apt-input py-2 text-sm"
                              value={editForm.emergencyContactPhone}
                              onChange={(e) => setEditForm({ ...editForm, emergencyContactPhone: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
                        <FileText className="w-3.5 h-3.5" /> Insurance Details
                      </h3>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-600">Provider Name</label>
                          <input
                            type="text"
                            className="apt-input py-2 text-sm"
                            value={editForm.insuranceProvider}
                            onChange={(e) => setEditForm({ ...editForm, insuranceProvider: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-600">Policy Number</label>
                          <input
                            type="text"
                            className="apt-input py-2 text-sm"
                            value={editForm.insurancePolicyNumber}
                            onChange={(e) => setEditForm({ ...editForm, insurancePolicyNumber: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Actions */}
                  <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setEditingPatient(null)}
                      className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 bg-[#0F5C3A] text-white hover:bg-[#0A3E2A] text-sm font-bold rounded-xl flex items-center gap-2 shadow-sm transition cursor-pointer"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                    </button>
                  </div>

                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}