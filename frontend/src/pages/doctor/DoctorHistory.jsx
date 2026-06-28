import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  Search,
  Eye,
  FileText,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  MoreVertical,
  FileImage,
  Stethoscope,
  ClipboardList,
  X,
  Printer,
  RefreshCw,
} from "lucide-react";
import { api } from "../../lib/api";

const DoctorHistory = () => {
  const location = useLocation();
  const prefillPatient = location.state?.prefillPatient || null;

  const [history, setHistory] = useState([]);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(prefillPatient?.name || prefillPatient?.fullName || "");
  const [typeFilter, setTypeFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.getMyHistory();
      const data = res.data?.data || {};
      setDoctorInfo(data.doctor || null);

      // Map API data to display format
      const mapped = (data.history || []).map((item) => {
        const d = new Date(item.date);
        const dateStr = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
        const timeStr = item.slot || d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

        // Determine type from status
        let type = "Consultation";
        if ((item.status || "").toUpperCase() === "COMPLETED") type = "Completed Visit";
        else if ((item.status || "").toUpperCase() === "CANCELLED") type = "Cancelled";
        else if ((item.status || "").toUpperCase() === "NO_SHOW") type = "No Show";
        else type = "Consultation";

        return {
          id: item.id,
          date: dateStr,
          time: timeStr,
          type: "Consultation",
          details: item.reason || "General Consultation",
          items: item.notes ? [item.notes] : [],
          status: item.status,
          doctor: item.doctor?.name || "Doctor",
          doctorSpecialty: item.doctor?.specialization || "",
          patient: item.patient || { name: "Unknown" },
          note: item.notes || "",
        };
      });

      setHistory(mapped);
    } catch (err) {
      setError(err.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  // Filter history
  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.items.some((i) => i.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.patient?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.note && item.note.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === "all" || 
      (typeFilter === "completed" && (item.status || "").toUpperCase() === "COMPLETED") ||
      (typeFilter === "waiting" && ["WAITING", "ARRIVED", "IN_PROGRESS"].includes((item.status || "").toUpperCase())) ||
      (typeFilter === "cancelled" && (item.status || "").toUpperCase() === "CANCELLED") ||
      (typeFilter === "no_show" && (item.status || "").toUpperCase() === "NO_SHOW");
    return matchesSearch && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredHistory.length / rowsPerPage) || 1;
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const getStatusStyles = (status) => {
    const upper = (status || "").toUpperCase();
    switch (upper) {
      case "COMPLETED":
        return { icon: ClipboardList, color: "bg-emerald-100 text-emerald-700", label: "Completed" };
      case "WAITING":
      case "ARRIVED":
      case "IN_PROGRESS":
      case "SCHEDULED":
        return { icon: Stethoscope, color: "bg-amber-100 text-amber-700", label: upper.replace("_", " ") };
      case "CANCELLED":
        return { icon: AlertCircle, color: "bg-red-100 text-red-700", label: "Cancelled" };
      case "NO_SHOW":
        return { icon: FileImage, color: "bg-gray-100 text-gray-500", label: "No Show" };
      default:
        return { icon: FileText, color: "bg-blue-100 text-blue-700", label: "Consultation" };
    }
  };

  const handleViewDetails = (item) => {
    setSelectedRecord(item);
  };

  const handleCloseModal = () => {
    setSelectedRecord(null);
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const originalTitle = document.title;
      document.title = `Medical Record - ${selectedRecord?.date} ${selectedRecord?.type}`;
      const printWindow = window.open("", "_blank", "width=800,height=600");
      printWindow.document.write(`
        <html>
          <head>
            <title>${document.title}</title>
            <style>
              body { font-family: 'Inter', sans-serif; padding: 2rem; line-height: 1.5; }
              h1 { color: #06402B; border-bottom: 2px solid #06402B; padding-bottom: 0.5rem; }
              .record-detail { margin: 1rem 0; }
              .label { font-weight: 600; color: #4B5563; width: 140px; display: inline-block; }
              .value { color: #1F2937; }
              hr { margin: 1rem 0; }
            </style>
          </head>
          <body>${printContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      document.title = originalTitle;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F9F6] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-semibold">Loading history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F2F9F6] p-8 flex items-center justify-center">
        <div className="bg-white rounded-3xl border border-red-100 p-8 shadow-sm max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">History Error</h2>
          <p className="text-sm text-slate-500">{error}</p>
          <button
            onClick={fetchHistory}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Pick first patient from history for sidebar (or empty)
  const sidebarPatient = selectedRecord?.patient || (history.length > 0 ? history[0].patient : null);

  return (
    <div className="min-h-screen bg-[#F2F9F6] p-6">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - History List */}
        <div className="xl:col-span-2 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[#06402B] tracking-tight">History</h1>
            <p className="text-gray-500">View and manage patient history and past consultations.</p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient, reason, or notes..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-12 pl-12 pr-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 outline-none"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-12 px-4 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500/20 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="waiting">Waiting / In Progress</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>

          {/* History Cards */}
          <div className="space-y-4">
            {paginatedHistory.map((item) => {
              const { icon: TypeIcon, color, label } = getStatusStyles(item.status);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center min-w-[70px]">
                        <span className="text-sm font-bold text-gray-900">{item.date}</span>
                        <span className="text-xs text-gray-400">{item.time}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${color}`}>
                          <TypeIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{item.patient?.name || "Patient"}</div>
                          <div className="text-sm text-gray-600 font-medium">{item.details}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
                              {label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-800">{item.doctor}</div>
                        <div className="text-xs text-gray-400">{item.doctorSpecialty}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(item)}
                          className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewDetails(item)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {paginatedHistory.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
                No history records found.
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredHistory.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
              <div className="text-xs text-gray-500">
                Showing {((currentPage - 1) * rowsPerPage) + 1} to{" "}
                {Math.min(currentPage * rowsPerPage, filteredHistory.length)} of {filteredHistory.length} records
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Rows per page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:ring-emerald-500 outline-none"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    ←
                  </button>
                  <span className="text-sm font-medium text-gray-700 px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Doctor Profile Sidebar */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm sticky top-6">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#06402B]">Doctor Profile</h2>
              <p className="text-xs text-gray-400">Your consultation history</p>
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
                      <div className="text-sm text-emerald-600 font-medium mt-1">
                        {doctorInfo.specialization}
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Qualification</h4>
                    <p className="text-sm text-gray-700">{doctorInfo.qualification || "N/A"}</p>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Experience</h4>
                    <p className="text-sm text-gray-700">{doctorInfo.experience ? `${doctorInfo.experience} Years` : "N/A"}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Consultations</span>
                        <span className="font-bold text-gray-800">{history.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Completed</span>
                        <span className="font-bold text-emerald-600">
                          {history.filter(h => (h.status || "").toUpperCase() === "COMPLETED").length}
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

      {/* Modal for detailed view */}
      {selectedRecord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#06402B]">Record Details</h3>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div ref={printRef} className="p-6 space-y-5">
              {/* Header */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-xl ${getStatusStyles(selectedRecord.status).color}`}>
                    {React.createElement(getStatusStyles(selectedRecord.status).icon, { className: "w-6 h-6" })}
                  </div>
                  <span className="text-sm font-semibold text-gray-500">{getStatusStyles(selectedRecord.status).label}</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedRecord.details}</h2>
                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                  <span>{selectedRecord.date} at {selectedRecord.time}</span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                {selectedRecord.items.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Notes</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {selectedRecord.items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Doctor</h4>
                    <p className="font-medium text-gray-800">{selectedRecord.doctor}</p>
                    <p className="text-sm text-gray-500">{selectedRecord.doctorSpecialty}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Patient</h4>
                    <p className="font-medium text-gray-800">{selectedRecord.patient?.name || "Unknown"}</p>
                    {selectedRecord.patient?.age && (
                      <p className="text-sm text-gray-500">
                        {selectedRecord.patient.age} Y, {selectedRecord.patient.gender || ""}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <hr className="my-2" />
              <div className="text-xs text-gray-400 text-center">
                Generated from Electronic Medical Record System
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
              <button
                onClick={handleCloseModal}
                className="px-5 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="px-5 py-2 rounded-xl bg-[#06402B] text-white hover:bg-emerald-800 transition flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorHistory;