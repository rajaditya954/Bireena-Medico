import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Search, Trash2, Plus, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import * as api from "../../services/appointmentApi";

const DOCTORS_LIST = [
  { name: "Dr. Michael Brown", type: "General Checkup", fee: 800 },
  { name: "Dr. Rajesh Kumar", type: "General Checkup", fee: 800 },
  { name: "Dr. Priya Sharma", type: "Cardiology", fee: 1200 },
];
const LAB_TESTS = [
  { name: "Complete Blood Count (CBC)", category: "Hematology", price: 350 },
  { name: "Liver Function Test (LFT)", category: "Biochemistry", price: 450 },
  { name: "Thyroid Profile (T3, T4, TSH)", category: "Endocrinology", price: 550 },
  { name: "Lipid Profile", category: "Biochemistry", price: 400 },
  { name: "Kidney Function Test", category: "Biochemistry", price: 500 },
];
const PAY_METHODS = ["Cash", "Card", "UPI", "Wallet", "Insurance"];

export default function BillingGenerateTab({ onBillGenerated }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApt, setSelectedApt] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [serviceMode, setServiceMode] = useState("both");
  const [consultations, setConsultations] = useState([
    { name: "Consultation Fee", doctor: DOCTORS_LIST[0].name, type: DOCTORS_LIST[0].type, amount: DOCTORS_LIST[0].fee },
  ]);
  const [labTests, setLabTests] = useState([]);
  const [labDiscount, setLabDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [payMethod, setPayMethod] = useState("Cash");
  const [payReceived, setPayReceived] = useState("");
  const [followupCharges, setFollowupCharges] = useState(0);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api.getTodayAppointments("all").then(r => setAppointments(r.data?.data || [])).catch(() => setAppointments([]));
  }, []);

  const filteredApts = (appointments || []).filter(a => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return a.patientName?.toLowerCase().includes(q) || a._id?.includes(q) || a.patientPhone?.includes(q);
  });

  const selectAppointment = (apt) => {
    setSelectedApt(apt);
    setSearchTerm("");
    setConsultations([{
      name: "Consultation Fee",
      doctor: apt.doctorName || DOCTORS_LIST[0].name,
      type: "General Checkup",
      amount: 800
    }]);
  };

  const addLabTest = (test) => {
    if (labTests.find(t => t.name === test.name)) return;
    setLabTests(prev => [...prev, { ...test }]);
  };

  const updateConsultation = (index, field, value) => {
    setConsultations(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  const updateLabTest = (index, field, value) => {
    setLabTests(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t));
  };

  const doctorTotal = consultations.reduce((s, c) => s + (c.amount || 0), 0) + followupCharges;
  const labTotal = labTests.reduce((s, t) => s + (t.price || 0), 0) - labDiscount;
  const subtotal = doctorTotal + Math.max(0, labTotal);
  const discount = 0;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const totalAmount = subtotal - discount + tax;
  const change = payReceived ? Math.max(0, parseFloat(payReceived) - totalAmount) : 0;

  const handleGenerate = () => {
    if (!selectedApt) return toast.error("Select an appointment first");
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      toast.success("Bill generated successfully!");
      if (onBillGenerated) onBillGenerated();
    }, 1000);
  };

  return (
    <div className="space-y-5">
      {/* Search + Select */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">Search Appointment</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input className="w-full h-10 pl-10 pr-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0F5C3A]" placeholder="Search by Appointment ID / Patient Name / Mobile" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <button className="px-4 h-10 bg-[#0F5C3A] text-white text-sm font-bold rounded-lg">Search</button>
            </div>
            {searchTerm && filteredApts.length > 0 && !selectedApt && (
              <div className="mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto z-20 relative">
                {filteredApts.slice(0, 5).map(a => (
                  <button key={a._id} onClick={() => selectAppointment(a)} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b last:border-0">
                    <span className="font-bold">{a.patientName}</span>
                    <span className="text-gray-400 ml-2 text-xs">{a._id?.slice(-6)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">Select Appointment</label>
            <select className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg" value={selectedApt?._id || ""} onChange={e => { const a = appointments.find(x => x._id === e.target.value); if (a) selectAppointment(a); }}>
              <option value="">Select Appointments</option>
              {appointments.map(a => <option key={a._id} value={a._id}>{a.patientName} - {a._id?.slice(-6)}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Appointment Details */}
      {selectedApt && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-bold text-[#0A3E2A]">Appointment Details</span>
            <span className="px-2 py-0.5 bg-emerald-100 text-[#0F5C3A] text-xs font-bold rounded">{selectedApt._id?.slice(-8)}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div><span className="text-xs text-gray-400 block">Patient</span><span className="font-bold">{selectedApt.patientName}</span></div>
            <div><span className="text-xs text-gray-400 block">Age / Gender</span><span className="font-bold">—</span></div>
            <div><span className="text-xs text-gray-400 block">Mobile</span><span className="font-bold">{selectedApt.patientPhone || "—"}</span></div>
            <div><span className="text-xs text-gray-400 block">Date & Time</span><span className="font-bold">{selectedApt.date}, {selectedApt.scheduledTime || "Walk-in"}</span></div>
            <div><span className="text-xs text-gray-400 block">Status</span><span className={cn("font-bold capitalize", selectedApt.status === "completed" ? "text-emerald-600" : "text-amber-600")}>{selectedApt.status}</span></div>
          </div>
        </div>
      )}

      {/* Services + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left: Services */}
        <div className="lg:col-span-3 space-y-4">
          {/* Service mode toggle */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#0A3E2A]">Services</span>
              <div className="flex gap-2">
                {[{ id: "both", label: "Both (Doctor + Lab)" }, { id: "doctor", label: "Only Doctor" }, { id: "lab", label: "Only Lab" }].map(m => (
                  <button key={m.id} onClick={() => setServiceMode(m.id)} className={cn("px-3 py-1.5 rounded-full text-xs font-bold border transition", serviceMode === m.id ? "bg-emerald-50 border-[#0F5C3A] text-[#0F5C3A]" : "border-gray-200 text-gray-500")}>{m.label}</button>
                ))}
              </div>
            </div>

            {/* Doctor Consultation */}
            {(serviceMode === "both" || serviceMode === "doctor") && (
              <div>
                <h3 className="text-xs font-bold text-gray-500 flex items-center gap-1 mb-2">🩺 Doctor Consultation</h3>
                <table className="w-full text-sm">
                  <thead><tr className="text-xs text-gray-400 border-b"><th className="text-left py-2">Name</th><th className="text-left py-2">Doctor</th><th className="text-left py-2">Consultation Type</th><th className="text-right py-2">Amount (₹)</th><th className="w-8"></th></tr></thead>
                  <tbody>
                    {consultations.map((c, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="py-2">
                          <input type="text" className="w-full text-sm font-medium outline-none bg-transparent" value={c.name} onChange={e => updateConsultation(i, 'name', e.target.value)} placeholder="Consultation Fee" />
                        </td>
                        <td className="py-2">
                          <input type="text" className="w-full text-sm text-gray-600 outline-none bg-transparent" value={c.doctor} onChange={e => updateConsultation(i, 'doctor', e.target.value)} placeholder="Doctor Name" />
                        </td>
                        <td className="py-2">
                          <input type="text" className="w-full text-sm text-gray-600 outline-none bg-transparent" value={c.type} onChange={e => updateConsultation(i, 'type', e.target.value)} placeholder="Type" />
                        </td>
                        <td className="py-2 text-right">
                          <div className="flex items-center justify-end font-bold">
                            ₹ <input type="number" className="w-16 text-right outline-none bg-transparent" value={c.amount} onChange={e => updateConsultation(i, 'amount', Number(e.target.value) || 0)} />
                          </div>
                        </td>
                        <td className="py-2 text-right"><button onClick={() => setConsultations(prev => prev.filter((_, j) => j !== i))} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button></td>
                      </tr>
                    ))}
                    {consultations.length === 0 && <tr><td colSpan={5} className="py-3 text-center text-gray-300 text-xs">No consultations added</td></tr>}
                  </tbody>
                </table>
                <div className="flex items-center justify-between mt-3 text-xs">
                  <button onClick={() => setConsultations(prev => [...prev, { name: "Consultation Fee", doctor: DOCTORS_LIST[0].name, type: "General Checkup", amount: 800 }])} className="px-2 py-1 bg-emerald-50 text-[#0F5C3A] rounded border border-[#0F5C3A]/20 font-bold hover:bg-emerald-100 transition">+ Add Consultation</button>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-bold">Follow-up Charges (₹):</span>
                    <input type="number" className="w-20 h-7 px-2 text-right border rounded outline-none focus:border-[#0F5C3A]" value={followupCharges} onChange={e => setFollowupCharges(Number(e.target.value) || 0)} />
                  </div>
                </div>
              </div>
            )}

            {/* Lab Services */}
            {(serviceMode === "both" || serviceMode === "lab") && (
              <div>
                <h3 className="text-xs font-bold text-gray-500 flex items-center gap-1 mb-2">🧪 Lab Services / Tests</h3>
                <table className="w-full text-sm">
                  <thead><tr className="text-xs text-gray-400 border-b"><th className="text-left py-2">Test / Package</th><th className="text-left py-2">Category</th><th className="text-right py-2">Price (₹)</th><th className="w-8"></th></tr></thead>
                  <tbody>
                    {labTests.map((t, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="py-2 flex items-center gap-1">
                          <span className="text-gray-300">✓</span> <input type="text" className="w-full text-sm font-medium outline-none bg-transparent" value={t.name} onChange={e => updateLabTest(i, 'name', e.target.value)} placeholder="Test Name" />
                        </td>
                        <td className="py-2">
                          <input type="text" className="w-full text-sm text-gray-500 outline-none bg-transparent" value={t.category} onChange={e => updateLabTest(i, 'category', e.target.value)} placeholder="Category" />
                        </td>
                        <td className="py-2 text-right">
                          <div className="flex items-center justify-end font-bold">
                            ₹ <input type="number" className="w-16 text-right outline-none bg-transparent" value={t.price} onChange={e => updateLabTest(i, 'price', Number(e.target.value) || 0)} />
                          </div>
                        </td>
                        <td className="py-2 text-right"><button onClick={() => setLabTests(prev => prev.filter((_, j) => j !== i))} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button></td>
                      </tr>
                    ))}
                    {labTests.length === 0 && <tr><td colSpan={4} className="py-3 text-center text-gray-300 text-xs">No lab tests added</td></tr>}
                  </tbody>
                </table>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {LAB_TESTS.filter(t => !labTests.find(x => x.name === t.name)).map(t => (
                    <button key={t.name} onClick={() => addLabTest(t)} className="flex items-center gap-1 px-2 py-1 text-xs border border-dashed border-gray-300 rounded text-gray-500 hover:border-[#0F5C3A] hover:text-[#0F5C3A] transition">
                      <Plus className="w-3 h-3" />{t.name}
                    </button>
                  ))}
                  <button onClick={() => setLabTests(prev => [...prev, { name: "Custom Test", category: "Other", price: 0 }])} className="flex items-center gap-1 px-2 py-1 text-xs border border-dashed border-[#0F5C3A]/50 bg-emerald-50 rounded text-[#0F5C3A] font-bold hover:bg-emerald-100 transition">
                    <Plus className="w-3 h-3" /> Custom Test
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                  <span>Lab Discount (₹)</span>
                  <input type="number" className="w-20 h-7 px-2 text-right text-xs border rounded" value={labDiscount} onChange={e => setLabDiscount(Number(e.target.value) || 0)} />
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <label className="text-xs font-bold text-gray-500 block mb-1">Notes (Optional)</label>
            <textarea className="w-full h-16 px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none outline-none focus:border-[#0F5C3A]" placeholder="Add any notes here..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>

        {/* Right: Billing Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-4 space-y-4">
            <h3 className="text-sm font-bold text-[#0A3E2A]">Billing Summary</h3>
            <div className="space-y-2 text-sm">
              {(serviceMode === "both" || serviceMode === "doctor") && <div className="flex justify-between"><span className="text-gray-500">Doctor Consultation</span><span className="font-bold">₹{doctorTotal.toFixed(2)}</span></div>}
              {(serviceMode === "both" || serviceMode === "lab") && <div className="flex justify-between"><span className="text-gray-500">Lab Tests ({labTests.length})</span><span className="font-bold">₹{Math.max(0, labTotal).toFixed(2)}</span></div>}
              <div className="border-t pt-2 flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-bold">₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Discount</span><span className="font-bold">₹{discount.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tax (GST 5%)</span><span className="font-bold">₹{tax.toFixed(2)}</span></div>
              <div className="border-t pt-2 flex justify-between text-base"><span className="font-bold text-[#0A3E2A]">Total Amount</span><span className="font-black text-[#0A3E2A]">₹ {totalAmount.toFixed(2)}</span></div>
              <div className="bg-emerald-50 rounded-lg p-3 flex justify-between"><span className="font-bold text-[#0F5C3A]">Amount Payable</span><span className="font-black text-[#0F5C3A] text-lg">₹ {totalAmount.toFixed(2)}</span></div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-2">Payment Method</label>
              <div className="flex gap-2 flex-wrap">
                {PAY_METHODS.map(m => (
                  <button key={m} onClick={() => setPayMethod(m)} className={cn("px-3 py-1.5 rounded-full text-xs font-bold border transition", payMethod === m ? "bg-[#0F5C3A] text-white border-[#0F5C3A]" : "border-gray-200 text-gray-500")}>● {m}</button>
                ))}
              </div>
            </div>

            {/* Payment Received */}
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Payment Received (₹)</label>
              <input type="number" className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0F5C3A]" value={payReceived} onChange={e => setPayReceived(e.target.value)} placeholder={totalAmount.toFixed(2)} />
            </div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Change (₹)</span><span className="font-bold">{change.toFixed(2)}</span></div>

            {/* Generate */}
            <button onClick={handleGenerate} disabled={generating || !selectedApt} className="w-full h-12 bg-[#0F5C3A] text-white rounded-xl font-bold text-sm hover:bg-[#0A3E2A] transition disabled:opacity-50 flex items-center justify-center gap-2">
              {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : "🧾 Generate Bill"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
