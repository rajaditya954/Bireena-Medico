// src/pages/inventory/StockManagement.jsx
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
  DollarSign,
  TrendingDown,
  AlertTriangle,
  Warehouse,
  Calendar,
  Tag,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../../components/common/Button";

// ==================== Mock Data ====================
const mockStockItems = [
  {
    id: "STK-001",
    medicineName: "Paracetamol 650mg",
    category: "Pain Relief",
    batchNo: "PARA650-0425",
    warehouse: "Central Warehouse",
    stock: 150,
    reorderLevel: 50,
    unitPrice: 1.25,
    totalValue: 187.50,
    expiryDate: "2025-05-20",
    status: "In Stock",
    notes: "",
  },
  {
    id: "STK-002",
    medicineName: "Amoxicillin 500mg",
    category: "Antibiotic",
    batchNo: "AMOX500-0325",
    warehouse: "East Warehouse",
    stock: 80,
    reorderLevel: 40,
    unitPrice: 6.80,
    totalValue: 544.00,
    expiryDate: "2025-05-25",
    status: "In Stock",
    notes: "",
  },
  {
    id: "STK-003",
    medicineName: "Cetirizine 10mg",
    category: "Antihistamine",
    batchNo: "CET10-0125",
    warehouse: "North Warehouse",
    stock: 60,
    reorderLevel: 30,
    unitPrice: 1.20,
    totalValue: 72.00,
    expiryDate: "2025-05-28",
    status: "In Stock",
    notes: "",
  },
  {
    id: "STK-004",
    medicineName: "Omeprazole 20mg",
    category: "Gastric",
    batchNo: "OME20-0225",
    warehouse: "Central Warehouse",
    stock: 20,
    reorderLevel: 30,
    unitPrice: 3.40,
    totalValue: 68.00,
    expiryDate: "2025-05-05",
    status: "Low Stock",
    notes: "",
  },
  {
    id: "STK-005",
    medicineName: "Salbutamol Inhaler",
    category: "Respiratory",
    batchNo: "SALB100-1224",
    warehouse: "South Warehouse",
    stock: 15,
    reorderLevel: 25,
    unitPrice: 8.90,
    totalValue: 133.50,
    expiryDate: "2025-04-28",
    status: "Low Stock",
    notes: "",
  },
  {
    id: "STK-006",
    medicineName: "Ibuprofen 400mg",
    category: "Pain Relief",
    batchNo: "IBU400-0225",
    warehouse: "East Warehouse",
    stock: 100,
    reorderLevel: 50,
    unitPrice: 1.80,
    totalValue: 180.00,
    expiryDate: "2025-05-30",
    status: "In Stock",
    notes: "",
  },
  {
    id: "STK-007",
    medicineName: "Azithromycin 500mg",
    category: "Antibiotic",
    batchNo: "AZI500-0125",
    warehouse: "West Warehouse",
    stock: 40,
    reorderLevel: 50,
    unitPrice: 4.90,
    totalValue: 196.00,
    expiryDate: "2025-06-02",
    status: "Low Stock",
    notes: "",
  },
  {
    id: "STK-008",
    medicineName: "Vitamin D3 1000 IU",
    category: "Vitamin",
    batchNo: "VITD3-0525",
    warehouse: "Central Warehouse",
    stock: 200,
    reorderLevel: 100,
    unitPrice: 2.20,
    totalValue: 440.00,
    expiryDate: "2025-08-15",
    status: "In Stock",
    notes: "",
  },
];

// ==================== Main Component ====================
export default function StockManagement() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    stock: "",
    reorderLevel: "",
    unitPrice: "",
    notes: "",
  });
  const [saveMessage, setSaveMessage] = useState(null);

  // Metrics calculations
  const totalStockItems = items.length;
  const totalStockValue = items.reduce((sum, i) => sum + i.totalValue, 0);
  const lowStockItems = items.filter(i => i.status === "Low Stock").length;
  const outOfStockItems = items.filter(i => i.status === "Out of Stock").length;

  useEffect(() => {
    const stored = localStorage.getItem("medico_stock_items");
    if (stored) {
      setItems(JSON.parse(stored));
    } else {
      setItems(mockStockItems);
      localStorage.setItem("medico_stock_items", JSON.stringify(mockStockItems));
    }
  }, []);

  useEffect(() => {
    let filtered = [...items];

    // Filter by tab
    if (activeTab === "inStock") {
      filtered = filtered.filter(i => i.status === "In Stock");
    } else if (activeTab === "lowStock") {
      filtered = filtered.filter(i => i.status === "Low Stock");
    } else if (activeTab === "outOfStock") {
      filtered = filtered.filter(i => i.status === "Out of Stock");
    }

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(i =>
        i.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.batchNo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  }, [items, activeTab, searchTerm]);

  const handleEdit = (item) => {
    setEditingItem(item);
    setEditForm({
      stock: item.stock,
      reorderLevel: item.reorderLevel,
      unitPrice: item.unitPrice,
      notes: item.notes || "",
    });
  };

  const handleSaveEdit = () => {
    const updatedStock = parseInt(editForm.stock);
    const updatedReorderLevel = parseInt(editForm.reorderLevel);
    const updatedUnitPrice = parseFloat(editForm.unitPrice);
    const newTotalValue = updatedStock * updatedUnitPrice;
    
    let newStatus = "In Stock";
    if (updatedStock <= 0) newStatus = "Out of Stock";
    else if (updatedStock <= updatedReorderLevel) newStatus = "Low Stock";
    else newStatus = "In Stock";

    const updatedItems = items.map(item =>
      item.id === editingItem.id
        ? {
            ...item,
            stock: updatedStock,
            reorderLevel: updatedReorderLevel,
            unitPrice: updatedUnitPrice,
            totalValue: newTotalValue,
            status: newStatus,
            notes: editForm.notes,
          }
        : item
    );

    setItems(updatedItems);
    localStorage.setItem("medico_stock_items", JSON.stringify(updatedItems));
    setEditingItem(null);
    setSaveMessage({ type: "success", text: "Stock updated successfully!" });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const metricsCards = [
    { label: "Total Stock Items", value: totalStockItems, icon: Package, color: "text-blue-600", bg: "bg-blue-50", subtitle: "All items" },
    { label: "Total Stock Value", value: `$${totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", subtitle: "Across all locations" },
    { label: "Low Stock Items", value: lowStockItems, icon: TrendingDown, color: "text-amber-600", bg: "bg-amber-50", subtitle: "Require attention" },
    { label: "Out of Stock Items", value: outOfStockItems, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", subtitle: "Not available" },
  ];

  const tabs = [
    { id: "all", label: "All Items", count: totalStockItems },
    { id: "inStock", label: "In Stock", count: items.filter(i => i.status === "In Stock").length },
    { id: "lowStock", label: "Low Stock", count: lowStockItems },
    { id: "outOfStock", label: "Out of Stock", count: outOfStockItems },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-primary-dark tracking-tighter italic">Stock Management</h1>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
          View, search and manage stock across all warehouses and outlets.
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

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search medicine name, batch no..."
            className="w-full h-12 pl-11 pr-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeTab === tab.id
                ? "bg-primary text-white shadow-md"
                : "text-gray-500 hover:bg-gray-50"
            )}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Medicine Name</th>
                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Category</th>
                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Batch No.</th>
                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Warehouse</th>
                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Stock (Units)</th>
                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Reorder Level</th>
                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Unit Price</th>
                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Value</th>
                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800 text-sm">{item.medicineName}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.category}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-mono">{item.batchNo}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.warehouse}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.stock}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.reorderLevel}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">${item.unitPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">${item.totalValue.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold",
                      item.status === "In Stock" ? "bg-emerald-50 text-emerald-600" :
                      item.status === "Low Stock" ? "bg-amber-50 text-amber-600" :
                      "bg-red-50 text-red-600"
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
          <div className="text-center py-12 text-gray-400 text-sm">No stock items found</div>
        )}
        <div className="px-6 py-4 border-t border-gray-100 text-xs text-gray-400 flex justify-between items-center">
          <span>Showing {filteredItems.length} of {items.length} items</span>
          <span className="italic">Stock Management – Update stock quantity, reorder level and unit price. Changes are reflected in real-time across all connected modules.</span>
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

      {/* Edit Modal (non-sticky) */}
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
                  <h2 className="text-xl font-black text-slate-800">Edit Stock Item</h2>
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
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Warehouse</label>
                    <p className="text-sm font-medium text-slate-700 bg-gray-50 rounded-xl px-4 py-2.5">
                      {editingItem.warehouse}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Batch No.</label>
                    <p className="text-sm font-mono text-slate-700 bg-gray-50 rounded-xl px-4 py-2.5">
                      {editingItem.batchNo}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Expiry Date</label>
                    <p className="text-sm text-slate-700 bg-gray-50 rounded-xl px-4 py-2.5">
                      {new Date(editingItem.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Current Stock (Units)</label>
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
                    <input
                      type="number"
                      step="0.01"
                      className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                      value={editForm.unitPrice}
                      onChange={(e) => setEditForm({ ...editForm, unitPrice: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Reorder Level</label>
                    <input
                      type="number"
                      className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                      value={editForm.reorderLevel}
                      onChange={(e) => setEditForm({ ...editForm, reorderLevel: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Value (USD)</label>
                    <p className="text-sm font-bold text-primary bg-gray-50 rounded-xl px-4 py-2.5">
                      ${(parseInt(editForm.stock || 0) * parseFloat(editForm.unitPrice || 0)).toFixed(2)}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Status</label>
                    <div className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm font-medium">
                      {parseInt(editForm.stock || 0) <= 0 ? "Out of Stock" :
                       parseInt(editForm.stock || 0) <= parseInt(editForm.reorderLevel || 0) ? "Low Stock" : "In Stock"}
                    </div>
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