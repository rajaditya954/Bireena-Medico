import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  Calendar, Search, Plus, Loader2, X, CheckCircle2,
  Stethoscope, FlaskConical, User, Clock, ArrowLeft
} from "lucide-react";
import { cn } from "../../lib/utils";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import * as api from "../../services/appointmentApi";

const STAFF_USER_ID = "staff-123";

export default function AddAppointment({ isEmbedded = false }) {
  const navigate = useNavigate();

  const [consultantType, setConsultantType] = useState("doctor");
  const [doctors, setDoctors] = useState([]);

  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [bookingSlot, setBookingSlot] = useState(null);
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingDate, setBookingDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [bookingPriority, setBookingPriority] = useState("normal");

  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [patientSearch, setPatientSearch] = useState("");
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [bookingPatient, setBookingPatient] = useState(null);

  const [isRegistering, setIsRegistering] = useState(false);
  const [regForm, setRegForm] = useState({ name: "", phone: "" });
  const [regLoading, setRegLoading] = useState(false);





  const [booked, setBooked] = useState(false);
  const [bookedApt, setBookedApt] = useState(null);

  // ── Fetch doctors ──────────────────────────────────────────
  useEffect(() => {
    api.getDoctors().then(res => {
      setDoctors(res.data?.data || []);
    }).catch(() => { });
  }, []);

  // ── Auto-select first doctor matching type ─────────────────
  useEffect(() => {
    if (!doctors.length) return;
    const matches = (d) => {
      if (consultantType === "doctor") return d.consultantType === "doctor";
      if (consultantType === "lab") return d.consultantType === "lab";
      return true;
    };
    if (!bookingDoctor || !matches(bookingDoctor)) {
      const first = doctors.find(matches);
      if (first) setBookingDoctor(first);
    }
  }, [consultantType, doctors]);

  // ── Patient search ─────────────────────────────────────────
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (patientSearch.trim().length < 2 || bookingPatient) { setPatients([]); return; }
      setLoadingPatients(true);
      try {
        const res = await api.searchPatients(patientSearch);
        setPatients(res.data?.data || []);
      } catch { }
      finally { setLoadingPatients(false); }
    }, 300);
    return () => clearTimeout(delay);
  }, [patientSearch, bookingPatient]);

  // ── Fetch slots when doctor/date changes ───────────────────
  useEffect(() => {
    if (!bookingDoctor?.id || !bookingDate) { setSlots([]); return; }
    const fetch = async () => {
      setLoadingSlots(true);
      try {
        const res = await api.getAvailableSlots(bookingDoctor.id, bookingDate);
        setSlots(res.data?.data || []);
        setBookingSlot(null);
      } catch { setSlots([]); }
      finally { setLoadingSlots(false); }
    };
    fetch();
  }, [bookingDoctor?.id, bookingDate]);

  const handleBooking = async () => {
    if (!bookingPatient) return toast.error("Please select a patient");
    if (!bookingDoctor) return toast.error("Please select a doctor/consultant");
    try {
      setBookingLoading(true);
      const res = await api.createAppointment({
        type: bookingSlot ? "scheduled" : "walk-in",
        patientId: bookingPatient.id,
        patientName: bookingPatient.name,
        patientPhone: bookingPatient.phone,
        doctorId: bookingDoctor.id,
        doctorName: bookingDoctor.name,
        slotId: bookingSlot?._id || null,
        consultantType,
        priority: bookingPriority,
        notes: bookingNotes || "Regular visit",
        createdBy: STAFF_USER_ID,
        date: bookingDate,
      });
      toast.success("Appointment booked successfully ✅");
      setBookedApt(res.data?.data || {});
      setBooked(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!regForm.name || !regForm.phone) return toast.error("Name and phone required");
    try {
      setRegLoading(true);
      const res = await api.createPatient(regForm);
      setBookingPatient(res.data?.data || null);
      setIsRegistering(false);
      setRegForm({ name: "", phone: "" });
      toast.success("Patient registered");
    } catch {
      toast.error("Registration failed");
    } finally {
      setRegLoading(false);
    }
  };





  const resetForm = () => {
    setBookingPatient(null);
    setPatientSearch("");
    setBookingSlot(null);
    setBookingNotes("");
    setBookingPriority("normal");
    setBookingDate(format(new Date(), "yyyy-MM-dd"));
    setBooked(false);
    setBookedApt(null);
  };

  const filteredDoctors = doctors.filter(d => {
    if (consultantType === "doctor") return d.consultantType === "doctor";
    if (consultantType === "lab") return d.consultantType === "lab";
    return true;
  });

  // ── Success screen ─────────────────────────────────────────
  if (booked && bookedApt) {
    return (
      <div className={cn("mx-auto text-center space-y-6", isEmbedded ? "max-w-full mt-4" : "max-w-xl mt-16")}>
        <Toaster position="top-right" />
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto shrink-0">
          <CheckCircle2 className="w-10 h-10 text-[#0F5C3A]" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-[#0A3E2A]">Appointment Booked!</h2>
          <p className="text-gray-500 mt-1">Token #{bookedApt.tokenNumber} has been created.</p>
        </div>
        <div className="apt-card p-6 text-left space-y-3">
          <div className="flex justify-between"><span className="text-sm text-gray-500">Patient</span><span className="font-bold text-sm">{bookedApt.patientName}</span></div>
          <div className="flex justify-between"><span className="text-sm text-gray-500">Doctor</span><span className="font-bold text-sm">{bookedApt.doctorName}</span></div>
          <div className="flex justify-between"><span className="text-sm text-gray-500">Date</span><span className="font-bold text-sm">{bookedApt.date}</span></div>
          <div className="flex justify-between"><span className="text-sm text-gray-500">Time</span><span className="font-bold text-sm">{bookedApt.scheduledTime || "Walk-in"}</span></div>
          <div className="flex justify-between"><span className="text-sm text-gray-500">Type</span><span className="font-bold text-sm capitalize">{bookedApt.type}</span></div>
          <div className="flex justify-between"><span className="text-sm text-gray-500">Priority</span><span className={cn("font-bold text-sm capitalize", bookedApt.priority === "emergency" ? "text-red-600" : "text-gray-800")}>{bookedApt.priority}</span></div>
        </div>
        <div className="flex gap-3">
          <button onClick={resetForm} className="flex-1 py-3 bg-[#0F5C3A] text-white rounded-xl font-bold text-sm hover:bg-[#0A3E2A] transition">
            Book Another
          </button>
          <button onClick={() => navigate("/appointment/dashboard")} className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-sm text-gray-600 hover:border-[#0F5C3A] hover:text-[#0F5C3A] transition">
            View Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("mx-auto pb-10", isEmbedded ? "max-w-full space-y-0" : "max-w-[1200px] space-y-6")}>
      <Toaster position="top-right" />

      {/* Header */}
      {!isEmbedded && (
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/appointment")} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-[#0A3E2A] tracking-tight">Book Appointment</h1>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-0.5">Walk-in & Scheduled</p>
          </div>
        </div>
      )}

      <div className="apt-card space-y-8 p-6 lg:p-8">
        
        {/* Embedded Header */}
        {isEmbedded && (
          <div className="border-b border-gray-100 pb-5 mb-2 -mt-2">
            <h2 className="text-xl font-black text-[#0A3E2A] tracking-tight">Book Appointment</h2>
          </div>
        )}

        {/* Consultant Type */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
            Consultant Type
          </label>
          <div className="flex gap-3">
            {[
              { id: "doctor", label: "Doctor", icon: Stethoscope },
              { id: "lab", label: "Lab Consultant", icon: FlaskConical },
              { id: "both", label: "Both", icon: User },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setConsultantType(t.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border transition-all",
                  consultantType === t.id
                    ? "bg-emerald-50 border-[#0F5C3A] text-[#0F5C3A] shadow-sm"
                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                )}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Patient Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Patient</label>
            {!isRegistering && !bookingPatient && (
              <button
                onClick={() => {
                  if (isEmbedded) {
                    setIsRegistering(true);
                    setRegForm({ name: patientSearch, phone: "" });
                  } else {
                    navigate("/appointment/add-patient");
                  }
                }}
                className="text-xs font-bold text-[#0F5C3A] flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Register New Patient
              </button>
            )}
          </div>

          {bookingPatient ? (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
              <div>
                <p className="font-bold text-[#0A3E2A]">{bookingPatient.name}</p>
                <p className="text-xs text-gray-500">{bookingPatient.phone}</p>
              </div>
              <button
                onClick={() => { setBookingPatient(null); setPatientSearch(""); }}
                className="p-1.5 hover:bg-red-100 text-red-500 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : isRegistering ? (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-700">Quick Patient Registration</span>
                <button onClick={() => setIsRegistering(false)}>
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="apt-input py-2 text-xs font-medium animate-fadeIn"
                  placeholder="Full Name *"
                  value={regForm.name}
                  onChange={(e) => setRegForm(p => ({ ...p, name: e.target.value }))}
                />
                <input
                  className="apt-input py-2 text-xs font-medium animate-fadeIn"
                  placeholder="Phone Number *"
                  value={regForm.phone}
                  onChange={(e) => setRegForm(p => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRegister}
                  disabled={regLoading}
                  className="flex-1 py-2 rounded-lg bg-[#0F5C3A] text-white hover:bg-[#0A3E2A] text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  {regLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Plus className="w-3.5 h-3.5" /> Register & Select</>}
                </button>
                <button onClick={() => setIsRegistering(false)} className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 transition-all">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
              <input
                type="text"
                placeholder="Search patient by name or phone..."
                className="apt-input py-3 text-sm"
                style={{ paddingLeft: "2.5rem" }}
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
              />
              {patientSearch.trim().length >= 2 && (
                <div className="absolute left-0 right-0 mt-1 apt-card shadow-xl z-30 max-h-52 overflow-y-auto">
                  {loadingPatients ? (
                    <div className="flex items-center justify-center p-4 gap-2 text-gray-500 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" /> Searching...
                    </div>
                  ) : patients.length > 0 ? (
                    patients.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => { setBookingPatient(p); setPatientSearch(""); }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 flex justify-between items-center"
                      >
                        <span className="font-medium text-gray-800 text-sm">{p.name}</span>
                        <span className="text-xs text-gray-400">{p.phone}</span>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-400">No patients found</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Doctor / Consultant */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
            {consultantType === "lab" ? "Lab Consultant" : "Doctor"}
          </label>
          <select
            className="apt-input py-3 text-sm"
            value={bookingDoctor?.id || ""}
            onChange={(e) => {
              const d = doctors.find(doc => doc.id === e.target.value);
              setBookingDoctor(d);
            }}
          >
            <option value="" disabled>
              Select {consultantType === "lab" ? "Lab Consultant" : "Doctor"}
            </option>
            {filteredDoctors.map(d => (
              <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>
            ))}
          </select>
        </div>

        {/* Main Grid */}
        <div className={cn("grid gap-6", isEmbedded ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2")}>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
              Appointment Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                className="apt-input py-3 text-sm"
                style={{ paddingLeft: "2.5rem" }}
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                min={format(new Date(), "yyyy-MM-dd")}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
              Time Slot{" "}
              <span className="text-gray-300 font-normal normal-case">(optional — leave blank for walk-in)</span>
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              {loadingSlots ? (
                <div className="apt-input py-3 pl-10 text-sm flex items-center gap-2 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading slots...
                </div>
              ) : (
                <select
                  className="apt-input py-3 text-sm"
                  style={{ paddingLeft: "2.5rem" }}
                  value={bookingSlot?._id || ""}
                  onChange={(e) => {
                    const s = slots.find(sl => sl._id === e.target.value);
                    setBookingSlot(s);
                  }}
                >
                  <option value="">Walk-in (no slot)</option>
                  {slots.filter(s => s.status !== "booked").map(s => (
                    <option key={s._id} value={s._id}>{s.startTime}</option>
                  ))}
                </select>
              )}
            </div>
            {slots.length > 0 && (
              <p className="text-[10px] text-gray-400 mt-1">
                {slots.filter(s => s.status !== "booked").length} slots available
              </p>
            )}
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Priority</label>
          <div className="flex gap-3">
            {[
              { id: "normal", label: "Normal", color: "border-gray-200 text-gray-600", active: "border-[#0F5C3A] bg-emerald-50 text-[#0F5C3A]" },
              { id: "urgent", label: "Urgent", color: "border-gray-200 text-gray-600", active: "border-amber-500 bg-amber-50 text-amber-700" },
              { id: "emergency", label: "Emergency", color: "border-gray-200 text-gray-600", active: "border-red-500 bg-red-50 text-red-600" },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setBookingPriority(p.id)}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all",
                  bookingPriority === p.id ? p.active : p.color
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
            Consultation Reason / Notes
          </label>
          <textarea
            className="apt-input min-h-[100px] resize-none text-sm"
            placeholder="Describe the reason for visit, symptoms, or special notes..."
            value={bookingNotes}
            onChange={(e) => setBookingNotes(e.target.value)}
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleBooking}
            disabled={bookingLoading || !bookingPatient || !bookingDoctor}
            className="flex-1 apt-btn-primary py-4 text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {bookingLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Booking...</>
              : <><Calendar className="w-4 h-4" /> Confirm Booking</>}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-4 border border-gray-200 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
