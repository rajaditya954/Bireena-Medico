import React, { useState, useEffect } from "react";
import {
  Package,
  IndianRupee,
  AlertTriangle,
  Calendar,
  TrendingUp,
  PlusCircle,
  Search,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  X,
  Send,
  Pill,
  Trash2,
} from "lucide-react";

// Mock data for medicines //removed
// Quick summary data

/*const stockAlerts = [
  { name: "Cetirizine 10mg", stock: 25, unit: "units" },
  { name: "Salbutamol 100mcg", stock: 15, unit: "units" },
  { name: "Amlodipine 5mg", stock: 60, unit: "units" },
];
const expiryAlerts = [
  { name: "Omeprazole 20mg", expiryDate: "10 Oct 2024", status: "expired" },
  { name: "Salbutamol 100mcg", daysLeft: 45, status: "soon" },
  { name: "Amoxicillin 500mg", daysLeft: 120, status: "soon" },
];
const recentlyAdded = [
  { name: "Cetirizine 10mg", date: "10 May 2025" },
  { name: "Zinc Sulfate 220mg", date: "09 May 2025" },
  { name: "Doxycycline 100mg", date: "08 May 2025" },
];*/

const purchaseOrders = { total: 145, month: "May" };
const salesThisMonth = { amount: 32450, month: "May" };

const getStatusBadge = (status) => {
  const normalized = status || "In Stock";
  const styles = {
    "In Stock": "bg-green-50 text-green-700 border-green-200",
    "Low Stock": "bg-amber-50 text-amber-700 border-amber-200",
    "Out of Stock": "bg-red-50 text-red-700 border-red-200",
  };
  const style = styles[normalized] || "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}>
      {normalized}
    </span>
  );
};

const getReqStatusBadge = (status) => {
  const normalized = status ? status.toUpperCase() : "PENDING";
  const styles = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    APPROVED: "bg-green-50 text-green-700 border-green-200",
    REJECTED: "bg-red-50 text-red-700 border-red-200",
    FULFILLED: "bg-blue-50 text-blue-700 border-blue-200",
  };
  const style = styles[normalized] || "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}>
      {normalized}
    </span>
  );
};



const StatCard = ({ label, value, icon: Icon, tone = "default", button }) => {
  const toneColors = {
    default: "bg-white border-l-4 border-emerald-600",
    info: "bg-white border-l-4 border-blue-600",
    warning: "bg-white border-l-4 border-amber-600",
    success: "bg-white border-l-4 border-green-600",
  };
  const iconColors = {
    default: "text-emerald-100",
    info: "text-blue-100",
    warning: "text-amber-100",
    success: "text-green-100",
  };
  return (
    <div className={`rounded-xl shadow-sm p-5 ${toneColors[tone]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {button && <div className="mt-2">{button}</div>}
        </div>
        <Icon className={`w-10 h-10 ${iconColors[tone]}`} />
      </div>
    </div>
  );
};

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("aarogya_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function DistributorDashboard() {
  const [stats, setStats] = useState({
    medicines: 0,
    stockValue: 0,
    lowStock: 0,
    requirements: 0,
  });

  const [stockAlerts, setStockAlerts] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const [recentMedicines, setRecentMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [selectedRequirement, setSelectedRequirement] = useState(null);


  const fetchRequirements = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/pharmacy/requirements`,
        { headers: getAuthHeaders() }
      );

      const data = await response.json();

      console.log("Requirements:", data);

      setRequirements(data?.data || []);
    } catch (error) {
      console.error(error);
    }
  };
  const fetchStockAlerts = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/pharmacy/stock-alerts`,
        { headers: getAuthHeaders() }
      );

      const data = await res.json();

      setStockAlerts(data?.data || []);
    } catch (error) {
      console.error(error);
    }
  };
  const fetchExpiryAlerts = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/pharmacy/expiry-alerts`,
        { headers: getAuthHeaders() }
      );

      const data = await response.json();

      setExpiryAlerts(data?.data || []);
    } catch (error) {
      console.error(error);
    }
  };
  const fetchRecentMedicines = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/pharmacy/recent-medicines`,
        { headers: getAuthHeaders() }
      );

      const data = await response.json();

      setRecentMedicines(data?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/pharmacy/categories`,
        { headers: getAuthHeaders() }
      );

      const data = await response.json();

      setCategories(data?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/pharmacy/dashboard-stats`,
        { headers: getAuthHeaders() }
      );

      const data = await response.json();

      if (data) setStats(data);
    } catch (error) {
      console.error(error);
    }
  };
  const [mockMedicines, setMedicines] = useState([]);

  useEffect(() => { //useEffect
    fetchMedicines();
    fetchDashboardStats();
    fetchRequirements();
    fetchStockAlerts();
    fetchExpiryAlerts();
    fetchRecentMedicines();
    fetchCategories();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/pharmacy/inventory`,
        { headers: getAuthHeaders() }
      );

      const result = await response.json();

      console.log("Inventory:", result?.data?.inventory);

      setMedicines(result?.data?.inventory || []);
    }
    catch (error) {
      console.error(error);
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showRequirementModal, setShowRequirementModal] = useState(false);


  // Form state for new requirement
  const [newRequirement, setNewRequirement] = useState({
    medicineName: "",
    quantity: "",
    priority: "Normal",
    notes: "",
  });

  const itemsPerPage = 10;

  // Filter medicines
  const filteredMedicines = mockMedicines.filter((med) => {
    const medicineName =
      med.medicineId?.medicineName || "";

    const category =
      med.medicineId?.category || "";

    const status =
      med.currentStock === 0
        ? "Out of Stock"
        : med.currentStock <= med.minimumStock
          ? "Low Stock"
          : "In Stock";

    const matchesSearch = medicineName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" ||
      category === categoryFilter;

    const matchesStatus =
      statusFilter === "all" ||
      status === statusFilter;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesStatus
    );
  });

  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage);
  const paginatedMedicines = filteredMedicines.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /*const categoryOptions = [
    "all",
    ...new Set(
      mockMedicines.map(
        item => item.medicineId?.category || item.category
      )
    )
  ];*/
  const statusList = [
    "all",
    "In Stock",
    "Low Stock",
    "Out of Stock",
  ];

  // Handle form input changes
  const handleRequirementChange = (e) => {
    const { name, value } = e.target;
    setNewRequirement(prev => ({ ...prev, [name]: value }));
  };

  // Toast state for success messages
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Submit new requirement
  const handleSubmitRequirement = (e) => {
    e.preventDefault();
    if (!newRequirement.medicineName || !newRequirement.quantity) {
      alert("Please fill in medicine name and quantity.");
      return;
    }

    // Create new requirement object matching database schema/API field keys
    const newId = `REQ-${new Date().getFullYear()}-${String(requirements.length + 100).slice(-4)}`;
    const newReq = {
      _id: newId,
      requirementId: newId,
      status: "PENDING",
      requestedQty: parseInt(newRequirement.quantity),
      createdAt: new Date().toISOString(),
      requestedMedicineName: newRequirement.medicineName,
      priority: newRequirement.priority,
      notes: newRequirement.notes,
    };

    // Add to requirements list (at the top)
    setRequirements([newReq, ...requirements]);

    // Increment requirements stat card count
    setStats(prev => ({ ...prev, requirements: prev.requirements + 1 }));

    // Reset form and close modal
    setNewRequirement({ medicineName: "", quantity: "", priority: "Normal", notes: "" });
    setShowRequirementModal(false);

    // Show success toast
    showToast(`Requirement for "${newReq.requestedMedicineName}" raised successfully!`);
  };

  // Delete a requirement
  const handleDeleteRequirement = async (req) => {
    const isLocalOnly = typeof req._id === "string" && req._id.startsWith("REQ-");

    if (!isLocalOnly) {
      // Call backend API to delete
      try {
        const res = await fetch(`${BASE_URL}/pharmacy/requirements/${req._id}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });
        const data = await res.json();
        if (!data.success) {
          alert("Failed to delete requirement.");
          return;
        }
      } catch (error) {
        console.error("Delete requirement error:", error);
        alert("Failed to delete requirement.");
        return;
      }
    }

    // Remove from local state
    setRequirements(prev => prev.filter(r => r._id !== req._id));

    // Decrement requirements stat card count
    setStats(prev => ({ ...prev, requirements: Math.max(0, prev.requirements - 1) }));

    showToast(`Requirement removed successfully.`);
  };

  return (
    <div className="min-h-screen bg-[#F2F9F6] p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#06402B] tracking-tight">Welcome</h1>
          <p className="text-gray-500 text-sm">Overview of inventory stock and request status.</p>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatCard label="Total Medicines" value={stats.medicines} icon={Package} tone="default" />
          <StatCard label="Total Stock Value" value={`₹${stats.stockValue}`} icon={IndianRupee} tone="info" />
          <StatCard label="Low Stock Items" value={stats.lowStock} icon={AlertTriangle} tone="warning" />
          <StatCard label="Expired Items" value={0} icon={Calendar} tone="warning" />
          <StatCard
            label="Medicine Requirements"
            value={stats.requirements}
            icon={TrendingUp}
            tone="success"
            button={
              <button
                onClick={() => setShowRequirementModal(true)}
                className="mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition inline-flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Raise new requirement
              </button>
            }
          />
        </div>

        {/* Tab row */}
        <div className="flex flex-row overflow-x-auto gap-2 mb-6 pb-2 whitespace-nowrap scrollbar-none">
          {["All medicines", "Current inventory value", "Require attention", "Remove from stock", "Pending", "Approved", "Rejected", "Fulfilled"].map((tab) => (
            <button
              key={tab}
              className="px-4 py-1.5 text-sm font-medium rounded-full bg-white border border-gray-200 text-gray-600 whitespace-nowrap hover:bg-emerald-50 hover:border-emerald-200 transition"
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Main 2-column layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="xl:col-span-2 space-y-6">
            {/* Search, filters, export */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search medicine by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700"
              >
                <option value="all">All Categories</option>

                {categories.map((cat) => (
                  <option
                    key={cat._id}
                    value={cat._id}
                  >
                    {cat._id}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700"
              >
                {statusList.map((st) => (
                  <option key={st} value={st}>
                    {st === "all" ? "All Status" : st}
                  </option>
                ))}
              </select>
              <button className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <Download className="w-4 h-4" /> Export
              </button>
            </div>

            {/* Medicine Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto w-full custom-scrollbar">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Medicine Name</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Stock</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Price (MRP)</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Expiry Date</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paginatedMedicines.map((med) => (
                      <tr key={med._id} className="hover:bg-gray-50/30">
                        <td className="px-5 py-3.5 font-medium text-gray-800 whitespace-nowrap">{med.medicineId?.medicineName}</td>
                        <td className="px-5 py-3.5 text-gray-500">{med.medicineId?.category}</td>
                        <td className="px-5 py-3.5 text-gray-700 font-semibold">{med.currentStock}</td>
                        <td className="px-5 py-3.5 text-gray-700 font-semibold">₹{med.medicineId?.mrp}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${med.currentStock === 0 ? "bg-red-50 text-red-700 border border-red-200" : med.currentStock <= med.minimumStock ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
                            {med.currentStock === 0 ? "Out of Stock" : med.currentStock <= med.minimumStock ? "Low Stock" : "In Stock"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{med.medicineId?.expiryDate ? new Date(med.medicineId.expiryDate).toLocaleDateString("en-IN") : "N/A"}</td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => setSelectedMedicine(med)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 hover:text-emerald-800 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
                <span>
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredMedicines.length)} of {filteredMedicines.length} medicines
                </span>
                <div className="flex items-center gap-3">
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

            {/* Recent Medicine Requirements (Requirement Requests) */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
                <h3 className="font-bold text-gray-800">Recent Medicine Requirements</h3>
                <button className="text-emerald-700 text-xs sm:text-sm font-semibold hover:underline">View all requirements →</button>
              </div>
              <div className="overflow-x-auto w-full custom-scrollbar">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Medicine name</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Qty</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {requirements.map((req) => (
                      <tr key={req._id} className="hover:bg-gray-50/30">
                        <td className="px-5 py-3.5 font-medium text-gray-800 whitespace-nowrap">
                          {req.medicineId?.medicineName || req.requestedMedicineName || "N/A"}
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                          {req.createdAt
                            ? new Date(req.createdAt).toLocaleDateString("en-IN")
                            : "-"}
                        </td>
                        <td className="px-5 py-3.5 text-gray-700 font-semibold">
                          {req.requestedQty}
                        </td>
                        <td className="px-5 py-3.5">
                          {getReqStatusBadge(req.status)}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedRequirement(req)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 hover:text-emerald-800 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" /> Details
                            </button>
                            <button
                              onClick={() => handleDeleteRequirement(req)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors cursor-pointer"
                              title="Remove requirement"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Summary */}
          <div className="space-y-5">
            {/* Stock Alerts */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-800">Stock Alerts</h3>
                <button className="text-emerald-700 text-xs font-semibold">View all</button>
              </div>
              <div className="space-y-3">
                {stockAlerts.slice(0, 3).map((alert) => (
                  <div key={alert._id} className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-sm font-medium text-gray-700">{alert.medicineId?.medicineName}</span>
                    <span className="text-xs text-amber-600 font-semibold">Only {alert.currentStock} {alert.medicineId?.unit} left</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expiry Alerts */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-800">Expiry Alerts</h3>
                <button className="text-emerald-700 text-xs font-semibold">View all</button>
              </div>
              <div className="space-y-3">
                {expiryAlerts.length === 0 ? (
                  <p className="text-sm text-gray-500">No expiry alerts to display.</p>
                ) : (
                  expiryAlerts.map((item, idx) => (
                    <div key={item._id || item.id || idx} className="flex justify-between items-center border-b border-gray-50 pb-2">
                      <span className="text-sm font-medium text-gray-700">{item.medicineName}</span>
                      <span className="text-xs text-red-600 font-semibold">
                        {new Date(item.expiryDate).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recently Added */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-800">Recently Added</h3>
                <button className="text-emerald-700 text-xs font-semibold">View all</button>
              </div>
              <div className="space-y-3">
                {recentMedicines.map((item, idx) => (
                  <div key={item._id} className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-sm font-medium text-gray-700">{item.medicineName}</span>
                    <span className="text-xs text-gray-400">Added on {
                      new Date(item.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-3">Categories</h3>
              <div className="space-y-2">

                {categories.map((cat) => (
                  <div key={cat._id} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">{cat._id}</span>
                    <span className="text-xs font-semibold text-gray-500">{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Purchase Orders & Sales */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                <ShoppingCart className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Purchase Orders</p>
                <p className="text-lg font-bold text-gray-800">{purchaseOrders.total}</p>
                <p className="text-[10px] text-gray-400">This {purchaseOrders.month}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                <IndianRupee className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Sales (This Month)</p>
                <p className="text-lg font-bold text-gray-800">₹{salesThisMonth.amount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Raise New Requirement */}
      {showRequirementModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowRequirementModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#06402B]">Raise New Requirement</h3>
              <button onClick={() => setShowRequirementModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitRequirement} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Medicine Name *</label>
                <input
                  type="text"
                  name="medicineName"
                  value={newRequirement.medicineName}
                  onChange={handleRequirementChange}
                  placeholder="e.g., Paracetamol 500mg"
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  value={newRequirement.quantity}
                  onChange={handleRequirementChange}
                  placeholder="Number of units"
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Priority</label>
                <select
                  name="priority"
                  value={newRequirement.priority}
                  onChange={handleRequirementChange}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option>Normal</option>
                  <option>Urgent</option>
                  <option>Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Additional Notes</label>
                <textarea
                  name="notes"
                  value={newRequirement.notes}
                  onChange={handleRequirementChange}
                  rows={3}
                  placeholder="Any specific instructions..."
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequirementModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#06402B] text-white rounded-xl font-bold shadow-md hover:bg-emerald-800 transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Submit Requirement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Medicine Details Modal */}
      {selectedMedicine && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedMedicine(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#06402B] flex items-center gap-2">
                <Pill className="w-5 h-5 text-emerald-600" /> Medicine Details
              </h3>
              <button onClick={() => setSelectedMedicine(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Medicine Name and Code */}
              <div>
                <h4 className="text-2xl font-bold text-gray-900">{selectedMedicine.medicineId?.medicineName}</h4>
                <span className="inline-block mt-1 text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  Code: {selectedMedicine.medicineId?.medicineCode}
                </span>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</span>
                  <span className="text-sm font-medium text-gray-900">{selectedMedicine.medicineId?.category}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Batch No</span>
                  <span className="text-sm font-medium text-gray-900">{selectedMedicine.medicineId?.batchNo || "N/A"}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Manufacturer</span>
                  <span className="text-sm font-medium text-gray-900">{selectedMedicine.medicineId?.manufacturer}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Supplier</span>
                  <span className="text-sm font-medium text-gray-900">{selectedMedicine.supplier || "N/A"}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Price (MRP)</span>
                  <span className="text-sm font-bold text-emerald-700">₹{selectedMedicine.medicineId?.mrp}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Expiry Date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedMedicine.medicineId?.expiryDate ? new Date(selectedMedicine.medicineId.expiryDate).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Stock Info */}
              <div className="grid grid-cols-3 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <div className="text-center">
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Current Stock</span>
                  <span className="text-lg font-bold text-gray-900 mt-1 block">{selectedMedicine.currentStock}</span>
                </div>
                <div className="text-center border-x border-gray-200">
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Min Stock</span>
                  <span className="text-lg font-bold text-gray-900 mt-1 block">{selectedMedicine.minimumStock}</span>
                </div>
                <div className="text-center">
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Stock Status</span>
                  <div className="mt-1">{getStatusBadge(
                    selectedMedicine.currentStock === 0 ? "Out of Stock" : selectedMedicine.currentStock <= selectedMedicine.minimumStock ? "Low Stock" : "In Stock"
                  )}</div>
                </div>
              </div>

              {/* Stock Value */}
              <div className="flex justify-between items-center bg-emerald-50/50 px-5 py-3 rounded-xl border border-emerald-100">
                <span className="text-sm font-semibold text-emerald-800">Estimated Stock Value</span>
                <span className="text-lg font-black text-[#06402B]">
                  ₹{((selectedMedicine.currentStock || 0) * (selectedMedicine.medicineId?.mrp || 0)).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Requirement Details Modal */}
      {selectedRequirement && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedRequirement(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#06402B] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" /> Requirement Details
              </h3>
              <button onClick={() => setSelectedRequirement(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Medicine Name and ID */}
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Requested Medicine</span>
                <h4 className="text-2xl font-bold text-gray-900">
                  {selectedRequirement.medicineId?.medicineName || selectedRequirement.requestedMedicineName || "N/A"}
                </h4>
                <span className="inline-block mt-1 text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  Req ID: {selectedRequirement.requirementId || "N/A"}
                </span>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Requested Quantity</span>
                  <span className="text-sm font-bold text-gray-900">{selectedRequirement.requestedQty} units</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</span>
                  <div className="mt-0.5">{getReqStatusBadge(selectedRequirement.status)}</div>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Date Raised</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedRequirement.createdAt ? new Date(selectedRequirement.createdAt).toLocaleDateString("en-IN") : "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Priority</span>
                  <span className="text-sm font-medium text-gray-900">{selectedRequirement.priority || "Normal"}</span>
                </div>
              </div>

              {/* Notes Section */}
              {selectedRequirement.notes && (
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Additional Notes</span>
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
                    "{selectedRequirement.notes}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-emerald-50 text-emerald-700 rounded-xl px-5 py-3 flex items-center gap-3 shadow-lg border border-emerald-200">
            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-semibold">{toastMessage}</span>
            <button onClick={() => setToastMessage("")} className="ml-2 p-1 text-emerald-400 hover:text-emerald-600 transition">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 64, 43, 0.15);
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 64, 43, 0.3);
        }
      `}</style>
    </div>
  );
}