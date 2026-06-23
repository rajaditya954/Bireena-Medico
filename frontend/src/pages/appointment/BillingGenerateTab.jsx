import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Search, Trash2, Plus, Loader2, X } from "lucide-react";
import { cn } from "../../lib/utils";
import * as api from "../../services/appointmentApi";
import { api as backendApi } from "../../lib/api";

// ─── Constants ──────────────────────────────────────────────────────────────
const DOCTORS_LIST = [
  { name: "Dr. Michael Brown", type: "General Checkup", fee: 800 },
  { name: "Dr. Rajesh Kumar",  type: "General Checkup", fee: 800 },
  { name: "Dr. Priya Sharma",  type: "Cardiology",      fee: 1200 },
];
const LAB_TESTS = [
  { name: "Complete Blood Count (CBC)",    category: "Hematology",    price: 350 },
  { name: "Liver Function Test (LFT)",     category: "Biochemistry",  price: 450 },
  { name: "Thyroid Profile (T3, T4, TSH)", category: "Endocrinology", price: 550 },
  { name: "Lipid Profile",                 category: "Biochemistry",  price: 400 },
  { name: "Kidney Function Test",          category: "Biochemistry",  price: 500 },
];
const PAY_METHODS = ["Cash", "Insurance"];

// ─── Print Bill (HTML + auto‑print) ─────────────────────────────────────────
function openPrintBill({
  apt, consultations, labTests, followupCharges, labDiscount,
  serviceMode, subtotal, discount, tax, totalAmount, notes,
  payMethod, payReceived,
}) {
  const now       = new Date();
  const dateStr   = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr   = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const invoiceNo = `INV-${Date.now().toString().slice(-8)}`;
  const change    = payReceived ? Math.max(0, parseFloat(payReceived) - totalAmount) : 0;

  const doctorRows = (serviceMode === "both" || serviceMode === "doctor")
    ? consultations.map(c => `<tr>
        <td>${c.name}</td>
        <td>${c.doctor} · ${c.type}</td>
        <td class="num">1</td>
        <td class="num">₹${(c.amount || 0).toFixed(2)}</td>
        <td class="num">₹${(c.amount || 0).toFixed(2)}</td>
      </tr>`).join("") : "";

  const followupRow = followupCharges > 0
    ? `<tr>
        <td>Follow-up Charges</td>
        <td>Additional consultation</td>
        <td class="num">1</td>
        <td class="num">₹${followupCharges.toFixed(2)}</td>
        <td class="num">₹${followupCharges.toFixed(2)}</td>
      </tr>` : "";

  const labRows = (serviceMode === "both" || serviceMode === "lab")
    ? labTests.map(t => `<tr>
        <td>${t.name}</td>
        <td>${t.category}</td>
        <td class="num">1</td>
        <td class="num">₹${(t.price || 0).toFixed(2)}</td>
        <td class="num">₹${(t.price || 0).toFixed(2)}</td>
      </tr>`).join("") : "";

  const labDiscountRow = labDiscount > 0
    ? `<tr class="disc"><td colspan="4" class="num">Lab Discount</td><td class="num">−₹${labDiscount.toFixed(2)}</td></tr>`
    : "";

  const paySection = `<div class="pay-box">
         <p><strong>Payment Mode:</strong> ${payMethod}</p>
         ${payReceived ? `<p><strong>Amount Received:</strong> ₹${parseFloat(payReceived).toFixed(2)}</p>
           <p><strong>Change:</strong> ₹${change.toFixed(2)}</p>` : ""}
       </div>`;

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<title>Invoice ${invoiceNo}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#1a1a1a;background:#fff;padding:32px}
.page{max-width:740px;margin:0 auto}
.header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:16px;border-bottom:2px solid #0F5C3A}
.brand{font-size:22px;font-weight:800;color:#0F5C3A}
.brand-sub{font-size:11px;color:#555;margin-top:3px}
.inv-meta{text-align:right}.inv-meta .no{font-size:15px;font-weight:700;color:#0F5C3A}
.inv-meta p{font-size:11px;color:#666;margin-top:2px}
.patient{display:grid;grid-template-columns:1fr 1fr;gap:12px;background:#f7faf9;border:1px solid #d4ede3;border-radius:8px;padding:14px;margin-top:18px}
.patient label{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.5px}
.patient span{display:block;font-weight:600;font-size:13px;margin-top:2px}
.sec-title{font-size:11px;font-weight:700;color:#0F5C3A;text-transform:uppercase;letter-spacing:.8px;margin-top:20px;margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid #e0ede8}
table{width:100%;border-collapse:collapse}
thead tr{background:#f0faf5}
th{font-size:11px;font-weight:700;color:#0A3E2A;padding:7px 8px;text-align:left;border-bottom:2px solid #c8e6d6}
th.num,td.num{text-align:right}
td{padding:7px 8px;border-bottom:1px solid #f0f0f0;font-size:12px}
.disc td{color:#e53935;font-weight:600}
.totals{margin-top:18px;display:flex;justify-content:flex-end}
.totals-inner{width:270px}
.t-row{display:flex;justify-content:space-between;font-size:12px;padding:4px 0;border-bottom:1px solid #f0f0f0}
.t-total{font-size:15px;font-weight:800;color:#0F5C3A;padding:8px 0;border-top:2px solid #0F5C3A;margin-top:4px;display:flex;justify-content:space-between}
.pay-box{margin-top:16px;background:#f7faf9;border:1px solid #d4ede3;border-radius:8px;padding:12px 16px;font-size:12px}
.pay-box p{margin-bottom:4px}
.badge{display:inline-block;margin-top:6px;background:#0F5C3A;color:#fff;padding:3px 14px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:.5px}
.mono{font-family:monospace;font-size:11px}
.notes{margin-top:16px;background:#fffbe6;border:1px solid #ffe082;border-radius:8px;padding:12px 16px;font-size:12px}
.footer{margin-top:28px;padding-top:14px;border-top:1px solid #e0e0e0;display:flex;justify-content:space-between;align-items:flex-end}
.footer .thank{font-size:12px;color:#555}
.footer .sig{text-align:right;font-size:11px;color:#aaa}
.footer .sig strong{display:block;color:#1a1a1a;font-size:12px}
@media print{body{padding:0}@page{margin:18mm 14mm}}
</style></head><body>
<div class="page">
  <div class="header">
    <div><div class="brand">Bireena Medico</div><div class="brand-sub">Multi-Specialty Clinic &amp; Diagnostic Centre</div></div>
    <div class="inv-meta">
      <div class="no">${invoiceNo}</div>
      <p>Date: ${dateStr}</p><p>Time: ${timeStr}</p>
      <p>Appt: ${apt._id?.slice(-8) || "—"}</p>
    </div>
  </div>

  <div class="patient">
    <div><label>Patient Name</label><span>${apt.patientName || "—"}</span></div>
    <div><label>Mobile</label><span>${apt.patientPhone || "—"}</span></div>
    <div><label>Date &amp; Time</label><span>${apt.date || dateStr}, ${apt.scheduledTime || "Walk-in"}</span></div>
    <div><label>Status</label><span style="text-transform:capitalize;color:${apt.status === "completed" ? "#0F5C3A" : "#b45309"}">${apt.status || "—"}</span></div>
  </div>

  ${(serviceMode === "both" || serviceMode === "doctor") && (consultations.length > 0 || followupCharges > 0) ? `
  <div class="sec-title">🩺 Doctor Consultation</div>
  <table><thead><tr><th>Service</th><th>Description</th><th class="num">Qty</th><th class="num">Unit Price</th><th class="num">Amount</th></tr></thead>
  <tbody>${doctorRows}${followupRow}</tbody></table>` : ""}

  ${(serviceMode === "both" || serviceMode === "lab") && labTests.length > 0 ? `
  <div class="sec-title">🧪 Lab Services / Tests</div>
  <table><thead><tr><th>Test / Package</th><th>Category</th><th class="num">Qty</th><th class="num">Unit Price</th><th class="num">Amount</th></tr></thead>
  <tbody>${labRows}${labDiscountRow}</tbody></table>` : ""}

  <div class="totals"><div class="totals-inner">
    ${(serviceMode === "both" || serviceMode === "doctor") ? `<div class="t-row"><span>Doctor Consultation</span><span>₹${(consultations.reduce((s,c)=>s+(c.amount||0),0)+followupCharges).toFixed(2)}</span></div>` : ""}
    ${(serviceMode === "both" || serviceMode === "lab") ? `<div class="t-row"><span>Lab Tests</span><span>₹${Math.max(0,labTests.reduce((s,t)=>s+Number(t.price||0),0)-labDiscount).toFixed(2)}</span></div>` : ""}
    <div class="t-row"><span>Subtotal</span><span>₹${subtotal.toFixed(2)}</span></div>
    <div class="t-row"><span>Discount</span><span>−₹${discount.toFixed(2)}</span></div>
    <div class="t-row"><span>GST (5%)</span><span>₹${tax.toFixed(2)}</span></div>
    <div class="t-total"><span>Total Amount</span><span>₹ ${totalAmount.toFixed(2)}</span></div>
  </div></div>

  ${paySection}
  ${notes ? `<div class="notes"><strong>Notes:</strong> ${notes}</div>` : ""}

  <div class="footer">
    <div class="thank">Thank you for choosing Bireena Medico.<br/>Get well soon 💚</div>
    <div class="sig"><strong>Authorised Signatory</strong>Bireena Medico</div>
  </div>
</div>
<script>window.onload=()=>{ window.print(); }</script>
</body></html>`;

  const win = window.open("", "_blank");
  if (!win) { toast.error("Pop-up blocked — allow pop-ups in your browser and try again."); return; }
  win.document.write(html);
  win.document.close();
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function BillingGenerateTab({ onBillGenerated }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

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
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [paymentMessage, setPaymentMessage] = useState("");

  useEffect(() => {
    api.getTodayAppointments("all")
      .then(r => setAppointments(r.data?.data || []))
      .catch(() => setAppointments([]));
  }, []);

  // ── Patient search ─────────────────────────────────────────
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (patientSearch.trim().length < 2 || selectedPatient) {
        setPatients([]);
        return;
      }
      setLoadingPatients(true);
      try {
        const res = await api.searchPatients(patientSearch);
        setPatients(res.data?.data || []);
      } catch (err) {
        console.error("Search patients error:", err);
      } finally {
        setLoadingPatients(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [patientSearch, selectedPatient]);

  const selectPatient = (patient) => {
    setSelectedPatient(patient);
    setPatientSearch("");
    setPatients([]);
    
    // Find today's appointments for this patient
    const patientApts = appointments.filter(a => {
      const pId = a.patientId?._id || a.patientId;
      return pId === patient._id || pId === patient.id;
    });

    if (patientApts.length === 1) {
      selectAppointment(patientApts[0]);
      toast.success(`Automatically selected appointment for ${patient.name || patient.fullName}`);
    } else if (patientApts.length > 1) {
      toast.success(`${patientApts.length} appointments found today. Please select one.`);
      setSelectedApt(null);
    } else {
      toast.error("No appointments found for this patient today");
      setSelectedApt(null);
    }
  };

  const filteredApts = (appointments || []).filter(a => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return a.patientName?.toLowerCase().includes(q) || a._id?.includes(q) || a.patientPhone?.includes(q);
  });

  const selectAppointment = (apt) => {
    setSelectedApt(apt);
    setSearchTerm("");
    if (apt) {
      setSelectedPatient({
        id: apt.patientId?._id || apt.patientId,
        _id: apt.patientId?._id || apt.patientId,
        name: apt.patientName,
        phone: apt.patientPhone
      });
    }
    setConsultations([{
      name: "Consultation Fee",
      doctor: apt.doctorName || DOCTORS_LIST[0].name,
      type: "General Checkup",
      amount: 800
    }]);
    setLabTests([]);
    setLabDiscount(0);
    setFollowupCharges(0);
    setNotes("");
    setPayReceived("");
    setPayMethod("Cash");
    setPaymentStatus("pending");
    setPaymentMessage("");
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
  const labTotal = labTests.reduce((s, t) => s + Number(t.price || 0), 0) - labDiscount;
  const subtotal = doctorTotal + Math.max(0, labTotal);
  const discount = 0;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const totalAmount = subtotal - discount + tax;
  const change = payReceived ? Math.max(0, parseFloat(payReceived) - totalAmount) : 0;

  // ----- Generate & Save Bill -----
  const handleGenerate = async () => {
    if (!selectedApt) return toast.error("Select an appointment first");

    setGenerating(true);
    try {
      const patientId = selectedApt.patientId || selectedApt.patient?._id;
      if (!patientId) throw new Error("Patient ID not found");

      const items = [];
      if (serviceMode === "both" || serviceMode === "doctor") {
        consultations.forEach(c => items.push({
          serviceName: c.name,
          description: `${c.doctor} • ${c.type}`,
          quantity: 1,
          unitPrice: c.amount || 0,
          amount: c.amount || 0,
        }));
        if (followupCharges) items.push({
          serviceName: "Follow-up Charges",
          description: "Additional consultation",
          quantity: 1,
          unitPrice: followupCharges,
          amount: followupCharges,
        });
      }
      if (serviceMode === "both" || serviceMode === "lab") {
        labTests.forEach(t => items.push({
          serviceName: t.name,
          description: t.category,
          quantity: 1,
          unitPrice: t.price || 0,
          amount: t.price || 0,
        }));
      }

      const billingRes = await backendApi.createBilling({
        patientId,
        appointmentId: selectedApt._id,
        items,
        subtotal,
        discount,
        tax,
        total: totalAmount,
        notes,
        paymentStatus: payMethod === "Cash" ? "PAID" : "PENDING",
        status: payMethod === "Cash" ? "paid" : "pending",
      });
      const billing = billingRes.data.billing;

      const invoiceRes = await backendApi.generateInvoice(billing._id);
      const invoice = invoiceRes.data.invoice;

      toast.success("Bill generated and saved!");
      if (onBillGenerated) onBillGenerated();

      setTimeout(() => {
        openPrintBill({
          apt: selectedApt,
          consultations,
          labTests,
          followupCharges,
          labDiscount,
          serviceMode,
          subtotal,
          discount,
          tax,
          totalAmount,
          notes,
          payMethod,
          payReceived,
        });
      }, 400);
    } catch (error) {
      console.error("Generate bill error:", error);
      toast.error(error.message || "Failed to generate bill");
    } finally {
      setGenerating(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Search + Select */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">Search Patient</label>
            {selectedPatient ? (
              <div className="flex items-center justify-between bg-emerald-50/60 border border-emerald-100 h-10 px-3 rounded-lg">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold text-[#0F5C3A] text-sm truncate">{selectedPatient.name || selectedPatient.fullName}</span>
                  <span className="text-xs text-gray-400 shrink-0">({selectedPatient.phone})</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedPatient(null);
                    setPatientSearch("");
                    setSelectedApt(null);
                  }}
                  className="p-1 hover:bg-red-50 text-red-500 rounded-md transition-all cursor-pointer"
                  title="Clear Selected Patient"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  className="w-full h-10 pl-10 pr-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0F5C3A]"
                  placeholder="Search patient by name or phone..."
                  value={patientSearch}
                  onChange={e => setPatientSearch(e.target.value)}
                />
                {patientSearch.trim().length >= 2 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-52 overflow-y-auto z-30">
                    {loadingPatients ? (
                      <div className="flex items-center justify-center p-3 gap-2 text-gray-500 text-xs">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching...
                       </div>
                    ) : patients.length > 0 ? (
                      patients.map((p) => (
                        <button
                          key={p.id || p._id}
                          onClick={() => selectPatient(p)}
                          className="w-full text-left px-3 py-2.5 hover:bg-gray-50 text-sm border-b last:border-0 flex justify-between items-center cursor-pointer"
                        >
                          <span className="font-medium text-gray-800">{p.name || p.fullName}</span>
                          <span className="text-xs text-gray-400">{p.phone}</span>
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-center text-xs text-gray-400">No patients found</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">Select Appointment</label>
            <select
              className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg"
              value={selectedApt?._id || ""}
              onChange={e => { const a = appointments.find(x => x._id === e.target.value); if (a) selectAppointment(a); }}
            >
              <option value="">Select Appointments</option>
              {(() => {
                const dropdownAppointments = selectedPatient
                  ? appointments.filter(a => {
                      const pId = a.patientId?._id || a.patientId;
                      return pId === selectedPatient._id || pId === selectedPatient.id;
                    })
                  : appointments;
                return dropdownAppointments.map(a => (
                  <option key={a._id} value={a._id}>
                    {a.patientName} - {a.doctorName} ({a.scheduledTime || "Walk-in"}) - {a._id?.slice(-6)}
                  </option>
                ));
              })()}
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

            {/* Payment Received (for Cash/Insurance) */}
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Payment Received (₹)</label>
              <input type="number" className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0F5C3A]" value={payReceived} onChange={e => setPayReceived(e.target.value)} placeholder={totalAmount.toFixed(2)} />
            </div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Change (₹)</span><span className="font-bold">{change.toFixed(2)}</span></div>

            {/* Buttons */}
            <div className="grid gap-3">
              <button
                onClick={handleGenerate}
                disabled={generating || !selectedApt}
                className="w-full h-12 bg-[#0F5C3A] text-white rounded-xl font-bold text-sm hover:bg-[#0A3E2A] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : "🧾 Generate Bill"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}