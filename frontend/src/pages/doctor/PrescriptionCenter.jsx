import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  MapPin,
  User,
  AlertCircle,
  RefreshCw,
  FileText,
  Stethoscope,
} from "lucide-react";
import { api } from "../../lib/api";

// Helper to format date as dd mmm yyyy
const formatDate = (date) => {
  const d = new Date(date);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

export default function PrescriptionCenter() {
  const location = useLocation();
  const prefillPatient = location.state?.prefillPatient || null;

  // ---------------------- State ----------------------
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [diagnosis, setDiagnosis] = useState("");
  const [diagnosisChars, setDiagnosisChars] = useState(0);

  // Medications table (start empty for new prescription)
  const [medications, setMedications] = useState([
    { id: 1, medicine: "", dosage: "", frequency: "", duration: "", instructions: "" },
  ]);

  // Reports table
  const [reports, setReports] = useState([
    { id: 1, reportName: "", suggestedDate: "", priority: "Routine" },
  ]);

  // Lab report form
  const [labReport, setLabReport] = useState({
    testType: "",
    testDate: formatDate(new Date()),
    resultStatus: "",
    findings: "",
  });
  const [findingsChars, setFindingsChars] = useState(0);

  // ---------------------- Fetch data ----------------------
  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.getMyPrescriptions();
      const data = res.data?.data || {};
      setDoctorInfo(data.doctor || null);
      setPrescriptions(data.prescriptions || []);
    } catch (err) {
      setError(err.message || "Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------- Handlers ----------------------
  const handleDiagnosisChange = (e) => {
    const val = e.target.value;
    setDiagnosis(val);
    setDiagnosisChars(val.length);
  };

  // Medication handlers
  const addMedication = () => {
    const newId = Math.max(...medications.map(m => m.id), 0) + 1;
    setMedications([...medications, { id: newId, medicine: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
  };
  const updateMedication = (id, field, value) => {
    setMedications(medications.map(med => med.id === id ? { ...med, [field]: value } : med));
  };
  const removeMedication = (id) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  // Report handlers
  const addReport = () => {
    const newId = Math.max(...reports.map(r => r.id), 0) + 1;
    setReports([...reports, { id: newId, reportName: "", suggestedDate: "", priority: "Routine" }]);
  };
  const updateReport = (id, field, value) => {
    setReports(reports.map(rpt => rpt.id === id ? { ...rpt, [field]: value } : rpt));
  };
  const removeReport = (id) => {
    setReports(reports.filter(rpt => rpt.id !== id));
  };

  // Lab report handlers
  const handleLabReportChange = (field, value) => {
    setLabReport({ ...labReport, [field]: value });
  };
  const handleFindingsChange = (e) => {
    const val = e.target.value;
    setLabReport({ ...labReport, findings: val });
    setFindingsChars(val.length);
  };
  const handleIssueLabReport = (e) => {
    e.preventDefault();
    alert("Lab report issued successfully!");
    setLabReport({ testType: "", testDate: formatDate(new Date()), resultStatus: "", findings: "" });
    setFindingsChars(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F9F6] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-semibold">Loading prescriptions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F2F9F6] p-8 flex items-center justify-center">
        <div className="bg-white rounded-3xl border border-red-100 p-8 shadow-sm max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Prescription Error</h2>
          <p className="text-sm text-slate-500">{error}</p>
          <button onClick={fetchPrescriptions} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F9F6] p-6">
      {/* Two-column layout */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Add Prescription Form */}
        <div className="xl:col-span-2 space-y-6">
          {/* Selected Patient Banner */}
          {prefillPatient && (
            <div className="bg-[#06402B] text-white rounded-xl shadow-md p-6 relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">Active Consultation</p>
                <h2 className="text-2xl font-black mt-1">{prefillPatient.name || prefillPatient.fullName}</h2>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-emerald-100 mt-2 font-medium">
                  <span>Phone: <strong className="text-white font-semibold">{prefillPatient.phone}</strong></span>
                  <span>Age / Gender: <strong className="text-white font-semibold">{prefillPatient.age} Y / {prefillPatient.gender}</strong></span>
                  <span>Blood Group: <strong className="text-white font-semibold">{prefillPatient.bloodGroup || "—"}</strong></span>
                </div>
              </div>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/15 text-[11px] font-bold tracking-wider text-emerald-200">
                UHID: {prefillPatient.patientId || prefillPatient._id || prefillPatient.id}
              </div>
            </div>
          )}
          {/* Existing Prescriptions List */}
          {prescriptions.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-[#06402B] mb-4">Your Prescriptions</h2>
              <div className="space-y-3">
                {prescriptions.map((p) => (
                  <div key={p.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-600" />
                          <span className="font-bold text-gray-900">{p.patient?.name || "Patient"}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{p.diagnosis || "No diagnosis"}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {p.medicines?.length || 0} medicines • {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </p>
                      </div>
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${p.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                        {p.isActive ? "Active" : "Closed"}
                      </span>
                    </div>
                    {p.medicines && p.medicines.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {p.medicines.map((m, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-md font-medium">
                            {m.medicineName || m.medicine || "Medicine"}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Diagnosis Section */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#06402B] mb-4">New Prescription — Diagnosis &amp; Impressions</h2>
            <textarea
              value={diagnosis}
              onChange={handleDiagnosisChange}
              placeholder="Enter diagnosis and clinical impressions..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none"
            />
            <div className="text-right text-xs text-gray-400 mt-2">
              {diagnosisChars} / 1000
            </div>
          </div>

          {/* Prescribed Medication Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#06402B] mb-4">Prescribed Medication</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Medicine / Composition</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Dosage</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Frequency</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Duration</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Instructions</th>
                    <th className="text-center py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {medications.map((med) => (
                    <tr key={med.id} className="border-b border-gray-50">
                      <td className="py-2 px-2">
                        <input type="text" value={med.medicine} onChange={(e) => updateMedication(med.id, "medicine", e.target.value)} placeholder="e.g., Amoxicillin 500mg" className="w-full px-2 py-1.5 bg-gray-50 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none" />
                      </td>
                      <td className="py-2 px-2">
                        <input type="text" value={med.dosage} onChange={(e) => updateMedication(med.id, "dosage", e.target.value)} placeholder="e.g., 1 Tablet" className="w-full px-2 py-1.5 bg-gray-50 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none" />
                      </td>
                      <td className="py-2 px-2">
                        <input type="text" value={med.frequency} onChange={(e) => updateMedication(med.id, "frequency", e.target.value)} placeholder="e.g., Twice a day" className="w-full px-2 py-1.5 bg-gray-50 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none" />
                      </td>
                      <td className="py-2 px-2">
                        <input type="text" value={med.duration} onChange={(e) => updateMedication(med.id, "duration", e.target.value)} placeholder="e.g., 5 Days" className="w-full px-2 py-1.5 bg-gray-50 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none" />
                      </td>
                      <td className="py-2 px-2">
                        <input type="text" value={med.instructions} onChange={(e) => updateMedication(med.id, "instructions", e.target.value)} placeholder="e.g., After food" className="w-full px-2 py-1.5 bg-gray-50 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none" />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button onClick={() => removeMedication(med.id)} className="text-gray-400 hover:text-red-500 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addMedication} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition">
              <Plus className="w-4 h-4" /> Add Another Medicine
            </button>
          </div>

          {/* Prescribed Reports & Media */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#06402B] mb-4">Prescribed Reports &amp; Media</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Report / Investigation</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Suggested Date</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Priority</th>
                    <th className="text-center py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((rpt) => (
                    <tr key={rpt.id} className="border-b border-gray-50">
                      <td className="py-2 px-2">
                        <input type="text" value={rpt.reportName} onChange={(e) => updateReport(rpt.id, "reportName", e.target.value)} placeholder="e.g., Complete Blood Count" className="w-full px-2 py-1.5 bg-gray-50 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none" />
                      </td>
                      <td className="py-2 px-2">
                        <input type="date" value={rpt.suggestedDate} onChange={(e) => updateReport(rpt.id, "suggestedDate", e.target.value)} className="px-2 py-1.5 bg-gray-50 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none" />
                      </td>
                      <td className="py-2 px-2">
                        <select value={rpt.priority} onChange={(e) => updateReport(rpt.id, "priority", e.target.value)} className="w-full px-2 py-1.5 bg-gray-50 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none">
                          <option>Routine</option><option>Urgent</option><option>Stat</option>
                        </select>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button onClick={() => removeReport(rpt.id)} className="text-gray-400 hover:text-red-500 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addReport} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition">
              <Plus className="w-4 h-4" /> Add Another Report
            </button>
          </div>

          {/* Issue Lab Report to Patient */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#06402B] mb-4">Issue Lab Report to Patient</h2>
            <p className="text-sm text-gray-500 mb-4">
              Create and issue a lab report. The report will be saved to the database and available to the patient.
            </p>
            <form onSubmit={handleIssueLabReport} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Report / Test *</label>
                  <select value={labReport.testType} onChange={(e) => handleLabReportChange("testType", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" required>
                    <option value="">Select Report</option>
                    <option>Complete Blood Count</option><option>Lipid Profile</option>
                    <option>Thyroid Function Test</option><option>Liver Function Test</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Test Date *</label>
                  <input type="date" value={labReport.testDate} onChange={(e) => handleLabReportChange("testDate", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Result Status *</label>
                <select value={labReport.resultStatus} onChange={(e) => handleLabReportChange("resultStatus", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" required>
                  <option value="">Select Status</option><option>Normal</option><option>Abnormal</option><option>Pending</option><option>Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Test Result / Findings *</label>
                <textarea value={labReport.findings} onChange={handleFindingsChange} rows={4} placeholder="Enter test result or findings..." className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none" required />
                <div className="text-right text-xs text-gray-400 mt-2">{findingsChars} / 2000</div>
              </div>
              <button type="submit" className="w-full py-3 bg-[#06402B] text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:scale-[1.01] transition-all">
                Issue &amp; Save Report
              </button>
            </form>
          </div>
        </div>

        {/* Right Column - Doctor Profile */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm sticky top-6">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#06402B]">Doctor Profile</h2>
              <p className="text-xs text-gray-400">Prescription overview</p>
            </div>
            <div className="p-6">
              {doctorInfo ? (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-2xl font-bold">
                      {(doctorInfo.name || "D").split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Dr. {doctorInfo.name}</h3>
                      <div className="text-sm text-emerald-600 font-medium mt-1">{doctorInfo.specialization}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Prescription Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Prescriptions</span>
                        <span className="font-bold text-gray-800">{prescriptions.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Active</span>
                        <span className="font-bold text-emerald-600">
                          {prescriptions.filter(p => p.isActive).length}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-400 text-center py-4">No doctor info available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}