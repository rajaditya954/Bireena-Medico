import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Stethoscope,
  Clock,
  FileText,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Search,
  Building,
  IndianRupee,
  GraduationCap,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight,
  Award,
  Activity,
  ArrowLeft,
  Heart,
  Edit3,
  MapPin,
  Briefcase,
  Hash,
  BadgeCheck,
} from "lucide-react";
import { Button } from "../../components/common/Button";
import { api } from "../../lib/api";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAYS_SHORT = { Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat", Sunday: "Sun" };

const SPECIALIZATIONS = [
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Dermatology",
  "Psychiatry",
  "Radiology",
  "General Medicine",
  "Gastroenterology",
  "Endocrinology",
  "Ophthalmology",
  "ENT",
];

const SPEC_COLORS = {
  Cardiology: { bg: "from-rose-500 to-pink-600", light: "bg-rose-50 text-rose-700", dot: "bg-rose-500" },
  Neurology: { bg: "from-violet-500 to-purple-600", light: "bg-violet-50 text-violet-700", dot: "bg-violet-500" },
  Orthopedics: { bg: "from-amber-500 to-orange-600", light: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  Pediatrics: { bg: "from-sky-500 to-blue-600", light: "bg-sky-50 text-sky-700", dot: "bg-sky-500" },
  Dermatology: { bg: "from-teal-500 to-emerald-600", light: "bg-teal-50 text-teal-700", dot: "bg-teal-500" },
  Psychiatry: { bg: "from-indigo-500 to-blue-600", light: "bg-indigo-50 text-indigo-700", dot: "bg-indigo-500" },
  Radiology: { bg: "from-cyan-500 to-teal-600", light: "bg-cyan-50 text-cyan-700", dot: "bg-cyan-500" },
  "General Medicine": { bg: "from-emerald-500 to-green-600", light: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  Gastroenterology: { bg: "from-yellow-500 to-amber-600", light: "bg-yellow-50 text-yellow-700", dot: "bg-yellow-500" },
  Endocrinology: { bg: "from-fuchsia-500 to-pink-600", light: "bg-fuchsia-50 text-fuchsia-700", dot: "bg-fuchsia-500" },
  Ophthalmology: { bg: "from-blue-500 to-indigo-600", light: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  ENT: { bg: "from-lime-500 to-green-600", light: "bg-lime-50 text-lime-700", dot: "bg-lime-500" },
};

const getSpecColor = (spec) => ({ bg: "from-emerald-500 to-teal-600", light: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" });

/* ─────── Stat Chip ─────── */
const StatChip = ({ icon: Icon, label, value, accent = "emerald" }) => (
  <div className="flex items-center gap-3 min-w-0">
    <div className={`w-9 h-9 rounded-xl bg-${accent}-50 flex items-center justify-center shrink-0`}>
      <Icon className={`w-4 h-4 text-${accent}-600`} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">{label}</p>
      <p className="text-sm font-bold text-slate-800 truncate">{value}</p>
    </div>
  </div>
);

/* ─────── Form Field Wrapper ─────── */
const Field = ({ label, required, children, icon: Icon, hint }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
      {Icon && <Icon className="w-3 h-3 text-emerald-500" />}
      {label}
      {required && <span className="text-red-400 text-[10px]">*</span>}
    </label>
    {children}
    {hint && <p className="text-[10px] text-gray-400 font-medium mt-0.5">{hint}</p>}
  </div>
);

const ensureDrPrefix = (name) => {
  if (!name) return "";
  const trimmed = name.trim();
  if (/^dr\.?/i.test(trimmed)) {
    return trimmed;
  }
  return `Dr. ${trimmed}`;
};

/* ─────── Main Component ─────── */
export default function DoctorsManagement() {
  const [doctorsList, setDoctorsList] = useState([]);
  const [unconfiguredUsers, setUnconfiguredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [mode, setMode] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const [formData, setFormData] = useState({
    specialization: "",
    experience: "",
    qualification: "",
    registrationNumber: "",
    roomNumber: "",
    consultationFee: "500",
    about: "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const [timeSlots, setTimeSlots] = useState([
    { id: 1, day: "Monday", from: "09:00", to: "13:00" },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const doctorsRes = await api.getDoctors();
      const doctors = doctorsRes.data?.data || doctorsRes.data || [];

      const usersRes = await api.listUsers({ role: "DOCTOR" });
      const allUsers = usersRes.data?.data?.users || usersRes.data?.users || usersRes.data?.data || usersRes.data || [];

      const configuredUserIds = doctors.map(d => String(d.userId?._id || d.userId));
      const unconfigured = allUsers.filter(u => !configuredUserIds.includes(String(u._id)));

      setDoctorsList(doctors);
      setUnconfiguredUsers(unconfigured);
    } catch (err) {
      console.error("Failed to fetch doctor configuration data:", err);
      setSubmitError("Failed to fetch doctor lists. Please reload the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStartAllot = (user) => {
    setSelectedUser(user);
    setSelectedDoctor(null);
    setMode("allot");
    setSubmitError("");
    setSubmitSuccess("");
    setFormData({
      specialization: "",
      experience: "",
      qualification: "",
      registrationNumber: "",
      roomNumber: "",
      consultationFee: "500",
      about: "",
    });
    setTimeSlots([{ id: 1, day: "Monday", from: "09:00", to: "13:00" }]);
  };

  const handleStartEdit = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedUser(null);
    setMode("edit");
    setSubmitError("");
    setSubmitSuccess("");

    const slots = (doctor.schedule || []).map((s, idx) => ({
      id: idx + 1,
      day: s.day,
      from: s.startTime,
      to: s.endTime,
    }));

    setFormData({
      specialization: doctor.specialization || "",
      experience: String(doctor.experience || ""),
      qualification: doctor.qualification || "",
      registrationNumber: doctor.registrationNumber || "",
      roomNumber: doctor.roomNumber || "",
      consultationFee: String(doctor.consultationFee || "500"),
      about: doctor.description || "",
    });
    setTimeSlots(slots.length > 0 ? slots : [{ id: 1, day: "Monday", from: "09:00", to: "13:00" }]);
  };

  const handleCancel = () => {
    setMode(null);
    setSelectedUser(null);
    setSelectedDoctor(null);
    setSubmitError("");
  };

  const addTimeSlot = () => {
    const newId = Math.max(...timeSlots.map((s) => s.id), 0) + 1;
    setTimeSlots([...timeSlots, { id: newId, day: "Monday", from: "09:00", to: "13:00" }]);
  };

  const removeTimeSlot = (id) => {
    if (timeSlots.length === 1) {
      setSubmitError("At least one time slot is required.");
      return;
    }
    setTimeSlots(timeSlots.filter((slot) => slot.id !== id));
  };

  const updateTimeSlot = (id, field, value) => {
    setTimeSlots(
      timeSlots.map((slot) => (slot.id === id ? { ...slot, [field]: value } : slot))
    );
  };

  const validateForm = () => {
    if (!formData.specialization) return "Specialization is required";
    if (!formData.experience || isNaN(parseFloat(formData.experience)) || parseFloat(formData.experience) < 0) {
      return "Valid experience in years is required";
    }
    if (!formData.roomNumber.trim()) return "Room number is required";
    if (!formData.consultationFee || isNaN(parseFloat(formData.consultationFee)) || parseFloat(formData.consultationFee) < 0) {
      return "Valid consultation fee is required";
    }
    if (timeSlots.length === 0) return "At least one availability slot is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErr = validateForm();
    if (validationErr) {
      setSubmitError(validationErr);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const schedule = timeSlots.map((slot) => ({
        day: slot.day,
        startTime: slot.from,
        endTime: slot.to,
        isAvailable: true,
      }));

      const payload = {
        specialization: formData.specialization,
        experience: parseFloat(formData.experience),
        qualification: formData.qualification,
        registrationNumber: formData.registrationNumber || `REG-${Date.now()}`,
        roomNumber: formData.roomNumber,
        consultationFee: parseFloat(formData.consultationFee),
        description: formData.about,
        schedule,
      };

      if (mode === "allot" && selectedUser) {
        await api.createDoctor({
          ...payload,
          userId: selectedUser._id,
          fullName: selectedUser.name,
        });
        setSubmitSuccess(`Successfully configured schedule & room for ${ensureDrPrefix(selectedUser.name)}!`);
      } else if (mode === "edit" && selectedDoctor) {
        await api.updateDoctor(selectedDoctor._id, payload);
        setSubmitSuccess(`Successfully updated profile details for ${ensureDrPrefix(selectedDoctor.name)}!`);
      }

      await fetchData();
      setTimeout(() => {
        setMode(null);
        setSelectedUser(null);
        setSelectedDoctor(null);
      }, 1500);
    } catch (err) {
      setSubmitError(err.message || "Failed to save configuration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDoctors = doctorsList.filter((doc) => {
    const term = searchQuery.toLowerCase();
    return (
      (doc.name || "").toLowerCase().includes(term) ||
      (doc.specialization || "").toLowerCase().includes(term) ||
      (doc.roomNumber || "").toLowerCase().includes(term)
    );
  });

  const inputCls =
    "w-full h-11 px-4 bg-gray-50/80 border border-gray-200/60 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all text-slate-800 placeholder:text-gray-400/60";

  /* ─────────── RENDER ─────────── */
  return (
    <div className="space-y-6 pb-12">
      {/* ───── Header ───── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Doctor Management</h1>
              <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                Manage slots, rooms & schedules
              </p>
            </div>
          </div>
        </div>
        {/* Summary Pills */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700">{doctorsList.length} Configured</span>
          </div>
          <div className="px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-bold text-amber-700">{unconfiguredUsers.length} Pending</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mode === null ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* ───── Action Bar ───── */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, specialization, or room..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 bg-white border border-gray-200/60 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all shadow-sm"
                />
              </div>

              {/* Configure Doctor Dropdown */}
              <div className="relative">
                <select
                  value=""
                  onChange={(e) => {
                    const user = unconfiguredUsers.find(u => u._id === e.target.value);
                    if (user) handleStartAllot(user);
                  }}
                  className="h-12 pl-4 pr-10 bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-none rounded-2xl text-xs font-bold outline-none cursor-pointer hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md shadow-emerald-500/15 appearance-none min-w-[240px]"
                >
                  <option value="" disabled className="text-gray-800 bg-white">
                    + Configure New Doctor...
                  </option>
                  {unconfiguredUsers.length === 0 ? (
                    <option disabled className="text-gray-400 bg-white">No unconfigured accounts</option>
                  ) : (
                    unconfiguredUsers.map((u) => (
                      <option key={u._id} value={u._id} className="text-gray-800 bg-white">
                        {u.name} ({u.email || "No email"})
                      </option>
                    ))
                  )}
                </select>
                <Plus className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70 pointer-events-none" />
              </div>
            </div>

            {/* ───── Doctors Grid ───── */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-3xl">
                <div className="relative">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-4">
                    <RefreshCw className="w-7 h-7 text-emerald-600 animate-spin" />
                  </div>
                </div>
                <p className="text-gray-500 text-sm font-bold">Loading Doctor Profiles...</p>
                <p className="text-gray-400 text-xs mt-1">Fetching configuration data</p>
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-3xl text-center px-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center mb-5">
                  <Stethoscope className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-slate-800 text-lg font-bold">No Configured Doctors</p>
                <p className="text-gray-400 text-sm mt-2 max-w-md leading-relaxed">
                  Use the <span className="font-bold text-emerald-600">"Configure New Doctor"</span> dropdown above to assign rooms, time-slots, and schedules to registered doctor accounts.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredDoctors.map((doc, idx) => {
                  const specColor = getSpecColor(doc.specialization);
                  return (
                    <motion.div
                      key={doc._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/40 hover:border-gray-200/80 transition-all duration-300 flex flex-col"
                    >
                      {/* Card Gradient Header Band */}
                      <div className={`h-1.5 bg-gradient-to-r ${specColor.bg}`} />

                      {/* Profile Section */}
                      <div className="p-5 flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${specColor.bg} text-white font-black text-sm flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20`}>
                          {doc.name?.split(" ")?.map((n) => n[0])?.join("")?.slice(0, 2)?.toUpperCase() || "DR"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-slate-800 truncate leading-tight">
                            {doc.name}
                          </h3>
                          <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${specColor.light}`}>
                            <Sparkles className="w-2.5 h-2.5" />
                            {doc.specialization}
                          </div>
                          {doc.doctorCode && (
                            <p className="text-gray-400 text-[10px] font-mono mt-1 flex items-center gap-1">
                              <Hash className="w-2.5 h-2.5" />
                              {doc.doctorCode}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="px-5 pb-4 space-y-2.5 flex-1">
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="p-2.5 bg-gray-50/80 rounded-xl">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Room</p>
                            <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              {doc.roomNumber || "—"}
                            </p>
                          </div>
                          <div className="p-2.5 bg-gray-50/80 rounded-xl">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Fee</p>
                            <p className="text-xs font-bold text-emerald-700 flex items-center">
                              <IndianRupee className="w-3 h-3" />
                              {doc.consultationFee || "—"}
                            </p>
                          </div>
                        </div>

                        {(doc.experience || doc.qualification) && (
                          <div className="grid grid-cols-2 gap-2.5">
                            {doc.experience && (
                              <div className="p-2.5 bg-gray-50/80 rounded-xl">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Experience</p>
                                <p className="text-xs font-bold text-slate-700">{doc.experience} yrs</p>
                              </div>
                            )}
                            {doc.qualification && (
                              <div className="p-2.5 bg-gray-50/80 rounded-xl">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Degree</p>
                                <p className="text-xs font-bold text-slate-700 truncate">{doc.qualification}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Schedule Pills */}
                        <div className="pt-1">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Schedule</p>
                          <div className="flex flex-wrap gap-1">
                            {doc.schedule && doc.schedule.length > 0 ? (
                              doc.schedule.map((slot, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50/80 border border-emerald-100 rounded-lg text-[10px] font-bold text-emerald-700"
                                >
                                  <Clock className="w-2.5 h-2.5" />
                                  {DAYS_SHORT[slot.day] || slot.day?.slice(0, 3)} {slot.startTime}–{slot.endTime}
                                </span>
                              ))
                            ) : (
                              <span className="text-red-400 font-bold text-[10px] italic">No slots defined</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Footer */}
                      <div className="px-5 pb-5 pt-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(doc)}
                          className="w-full h-10 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200/60 text-slate-700 hover:from-emerald-50 hover:to-teal-50 hover:border-emerald-200 hover:text-emerald-700 transition-all font-bold text-xs flex items-center justify-center gap-2 group/btn"
                        >
                          <Edit3 className="w-3.5 h-3.5 group-hover/btn:text-emerald-600 transition-colors" />
                          Edit Configuration
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover/btn:opacity-100 transition-all -translate-x-1 group-hover/btn:translate-x-0" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          /* ═══════════════════ CONFIGURATION FORM ═══════════════════ */
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Form Header */}
            <div className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-600" />
                </button>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    {mode === "allot" ? (
                      <>
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                          <Plus className="w-3.5 h-3.5 text-white" />
                        </div>
                        Configure {ensureDrPrefix(selectedUser?.name)}
                      </>
                    ) : (
                      <>
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <Edit3 className="w-3.5 h-3.5 text-white" />
                        </div>
                        Edit {ensureDrPrefix(selectedDoctor?.name)}
                      </>
                    )}
                  </h2>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                    {mode === "allot"
                      ? "Assign specialization, room, fee, and weekly availability"
                      : "Update scheduling blocks and profile metadata"}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* ──── Left Column: Profile Form (3 cols) ──── */}
                <div className="lg:col-span-3 space-y-6">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-gray-50/50 to-white">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-emerald-600" />
                        Clinical Profile
                      </h3>
                    </div>

                    <div className="p-6 space-y-5">
                      {/* Doctor Name */}
                      <Field label="Doctor Name" icon={User} hint="Auto-filled from user account, cannot be changed.">
                        <input
                          type="text"
                          className="w-full h-11 px-4 bg-gray-100/80 border border-gray-200/40 rounded-xl text-sm font-bold text-slate-400 outline-none cursor-not-allowed"
                          value={mode === "allot" ? (selectedUser?.name || "") : (selectedDoctor?.name || "")}
                          disabled
                        />
                      </Field>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Specialization */}
                        <Field label="Specialization" icon={Heart} required>
                          <select
                            className={inputCls}
                            value={formData.specialization}
                            onChange={(e) => handleChange("specialization", e.target.value)}
                            required
                          >
                            <option value="">Select specialization</option>
                            {SPECIALIZATIONS.map((spec) => (
                              <option key={spec} value={spec}>{spec}</option>
                            ))}
                          </select>
                        </Field>

                        {/* Experience */}
                        <Field label="Experience (Years)" icon={Briefcase} required>
                          <input
                            type="number"
                            step="0.5"
                            placeholder="e.g. 5"
                            className={inputCls}
                            value={formData.experience}
                            onChange={(e) => handleChange("experience", e.target.value)}
                            required
                          />
                        </Field>

                        {/* Qualification */}
                        <Field label="Qualification / Degrees" icon={GraduationCap}>
                          <input
                            type="text"
                            placeholder="e.g. MBBS, MD (Cardiology)"
                            className={inputCls}
                            value={formData.qualification}
                            onChange={(e) => handleChange("qualification", e.target.value)}
                          />
                        </Field>

                        {/* Registration Number */}
                        <Field label="Medical Reg. Number" icon={BadgeCheck}>
                          <input
                            type="text"
                            placeholder="e.g. MC-98745"
                            className={inputCls}
                            value={formData.registrationNumber}
                            onChange={(e) => handleChange("registrationNumber", e.target.value)}
                          />
                        </Field>

                        {/* Room Number */}
                        <Field label="Room Number" icon={MapPin} required>
                          <input
                            type="text"
                            placeholder="e.g. Room 101, Cabinet B"
                            className={inputCls}
                            value={formData.roomNumber}
                            onChange={(e) => handleChange("roomNumber", e.target.value)}
                            required
                          />
                        </Field>

                        {/* Fee */}
                        <Field label="Consultation Fee (₹)" icon={IndianRupee} required>
                          <input
                            type="number"
                            placeholder="500"
                            className={inputCls}
                            value={formData.consultationFee}
                            onChange={(e) => handleChange("consultationFee", e.target.value)}
                            required
                          />
                        </Field>
                      </div>
                    </div>
                  </div>

                  {/* Biography Card */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-gray-50/50 to-white">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        Biography & Description
                      </h3>
                    </div>
                    <div className="p-6">
                      <textarea
                        rows={4}
                        placeholder="Add a brief professional bio, areas of interest, or clinical specialties..."
                        className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200/60 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all resize-none text-slate-800 placeholder:text-gray-400/60 leading-relaxed"
                        value={formData.about}
                        onChange={(e) => handleChange("about", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* ──── Right Column: Availability Slots (2 cols) ──── */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-6">
                    <div className="px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-emerald-50/30 to-white flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        Weekly Availability
                      </h3>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {timeSlots.length} slot{timeSlots.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="p-5 space-y-3 max-h-[480px] overflow-y-auto">
                      {timeSlots.map((slot, idx) => (
                        <motion.div
                          key={slot.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="p-4 bg-gradient-to-br from-gray-50/80 to-white rounded-xl border border-gray-100 space-y-3 relative group/slot"
                        >
                          {/* Slot number badge */}
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-widest">
                              Slot {idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeTimeSlot(slot.id)}
                              className="w-7 h-7 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-all flex items-center justify-center opacity-50 group-hover/slot:opacity-100"
                              title="Remove slot"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Day selector */}
                          <div>
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">
                              Day of Week
                            </label>
                            <select
                              className="w-full h-9 px-3 bg-white border border-gray-200/60 rounded-lg text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all text-slate-700"
                              value={slot.day || "Monday"}
                              onChange={(e) => updateTimeSlot(slot.id, "day", e.target.value)}
                            >
                              {DAYS_OF_WEEK.map((d) => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                          </div>

                          {/* Time range */}
                          <div className="flex items-end gap-2">
                            <div className="flex-1">
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">
                                From
                              </label>
                              <input
                                type="time"
                                className="w-full h-9 px-3 bg-white border border-gray-200/60 rounded-lg text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all text-slate-700"
                                value={slot.from}
                                onChange={(e) => updateTimeSlot(slot.id, "from", e.target.value)}
                              />
                            </div>
                            <div className="pb-2">
                              <span className="text-gray-300 font-bold text-xs">→</span>
                            </div>
                            <div className="flex-1">
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">
                                To
                              </label>
                              <input
                                type="time"
                                className="w-full h-9 px-3 bg-white border border-gray-200/60 rounded-lg text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all text-slate-700"
                                value={slot.to}
                                onChange={(e) => updateTimeSlot(slot.id, "to", e.target.value)}
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {/* Add Slot Button */}
                      <button
                        type="button"
                        onClick={addTimeSlot}
                        className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/30 transition-all flex items-center justify-center gap-2 text-xs font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Availability Block
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ──── Status Messages ──── */}
              <AnimatePresence>
                {submitError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-50 border border-red-100 rounded-2xl p-4 text-red-700 text-sm flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <span className="font-semibold">{submitError}</span>
                  </motion.div>
                )}
                {submitSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-emerald-700 text-sm flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="font-semibold">{submitSuccess}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ──── Form Footer ──── */}
              <div className="flex gap-3 justify-end bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="h-11 px-6 rounded-xl bg-gray-100 text-slate-600 hover:bg-gray-200 font-bold text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 px-8 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] transition-all flex items-center gap-2 font-bold shadow-lg shadow-emerald-500/15 disabled:opacity-60 text-xs"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : mode === "allot" ? (
                    <Plus className="w-4 h-4" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {isSubmitting ? "Saving..." : mode === "allot" ? "Configure Doctor" : "Update Profile"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}