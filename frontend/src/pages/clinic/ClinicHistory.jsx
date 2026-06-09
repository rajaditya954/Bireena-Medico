import React, { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  FileText,
  Printer,
  X,
  ChevronLeft,
  ChevronRight,
  Pill,
  Stethoscope,
} from "lucide-react";

// Mock history data (prescriptions / medicines given to patients)
const mockHistory = [
  {
    id: 1,
    patientId: "PAT-0001",
    patientName: "Alice Cooper",
    age: 34,
    gender: "Female",
    mobile: "+91 98765 43210",
    address: "221B Baker Street, London",
    date: "12 May 2025",
    time: "09:30 AM",
    doctor: "Dr. Michael Brown",
    specialty: "General Physician",
    medicines: [
      { name: "Paracetamol 650mg Tablet", quantity: 20, dosage: "1 tablet", frequency: "Twice daily", notes: "After food" },
      { name: "Amoxicillin 500mg Capsule", quantity: 15, dosage: "1 capsule", frequency: "Three times daily", notes: "Before food" },
    ],
    totalAmount: 342.0,
    paymentMethod: "cash",
    status: "Completed",
  },
  {
    id: 2,
    patientId: "PAT-0002",
    patientName: "John Doe",
    age: 45,
    gender: "Male",
    mobile: "+91 91234 56789",
    address: "123 Main Street, Mumbai",
    date: "10 May 2025",
    time: "11:00 AM",
    doctor: "Dr. Sarah Johnson",
    specialty: "General Physician",
    medicines: [
      { name: "Cetirizine 10mg Tablet", quantity: 10, dosage: "1 tablet", frequency: "Once daily (night)", notes: "For allergy" },
    ],
    totalAmount: 120.0,
    paymentMethod: "upi",
    status: "Completed",
  },
  {
    id: 3,
    patientId: "PAT-0003",
    patientName: "Robert Brown",
    age: 52,
    gender: "Male",
    mobile: "+91 99887 76655",
    address: "Green Park, Delhi",
    date: "08 May 2025",
    time: "02:30 PM",
    doctor: "Dr. Michael Brown",
    specialty: "General Physician",
    medicines: [
      { name: "Metformin 500mg Tablet", quantity: 30, dosage: "1 tablet", frequency: "Twice daily", notes: "With meals" },
      { name: "Amlodipine 5mg Tablet", quantity: 30, dosage: "1 tablet", frequency: "Once daily", notes: "Morning" },
    ],
    totalAmount: 450.0,
    paymentMethod: "card",
    status: "Completed",
  },
  {
    id: 4,
    patientId: "PAT-0004",
    patientName: "Emily Davis",
    age: 29,
    gender: "Female",
    mobile: "+91 90011 22334",
    address: "Lake View, Chennai",
    date: "05 May 2025",
    time: "10:00 AM",
    doctor: "Dr. Sarah Johnson",
    specialty: "General Physician",
    medicines: [
      { name: "Ibuprofen 400mg Tablet", quantity: 10, dosage: "1 tablet", frequency: "As needed", notes: "For pain" },
    ],
    totalAmount: 220.0,
    paymentMethod: "cash",
    status: "Completed",
  },
  {
    id: 5,
    patientId: "PAT-0001",
    patientName: "Alice Cooper",
    age: 34,
    gender: "Female",
    mobile: "+91 98765 43210",
    address: "221B Baker Street, London",
    date: "28 Apr 2025",
    time: "09:15 AM",
    doctor: "Dr. Michael Brown",
    specialty: "General Physician",
    medicines: [
      { name: "Azithromycin 500mg Tablet", quantity: 6, dosage: "1 tablet", frequency: "Once daily", notes: "For 3 days" },
    ],
    totalAmount: 180.0,
    paymentMethod: "upi",
    status: "Completed",
  },
];

const DoctorHistory = () => {
  const [history, setHistory] = useState(mockHistory);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [dateFilter, setDateFilter] = useState("");

  // Filter history based on search (patient name, ID, medicine, doctor)
  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.medicines.some(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || item.date === dateFilter;
    return matchesSearch && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredHistory.length / rowsPerPage);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Get unique dates for filter
  const uniqueDates = ["", ...new Set(history.map(h => h.date))];

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
  };

  const handleCloseModal = () => {
    setSelectedRecord(null);
  };

  const handlePrint = () => {
    if (selectedRecord) {
      const printWindow = window.open("", "_blank", "width=800,height=600");
      printWindow.document.write(`
        <html>
          <head><title>Prescription - ${selectedRecord.patientName}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 2rem; }
            h1 { color: #06402B; }
            .label { font-weight: 600; color: #4B5563; }
            table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f3f4f6; }
          </style>
          </head>
          <body>
            <h1>Clinic Prescription</h1>
            <p><strong>Patient:</strong> ${selectedRecord.patientName} (${selectedRecord.patientId})</p>
            <p><strong>Date:</strong> ${selectedRecord.date} at ${selectedRecord.time}</p>
            <p><strong>Doctor:</strong> ${selectedRecord.doctor} (${selectedRecord.specialty})</p>
            <h3>Medicines</h3>
            <table>
              <thead><tr><th>Medicine</th><th>Quantity</th><th>Dosage</th><th>Frequency</th><th>Notes</th></tr></thead>
              <tbody>
                ${selectedRecord.medicines.map(m => `
                  <tr><td>${m.name}</td><td>${m.quantity}</td><td>${m.dosage}</td><td>${m.frequency}</td><td>${m.notes || "-"}</td></tr>
                `).join("")}
              </tbody>
            </table>
            <p><strong>Total Amount:</strong> ₹${selectedRecord.totalAmount.toFixed(2)}</p>
            <p><strong>Payment Method:</strong> ${selectedRecord.paymentMethod.toUpperCase()}</p>
            <hr />
            <p class="text-center text-gray-500 text-sm">Generated from Electronic Medical Record System</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F9F6] p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#06402B] tracking-tight">Clinic History</h1>
          <p className="text-gray-500 text-sm">View all patient prescriptions and medicine history.</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient name, ID, medicine, or doctor..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm font-medium text-gray-700"
            >
              {uniqueDates.map((date) => (
                <option key={date || "all"} value={date}>
                  {date === "" ? "All Dates" : date}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Patient</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date & Time</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Doctor</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Medicines</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedHistory.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50/30 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                          {record.patientName.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{record.patientName}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{record.patientId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-gray-800 font-medium">{record.date}</div>
                      <div className="text-xs text-gray-400">{record.time}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-800">{record.doctor}</div>
                      <div className="text-xs text-gray-400">{record.specialty}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {record.medicines.slice(0, 2).map((m, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                            <Pill className="w-2.5 h-2.5" /> {m.name}
                          </span>
                        ))}
                        {record.medicines.length > 2 && (
                          <span className="text-xs text-gray-400">+{record.medicines.length - 2} more</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-gray-800">₹{record.totalAmount.toFixed(2)}</td>
                    <td className="px-5 py-4">
                      <span className="text-xs capitalize bg-gray-100 px-2 py-1 rounded-full">{record.paymentMethod}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleViewDetails(record)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedHistory.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                      No history records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredHistory.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
              <span>
                Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
                {Math.min(currentPage * rowsPerPage, filteredHistory.length)} of {filteredHistory.length} records
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span>Rows per page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-sm"
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
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-medium text-gray-800">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal for detailed view */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={handleCloseModal}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#06402B]">Prescription Details</h3>
              <div className="flex gap-2">
                <button onClick={handlePrint} className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg">
                  <Printer className="w-5 h-5" />
                </button>
                <button onClick={handleCloseModal} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* Patient & Visit Info */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                    {selectedRecord.patientName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedRecord.patientName}</h2>
                    <p className="text-sm text-gray-500">Patient ID: {selectedRecord.patientId}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" />{selectedRecord.date} at {selectedRecord.time}</div>
                  <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400" />{selectedRecord.doctor} ({selectedRecord.specialty})</div>
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" />{selectedRecord.mobile}</div>
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" />{selectedRecord.address}</div>
                </div>
              </div>

              {/* Medicines Table */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Prescribed Medicines</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-2 text-xs font-semibold">Medicine</th>
                        <th className="text-left p-2 text-xs font-semibold">Qty</th>
                        <th className="text-left p-2 text-xs font-semibold">Dosage</th>
                        <th className="text-left p-2 text-xs font-semibold">Frequency</th>
                        <th className="text-left p-2 text-xs font-semibold">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRecord.medicines.map((m, idx) => (
                        <tr key={idx} className="border-b border-gray-50">
                          <td className="p-2">{m.name}</td>
                          <td className="p-2">{m.quantity}</td>
                          <td className="p-2">{m.dosage}</td>
                          <td className="p-2">{m.frequency}</td>
                          <td className="p-2 text-gray-500">{m.notes || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Billing Info */}
              <div className="border-t border-gray-100 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-bold text-gray-800">₹{selectedRecord.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="capitalize bg-gray-100 px-2 py-0.5 rounded-full text-xs">{selectedRecord.paymentMethod}</span>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
              <button onClick={handleCloseModal} className="px-5 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100">Close</button>
              <button onClick={handlePrint} className="px-5 py-2 rounded-xl bg-[#06402B] text-white flex items-center gap-2"> <Printer className="w-4 h-4" /> Print Prescription</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorHistory;