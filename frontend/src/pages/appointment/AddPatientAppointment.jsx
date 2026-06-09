import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  User, MapPin, Phone, Heart, FileText, Loader2,
  ArrowLeft, RotateCcw, X, CheckCircle2, UserPlus
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import * as api from "../../services/appointmentApi";

const INDIA_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh",
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function Section({ icon: Icon, title, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#0F5C3A]" />
        </div>
        <h2 className="text-sm font-bold text-[#0A3E2A]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-600">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full h-10 px-3 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-[#0F5C3A] focus:ring-2 focus:ring-[#0F5C3A]/10 transition placeholder:text-gray-300";
const selectCls = inputCls + " cursor-pointer";

const EMPTY_FORM = {
  // Personal
  fullName: "",
  dateOfBirth: "",
  age: "",
  gender: "",
  maritalStatus: "",
  bloodGroup: "",
  nationality: "Indian",
  preferredLanguage: "",
  religion: "",
  occupation: "",
  phoneNumber: "",
  alternatePhone: "",
  email: "",
  aadhaarNumber: "",
  panNumber: "",
  // Address
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pinCode: "",
  country: "India",
  // Emergency
  emergencyContactName: "",
  emergencyRelationship: "",
  emergencyPhone: "",
  emergencyAlternatePhone: "",
  emergencyAddress: "",
  sameAsPatientAddress: false,
  // Medical
  knownAllergies: "",
  chronicConditions: "",
  pastSurgeries: "",
  currentMedications: "",
  familyMedicalHistory: "",
  smokingStatus: "",
  alcoholConsumption: "",
  insuranceProvider: "",
  insuranceNumber: "",
  // Additional
  patientId: `PAT-${format(new Date(), "yyyy-MM")}-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, "0")}`,
  registrationDate: format(new Date(), "yyyy-MM-dd"),
  referredBy: "",
  notes: "",
};

export default function AddPatientAppointment() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedPatient, setSavedPatient] = useState(null);

  const set = (field, value) => setForm(p => ({ ...p, [field]: value }));

  // Auto-calc age from DOB
  const handleDobChange = (dob) => {
    set("dateOfBirth", dob);
    if (dob) {
      const diff = new Date() - new Date(dob);
      const years = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
      set("age", years >= 0 ? years : "");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) return toast.error("Full name is required");
    if (!form.phoneNumber.trim()) return toast.error("Phone number is required");
    if (!form.gender) return toast.error("Gender is required");

    try {
      setLoading(true);
      // Use the appointment API to create patient
      const res = await api.createPatient({
        name: form.fullName,
        phone: form.phoneNumber,
      });
      setSavedPatient(res.data?.data || null);
      setSaved(true);
      toast.success("Patient registered successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save patient");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({ ...EMPTY_FORM, patientId: `PAT-${format(new Date(), "yyyy-MM")}-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, "0")}` });
    setSaved(false);
    setSavedPatient(null);
  };

  // ── Success screen ─────────────────────────────────────────
  if (saved && savedPatient) {
    return (
      <div className="max-w-xl mx-auto mt-16 text-center space-y-6">
        <Toaster position="top-right" />
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-[#0F5C3A]" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-[#0A3E2A]">Patient Registered!</h2>
          <p className="text-gray-500 mt-1">{savedPatient.name} has been added to the system.</p>
        </div>
        <div className="apt-card p-6 text-left space-y-3">
          <div className="flex justify-between"><span className="text-sm text-gray-500">Name</span><span className="font-bold text-sm">{savedPatient.name}</span></div>
          <div className="flex justify-between"><span className="text-sm text-gray-500">Phone</span><span className="font-bold text-sm">{savedPatient.phone}</span></div>
          <div className="flex justify-between"><span className="text-sm text-gray-500">Patient ID</span><span className="font-bold text-sm font-mono">{savedPatient.id}</span></div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate("/appointment/add")} className="flex-1 py-3 bg-[#0F5C3A] text-white rounded-xl font-bold text-sm hover:bg-[#0A3E2A] transition">
            Book Appointment
          </button>
          <button onClick={handleReset} className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-sm text-gray-600 hover:border-[#0F5C3A] hover:text-[#0F5C3A] transition">
            Add Another Patient
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Toaster position="top-right" />

      {/* Breadcrumb + Header */}
      <div className="flex items-center justify-between">
        <div>
          
          <h1 className="text-2xl font-black text-[#0A3E2A] tracking-tight">Add New Patient</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-2">
            <span>{format(new Date(), "dd MMM yyyy")}</span>
          </div>
          <button
            onClick={() => navigate("/appointment/patients")}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Patients
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Personal Information */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
          <Section icon={User} title="Personal Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Field label="Full Name" required>
                <input className={inputCls} placeholder="Enter full name" value={form.fullName} onChange={e => set("fullName", e.target.value)} />
              </Field>
              <Field label="Date of Birth" required>
                <input type="date" className={inputCls} placeholder="dd/mm/yyyy" value={form.dateOfBirth} onChange={e => handleDobChange(e.target.value)} />
              </Field>
              <Field label="Age (Auto)">
                <input className={inputCls + " bg-gray-50"} placeholder="—" value={form.age} readOnly />
              </Field>
              <Field label="Gender" required>
                <select className={selectCls} value={form.gender} onChange={e => set("gender", e.target.value)}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </Field>
              <Field label="Marital Status">
                <select className={selectCls} value={form.maritalStatus} onChange={e => set("maritalStatus", e.target.value)}>
                  <option value="">Select status</option>
                  <option>Single</option>
                  <option>Married</option>
                  <option>Divorced</option>
                  <option>Widowed</option>
                </select>
              </Field>
              <Field label="Blood Group">
                <select className={selectCls} value={form.bloodGroup} onChange={e => set("bloodGroup", e.target.value)}>
                  <option value="">Select blood group</option>
                  {BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
                </select>
              </Field>
              <Field label="Nationality">
                <select className={selectCls} value={form.nationality} onChange={e => set("nationality", e.target.value)}>
                  <option>Indian</option>
                  <option>Other</option>
                </select>
              </Field>
              <Field label="Preferred Language">
                <select className={selectCls} value={form.preferredLanguage} onChange={e => set("preferredLanguage", e.target.value)}>
                  <option value="">Select language</option>
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Tamil</option>
                  <option>Telugu</option>
                  <option>Kannada</option>
                  <option>Malayalam</option>
                  <option>Bengali</option>
                  <option>Marathi</option>
                  <option>Gujarati</option>
                </select>
              </Field>
              <Field label="Religion">
                <select className={selectCls} value={form.religion} onChange={e => set("religion", e.target.value)}>
                  <option value="">Select religion</option>
                  <option>Hindu</option>
                  <option>Muslim</option>
                  <option>Christian</option>
                  <option>Sikh</option>
                  <option>Buddhist</option>
                  <option>Jain</option>
                  <option>Other</option>
                </select>
              </Field>
              <Field label="Occupation">
                <input className={inputCls} placeholder="Enter occupation" value={form.occupation} onChange={e => set("occupation", e.target.value)} />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              <Field label="Phone Number" required>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1 h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 whitespace-nowrap">
                    🇮🇳 +91
                  </div>
                  <input className={inputCls} placeholder="Enter phone number" value={form.phoneNumber} onChange={e => set("phoneNumber", e.target.value)} />
                </div>
              </Field>
              <Field label="Alternate Number">
                <div className="flex gap-2">
                  <div className="flex items-center gap-1 h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 whitespace-nowrap">
                    🇮🇳 +91
                  </div>
                  <input className={inputCls} placeholder="Enter alternate number" value={form.alternatePhone} onChange={e => set("alternatePhone", e.target.value)} />
                </div>
              </Field>
              <Field label="Email Address">
                <input type="email" className={inputCls} placeholder="Enter email address" value={form.email} onChange={e => set("email", e.target.value)} />
              </Field>
              <Field label="Aadhaar Number">
                <input className={inputCls} placeholder="Enter aadhaar number" maxLength={12} value={form.aadhaarNumber} onChange={e => set("aadhaarNumber", e.target.value)} />
              </Field>
              <Field label="PAN Number">
                <input className={inputCls} placeholder="Enter PAN number" value={form.panNumber} onChange={e => set("panNumber", e.target.value.toUpperCase())} />
              </Field>
            </div>
          </Section>
        </div>

        {/* Address Information */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <Section icon={MapPin} title="Address Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Address Line 1">
                <input className={inputCls} placeholder="House no., Building, Street" value={form.addressLine1} onChange={e => set("addressLine1", e.target.value)} />
              </Field>
              <Field label="Address Line 2">
                <input className={inputCls} placeholder="Area, Landmark (Optional)" value={form.addressLine2} onChange={e => set("addressLine2", e.target.value)} />
              </Field>
              <Field label="City">
                <input className={inputCls} placeholder="Enter city" value={form.city} onChange={e => set("city", e.target.value)} />
              </Field>
              <Field label="State" required>
                <select className={selectCls} value={form.state} onChange={e => set("state", e.target.value)}>
                  <option value="">Select state</option>
                  {INDIA_STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="PIN Code" required>
                <input className={inputCls} placeholder="Enter PIN code" maxLength={6} value={form.pinCode} onChange={e => set("pinCode", e.target.value)} />
              </Field>
              <Field label="Country" required>
                <select className={selectCls} value={form.country} onChange={e => set("country", e.target.value)}>
                  <option>India</option>
                  <option>Other</option>
                </select>
              </Field>
            </div>
          </Section>
        </div>

        {/* Emergency Contact + Medical Information — two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Emergency Contact */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <Section icon={Phone} title="Emergency Contact">
              <div className="space-y-3">
                <Field label="Contact Person Name" required>
                  <input className={inputCls} placeholder="Enter contact person name" value={form.emergencyContactName} onChange={e => set("emergencyContactName", e.target.value)} />
                </Field>
                <Field label="Relationship" required>
                  <select className={selectCls} value={form.emergencyRelationship} onChange={e => set("emergencyRelationship", e.target.value)}>
                    <option value="">Select relationship</option>
                    <option>Spouse</option>
                    <option>Parent</option>
                    <option>Child</option>
                    <option>Sibling</option>
                    <option>Friend</option>
                    <option>Other</option>
                  </select>
                </Field>
                <Field label="Phone Number">
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1 h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 whitespace-nowrap">🇮🇳 +91</div>
                    <input className={inputCls} placeholder="Enter phone number" value={form.emergencyPhone} onChange={e => set("emergencyPhone", e.target.value)} />
                  </div>
                </Field>
                <Field label="Alternate Phone">
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1 h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 whitespace-nowrap">🇮🇳 +91</div>
                    <input className={inputCls} placeholder="Enter alternate number" value={form.emergencyAlternatePhone} onChange={e => set("emergencyAlternatePhone", e.target.value)} />
                  </div>
                </Field>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sameAddress"
                    checked={form.sameAsPatientAddress}
                    onChange={e => set("sameAsPatientAddress", e.target.checked)}
                    className="w-4 h-4 accent-[#0F5C3A]"
                  />
                  <label htmlFor="sameAddress" className="text-sm text-gray-600 cursor-pointer">Same as patient address</label>
                </div>
                {!form.sameAsPatientAddress && (
                  <Field label="Address">
                    <input className={inputCls} placeholder="Enter address" value={form.emergencyAddress} onChange={e => set("emergencyAddress", e.target.value)} />
                  </Field>
                )}
              </div>
            </Section>
          </div>

          {/* Medical Information */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <Section icon={Heart} title="Medical Information">
              <div className="space-y-3">
                <Field label="Known Allergies">
                  <input className={inputCls} placeholder="Enter allergies (if any)" value={form.knownAllergies} onChange={e => set("knownAllergies", e.target.value)} />
                </Field>
                <Field label="Chronic Conditions">
                  <input className={inputCls} placeholder="Enter chronic conditions (if any)" value={form.chronicConditions} onChange={e => set("chronicConditions", e.target.value)} />
                </Field>
                <Field label="Past Surgeries">
                  <input className={inputCls} placeholder="Enter past surgeries (if any)" value={form.pastSurgeries} onChange={e => set("pastSurgeries", e.target.value)} />
                </Field>
                <Field label="Current Medications">
                  <input className={inputCls} placeholder="Enter current medications" value={form.currentMedications} onChange={e => set("currentMedications", e.target.value)} />
                </Field>
                <Field label="Family Medical History">
                  <input className={inputCls} placeholder="Enter family medical history" value={form.familyMedicalHistory} onChange={e => set("familyMedicalHistory", e.target.value)} />
                </Field>
                <Field label="Smoking Status">
                  <select className={selectCls} value={form.smokingStatus} onChange={e => set("smokingStatus", e.target.value)}>
                    <option value="">Select status</option>
                    <option>Never</option>
                    <option>Former</option>
                    <option>Current</option>
                  </select>
                </Field>
                <Field label="Alcohol Consumption">
                  <select className={selectCls} value={form.alcoholConsumption} onChange={e => set("alcoholConsumption", e.target.value)}>
                    <option value="">Select status</option>
                    <option>None</option>
                    <option>Occasional</option>
                    <option>Moderate</option>
                    <option>Heavy</option>
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Insurance Provider">
                    <input className={inputCls} placeholder="Enter provider" value={form.insuranceProvider} onChange={e => set("insuranceProvider", e.target.value)} />
                  </Field>
                  <Field label="Insurance Number">
                    <input className={inputCls} placeholder="Enter number" value={form.insuranceNumber} onChange={e => set("insuranceNumber", e.target.value)} />
                  </Field>
                </div>
              </div>
            </Section>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <Section icon={FileText} title="Additional Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Patient ID (Auto)">
                <input className={inputCls + " bg-gray-50 font-mono text-xs"} value={form.patientId} readOnly />
              </Field>
              <Field label="Registration Date">
                <input type="date" className={inputCls} value={form.registrationDate} onChange={e => set("registrationDate", e.target.value)} />
              </Field>
              <Field label="Referred By (Doctor)">
                <select className={selectCls} value={form.referredBy} onChange={e => set("referredBy", e.target.value)}>
                  <option value="">Select doctor (optional)</option>
                  <option>Dr. Rajesh Kumar</option>
                  <option>Dr. Priya Sharma</option>
                  <option>Dr. Anil Verma</option>
                </select>
              </Field>
              <Field label="Notes">
                <input className={inputCls} placeholder="Enter any additional notes" value={form.notes} onChange={e => set("notes", e.target.value)} />
              </Field>
            </div>
          </Section>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-[#0F5C3A] text-white rounded-xl font-bold text-sm hover:bg-[#0A3E2A] transition shadow-lg shadow-emerald-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              : <><UserPlus className="w-4 h-4" /> Save Patient</>}
          </button>
        </div>
      </form>
    </div>
  );
}
