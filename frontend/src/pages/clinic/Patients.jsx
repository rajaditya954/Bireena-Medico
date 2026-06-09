import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Trash2,
  User,
  Phone,
  MapPin,
  Droplet,
  AlertCircle,
  CreditCard,
  Wallet,
  Smartphone,
  Banknote,
  CheckCircle,
  X,
} from "lucide-react";

// Mock medicines inventory (for search)
const mockMedicines = [
  { id: 1, name: "Paracetamol 650mg Tablet", category: "Pain Relief", unitType: "Tablet", price: 18.0 },
  { id: 2, name: "Amoxicillin 500mg Capsule", category: "Antibiotic", unitType: "Capsule", price: 25.0 },
  { id: 3, name: "Cetirizine 10mg Tablet", category: "Antihistamine", unitType: "Tablet", price: 12.0 },
  { id: 4, name: "Ibuprofen 400mg Tablet", category: "Pain Relief", unitType: "Tablet", price: 22.0 },
  { id: 5, name: "Omeprazole 20mg Capsule", category: "Gastric", unitType: "Capsule", price: 30.0 },
  { id: 6, name: "Metformin 500mg Tablet", category: "Diabetes", unitType: "Tablet", price: 15.0 },
];

// Mock registered patients
const mockRegisteredPatients = [
  {
    id: "PAT-0001",
    name: "Alice Cooper",
    age: 34,
    gender: "Male",
    mobile: "+91 9876543210",
    address: "221B Baker Street, London",
    bloodGroup: "O+",
    allergies: "Penicillin",
  },
  {
    id: "PAT-0002",
    name: "John Doe",
    age: 45,
    gender: "Male",
    mobile: "+91 9123456789",
    address: "123 Main Street, Mumbai",
    bloodGroup: "B+",
    allergies: "None",
  },
];

// Helper to calculate totals
const calculateTotals = (items, requestedItems, discount = 0, taxRate = 0.05) => {
  const subtotalItems = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const subtotalRequested = requestedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const subtotal = subtotalItems + subtotalRequested;
  const tax = subtotal * taxRate;
  const total = subtotal + tax - discount;
  return { subtotalItems, subtotalRequested, subtotal, tax, total };
};

export default function AddMedicineForPatient() {
  const [activeTab, setActiveTab] = useState("registered"); // "registered" or "nonRegistered"
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchPatientQuery, setSearchPatientQuery] = useState("");
  
  // Registered patient search
  const filteredPatients = mockRegisteredPatients.filter(p =>
    p.name.toLowerCase().includes(searchPatientQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchPatientQuery.toLowerCase()) ||
    p.mobile.includes(searchPatientQuery)
  );

  // Non-registered patient form
  const [nonRegPatient, setNonRegPatient] = useState({
    name: "",
    age: "",
    gender: "Male",
    mobile: "",
    address: "",
    bloodGroup: "",
    allergies: "",
    idType: "",
    idNumber: "",
    email: "",
    aadhaar: "",
  });

  // Medicine lists
  const [medicines, setMedicines] = useState([
    { id: Date.now() + 1, name: "Paracetamol 650mg Tablet", category: "Pain Relief", unitType: "Tablet", quantity: 20, price: 18.0, notes: "After food" },
    { id: Date.now() + 2, name: "Amoxicillin 500mg Capsule", category: "Antibiotic", unitType: "Capsule", quantity: 15, price: 25.0, notes: "Before food" },
    { id: Date.now() + 3, name: "Cetirizine 10mg Tablet", category: "Antihistamine", unitType: "Tablet", quantity: 10, price: 12.0, notes: "Night only" },
  ]);
  
  const [requestedMedicines, setRequestedMedicines] = useState([
    { id: Date.now() + 4, name: "", strength: "", unitType: "Tablet", quantity: 0, price: 0, notes: "" },
  ]);

  // Filters for medicine table (registered/non-reg share same search)
  const [medicineSearch, setMedicineSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [unitFilter, setUnitFilter] = useState("all");

  // Billing & payment
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountPaid, setAmountPaid] = useState(0);

  const categories = ["all", ...new Set(mockMedicines.map(m => m.category))];
  const unitTypes = ["all", ...new Set(mockMedicines.map(m => m.unitType))];

  // Filter medicines for dropdown suggestion
  const filteredMedicineOptions = mockMedicines.filter(m => 
    (categoryFilter === "all" || m.category === categoryFilter) &&
    (unitFilter === "all" || m.unitType === unitFilter) &&
    m.name.toLowerCase().includes(medicineSearch.toLowerCase())
  );

  // Add new medicine row (from inventory)
  const addMedicineRow = () => {
    setMedicines([
      ...medicines,
      { id: Date.now(), name: "", category: "", unitType: "", quantity: 1, price: 0, notes: "" }
    ]);
  };

  const updateMedicine = (id, field, value) => {
    setMedicines(medicines.map(med => {
      if (med.id === id) {
        let updated = { ...med, [field]: value };
        // If name changes, try to auto-fill category, unitType, price from mock list
        if (field === "name") {
          const found = mockMedicines.find(m => m.name === value);
          if (found) {
            updated.category = found.category;
            updated.unitType = found.unitType;
            updated.price = found.price;
          }
        }
        return updated;
      }
      return med;
    }));
  };

  const removeMedicine = (id) => {
    setMedicines(medicines.filter(m => m.id !== id));
  };

  // Add requested medicine row
  const addRequestedRow = () => {
    setRequestedMedicines([
      ...requestedMedicines,
      { id: Date.now(), name: "", strength: "", unitType: "Tablet", quantity: 0, price: 0, notes: "" }
    ]);
  };

  const updateRequested = (id, field, value) => {
    setRequestedMedicines(requestedMedicines.map(req => {
      if (req.id === id) {
        let updated = { ...req, [field]: value };
        // Simple price estimation (you can customize)
        if (field === "quantity" || field === "strength") {
          updated.price = 0; // in real app, fetch price manually
        }
        return updated;
      }
      return req;
    }));
  };

  const removeRequested = (id) => {
    setRequestedMedicines(requestedMedicines.filter(r => r.id !== id));
  };

  const totals = calculateTotals(medicines, requestedMedicines, discount);

  useEffect(() => {
    setAmountPaid(totals.total);
  }, [totals.total]);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Requirement submitted successfully!");
    // In real app, send data to backend
  };

  return (
    <div className="min-h-screen bg-[#F2F9F6] p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto">
        <h1 className="text-2xl font-bold text-[#06402B] tracking-tight mb-2">Add Medicine for Patient</h1>
        <p className="text-gray-500 text-sm mb-6">Select a patient to add medicines and place a requirement.</p>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("registered")}
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition ${
              activeTab === "registered"
                ? "bg-white text-emerald-700 border-b-2 border-emerald-600"
                : "text-gray-500 hover:text-emerald-600"
            }`}
          >
            Registered Patients
          </button>
          <button
            onClick={() => setActiveTab("nonRegistered")}
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition ${
              activeTab === "nonRegistered"
                ? "bg-white text-emerald-700 border-b-2 border-emerald-600"
                : "text-gray-500 hover:text-emerald-600"
            }`}
          >
            Non-Registered Patients
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* LEFT COLUMN: Patient Info + Medicine Tables */}
            <div className="xl:col-span-2 space-y-6">
              {/* Patient Selection / Non-Reg Form */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                {activeTab === "registered" ? (
                  <>
                    <h2 className="text-base font-bold text-gray-800 mb-3">Select Patient</h2>
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by Patient Name / ID / Mobile"
                        value={searchPatientQuery}
                        onChange={(e) => setSearchPatientQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {filteredPatients.map((patient) => (
                        <div
                          key={patient.id}
                          onClick={() => setSelectedPatient(patient)}
                          className={`p-4 rounded-xl border cursor-pointer transition ${
                            selectedPatient?.id === patient.id
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-gray-100 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                              {patient.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <h3 className="font-bold text-gray-800">{patient.name}</h3>
                                <span className="text-xs text-gray-400 font-mono">{patient.id}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                                <span><span className="font-semibold">Age/Gender:</span> {patient.age} Y, {patient.gender}</span>
                                <span><span className="font-semibold">Mobile:</span> {patient.mobile}</span>
                                <span className="col-span-2"><span className="font-semibold">Address:</span> {patient.address}</span>
                                <span><span className="font-semibold">Blood Group:</span> {patient.bloodGroup}</span>
                                <span><span className="font-semibold">Allergies:</span> {patient.allergies}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {filteredPatients.length === 0 && (
                        <div className="text-center text-gray-400 py-8">No patients found</div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-base font-bold text-gray-800 mb-3">Patient Information (Non-Registered)</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Patient Name *</label>
                        <input type="text" value={nonRegPatient.name} onChange={e => setNonRegPatient({...nonRegPatient, name: e.target.value})} className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm" required />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Age *</label>
                        <input type="number" value={nonRegPatient.age} onChange={e => setNonRegPatient({...nonRegPatient, age: e.target.value})} className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Gender</label>
                        <select value={nonRegPatient.gender} onChange={e => setNonRegPatient({...nonRegPatient, gender: e.target.value})} className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm">
                          <option>Male</option><option>Female</option><option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Mobile *</label>
                        <input type="tel" value={nonRegPatient.mobile} onChange={e => setNonRegPatient({...nonRegPatient, mobile: e.target.value})} className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Address</label>
                        <input type="text" value={nonRegPatient.address} onChange={e => setNonRegPatient({...nonRegPatient, address: e.target.value})} className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Blood Group</label>
                        <input type="text" value={nonRegPatient.bloodGroup} onChange={e => setNonRegPatient({...nonRegPatient, bloodGroup: e.target.value})} className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm" placeholder="e.g. O+" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Allergies (If any)</label>
                        <input type="text" value={nonRegPatient.allergies} onChange={e => setNonRegPatient({...nonRegPatient, allergies: e.target.value})} className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm" placeholder="None" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">ID Type (Optional)</label>
                        <select value={nonRegPatient.idType} onChange={e => setNonRegPatient({...nonRegPatient, idType: e.target.value})} className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm">
                          <option value="">Select</option><option>Aadhaar</option><option>PAN</option><option>Driving License</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">ID Number (Optional)</label>
                        <input type="text" value={nonRegPatient.idNumber} onChange={e => setNonRegPatient({...nonRegPatient, idNumber: e.target.value})} className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Email (Optional)</label>
                        <input type="email" value={nonRegPatient.email} onChange={e => setNonRegPatient({...nonRegPatient, email: e.target.value})} className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Aadhaar Card (Optional)</label>
                        <input type="text" value={nonRegPatient.aadhaar} onChange={e => setNonRegPatient({...nonRegPatient, aadhaar: e.target.value})} className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm" placeholder="XXXX XXXX XXXX" />
                      </div>
                    </div>
                    <div className="mt-4 text-xs text-amber-600 bg-amber-50 p-3 rounded-lg">
                      <AlertCircle className="w-3.5 h-3.5 inline mr-1" /> This patient is not registered in the system. The details will be saved with this requirement only.
                    </div>
                  </>
                )}
              </div>

              {/* Add Medicines Section */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-base font-bold text-gray-800 mb-3">Add Medicines</h2>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search medicine by name..."
                      value={medicineSearch}
                      onChange={(e) => setMedicineSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-xl text-sm"
                    />
                  </div>
                  <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-3 py-2 bg-gray-50 rounded-xl text-sm">
                    {categories.map(c => <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>)}
                  </select>
                  <select value={unitFilter} onChange={e => setUnitFilter(e.target.value)} className="px-3 py-2 bg-gray-50 rounded-xl text-sm">
                    {unitTypes.map(u => <option key={u} value={u}>{u === "all" ? "All Unit Types" : u}</option>)}
                  </select>
                </div>

                {/* Medicine Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500">Medicine</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500">Category</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500">Unit Type</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500">Quantity*</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500">Notes (Optional)</th>
                        <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicines.map((med) => (
                        <tr key={med.id} className="border-b border-gray-50">
                          <td className="px-3 py-2">
                            <select
                              value={med.name}
                              onChange={(e) => updateMedicine(med.id, "name", e.target.value)}
                              className="w-full px-2 py-1 bg-gray-50 rounded-lg text-xs"
                            >
                              <option value="">Select medicine</option>
                              {filteredMedicineOptions.map(m => (
                                <option key={m.id} value={m.name}>{m.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2 text-gray-600">{med.category || "-"}</td>
                          <td className="px-3 py-2 text-gray-600">{med.unitType || "-"}</td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={med.quantity}
                              onChange={(e) => updateMedicine(med.id, "quantity", parseInt(e.target.value) || 0)}
                              className="w-20 px-2 py-1 bg-gray-50 rounded-lg text-sm"
                              min="1"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={med.notes}
                              onChange={(e) => updateMedicine(med.id, "notes", e.target.value)}
                              className="w-full px-2 py-1 bg-gray-50 rounded-lg text-xs"
                              placeholder="e.g. After food"
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button type="button" onClick={() => removeMedicine(med.id)} className="text-red-500 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button type="button" onClick={addMedicineRow} className="mt-3 text-emerald-700 text-sm font-semibold inline-flex items-center gap-1 hover:underline">
                  <Plus className="w-4 h-4" /> Add Another Medicine
                </button>
              </div>

              {/* Patient Wants Other Medicine? (non-inventory) */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-base font-bold text-gray-800 mb-3">Patient Wants Other Medicine?</h2>
                <p className="text-xs text-gray-500 mb-3">Add medicines that are not available in your current inventory.</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500">Medicine Name*</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500">Strength</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500">Unit Type</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500">Quantity*</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500">Notes (Optional)</th>
                        <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requestedMedicines.map((req) => (
                        <tr key={req.id} className="border-b border-gray-50">
                          <td className="px-3 py-2"><input type="text" value={req.name} onChange={e => updateRequested(req.id, "name", e.target.value)} className="w-full px-2 py-1 bg-gray-50 rounded-lg text-sm" placeholder="Enter medicine name" /></td>
                          <td className="px-3 py-2"><input type="text" value={req.strength} onChange={e => updateRequested(req.id, "strength", e.target.value)} className="w-full px-2 py-1 bg-gray-50 rounded-lg text-sm" placeholder="e.g. 500mg" /></td>
                          <td className="px-3 py-2">
                            <select value={req.unitType} onChange={e => updateRequested(req.id, "unitType", e.target.value)} className="px-2 py-1 bg-gray-50 rounded-lg text-sm">
                              <option>Tablet</option><option>Capsule</option><option>Inhaler</option><option>Syrup</option><option>Injection</option>
                            </select>
                          </td>
                          <td className="px-3 py-2"><input type="number" value={req.quantity} onChange={e => updateRequested(req.id, "quantity", parseInt(e.target.value) || 0)} className="w-20 px-2 py-1 bg-gray-50 rounded-lg text-sm" min="0" /></td>
                          <td className="px-3 py-2"><input type="text" value={req.notes} onChange={e => updateRequested(req.id, "notes", e.target.value)} className="w-full px-2 py-1 bg-gray-50 rounded-lg text-xs" placeholder="e.g. Required urgently" /></td>
                          <td className="px-3 py-2 text-center"><button type="button" onClick={() => removeRequested(req.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button type="button" onClick={addRequestedRow} className="mt-3 text-emerald-700 text-sm font-semibold inline-flex items-center gap-1 hover:underline">
                  <Plus className="w-4 h-4" /> Add Another Requested Medicine
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Requirement Summary & Billing */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sticky top-6">
                <h2 className="text-base font-bold text-gray-800 mb-3">Requirement Summary</h2>
                
                {/* Patient Information Summary */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Patient Information</h3>
                  {activeTab === "registered" && selectedPatient ? (
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">{selectedPatient.name}</span> ({selectedPatient.id})</p>
                      <p className="text-xs text-gray-500">Mobile: {selectedPatient.mobile}</p>
                      <p className="text-xs text-gray-500">Address: {selectedPatient.address}</p>
                      <p className="text-xs text-gray-500">Age/Gender: {selectedPatient.age} Y, {selectedPatient.gender}</p>
                      <p className="text-xs text-gray-500">Blood Group: {selectedPatient.bloodGroup}</p>
                    </div>
                  ) : activeTab === "registered" && !selectedPatient ? (
                    <p className="text-xs text-gray-400">No patient selected</p>
                  ) : (
                    <div className="space-y-1 text-sm">
                      <p><span className="font-semibold">{nonRegPatient.name || "—"}</span></p>
                      <p className="text-xs text-gray-500">Mobile: {nonRegPatient.mobile || "—"}</p>
                      <p className="text-xs text-gray-500">Address: {nonRegPatient.address || "—"}</p>
                      <p className="text-xs text-gray-500">Age/Gender: {nonRegPatient.age} Y, {nonRegPatient.gender}</p>
                      <p className="text-xs text-gray-500">Blood Group: {nonRegPatient.bloodGroup || "—"}</p>
                    </div>
                  )}
                </div>

                {/* Medicine Summary */}
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Medicines</h3>
                  <ul className="space-y-1 text-xs">
                    {medicines.filter(m => m.name && m.quantity > 0).map(m => (
                      <li key={m.id} className="flex justify-between"><span>{m.name}</span><span className="font-semibold">x{m.quantity}</span></li>
                    ))}
                    {requestedMedicines.filter(r => r.name && r.quantity > 0).map(r => (
                      <li key={r.id} className="flex justify-between"><span>{r.name} {r.strength}</span><span className="font-semibold">x{r.quantity}</span></li>
                    ))}
                    {medicines.filter(m => m.name && m.quantity > 0).length === 0 && requestedMedicines.filter(r => r.name && r.quantity > 0).length === 0 && (
                      <li className="text-gray-400">No items added</li>
                    )}
                  </ul>
                </div>

                {/* Billing */}
                <div className="border-t border-gray-100 pt-3">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Billing & Payment</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Subtotal (Items)</span><span>₹{totals.subtotalItems.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Other Requested Items</span><span>₹{totals.subtotalRequested.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Discount</span><span><input type="number" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} className="w-20 px-1 py-0.5 bg-gray-50 rounded text-right text-sm" /> ₹</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Tax (GST 5%)</span><span>₹{totals.tax.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold text-gray-800 pt-2 border-t border-gray-100"><span>Total Amount</span><span>₹{totals.total.toFixed(2)}</span></div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Payment Method</label>
                    <div className="flex gap-3 flex-wrap">
                      {["cash", "upi", "card", "other"].map(method => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1 ${
                            paymentMethod === method ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {method === "cash" && <Banknote className="w-3 h-3" />}
                          {method === "upi" && <Smartphone className="w-3 h-3" />}
                          {method === "card" && <CreditCard className="w-3 h-3" />}
                          {method === "other" && <Wallet className="w-3 h-3" />}
                          {method.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Amount Paid</label>
                    <input
                      type="number"
                      value={amountPaid}
                      onChange={e => setAmountPaid(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button type="button" className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-[#06402B] text-white rounded-xl font-bold shadow-md hover:bg-emerald-800 transition flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Submit Requirement
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}