import React, { useState, useRef } from "react";
import {
  Search,
  Eye,
  FileText,
  Upload,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  PlusCircle,
  X,
  Printer,
  FilePlus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Mock data for prescribed reports (extended with findings & notes)
const initialReports = [
  {
    id: 1,
    testName: "CBC",
    fullName: "Complete Blood Count (CBC) Lab Report",
    category: "Hematology",
    prescribedOn: "12 May 2025 09:30 AM",
    status: "Pending",
    findings: "Hemoglobin 14.2 g/dL, WBC 7.5 x10^3/µL, Platelets 250 x10^3/µL",
    notes: "All values within normal reference range.",
    resultStatus: "Normal",
    testDate: "12 May 2025",
    attachments: [],
  },
  {
    id: 2,
    testName: "LFT",
    fullName: "Liver Function Test (LFT) Lab Report",
    category: "Biochemistry",
    prescribedOn: "12 May 2025 09:30 AM",
    status: "Pending",
    findings: "ALT 32 U/L, AST 28 U/L, ALP 85 U/L, Total Bilirubin 0.8 mg/dL",
    notes: "Liver enzymes within normal limits.",
    resultStatus: "Normal",
    testDate: "12 May 2025",
    attachments: [],
  },
  {
    id: 3,
    testName: "X-RAY",
    fullName: "Chest X-Ray Imaging",
    category: "Radiology",
    prescribedOn: "12 May 2025 09:30 AM",
    status: "Completed",
    findings: "No cardiomegaly. Lungs are clear. No pleural effusion.",
    notes: "Normal chest X-ray.",
    resultStatus: "Normal",
    testDate: "11 May 2025",
    attachments: [{ name: "xray_result.pdf", url: "#" }],
  },
  {
    id: 4,
    testName: "ECG",
    fullName: "Electrocardiogram (ECG) Cardiology",
    category: "Cardiology",
    prescribedOn: "12 May 2025 09:30 AM",
    status: "Completed",
    findings: "Normal sinus rhythm. Rate 72 bpm. No ischemic changes.",
    notes: "ECG normal.",
    resultStatus: "Normal",
    testDate: "12 May 2025",
    attachments: [],
  },
  {
    id: 5,
    testName: "UR",
    fullName: "Urine Routine Examination Lab Report",
    category: "Microbiology",
    prescribedOn: "12 May 2025 09:30 AM",
    status: "In Progress",
    findings: "Pending culture sensitivity.",
    notes: "Awaiting final report.",
    resultStatus: "Pending",
    testDate: "12 May 2025",
    attachments: [],
  },
];

// Patient profile (same as before)
const patientInfo = {
  id: "PAT-0001",
  name: "Alice Cooper",
  gender: "Female",
  age: 34,
  phone: "+91 98765 43210",
  email: "alice.cooper@email.com",
  address: "Medical District, Hyderabad",
  lastAppointment: "12 May 2025, 09:30 AM",
  doctor: "Dr. Michael Brown",
  specialty: "General Physician",
};

const DoctorReports = () => {
  const [reports, setReports] = useState(initialReports);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);     // for report detail modal
  const [showIssueModal, setShowIssueModal] = useState(false);    // for issue report modal
  const [issueForm, setIssueForm] = useState({
    reportType: "",
    testDate: new Date().toISOString().split("T")[0],
    resultStatus: "",
    findings: "",
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [findingsChars, setFindingsChars] = useState(0);
  const printRef = useRef();

  // Filter reports based on search
  const filteredReports = reports.filter(
    (r) =>
      r.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ---------- Report Detail Modal ----------
  const handleViewReport = (report) => {
    setSelectedReport(report);
  };

  const closeDetailModal = () => {
    setSelectedReport(null);
  };

  const handlePrintReport = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const printWindow = window.open("", "_blank", "width=800,height=600");
      printWindow.document.write(`
        <html>
          <head><title>Report - ${selectedReport?.testName}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 2rem; }
            h1 { color: #06402B; }
            .label { font-weight: 600; color: #4B5563; }
          </style>
          </head>
          <body>${printContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // ---------- Issue Report Modal ----------
  const handleIssueChange = (field, value) => {
    setIssueForm({ ...issueForm, [field]: value });
  };

  const handleFindingsChange = (e) => {
    const val = e.target.value;
    setIssueForm({ ...issueForm, findings: val });
    setFindingsChars(val.length);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      setUploadedFile(file);
    } else {
      alert("File size should be less than 10MB");
    }
  };

  const handleSubmitIssue = (e) => {
    e.preventDefault();
    // Simulate API call
    const newReport = {
      id: reports.length + 1,
      testName: issueForm.reportType.split(" ")[0],
      fullName: issueForm.reportType,
      category: "General",
      prescribedOn: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      status: "Pending",
      findings: issueForm.findings,
      notes: "",
      resultStatus: issueForm.resultStatus,
      testDate: issueForm.testDate,
      attachments: uploadedFile ? [{ name: uploadedFile.name, url: "#" }] : [],
    };
    setReports([newReport, ...reports]);
    alert(`Report issued for ${issueForm.reportType || "selected test"}`);
    setIssueForm({
      reportType: "",
      testDate: new Date().toISOString().split("T")[0],
      resultStatus: "",
      findings: "",
    });
    setUploadedFile(null);
    setFindingsChars(0);
    setShowIssueModal(false);
  };

  // Status badge styling
  const getStatusBadge = (status) => {
    const styles = {
      Pending: "bg-amber-50 text-amber-700 border-amber-200",
      Completed: "bg-green-50 text-green-700 border-green-200",
      "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
    };
    return styles[status] || "bg-gray-50 text-gray-600 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-[#F2F9F6] p-6">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Reports List */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#06402B] tracking-tight">Reports</h1>
              <p className="text-gray-500">View and manage all prescribed reports and test results.</p>
            </div>
            <button
              onClick={() => setShowIssueModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#06402B] text-white rounded-xl font-semibold shadow-md hover:bg-emerald-800 transition"
            >
              <FilePlus className="w-4 h-4" /> Issue New Report
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports by name or test type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 outline-none"
            />
          </div>

          {/* Prescribed Reports Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-[#06402B]">Prescribed Reports</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Report / Test Name</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Prescribed On</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50/30 transition cursor-pointer" onClick={() => handleViewReport(report)}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-bold text-gray-900">{report.testName}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{report.fullName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{report.category}</td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{report.prescribedOn}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(report.status)}`}>
                          {report.status}
                        </span>
                       </td>
                      <td className="px-6 py-4">
                        {report.status === "Pending" ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleViewReport(report); }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition"
                          >
                            <PlusCircle className="w-3.5 h-3.5" /> Add Result
                          </button>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleViewReport(report); }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Result
                          </button>
                        )}
                       </td>
                     </tr>
                  ))}
                </tbody>
              </table>
              {filteredReports.length === 0 && (
                <div className="p-12 text-center text-gray-400">No reports found</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Clinical Profile (unchanged) */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm sticky top-6">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#06402B]">Clinical Profile</h2>
              <p className="text-xs text-gray-400">Digital Medical Record</p>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-2xl font-bold">AC</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{patientInfo.name}</h3>
                  <div className="flex gap-2 text-sm text-gray-500 mt-1">
                    <span>{patientInfo.gender}</span>•<span>{patientInfo.age} Years</span>
                  </div>
                  <p className="text-xs text-gray-400 font-mono mt-1">Patient ID: {patientInfo.id}</p>
                </div>
              </div>
              <div className="mb-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm"><Phone className="w-4 h-4 text-gray-400" /><span>{patientInfo.phone}</span></div>
                  <div className="flex items-center gap-3 text-sm"><Mail className="w-4 h-4 text-gray-400" /><span>{patientInfo.email}</span></div>
                  <div className="flex items-center gap-3 text-sm"><MapPin className="w-4 h-4 text-gray-400" /><span>{patientInfo.address}</span></div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Appointment Info</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm"><Calendar className="w-4 h-4 text-gray-400" /><span>{patientInfo.lastAppointment}</span></div>
                  <div className="flex items-center gap-3 text-sm"><User className="w-4 h-4 text-gray-400" /><span>{patientInfo.doctor}</span></div>
                  <div className="flex items-center gap-3 text-sm"><AlertCircle className="w-4 h-4 text-gray-400" /><span>{patientInfo.specialty}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Modal: Report Details ---------- */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <h3 className="text-xl font-bold text-[#06402B]">Report Details</h3>
                <div className="flex gap-2">
                  <button onClick={handlePrintReport} className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition">
                    <Printer className="w-5 h-5" />
                  </button>
                  <button onClick={closeDetailModal} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div ref={printRef} className="p-6 space-y-5">
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-blue-100 text-blue-700"><FileText className="w-5 h-5" /></div>
                    <span className="text-sm font-semibold text-gray-500">Lab Report</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedReport.fullName}</h2>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>Test: {selectedReport.testName}</span>
                    <span>•</span>
                    <span>Category: {selectedReport.category}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><span className="text-xs font-bold text-gray-400 uppercase">Prescribed On</span><p className="text-gray-800">{selectedReport.prescribedOn}</p></div>
                  <div><span className="text-xs font-bold text-gray-400 uppercase">Test Date</span><p className="text-gray-800">{selectedReport.testDate || "—"}</p></div>
                  <div><span className="text-xs font-bold text-gray-400 uppercase">Status</span><p><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(selectedReport.status)}`}>{selectedReport.status}</span></p></div>
                  <div><span className="text-xs font-bold text-gray-400 uppercase">Result Status</span><p className="text-gray-800">{selectedReport.resultStatus || "—"}</p></div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Findings / Result</h4>
                  <div className="bg-gray-50 p-3 rounded-lg text-gray-700 whitespace-pre-wrap">{selectedReport.findings || "No findings entered."}</div>
                </div>
                {selectedReport.notes && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Clinical Notes</h4>
                    <p className="text-gray-700">{selectedReport.notes}</p>
                  </div>
                )}
                {selectedReport.attachments?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Attachments</h4>
                    <ul className="list-disc list-inside text-blue-600">
                      {selectedReport.attachments.map((att, idx) => <li key={idx}>{att.name}</li>)}
                    </ul>
                  </div>
                )}
              </div>
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                <button onClick={closeDetailModal} className="px-5 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100">Close</button>
                <button onClick={handlePrintReport} className="px-5 py-2 rounded-xl bg-[#06402B] text-white flex items-center gap-2"> <Printer className="w-4 h-4" /> Print </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------- Modal: Issue New Report ---------- */}
      <AnimatePresence>
        {showIssueModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <h3 className="text-xl font-bold text-[#06402B]">Issue Lab Report</h3>
                <button onClick={() => setShowIssueModal(false)} className="p-2 text-gray-500 hover:text-red-500 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmitIssue} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Report / Test *</label>
                  <select value={issueForm.reportType} onChange={(e) => handleIssueChange("reportType", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" required>
                    <option value="">Select Report</option>
                    <option>Complete Blood Count (CBC)</option><option>Liver Function Test (LFT)</option>
                    <option>Chest X-Ray</option><option>Electrocardiogram (ECG)</option><option>Urine Routine</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Test Date *</label><input type="date" value={issueForm.testDate} onChange={(e) => handleIssueChange("testDate", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 rounded-xl" required /></div>
                  <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Result Status *</label><select value={issueForm.resultStatus} onChange={(e) => handleIssueChange("resultStatus", e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 rounded-xl" required><option value="">Select</option><option>Normal</option><option>Abnormal</option><option>Critical</option><option>Pending</option></select></div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Test Result / Findings *</label>
                  <textarea value={issueForm.findings} onChange={handleFindingsChange} rows={4} placeholder="Enter test result or findings..." className="w-full px-4 py-3 bg-gray-50 rounded-xl resize-none" required />
                  <div className="text-right text-xs text-gray-400 mt-2">{findingsChars} / 2000</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Upload files (optional)</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-emerald-300 transition">
                    <input type="file" id="issueFileUpload" accept=".pdf,.jpg,.png" onChange={handleFileUpload} className="hidden" />
                    <label htmlFor="issueFileUpload" className="cursor-pointer flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-gray-400" /><span className="text-sm text-gray-500">PDF, JPG, PNG (Max 10MB)</span>
                      {uploadedFile && <span className="text-xs text-emerald-600 mt-1">{uploadedFile.name}</span>}
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowIssueModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-[#06402B] text-white rounded-xl font-bold shadow-md hover:bg-emerald-800">Issue & Save Report</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorReports;