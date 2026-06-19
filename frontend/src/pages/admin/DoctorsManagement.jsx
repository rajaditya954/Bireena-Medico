import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  User,
  Stethoscope,
  Clock,
  FileText,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { Button } from "../../components/common/Button";
import { api } from "../../lib/api";

// Days of the week for scheduling
const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function AddDoctor() {
  const navigate = useNavigate();

  // Form state capturing both user registration credentials and doctor profile details
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    experience: "",
    qualification: "",
    registrationNumber: "",
    roomNumber: "",
    consultationFee: "500",
    about: "",
  });

  // Weekday-specific availability slots state
  const [timeSlots, setTimeSlots] = useState([
    { id: 1, day: "Monday", from: "09:00", to: "13:00" },
    { id: 2, day: "Wednesday", from: "14:00", to: "18:00" },
  ]);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  // Common specializations
  const specializations = [
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

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
    if (!formData.fullName.trim()) return "Full name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email)) return "Invalid email address";
    if (!formData.password) return "Password is required";
    if (formData.password.length < 6) return "Password must be at least 6 characters";
    if (!formData.specialization) return "Specialization is required";
    if (
      !formData.experience ||
      isNaN(parseFloat(formData.experience)) ||
      parseFloat(formData.experience) < 0
    )
      return "Valid experience in years is required";
    if (!formData.registrationNumber.trim()) return "Registration number is required";
    if (!formData.roomNumber.trim()) return "Room number is required";
    if (
      !formData.consultationFee ||
      isNaN(parseFloat(formData.consultationFee)) ||
      parseFloat(formData.consultationFee) < 0
    )
      return "Valid consultation fee is required";
    if (timeSlots.length === 0) return "At least one availability slot is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setSubmitError(error);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        specialization: formData.specialization,
        experience: parseFloat(formData.experience),
        qualification: formData.qualification,
        registrationNumber: formData.registrationNumber,
        roomNumber: formData.roomNumber,
        consultationFee: parseFloat(formData.consultationFee),
        about: formData.about,
        timeSlots: timeSlots,
      };

      // Call actual backend database API
      await api.createDoctor(payload);

      setSubmitSuccess("Doctor created and database profile linked successfully!");
      
      setTimeout(() => {
        navigate("/admin/doctors");
      }, 1500);
    } catch (err) {
      setSubmitError(err.message || "Failed to add doctor. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header with back button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter italic">Add Doctor</h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
            Doctors &gt; Add Doctor
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin/doctors")}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-800 self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to list
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Two column/Three column layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info Columns (Spans 2) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Clinical Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-transparent">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-emerald-600 animate-pulse" />
                  Clinical Profile
                </h2>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Specialization <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all"
                    value={formData.specialization}
                    onChange={(e) => handleChange("specialization", e.target.value)}
                    required
                  >
                    <option value="">Select specialization</option>
                    {specializations.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Experience (Years) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="Enter years of experience"
                    className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all"
                    value={formData.experience}
                    onChange={(e) => handleChange("experience", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Qualification
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MBBS, MD, FRCP"
                    className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all"
                    value={formData.qualification}
                    onChange={(e) => handleChange("qualification", e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Registration Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Medical Council Reg No."
                    className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all"
                    value={formData.registrationNumber}
                    onChange={(e) => handleChange("registrationNumber", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Consultation Room No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Room No. (e.g. 101, B-22)"
                    className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all"
                    value={formData.roomNumber}
                    onChange={(e) => handleChange("roomNumber", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Consultation Fee (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Enter fee amount"
                    className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all"
                    value={formData.consultationFee}
                    onChange={(e) => handleChange("consultationFee", e.target.value)}
                    required
                  />
                </div>
              </div>
            </motion.div>

            {/* Account Credentials Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-transparent">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-600" />
                  Account & Credentials
                </h2>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="doctor@hospital.com"
                    className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Enter secure password"
                    className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar Info Columns (Spans 1) */}
          <div className="space-y-8">
            
            {/* About Doctor Bio Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-transparent">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  Bio & About
                </h2>
              </div>
              <div className="p-6">
                <textarea
                  rows={4}
                  placeholder="Enter a brief background, biography, or expertise summary of the doctor..."
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all resize-none"
                  value={formData.about}
                  onChange={(e) => handleChange("about", e.target.value)}
                />
              </div>
            </motion.div>

            {/* Weekly Availability Slots Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-transparent">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  Availability Slots
                </h2>
                <p className="text-gray-400 text-xs font-semibold mt-1">
                  Add day-wise scheduling blocks.
                </p>
              </div>
              
              <div className="p-6 space-y-4">
                {timeSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50 space-y-3 relative group"
                  >
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Day of Week
                      </label>
                      <select
                        className="w-full h-10 px-3 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all"
                        value={slot.day || "Monday"}
                        onChange={(e) => updateTimeSlot(slot.id, "day", e.target.value)}
                      >
                        {DAYS_OF_WEEK.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          From
                        </label>
                        <input
                          type="time"
                          className="w-full h-10 px-3 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all"
                          value={slot.from}
                          onChange={(e) => updateTimeSlot(slot.id, "from", e.target.value)}
                        />
                      </div>
                      <div className="text-slate-400 font-bold text-xs pt-4">to</div>
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          To
                        </label>
                        <input
                          type="time"
                          className="w-full h-10 px-3 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all"
                          value={slot.to}
                          onChange={(e) => updateTimeSlot(slot.id, "to", e.target.value)}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeTimeSlot(slot.id)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all flex items-center justify-center border border-red-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addTimeSlot}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-slate-500 hover:border-emerald-600 hover:text-emerald-600 transition-all flex items-center justify-center gap-2 text-xs font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  Add Time Slot
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Submit Messages */}
        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-100 rounded-2xl p-4 text-red-700 text-sm flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span className="font-semibold">{submitError}</span>
          </motion.div>
        )}
        {submitSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-emerald-700 text-sm flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 animate-bounce" />
            <span className="font-semibold">{submitSuccess}</span>
          </motion.div>
        )}

        {/* Form Actions footer */}
        <div className="flex gap-4 justify-end bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/doctors")}
            className="h-12 px-6 rounded-2xl hover:bg-slate-50 font-bold border-gray-200 text-slate-700"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 px-8 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center gap-2 font-bold shadow-md shadow-emerald-600/10 disabled:opacity-60"
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSubmitting ? "Creating..." : "Create Doctor"}
          </Button>
        </div>
      </form>
    </div>
  );
}