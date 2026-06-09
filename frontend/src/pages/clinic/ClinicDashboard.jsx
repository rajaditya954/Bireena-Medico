import React, { useState } from "react";
import {
  Package,
  DollarSign,
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
} from "lucide-react";

// Mock data for medicines
const mockMedicines = [
  { id: 1, name: "Paracetamol 650mg", category: "Pain Relief", form: "Tablet", stock: 350, price: 2.5, status: "In Stock", expiry: "31 Dec 2025", reqId: "REQ-2025-0007", reqStatus: "Approved", reqDate: "10 May 2025", reqItems: 5 },
  { id: 2, name: "Amoxicillin 500mg", category: "Antibiotic", form: "Capsule", stock: 120, price: 6.8, status: "In Stock", expiry: "15 Nov 2025", reqId: "REQ-2025-0006", reqStatus: "Fulfilled", reqDate: "08 May 2025", reqItems: 12 },
  { id: 3, name: "Cetirizine 10mg", category: "Antihistamine", form: "Tablet", stock: 25, price: 1.2, status: "Low Stock", expiry: "20 Sep 2025", reqId: "REQ-2025-0005", reqStatus: "Rejected", reqDate: "06 May 2025", reqItems: 3 },
  { id: 4, name: "Omeprazole 20mg", category: "Gastric", form: "Capsule", stock: 0, price: 3.4, status: "Out of Stock", expiry: "10 Oct 2024", reqId: "REQ-2025-0004", reqStatus: "Approved", reqDate: "04 May 2025", reqItems: 6 },
  { id: 5, name: "Metformin 500mg", category: "Diabetes", form: "Tablet", stock: 80, price: 2.1, status: "In Stock", expiry: "05 Jan 2026", reqId: "REQ-2025-0003", reqStatus: "Pending", reqDate: "02 May 2025", reqItems: 8 },
  { id: 6, name: "Salbutamol 100mcg", category: "Respiratory", form: "Inhaler", stock: 15, price: 8.9, status: "Low Stock", expiry: "18 Aug 2025", reqId: "REQ-2025-0002", reqStatus: "Approved", reqDate: "30 Apr 2025", reqItems: 4 },
  { id: 7, name: "Ibuprofen 400mg", category: "Pain Relief", form: "Tablet", stock: 200, price: 1.8, status: "In Stock", expiry: "22 Dec 2025", reqId: "REQ-2025-0001", reqStatus: "Fulfilled", reqDate: "28 Apr 2025", reqItems: 7 },
  { id: 8, name: "Amlodipine 5mg", category: "Blood Pressure", form: "Tablet", stock: 60, price: 2.7, status: "In Stock", expiry: "30 Oct 2025", reqId: "REQ-2025-0008", reqStatus: "Pending", reqDate: "12 May 2025", reqItems: 8 },
];

// Quick summary data
const stockAlerts = [
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
];
const categories = [
  { name: "Tablet", count: 12 },
  { name: "Capsule", count: 18 },
  { name: "Inhaler", count: 32 },
];
const purchaseOrders = { total: 145, month: "May" };
const salesThisMonth = { amount: 32450, month: "May" };

const getStatusBadge = (status) => {
  const styles = {
    "In Stock": "bg-green-50 text-green-700 border-green-200",
    "Low Stock": "bg-amber-50 text-amber-700 border-amber-200",
    "Out of Stock": "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {status}
    </span>
  );
};

const getReqStatusBadge = (status) => {
  const styles = {
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Approved: "bg-green-50 text-green-700 border-green-200",
    Rejected: "bg-red-50 text-red-700 border-red-200",
    Fulfilled: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {status}
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

export default function DistributorDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showRequirementModal, setShowRequirementModal] = useState(false);
  const [requirements, setRequirements] = useState(
    // unique requirement list derived from medicines
    mockMedicines.map(m => ({
      id: m.reqId,
      status: m.reqStatus,
      items: m.reqItems,
      date: m.reqDate,
    })).filter((v, i, a) => a.findIndex(t => t.id === v.id) === i).slice(0, 5)
  );
  
  // Form state for new requirement
  const [newRequirement, setNewRequirement] = useState({
    medicineName: "",
    quantity: "",
    priority: "Normal",
    notes: "",
  });

  const itemsPerPage = 8;

  // Filter medicines
  const filteredMedicines = mockMedicines.filter((med) => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || med.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || med.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage);
  const paginatedMedicines = filteredMedicines.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const categoriesList = ["all", ...new Set(mockMedicines.map((m) => m.category))];
  const statusList = ["all", ...new Set(mockMedicines.map((m) => m.status))];

  // Handle form input changes
  const handleRequirementChange = (e) => {
    const { name, value } = e.target;
    setNewRequirement(prev => ({ ...prev, [name]: value }));
  };

  // Submit new requirement
  const handleSubmitRequirement = (e) => {
    e.preventDefault();
    if (!newRequirement.medicineName || !newRequirement.quantity) {
      alert("Please fill in medicine name and quantity.");
      return;
    }
    
    // Create new requirement object
    const newId = `REQ-${new Date().getFullYear()}-${String(requirements.length + 100).slice(-4)}`;
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const newReq = {
      id: newId,
      status: "Pending",
      items: parseInt(newRequirement.quantity),
      date: today,
      medicineName: newRequirement.medicineName,
      priority: newRequirement.priority,
      notes: newRequirement.notes,
    };
    
    // Add to requirements list (at the top)
    setRequirements([newReq, ...requirements]);
    
    // Optionally, also add to mockMedicines? Not needed here; just alert success.
    alert(`Requirement ${newId} raised successfully for ${newRequirement.medicineName} (Qty: ${newRequirement.quantity})`);
    
    // Reset form and close modal
    setNewRequirement({ medicineName: "", quantity: "", priority: "Normal", notes: "" });
    setShowRequirementModal(false);
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
          <StatCard label="Total Medicines" value="245" icon={Package} tone="default" />
          <StatCard label="Total Stock Value" value="$24,560.00" icon={DollarSign} tone="info" />
          <StatCard label="Low Stock Items" value="18" icon={AlertTriangle} tone="warning" />
          <StatCard label="Expired Items" value="5" icon={Calendar} tone="warning" />
          <StatCard
            label="Medicine Requirements"
            value={requirements.length.toString()}
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
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
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
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
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
              <div className="overflow-x-auto">
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
                      <tr key={med.id} className="hover:bg-gray-50/30">
                        <td className="px-5 py-3 font-medium text-gray-800">{med.name}</td>
                        <td className="px-5 py-3 text-gray-500">{med.category}</td>
                        <td className="px-5 py-3 text-gray-700">{med.stock} {med.form === "Tablet" ? "tablets" : med.form === "Capsule" ? "capsules" : "units"}</td>
                        <td className="px-5 py-3 text-gray-700">${med.price.toFixed(2)}</td>
                        <td className="px-5 py-3">{getStatusBadge(med.status)}</td>
                        <td className="px-5 py-3 text-gray-500">{med.expiry}</td>
                        <td className="px-5 py-3">
                          <button className="text-emerald-700 hover:text-emerald-800 font-semibold text-xs flex items-center gap-1">
                            View Details <Eye className="w-3.5 h-3.5" />
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

            {/* Inventory Overview (Requirement Requests) */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-800">Inventory Overview</h3>
                <button className="text-emerald-700 text-sm font-semibold hover:underline">View all requirements →</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 text-xs font-semibold text-gray-400">Requirement ID</th>
                      <th className="text-left py-2 text-xs font-semibold text-gray-400">Date</th>
                      <th className="text-left py-2 text-xs font-semibold text-gray-400">Items</th>
                      <th className="text-left py-2 text-xs font-semibold text-gray-400">Status</th>
                      <th className="text-left py-2 text-xs font-semibold text-gray-400"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {requirements.map((req) => (
                      <tr key={req.id}>
                        <td className="py-2 font-mono text-xs">{req.id}</td>
                        <td className="py-2 text-gray-500 text-xs">{req.date}</td>
                        <td className="py-2 text-gray-700">{req.items} Items</td>
                        <td className="py-2">{getReqStatusBadge(req.status)}</td>
                        <td className="py-2">
                          <button className="text-emerald-700 text-xs font-semibold">View Details</button>
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
                {stockAlerts.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    <span className="text-xs text-amber-600 font-semibold">Only {item.stock} {item.unit} left</span>
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
                {expiryAlerts.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    <span className="text-xs text-red-600 font-semibold">
                      {item.status === "expired" ? `Expired on ${item.expiryDate}` : `Expires in ${item.daysLeft} days`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recently Added */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-800">Recently Added</h3>
                <button className="text-emerald-700 text-xs font-semibold">View all</button>
              </div>
              <div className="space-y-3">
                {recentlyAdded.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    <span className="text-xs text-gray-400">Added on {item.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-3">Categories</h3>
              <div className="space-y-2">
                {categories.map((cat, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">{cat.name}</span>
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
                <DollarSign className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Sales (This Month)</p>
                <p className="text-lg font-bold text-gray-800">${salesThisMonth.amount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Raise New Requirement */}
      {showRequirementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowRequirementModal(false)}>
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
    </div>
  );
}