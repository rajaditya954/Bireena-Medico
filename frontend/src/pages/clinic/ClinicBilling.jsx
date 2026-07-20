import React, { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Calendar,
  IndianRupee,
  FileText,
  Printer,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("aarogya_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const getStatusBadge = (status) => {
  const normalized = (status || "pending").toUpperCase();
  const styles = {
    PAID: "bg-green-50 text-green-700 border-green-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    UNPAID: "bg-red-50 text-red-700 border-red-200",
    DRAFT: "bg-gray-50 text-gray-600 border-gray-200",
    CANCELLED: "bg-red-50 text-red-500 border-red-200",
    FAILED: "bg-red-50 text-red-700 border-red-200",
  };
  const icons = {
    PAID: <CheckCircle className="w-3 h-3" />,
    PENDING: <Clock className="w-3 h-3" />,
    UNPAID: <AlertCircle className="w-3 h-3" />,
  };
  const style = styles[normalized] || "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}>
      {icons[normalized] || null}
      {normalized}
    </span>
  );
};

const ClinicBilling = () => {
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedBilling, setSelectedBilling] = useState(null);

  const fetchBillings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/billing`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      setBillings(data?.data || []);
    } catch (error) {
      console.error("Failed to fetch billings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillings();
  }, []);

  // Filter billings
  const filteredBillings = billings.filter((bill) => {
    const patientName = bill.patientId?.fullName || "";
    const billingId = bill.billingId || "";
    const invoiceNumber = bill.invoiceNumber || "";

    const matchesSearch =
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      billingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const billStatus = (bill.paymentStatus || bill.status || "").toUpperCase();
    const matchesStatus =
      statusFilter === "all" || billStatus === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredBillings.length / rowsPerPage);
  const paginatedBillings = filteredBillings.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Stats
  const totalBilled = billings.reduce((sum, b) => sum + Number(b.total || 0), 0);
  const totalPaid = billings.reduce(
    (sum, b) => sum + Number(b.paymentSummary?.paidAmount || 0),
    0
  );
  const totalPending = billings.filter(
    (b) => (b.paymentStatus || b.status || "").toUpperCase() === "PENDING"
  ).length;

  const handlePrint = (bill) => {
    const printWindow = window.open("", "_blank", "width=800,height=600");
    printWindow.document.write(`
      <html>
        <head><title>Invoice - ${bill.billingId}</title>
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
          <h1>Bireena Medico - Invoice</h1>
          <p><strong>Invoice No:</strong> ${bill.invoiceNumber || bill.billingId}</p>
          <p><strong>Patient:</strong> ${bill.patientId?.fullName || "N/A"} (${bill.patientId?.patientId || "N/A"})</p>
          <p><strong>Date:</strong> ${new Date(bill.createdAt).toLocaleDateString("en-IN")}</p>
          <h3>Items</h3>
          <table>
            <thead><tr><th>Service</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr></thead>
            <tbody>
              ${(bill.items || [])
                .map(
                  (item) => `
                <tr>
                  <td>${item.serviceName || "Service"}</td>
                  <td>${item.quantity || 1}</td>
                  <td>₹${Number(item.unitPrice || 0).toFixed(2)}</td>
                  <td>₹${Number(item.amount || 0).toFixed(2)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <br/>
          <p><strong>Subtotal:</strong> ₹${Number(bill.subtotal || 0).toFixed(2)}</p>
          <p><strong>Tax:</strong> ₹${Number(bill.tax || 0).toFixed(2)}</p>
          <p><strong>Discount:</strong> ₹${Number(bill.discount || 0).toFixed(2)}</p>
          <p><strong>Total:</strong> ₹${Number(bill.total || 0).toFixed(2)}</p>
          <p><strong>Paid:</strong> ₹${Number(bill.paymentSummary?.paidAmount || 0).toFixed(2)}</p>
          <p><strong>Due:</strong> ₹${Number(bill.paymentSummary?.dueAmount || 0).toFixed(2)}</p>
          <hr />
          <p style="text-align:center; color:#888; font-size:12px;">Generated from Bireena Medico Hospital System</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="min-h-screen bg-[#F2F9F6] p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#06402B] tracking-tight">Clinic Billing</h1>
          <p className="text-gray-500 text-sm">View and manage all billing and invoice records.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-emerald-600">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Billed</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">₹{totalBilled.toLocaleString("en-IN")}</p>
            <p className="text-xs text-gray-400 mt-1">{billings.length} records</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-600">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Collected</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">₹{totalPaid.toLocaleString("en-IN")}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-amber-600">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Pending Bills</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalPending}</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient name, billing ID, or invoice..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm font-medium text-gray-700"
            >
              <option value="all">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="UNPAID">Unpaid</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Billing Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <span className="ml-3 text-gray-500 text-sm">Loading billing records...</span>
            </div>
          ) : filteredBillings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <FileText className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-sm font-medium">No billing records found</p>
              <p className="text-xs mt-1">Billing records will appear here when invoices are generated.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Billing ID</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Patient</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Items</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Paid</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="text-center px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paginatedBillings.map((bill) => (
                      <tr key={bill._id} className="hover:bg-gray-50/30 transition">
                        <td className="px-5 py-3.5">
                          <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {bill.billingId || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                              {bill.patientId?.fullName
                                ?.split(" ")
                                ?.map((n) => n[0])
                                ?.join("")
                                ?.slice(0, 2)
                                ?.toUpperCase() || "?"}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{bill.patientId?.fullName || "N/A"}</p>
                              <p className="text-[10px] text-gray-400 font-mono">{bill.patientId?.patientId || ""}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                          {bill.createdAt
                            ? new Date(bill.createdAt).toLocaleDateString("en-IN")
                            : "—"}
                        </td>
                        <td className="px-5 py-3.5 text-gray-700">
                          {bill.items?.length || 0} items
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-gray-800">
                          ₹{(bill.total || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="px-5 py-3.5 text-gray-700">
                          ₹{(bill.paymentSummary?.paidAmount || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="px-5 py-3.5">
                          {getStatusBadge(bill.paymentStatus || bill.status)}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedBilling(bill)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition"
                            >
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                            <button
                              onClick={() => handlePrint(bill)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-200 transition"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
                <span>
                  Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
                  {Math.min(currentPage * rowsPerPage, filteredBillings.length)} of {filteredBillings.length} records
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
                      Page {currentPage} of {totalPages || 1}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Billing Detail Modal */}
      {selectedBilling && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedBilling(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#06402B]">Billing Details</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePrint(selectedBilling)}
                  className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedBilling(null)}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Patient & Billing Info */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                    {selectedBilling.patientId?.fullName?.charAt(0) || "?"}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedBilling.patientId?.fullName || "N/A"}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Patient ID: {selectedBilling.patientId?.patientId || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    Bill: {selectedBilling.billingId || "—"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {selectedBilling.createdAt
                      ? new Date(selectedBilling.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "—"}
                  </div>
                  <div className="flex items-center gap-2">
                    Status: {getStatusBadge(selectedBilling.paymentStatus || selectedBilling.status)}
                  </div>
                  {selectedBilling.invoiceNumber && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      Invoice: {selectedBilling.invoiceNumber}
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              {selectedBilling.items && selectedBilling.items.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Items / Services</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-2 text-xs font-semibold">Service</th>
                          <th className="text-left p-2 text-xs font-semibold">Description</th>
                          <th className="text-left p-2 text-xs font-semibold">Qty</th>
                          <th className="text-left p-2 text-xs font-semibold">Unit Price</th>
                          <th className="text-left p-2 text-xs font-semibold">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBilling.items.map((item, idx) => (
                          <tr key={idx} className="border-b border-gray-50">
                            <td className="p-2 font-medium">{item.serviceName || "Service"}</td>
                            <td className="p-2 text-gray-500">{item.description || "—"}</td>
                            <td className="p-2">{item.quantity || 1}</td>
                            <td className="p-2">₹{Number(item.unitPrice || 0).toFixed(2)}</td>
                            <td className="p-2 font-semibold">₹{Number(item.amount || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Billing Summary */}
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-800">₹{Number(selectedBilling.subtotal || 0).toFixed(2)}</span>
                </div>
                {Number(selectedBilling.tax || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium text-gray-800">₹{Number(selectedBilling.tax || 0).toFixed(2)}</span>
                  </div>
                )}
                {Number(selectedBilling.discount || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-green-600">-₹{Number(selectedBilling.discount || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-2">
                  <span className="text-gray-800">Total</span>
                  <span className="text-[#06402B]">₹{Number(selectedBilling.total || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="font-semibold text-emerald-700">
                    ₹{Number(selectedBilling.paymentSummary?.paidAmount || 0).toFixed(2)}
                  </span>
                </div>
                {Number(selectedBilling.paymentSummary?.dueAmount || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount Due</span>
                    <span className="font-semibold text-red-600">
                      ₹{Number(selectedBilling.paymentSummary?.dueAmount || 0).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedBilling.notes && (
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Notes</span>
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
                    "{selectedBilling.notes}"
                  </p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
              <button
                onClick={() => setSelectedBilling(null)}
                className="px-5 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
              <button
                onClick={() => handlePrint(selectedBilling)}
                className="px-5 py-2 rounded-xl bg-[#06402B] text-white flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicBilling;
