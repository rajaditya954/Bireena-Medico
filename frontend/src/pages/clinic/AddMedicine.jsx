// src/pages/inventory/AddMedicine.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Save,
  Pill,
  Package,
  DollarSign,
  Box,
  Calendar,
  Truck,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../../components/common/Button";

// ==================== Mock Data ====================
const categories = [
  "Analgesics",
  "Antibiotics",
  "Antipyretics",
  "Antihistamines",
  "Antidepressants",
  "Antidiabetics",
  "Antihypertensives",
  "Vitamins & Supplements",
  "Dermatologicals",
  "Respiratory",
  "Cardiovascular",
  "Gastrointestinal",
];

const forms = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Injection",
  "Cream/Ointment",
  "Drops",
  "Inhaler",
  "Powder",
  "Patch",
];

const unitTypes = [
  "mg",
  "g",
  "mcg",
  "ml",
  "IU",
  "%",
  "Tablet",
  "Capsule",
  "Dose",
];

const suppliers = [
  "MediSource Pharma",
  "HealthPlus Distributors",
  "CareMed Solutions",
  "Global Pharma Corp",
  "Reliance Medical Supplies",
  "Apollo Pharmaceuticals",
];

// ==================== Main Component ====================
export default function AddMedicine() {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    medicineName: "",
    genericName: "",
    category: "",
    form: "",
    strength: "",
    unitType: "",
    amount: "",
    currentStock: "",
    mrp: "",
    reorderLevel: "",
    expiryDate: "",
    supplier: "",
    description: "",
    requirePrescription: false,
  });

  // Validation errors
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);

  // Handle input changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.medicineName.trim()) newErrors.medicineName = "Medicine name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.form) newErrors.form = "Form is required";
    if (!formData.unitType) newErrors.unitType = "Unit type is required";

    // Numeric validations
    if (formData.amount && isNaN(parseFloat(formData.amount))) newErrors.amount = "Must be a valid number";
    if (formData.currentStock && isNaN(parseInt(formData.currentStock))) newErrors.currentStock = "Must be a valid number";
    if (formData.mrp && isNaN(parseFloat(formData.mrp))) newErrors.mrp = "Must be a valid number";
    if (formData.reorderLevel && isNaN(parseInt(formData.reorderLevel))) newErrors.reorderLevel = "Must be a valid number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save to localStorage / API
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Create medicine object
      const newMedicine = {
        id: `MED-${Date.now()}`,
        ...formData,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        currentStock: formData.currentStock ? parseInt(formData.currentStock) : 0,
        mrp: formData.mrp ? parseFloat(formData.mrp) : null,
        reorderLevel: formData.reorderLevel ? parseInt(formData.reorderLevel) : null,
        expiryDate: formData.expiryDate || null,
        createdAt: new Date().toISOString(),
      };

      // Retrieve existing medicines from localStorage
      const existingMedicines = JSON.parse(localStorage.getItem("medico_medicines") || "[]");
      localStorage.setItem("medico_medicines", JSON.stringify([...existingMedicines, newMedicine]));

      setSubmitMessage({ type: "success", text: "Medicine added successfully!" });
      setTimeout(() => {
        navigate("/inventory/medicines"); // Redirect to medicine list page
      }, 1500);
    } catch (error) {
      setSubmitMessage({ type: "error", text: "Failed to add medicine. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-3xl font-black text-primary-dark tracking-tighter italic">Add New Medicine</h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
            Add a new medicine to inventory
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Two-column layout for form fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-primary" />
                  Medicine Details
                </h2>
              </div>
              <div className="p-6 space-y-5">
                {/* Medicine Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                    Medicine Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter medicine name"
                    className={cn(
                      "w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20",
                      errors.medicineName && "ring-2 ring-red-300"
                    )}
                    value={formData.medicineName}
                    onChange={(e) => handleChange("medicineName", e.target.value)}
                  />
                  {errors.medicineName && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.medicineName}
                    </p>
                  )}
                </div>

                {/* Generic Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                    Generic Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter generic name"
                    className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.genericName}
                    onChange={(e) => handleChange("genericName", e.target.value)}
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={cn(
                      "w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20",
                      errors.category && "ring-2 ring-red-300"
                    )}
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.category}
                    </p>
                  )}
                </div>

                {/* Form */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                    Form <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={cn(
                      "w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20",
                      errors.form && "ring-2 ring-red-300"
                    )}
                    value={formData.form}
                    onChange={(e) => handleChange("form", e.target.value)}
                  >
                    <option value="">Select form</option>
                    {forms.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                  {errors.form && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.form}
                    </p>
                  )}
                </div>

                {/* Strength */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                    Strength <span className="text-gray-400 text-[8px]">(e.g. 500mg)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 500mg"
                    className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.strength}
                    onChange={(e) => handleChange("strength", e.target.value)}
                  />
                </div>

                {/* Unit Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                    Unit Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={cn(
                      "w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20",
                      errors.unitType && "ring-2 ring-red-300"
                    )}
                    value={formData.unitType}
                    onChange={(e) => handleChange("unitType", e.target.value)}
                  >
                    <option value="">Select unit type</option>
                    {unitTypes.map((unit) => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                  {errors.unitType && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.unitType}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Inventory & Pricing
                </h2>
              </div>
              <div className="p-6 space-y-5">
                {/* Amount (USD) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                    Amount (USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 1.20"
                      className="w-full h-12 pl-9 pr-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                      value={formData.amount}
                      onChange={(e) => handleChange("amount", e.target.value)}
                    />
                  </div>
                  {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
                </div>

                {/* Current Stock */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                    Current Stock
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 100"
                    className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.currentStock}
                    onChange={(e) => handleChange("currentStock", e.target.value)}
                  />
                  {errors.currentStock && <p className="text-xs text-red-500">{errors.currentStock}</p>}
                </div>

                {/* MRP (USD) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                    MRP (USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 2.50"
                      className="w-full h-12 pl-9 pr-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                      value={formData.mrp}
                      onChange={(e) => handleChange("mrp", e.target.value)}
                    />
                  </div>
                  {errors.mrp && <p className="text-xs text-red-500">{errors.mrp}</p>}
                </div>

                {/* Reorder Level */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                    Reorder Level
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 20"
                    className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.reorderLevel}
                    onChange={(e) => handleChange("reorderLevel", e.target.value)}
                  />
                  {errors.reorderLevel && <p className="text-xs text-red-500">{errors.reorderLevel}</p>}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  Additional Information
                </h2>
              </div>
              <div className="p-6 space-y-5">
                {/* Expiry Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                    Expiry Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      className="w-full h-12 pl-9 pr-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                      value={formData.expiryDate}
                      onChange={(e) => handleChange("expiryDate", e.target.value)}
                    />
                  </div>
                </div>

                {/* Supplier */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                    Supplier
                  </label>
                  <select
                    className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.supplier}
                    onChange={(e) => handleChange("supplier", e.target.value)}
                  >
                    <option value="">Select supplier</option>
                    {suppliers.map((sup) => (
                      <option key={sup} value={sup}>{sup}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter medicine description..."
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                  />
                </div>

                {/* Require Prescription Checkbox */}
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="requirePrescription"
                    checked={formData.requirePrescription}
                    onChange={(e) => handleChange("requirePrescription", e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="requirePrescription" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Requires Prescription
                  </label>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Submit Message */}
        {submitMessage && (
          <div
            className={cn(
              "rounded-xl p-4 flex items-center gap-2",
              submitMessage.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            )}
          >
            {submitMessage.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {submitMessage.text}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex gap-4 justify-end sticky bottom-4 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 shadow-lg">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            className="h-12 px-6 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 px-8 rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSubmitting ? "Saving..." : "Save Medicine"}
          </Button>
        </div>
      </form>
    </div>
  );
}

// RefreshCw is needed for spinner – add to imports if not already there
import { RefreshCw } from "lucide-react";