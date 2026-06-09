// src/pages/inventory/ExpiryItems.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Edit,
  X,
  Save,
  AlertCircle,
  CheckCircle2,
  Package,
  Calendar,
  DollarSign,
  Warehouse,
  Clock,
  TrendingDown,
  Filter,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../../components/common/Button";

// ==================== Mock Data ====================
const mockExpiryItems = [
  {
    id: "EXP-001",
    medicineName: "Paracetamol 650mg Tablet",
    batchNo: "PARA650-0425",
    warehouse: "Central Warehouse",
    expiryDate: "2025-05-20",
    daysLeft: 8,
    stock: 150,
    unitPrice: 1.25,
    totalValue: 187.50,
    status: "Expiring Soon",
  },
  {
    id: "EXP-002",
    medicineName: "Amoxicillin 500mg Capsule",
    batchNo: "AMOX500-0325",
    warehouse: "East Warehouse",
    expiryDate: "2025-05-25",
    daysLeft: 13,
    stock: 80,
    unitPrice: 6.80,
    totalValue: 544.00,
    status: "Expiring Soon",
  },
  {
    id: "EXP-003",
    medicineName: "Cetirizine 10mg Tablet",
    batchNo: "CET10-0125",
    warehouse: "North Warehouse",
    expiryDate: "2025-05-28",
    daysLeft: 16,
    stock: 60,
    unitPrice: 1.20,
    totalValue: 72.00,
    status: "Expiring Soon",
  },
  {
    id: "EXP-004",
    medicineName: "Omeprazole 20mg Capsule",
    batchNo: "OME20-0225",
    warehouse: "Central Warehouse",
    expiryDate: "2025-05-05",
    daysLeft: -7,
    stock: 20,
    unitPrice: 3.40,
    totalValue: 68.00,
    status: "Expired",
  },
  {
    id: "EXP-005",
    medicineName: "Salbutamol Inhaler",
    batchNo: "SALB100-1224",
    warehouse: "South Warehouse",
    expiryDate: "2025-04-28",
    daysLeft: -14,
    stock: 15,
    unitPrice: 8.90,
    totalValue: 133.50,
    status: "Expired",
  },
  {
    id: "EXP-006",
    medicineName: "Ibuprofen 400mg Tablet",
    batchNo: "IBU400-0225",
    warehouse: "East Warehouse",
    expiryDate: "2025-05-30",
    daysLeft: 18,
    stock: 100,
    unitPrice: 1.80,
    totalValue: 180.00,
    status: "Expiring Soon",
  },
  {
    id: "EXP-007",
    medicineName: "Azithromycin 500mg Tablet",
    batchNo: "AZI500-0125",
    warehouse: "West Warehouse",
    expiryDate: "2025-06-02",
    daysLeft: 21,
    stock: 40,
    unitPrice: 4.90,
    totalValue: 196.00,
    status: "Expiring Soon",
  },
];

const warehouses = ["All Warehouses", "Central Warehouse", "East Warehouse", "North Warehouse", "South Warehouse", "West Warehouse"];
const statuses = ["All Status", "Expiring Soon", "Expired"];
const categories = ["All Categories", "Analgesics", "Antibiotics", "Antihistamines", "Gastrointestinal", "Respiratory"];

// ==================== Main Component ====================
export default function ExpiryItems() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("All Warehouses");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    warehouse: "",
    expiryDate: "",
    stock: "",
    notes: "",
  });
  const [saveMessage, setSaveMessage] = useState(null);

  // Metrics calculations
  const expiringSoon = items.filter(i => i.status === "Expiring Soon").length;
  const expiredItems = items.filter(i => i.status === "Expired").length;
  const totalExpiryItems = items.length;
  const totalValueAtRisk = items.reduce((sum, i) => sum + i.totalValue, 0);

  useEffect(() => {
    // Load from localStorage or use mock data
    const stored = localStorage.getItem("medico_expiry_items");
    if (stored) {
      setItems(JSON.parse(stored));
    } else {
      setItems(mockExpiryItems);
      localStorage.setItem("medico_expiry_items", JSON.stringify(mockExpiryItems));
    }
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = [...items];
    
    if (searchTerm) {
      filtered = filtered.filter(i => 
        i.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.batchNo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (warehouseFilter !== "All Warehouses") {
      filtered = filtered.filter(i => i.warehouse === warehouseFilter);
    }
    
    if (statusFilter !== "All Status") {
      filtered = filtered.filter(i => i.status === statusFilter);
    }
    
    setFilteredItems(filtered);
  }, [items, searchTerm, warehouseFilter, statusFilter]);

  const handleEdit = (item) => {
    setEditingItem(item);
    setEditForm({
      warehouse: item.warehouse,
      expiryDate: item.expiryDate,
      stock: item.stock,
      notes: item.notes || "",
    });
  };

  const handleSaveEdit = () => {
    const updatedItems = items.map(item => 
      item.id === editingItem.id 
        ? { 
            ...item, 
            warehouse: editForm.warehouse,
            expiryDate: editForm.expiryDate,
            stock: parseInt(editForm.stock),
            totalValue: parseInt(editForm.stock) * item.unitPrice,
            notes: editForm.notes,
            daysLeft: calculateDaysLeft(editForm.expiryDate),
            status: calculateStatus(editForm.expiryDate),
          }
        : item
    );
    setItems(updatedItems);
    localStorage.setItem("medico_expiry_items", JSON.stringify(updatedItems));
    setEditingItem(null);
    setSaveMessage({ type: "success", text: "Item updated successfully!" });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const calculateDaysLeft = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(date);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateStatus = (date) => {
    const daysLeft = calculateDaysLeft(date);
    return daysLeft < 0 ? "Expired" : "Expiring Soon";
  };

  const metricsCards = [
    { label: "Expiring Soon", value: expiringSoon, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", subtitle: "In next 30 days" },
    { label: "Expired Items", value: expiredItems, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", subtitle: "Already expired" },
    { label: "Total Expiry Items", value: totalExpiryItems, icon: Package, color: "text-blue-600", bg: "bg-blue-50", subtitle: "Expiring or expired" },
    { label: "Total Value at Risk", value: `$${totalValueAtRisk.toFixed(2)}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", subtitle: "Approx. value" },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-primary-dark tracking-tighter italic">Expiry Items</h1>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
          View and manage items approaching or past expiry.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metricsCards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center mb-3", card.bg, card.color)}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{card.label}</p>
            <p className="text-2xl font-black text-slate-800">{card.value}</p>
            <p className="text-[10px] text-gray-400 mt-1">{card.subtitle}</p>
          </motion.div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search medicine name, batch no..."
              className="w-full h-12 pl-11 pr-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium text-gray-600 outline-none focus:ring-2 focus:ring-primary/20"
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
          >
            {warehouses.map(w => <option key={w}>{w}</option>)}
          </select>
          <select
            className="h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium text-gray-600 outline-none focus:ring-2 focus:ring-primary/20"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statuses.map(s => <option key={s}>{s}</option>)}
          </select>
          <select
            className="h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium text-gray-600 outline-none focus:ring-2 focus:ring-primary/20"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Medicine Name</th>
                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Batch No.</th>
                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Warehouse</th>
                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Expiry Date</th>
                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Days Left</th>
                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Stock</th>
                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Value</th>
                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 text-sm">{item.medicineName}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-mono">{item.batchNo}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.warehouse}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(item.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-sm font-medium",
                      item.daysLeft < 0 ? "text-red-600" : "text-amber-600"
                    )}>
                      {item.daysLeft < 0 ? `${Math.abs(item.daysLeft)} days ago` : `${item.daysLeft} days`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.stock} units</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">${item.totalValue.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold",
                      item.status === "Expiring Soon" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                    )}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEdit(item)}
                      className="w-8 h-8 rounded-lg bg-gray-50 text-gray-500 hover:bg-primary hover:text-white transition-all flex items-center justify-center"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No items found</div>
        )}
        <div className="px-6 py-4 border-t border-gray-100 text-xs text-gray-400">
          Showing 1 to {filteredItems.length} of {items.length} items
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-emerald-50 text-emerald-700 rounded-xl px-4 py-3 flex items-center gap-2 shadow-lg">
            <CheckCircle2 className="w-4 h-4" />
            {saveMessage.text}
          </div>
        </div>
      )}

      {/* Edit Modal (non-sticky, scrollable) */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setEditingItem(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto my-8"
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between rounded-t-3xl z-10">
                <div>
                  <h2 className="text-xl font-black text-slate-800">Edit Expiry Item</h2>
                  <p className="text-sm text-primary font-bold">{editingItem.medicineName}</p>
                </div>
                <button
                  onClick={() => setEditingItem(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Batch No.</label>
                    <p className="text-sm font-mono font-medium text-slate-700 bg-gray-50 rounded-xl px-4 py-2.5">
                      {editingItem.batchNo}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Warehouse</label>
                    <select
                      className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                      value={editForm.warehouse}
                      onChange={(e) => setEditForm({ ...editForm, warehouse: e.target.value })}
                    >
                      {warehouses.filter(w => w !== "All Warehouses").map(w => (
                        <option key={w}>{w}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Expiry Date</label>
                    <input
                      type="date"
                      className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                      value={editForm.expiryDate}
                      onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Stock (Units)</label>
                    <input
                      type="number"
                      className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                      value={editForm.stock}
                      onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Unit Price (USD)</label>
                    <p className="text-sm font-medium text-slate-700 bg-gray-50 rounded-xl px-4 py-2.5">
                      ${editingItem.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Value (USD)</label>
                    <p className="text-sm font-bold text-primary bg-gray-50 rounded-xl px-4 py-2.5">
                      ${(parseInt(editForm.stock || 0) * editingItem.unitPrice).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Add notes (optional)..."
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingItem(null)}
                    className="flex-1 h-12 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveEdit}
                    className="flex-1 h-12 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20"
                  >
                    <Save className="w-4 h-4" /> Save Changes
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}