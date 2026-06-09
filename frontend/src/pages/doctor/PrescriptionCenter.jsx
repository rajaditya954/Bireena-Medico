import React, { useState } from "react";
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  MapPin,
  User,
  AlertCircle
} from "lucide-react";

// Helper to format date as dd mmm yyyy
const formatDate = (date) => {
  const d = new Date(date);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

export default function PrescriptionCenter() {
  // ---------------------- State ----------------------
  const [diagnosis, setDiagnosis] = useState("");
  const [diagnosisChars, setDiagnosisChars] = useState(0);

  // Medications table
  const [medications, setMedications] = useState([
    {
      id: 1,
      medicine: "Amoxicillin 500mg Tablet",
      dosage: "1 Tablet",
      frequency: "Twice a day",
      duration: "5 Days",
      instructions: "After food",
    },
    {
      id: 2,
      medicine: "Paracetamol 650mg Tablet",
      dosage: "1 Tablet",
      frequency: "Thrice a day",
      duration: "3 Days",
      instructions: "After food if needed",
    },
  ]);

  // Reports table
  const [reports, setReports] = useState([
    {
      id: 1,
      reportName: "CBP Complete Blood Picture Blood Test",
      suggestedDate: "2025-05-13",
      priority: "Routine",
    },
  ]);

  // Lab report form
  const [labReport, setLabReport] = useState({
    testType: "",
    testDate: formatDate(new Date()),
    resultStatus: "",
    findings: "",
  });
  const [findingsChars, setFindingsChars] = useState(0);

  // ---------------------- Handlers ----------------------
  const handleDiagnosisChange = (e) => {
    const val = e.target.value;
    setDiagnosis(val);
    setDiagnosisChars(val.length);
  };

  // Medication handlers
  const addMedication = () => {
    const newId = Math.max(...medications.map(m => m.id), 0) + 1;
    setMedications([
      ...medications,
      {
        id: newId,
        medicine: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      },
    ]);
  };

  const updateMedication = (id, field, value) => {
    setMedications(medications.map(med =>
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  const removeMedication = (id) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  // Report handlers
  const addReport = () => {
    const newId = Math.max(...reports.map(r => r.id), 0) + 1;
    setReports([
      ...reports,
      {
        id: newId,
        reportName: "",
        suggestedDate: "",
        priority: "Routine",
      },
    ]);
  };

  const updateReport = (id, field, value) => {
    setReports(reports.map(rpt =>
      rpt.id === id ? { ...rpt, [field]: value } : rpt
    ));
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
    // In real app, send to backend
    alert("Lab report issued successfully!");
    setLabReport({
      testType: "",
      testDate: formatDate(new Date()),
      resultStatus: "",
      findings: "",
    });
    setFindingsChars(0);
  };

  return (
    <div className="min-h-screen bg-[#F2F9F6] p-6">
      {/* Two-column layout */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Add Prescription Form */}
        <div className="xl:col-span-2 space-y-6">
          {/* Diagnosis Section */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#06402B] mb-4">Diagnosis &amp; Impressions</h2>
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
                        <input
                          type="text"
                          value={med.medicine}
                          onChange={(e) => updateMedication(med.id, "medicine", e.target.value)}
                          placeholder="e.g., Amoxicillin 500mg"
                          className="w-full px-2 py-1.5 bg-gray-50 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) => updateMedication(med.id, "dosage", e.target.value)}
                          placeholder="e.g., 1 Tablet"
                          className="w-full px-2 py-1.5 bg-gray-50 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={med.frequency}
                          onChange={(e) => updateMedication(med.id, "frequency", e.target.value)}
                          placeholder="e.g., Twice a day"
                          className="w-full px-2 py-1.5 bg-gray-50 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => updateMedication(med.id, "duration", e.target.value)}
                          placeholder="e.g., 5 Days"
                          className="w-full px-2 py-1.5 bg-gray-50 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={med.instructions}
                          onChange={(e) => updateMedication(med.id, "instructions", e.target.value)}
                          placeholder="e.g., After food"
                          className="w-full px-2 py-1.5 bg-gray-50 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          onClick={() => removeMedication(med.id)}
                          className="text-gray-400 hover:text-red-500 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={addMedication}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition"
            >
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
                        <input
                          type="text"
                          value={rpt.reportName}
                          onChange={(e) => updateReport(rpt.id, "reportName", e.target.value)}
                          placeholder="e.g., Complete Blood Count"
                          className="w-full px-2 py-1.5 bg-gray-50 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="date"
                          value={rpt.suggestedDate}
                          onChange={(e) => updateReport(rpt.id, "suggestedDate", e.target.value)}
                          className="px-2 py-1.5 bg-gray-50 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <select
                          value={rpt.priority}
                          onChange={(e) => updateReport(rpt.id, "priority", e.target.value)}
                          className="w-full px-2 py-1.5 bg-gray-50 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                        >
                          <option>Routine</option>
                          <option>Urgent</option>
                          <option>Stat</option>
                        </select>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          onClick={() => removeReport(rpt.id)}
                          className="text-gray-400 hover:text-red-500 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={addReport}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition"
            >
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
                  <select
                    value={labReport.testType}
                    onChange={(e) => handleLabReportChange("testType", e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  >
                    <option value="">Select Report</option>
                    <option>Complete Blood Count</option>
                    <option>Lipid Profile</option>
                    <option>Thyroid Function Test</option>
                    <option>Liver Function Test</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Test Date *</label>
                  <input
                    type="date"
                    value={labReport.testDate}
                    onChange={(e) => handleLabReportChange("testDate", e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Result Status *</label>
                <select
                  value={labReport.resultStatus}
                  onChange={(e) => handleLabReportChange("resultStatus", e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                >
                  <option value="">Select Status</option>
                  <option>Normal</option>
                  <option>Abnormal</option>
                  <option>Pending</option>
                  <option>Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Test Result / Findings *</label>
                <textarea
                  value={labReport.findings}
                  onChange={handleFindingsChange}
                  rows={4}
                  placeholder="Enter test result or findings..."
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  required
                />
                <div className="text-right text-xs text-gray-400 mt-2">
                  {findingsChars} / 2000
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-[#06402B] text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:scale-[1.01] transition-all"
              >
                Issue &amp; Save Report
              </button>
            </form>
          </div>
        </div>

        {/* Right Column - Clinical Profile */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm sticky top-6">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#06402B]">Clinical Profile</h2>
              <p className="text-xs text-gray-400">Digital Medical Record</p>
            </div>

            {/* Patient Basic Info */}
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-2xl font-bold">
                  AC
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Alice Cooper</h3>
                  <div className="flex gap-3 text-sm text-gray-500 mt-1">
                    <span>Female</span>
                    <span>•</span>
                    <span>34 Years</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 font-mono">Patient ID: PAT-0001</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">+91 98765 43210</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">alice.cooper@email.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">Medical District, Hyderabad</span>
                  </div>
                </div>
              </div>

              {/* Appointment Info */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Appointment Info</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">12 May 2025, 09:30 AM</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">Dr. Michael Brown</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">General Physician</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}