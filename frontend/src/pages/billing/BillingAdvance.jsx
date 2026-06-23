import { useEffect, useMemo, useRef, useState } from "react";

import {
  PATIENTS, APPOINTMENTS, SERVICE_CATALOG, TAX_RATE,
  DEFAULT_DISCOUNT, HOSPITAL_INFO, generateInvoiceNumber,
} from "../../data/bill";

import { money, fmtDate, fmtDateTime, capitalize } from "../../lib/format";
import { api } from "../../lib/api";
import { cn } from "../../lib/utils";

import { toast } from "sonner";

import {
  User, Hospital, Receipt, Shield, CreditCard, Calculator,
  Camera, ClipboardList, Plus, Minus, X, Printer, RotateCcw,
} from "lucide-react";
const TYPE_COLOR = {
  CONSULTATION: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  LAB: "bg-teal-500/10 text-teal-700 border-teal-500/20",
  MEDICINE: "bg-red-500/10 text-red-600 border-red-500/20",
  PROCEDURE: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  ROOM: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  NURSING: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20",
  EQUIPMENT: "bg-emerald-500/10 text-brand-accent border-emerald-500/20",
  OTHER: "bg-slate-500/10 text-slate-600 border-slate-500/20",
};

const STATUS_COLOR = {
  paid: "text-emerald-600 border-l-emerald-500",
  pending: "text-amber-600 border-l-amber-500",
  partial: "text-blue-600 border-l-blue-500",
  draft: "text-slate-500 border-l-slate-400",
};

const SECTIONS = [
  { id: "patient", label: "Patient Info", icon: User },
  { id: "visit", label: "Visit / Admission", icon: Hospital },
  { id: "charges", label: "Charges", icon: Receipt },
  { id: "insurance", label: "Insurance", icon: Shield },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "summary", label: "Summary", icon: Calculator },
  { id: "preview", label: "Preview", icon: Camera },
  { id: "saved", label: "Saved Bills", icon: ClipboardList },
];

function FieldLabel({ children }) {
  return <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">{children}</div>;
}
function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-2xl bg-brand-soft text-brand flex items-center justify-center"><Icon className="w-5 h-5" /></div>
      <h2 className="text-lg font-bold text-brand tracking-tight">{title}</h2>
    </div>
  );
}

function InvoicePreview({ bill, patient, appointment, onClose, onPrint }) {
  const status = bill.status || "pending";
  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-6 no-print">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-8">
        <div className="flex items-center justify-between p-6 border-b border-border/60 no-print">
          <div>
            <p className="font-black text-brand text-lg tracking-tight">Invoice Preview</p>
            <p className="text-xs font-bold text-muted-foreground">Print or save as PDF</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onPrint} className="h-11 px-5 rounded-xl bg-brand text-brand-foreground font-black text-xs uppercase tracking-widest flex items-center gap-2"><Printer className="w-4 h-4" /> Print / Save PDF</button>
            <button onClick={onClose} className="h-11 px-5 rounded-xl bg-surface-muted text-foreground font-black text-xs uppercase tracking-widest flex items-center gap-2"><X className="w-4 h-4" /> Close</button>
          </div>
        </div>

        <div id="invoice-print" className="p-10 text-foreground">
          <div className="flex items-start justify-between gap-8">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-brand-soft rounded-2xl flex items-center justify-center text-3xl">{HOSPITAL_INFO.logo}</div>
              <div>
                <p className="font-black text-brand text-xl tracking-tighter">{HOSPITAL_INFO.name}</p>
                <p className="text-xs font-bold text-muted-foreground italic">{HOSPITAL_INFO.tagline}</p>
                <p className="text-[11px] text-muted-foreground mt-2 leading-5">
                  {HOSPITAL_INFO.address}<br />
                  {HOSPITAL_INFO.phone} · {HOSPITAL_INFO.email}<br />
                  GST: {HOSPITAL_INFO.gst}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className={cn("inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", status === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-50 text-slate-600 border-slate-200")}>{capitalize(status)}</span>
              <p className="font-black text-brand text-xl tracking-tighter mt-2">{bill.invoiceNumber}</p>
              <p className="text-[11px] text-muted-foreground">Date: {fmtDate(bill.issuedAt)}</p>
              {bill.dueDate && <p className="text-[11px] text-muted-foreground">Due: {fmtDate(bill.dueDate)}</p>}
            </div>
          </div>

          <div className="my-8 h-px bg-border" />

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Patient", title: patient?.name || "—", lines: [`UHID: ${patient?._id || "—"}`, `${patient?.age ?? "—"}y · ${patient?.gender || "—"}`, patient?.phone, patient?.email] },
              { label: "Visit", title: appointment?.doctorName || "Walk-in", lines: [`Dept: ${appointment?.speciality || "General"}`, `Type: ${bill.visitType || "OPD"}`, `Date: ${appointment?.date || fmtDate(bill.issuedAt)}`, `Room: ${bill.roomNumber || "—"}`] },
              { label: "Insurance", title: bill.insuranceProvider || "Self Pay", lines: [`Policy: ${bill.policyNumber || "—"}`, `Coverage: ${bill.coveragePercent ?? 0}%`, `Deduction: ${money(bill.insuranceDeduction || 0)}`, `Method: ${bill.paymentMethod || "—"}`] },
            ].map((c) => (
              <div key={c.label} className="bg-surface-muted rounded-2xl p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{c.label}</p>
                <p className="font-bold text-brand mt-1">{c.title}</p>
                <div className="text-[11px] text-muted-foreground mt-2 leading-5">
                  {c.lines.filter(Boolean).map((l, i) => <p key={i}>{l}</p>)}
                </div>
              </div>
            ))}
          </div>

          <p className="font-black text-brand uppercase tracking-widest text-xs mt-8 mb-3">Itemized Charges</p>
          <table className="w-full text-sm">
            <thead className="bg-brand-soft text-brand">
              <tr>
                <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest">Date</th>
                <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest">Description</th>
                <th className="text-right py-3 px-4 text-[10px] font-black uppercase tracking-widest">Charges</th>
                <th className="text-right py-3 px-4 text-[10px] font-black uppercase tracking-widest">Balance</th>
              </tr>
            </thead>
            <tbody>
              {(bill.items || []).map((it, i) => (
                <tr key={i} className={i % 2 ? "bg-surface-muted/40" : ""}>
                  <td className="py-3 px-4 text-xs">{fmtDate(it.date || bill.issuedAt)}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-foreground">{it.name}</p>
                    <p className="text-[11px] text-muted-foreground">{it.type} · Qty {it.quantity}</p>
                  </td>
                  <td className="py-3 px-4 text-right font-bold">{money(it.amount)}</td>
                  <td className="py-3 px-4 text-right font-bold">{money(it.amount)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-brand">
                <td colSpan={2} className="py-3 px-4 font-black uppercase text-xs tracking-widest">Subtotal</td>
                <td className="py-3 px-4 text-right font-black">{money(bill.subtotal)}</td>
                <td className="py-3 px-4 text-right font-black">{money(bill.subtotal)}</td>
              </tr>
              <tr><td colSpan={2} className="py-2 px-4 text-xs font-bold text-muted-foreground">GST</td><td className="py-2 px-4 text-right">{money(bill.tax)}</td><td className="py-2 px-4 text-right">{money(bill.tax)}</td></tr>
              <tr><td colSpan={2} className="py-2 px-4 text-xs font-bold text-muted-foreground">Discount</td><td className="py-2 px-4 text-right text-red-600">- {money(bill.discount)}</td><td className="py-2 px-4 text-right text-red-600">- {money(bill.discount)}</td></tr>
              <tr><td colSpan={2} className="py-2 px-4 text-xs font-bold text-muted-foreground">Insurance Deduction</td><td className="py-2 px-4 text-right text-red-600">- {money(bill.insuranceDeduction || 0)}</td><td className="py-2 px-4 text-right text-red-600">- {money(bill.insuranceDeduction || 0)}</td></tr>
              <tr className="bg-brand text-brand-foreground">
                <td colSpan={2} className="py-4 px-4 font-black uppercase tracking-widest">Patient Due</td>
                <td className="py-4 px-4 text-right text-2xl font-black tracking-tighter">{money(bill.totalAmount)}</td>
                <td className="py-4 px-4 text-right text-2xl font-black tracking-tighter">{money(bill.paymentSummary?.dueAmount ?? bill.totalAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function BillingAdvanced() {
  const [tab, setTab] = useState("create");
  const [activeSection, setActiveSection] = useState("patient");
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState(PATIENTS);
  const [appointments, setAppointments] = useState(APPOINTMENTS);
  const [services, setServices] = useState(SERVICE_CATALOG);
  const [backendUp, setBackendUp] = useState(null);

  const refs = {
    patient: useRef(null), visit: useRef(null),
    charges: useRef(null), insurance: useRef(null),
    payment: useRef(null), summary: useRef(null),
    preview: useRef(null), saved: useRef(null),
  };

  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedAppt, setSelectedAppt] = useState("");
  const [items, setItems] = useState([]);
  const [serviceSearch, setServiceSearch] = useState("");
  const [discount, setDiscount] = useState(DEFAULT_DISCOUNT);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [billStatus, setBillStatus] = useState("pending");
  const [visitType, setVisitType] = useState("OPD");
  const [roomNumber, setRoomNumber] = useState("");
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [coveragePercent, setCoveragePercent] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [viewBill, setViewBill] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [p, a, s, b] = await Promise.all([api.listPatients(), api.listAppointments(), api.listServices(), api.listBills()]);
        if (p?.length) setPatients(p);
        if (a?.length) setAppointments(a);
        if (s?.length) setServices(s);
        setBills(b || []);
        setBackendUp(true);
      } catch {
        setBackendUp(false);
      }
    })();
  }, []);

  const selectedPatientObj = useMemo(() => patients.find((p) => p._id === selectedPatient) || null, [selectedPatient, patients]);
  const patientAppointments = useMemo(() => appointments.filter((a) => a.patientId === selectedPatient), [selectedPatient, appointments]);
  const selectedApptObj = useMemo(() => appointments.find((a) => a._id === selectedAppt) || null, [selectedAppt, appointments]);

  const filteredServices = useMemo(() => {
    const q = serviceSearch.trim().toLowerCase();
    if (!q) return services;
    return services.filter((s) => s.name.toLowerCase().includes(q) || s.type.toLowerCase().includes(q));
  }, [serviceSearch, services]);

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + Number(i.amount || 0), 0), [items]);
  const tax = +(subtotal * TAX_RATE).toFixed(2);
  const discountAmount = Number(discount || 0);
  const insuranceDeduction = useMemo(() => {
    const base = subtotal + tax - discountAmount;
    return +Math.max(0, (base * Number(coveragePercent || 0)) / 100).toFixed(2);
  }, [subtotal, tax, discountAmount, coveragePercent]);
  const totalAmount = +Math.max(0, subtotal + tax - discountAmount - insuranceDeduction).toFixed(2);
  const paidAmount = billStatus === "paid" ? totalAmount : billStatus === "partial" ? +(totalAmount * 0.5).toFixed(2) : 0;
  const dueAmount = +Math.max(0, totalAmount - paidAmount).toFixed(2);

  const goToSection = (id) => {
    setActiveSection(id);
    refs[id].current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const addService = (svc) => {
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.name === svc.name && x.type === svc.type);
      if (idx !== -1) return prev.map((x, i) => i === idx ? { ...x, quantity: x.quantity + 1, amount: (x.quantity + 1) * x.unitPrice } : x);
      return [...prev, { type: svc.type, name: svc.name, quantity: 1, unitPrice: svc.unitPrice, amount: svc.unitPrice, date: new Date().toISOString() }];
    });
  };
  const updateQty = (i, qty) => {
    if (qty < 1) return removeItem(i);
    setItems((prev) => prev.map((it, idx) => idx === i ? { ...it, quantity: qty, amount: qty * it.unitPrice } : it));
  };
  const removeItem = (i) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const resetForm = () => {
    setSelectedPatient(""); setSelectedAppt(""); setItems([]); setServiceSearch("");
    setDiscount(DEFAULT_DISCOUNT); setPaymentMethod("Cash"); setBillStatus("pending");
    setVisitType("OPD"); setRoomNumber(""); setInsuranceProvider(""); setPolicyNumber("");
    setCoveragePercent(0); setDueDate("");
  };

  const saveBill = async () => {
    if (!selectedPatient) return toast.error("Select a patient first.");
    if (!items.length) return toast.error("Add at least one item.");
    const payload = {
      patient: selectedPatient,
      appointment: selectedAppt || null,
      items, subtotal, tax, discount: discountAmount,
      insuranceProvider, policyNumber,
      coveragePercent: Number(coveragePercent || 0), insuranceDeduction,
      totalAmount, status: billStatus,
      paymentSummary: { paidAmount, dueAmount },
      paymentMethod, visitType, roomNumber,
      dueDate: dueDate || null, issuedAt: new Date().toISOString(),
    };
    try {
      const created = await api.createBill(payload);
      setBills((p) => [created, ...p]);
      setViewBill(created);
      toast.success(`Saved ${created.invoiceNumber}`);
      resetForm();
    } catch {
      const local = { ...payload, _id: `b-${Date.now()}`, invoiceNumber: generateInvoiceNumber(bills.length) };
      setBills((p) => [local, ...p]);
      setViewBill(local);
      toast.warning("Backend offline / unauthorized — saved locally only.");
      resetForm();
    }
  };

  const getPatient = (id) => patients.find((p) => p._id === id);
  const getAppt = (id) => appointments.find((a) => a._id === id);

  return (
    <div className="space-y-8">
      {viewBill && (
        <InvoicePreview bill={viewBill} patient={getPatient(viewBill.patient)} appointment={getAppt(viewBill.appointment)} onClose={() => setViewBill(null)} onPrint={() => window.print()} />
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-brand tracking-tighter italic">Advanced Billing</h1>
          <p className="text-muted-foreground font-medium">{HOSPITAL_INFO.name} · {fmtDate(new Date())}</p>
        </div>
        <div className="flex items-center gap-3">
          {backendUp === false && <span className="text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-lg bg-orange-50 text-orange-600 border border-orange-200">Backend offline</span>}
          <div className="bg-surface p-1.5 rounded-2xl border border-border/60 flex gap-1">
            <button onClick={() => setTab("create")} className={cn("px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all", tab === "create" ? "bg-brand text-brand-foreground" : "text-muted-foreground hover:text-brand")}>New Invoice</button>
            <button onClick={() => setTab("list")} className={cn("px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all", tab === "list" ? "bg-brand text-brand-foreground" : "text-muted-foreground hover:text-brand")}>Saved ({bills.length})</button>
          </div>
        </div>
      </div>

      {tab === "create" && (
        <div className="flex gap-8">
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="sticky top-28 bg-surface rounded-3xl border border-border/60 p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 mb-1">Bill Management</p>
              <p className="text-[10px] font-bold text-muted-foreground/60 px-3 mb-4">Fill section by section</p>
              <div className="space-y-1">
                {SECTIONS.map((s) => {
                  const Icon = s.icon;
                  const active = activeSection === s.id;
                  return (
                    <button key={s.id} onClick={() => goToSection(s.id)} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all", active ? "bg-brand text-brand-foreground" : "text-muted-foreground hover:bg-brand-soft hover:text-brand")}>
                      <Icon className="w-4 h-4" /> {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <div className="flex-1 space-y-6 min-w-0">
            <div ref={refs.patient} className="bg-surface rounded-3xl border border-border/60 p-8 shadow-sm">
              <SectionTitle icon={User} title="Patient Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FieldLabel>Patient *</FieldLabel>
                  <select value={selectedPatient} onChange={(e) => { setSelectedPatient(e.target.value); setSelectedAppt(""); }} className="w-full h-12 px-4 bg-surface-muted rounded-xl outline-none focus:ring-4 focus:ring-brand/10 font-bold text-sm">
                    <option value="">Select patient</option>
                    {patients.map((p) => <option key={p._id} value={p._id}>{p.name} · {p.age}y · {p.gender}</option>)}
                  </select>
                </div>
                <div>
                  <FieldLabel>Patient Preview</FieldLabel>
                  <input disabled value={selectedPatientObj ? `${selectedPatientObj.name} | ${selectedPatientObj.phone}` : ""} placeholder="Selected details appear here" className="w-full h-12 px-4 bg-surface-muted rounded-xl font-bold text-sm" />
                </div>
              </div>
            </div>

            <div ref={refs.visit} className="bg-surface rounded-3xl border border-border/60 p-8 shadow-sm">
              <SectionTitle icon={Hospital} title="Visit / Admission Details" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><FieldLabel>Visit Type</FieldLabel>
                  <select value={visitType} onChange={(e) => setVisitType(e.target.value)} className="w-full h-12 px-4 bg-surface-muted rounded-xl font-bold text-sm">
                    {["OPD", "IPD", "Emergency", "Follow-up"].map((v) => <option key={v}>{v}</option>)}
                  </select></div>
                <div><FieldLabel>Room / Bed</FieldLabel>
                  <input value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="Room 203 / Bed 7" className="w-full h-12 px-4 bg-surface-muted rounded-xl font-bold text-sm" /></div>
                <div><FieldLabel>Appointment</FieldLabel>
                  <select value={selectedAppt} onChange={(e) => setSelectedAppt(e.target.value)} disabled={!selectedPatient} className="w-full h-12 px-4 bg-surface-muted rounded-xl font-bold text-sm disabled:opacity-60">
                    <option value="">Walk-in / No appointment</option>
                    {patientAppointments.map((a) => <option key={a._id} value={a._id}>{a.doctorName} · {a.speciality} · {a.date}</option>)}
                  </select></div>
                <div><FieldLabel>Selected Doctor</FieldLabel>
                  <input disabled value={selectedApptObj ? `${selectedApptObj.doctorName} | ${selectedApptObj.speciality}` : ""} placeholder="Doctor details" className="w-full h-12 px-4 bg-surface-muted rounded-xl font-bold text-sm" /></div>
              </div>
            </div>

            <div ref={refs.charges} className="bg-surface rounded-3xl border border-border/60 p-8 shadow-sm">
              <SectionTitle icon={Receipt} title="Charges" />
              <input value={serviceSearch} onChange={(e) => setServiceSearch(e.target.value)} placeholder="Search consultation, lab, medicine…" className="w-full h-12 px-4 bg-surface-muted rounded-xl font-bold text-sm mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredServices.map((svc) => (
                  <button key={svc.id} onClick={() => addService(svc)} className={cn("text-left p-4 rounded-2xl border-2 transition-all hover:scale-105", TYPE_COLOR[svc.type] || TYPE_COLOR.OTHER)}>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-80">{svc.type}</p>
                    <p className="font-bold text-foreground text-sm mt-1 leading-tight">{svc.name}</p>
                    <p className="font-black text-brand mt-2">{money(svc.unitPrice)}</p>
                  </button>
                ))}
              </div>

              <div className="mt-6 bg-surface-muted rounded-2xl p-5">
                <p className="text-xs font-black uppercase tracking-widest text-brand mb-3">Bill Items ({items.length})</p>
                {!items.length ? (
                  <p className="text-sm font-bold text-muted-foreground/60 py-6 text-center">No items added yet. Click a service above.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <th className="pb-2">Type</th><th className="pb-2">Item</th><th className="pb-2">Qty</th><th className="pb-2">Unit</th><th className="pb-2">Amount</th><th />
                    </tr></thead>
                    <tbody className="divide-y divide-border/40">
                      {items.map((it, i) => (
                        <tr key={i}>
                          <td className="py-3"><span className={cn("text-[10px] font-black px-2 py-1 rounded-md", TYPE_COLOR[it.type] || TYPE_COLOR.OTHER)}>{it.type}</span></td>
                          <td className="py-3 font-bold">{it.name}</td>
                          <td className="py-3"><div className="inline-flex items-center gap-2 bg-surface rounded-lg px-2 py-1">
                            <button onClick={() => updateQty(i, it.quantity - 1)} className="w-6 h-6 rounded bg-surface-muted hover:bg-brand-soft flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                            <span className="font-black w-6 text-center">{it.quantity}</span>
                            <button onClick={() => updateQty(i, it.quantity + 1)} className="w-6 h-6 rounded bg-surface-muted hover:bg-brand-soft flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                          </div></td>
                          <td className="py-3">{money(it.unitPrice)}</td>
                          <td className="py-3 font-black">{money(it.amount)}</td>
                          <td className="py-3 text-right"><button onClick={() => removeItem(i)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg"><X className="w-4 h-4" /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div ref={refs.insurance} className="bg-surface rounded-3xl border border-border/60 p-8 shadow-sm">
              <SectionTitle icon={Shield} title="Insurance Details" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><FieldLabel>Provider</FieldLabel><input value={insuranceProvider} onChange={(e) => setInsuranceProvider(e.target.value)} placeholder="e.g. Star Health" className="w-full h-12 px-4 bg-surface-muted rounded-xl font-bold text-sm" /></div>
                <div><FieldLabel>Policy Number</FieldLabel><input value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} placeholder="Policy / Claim ID" className="w-full h-12 px-4 bg-surface-muted rounded-xl font-bold text-sm" /></div>
                <div><FieldLabel>Coverage %</FieldLabel><input type="number" min={0} max={100} value={coveragePercent} onChange={(e) => setCoveragePercent(Number(e.target.value))} className="w-full h-12 px-4 bg-surface-muted rounded-xl font-bold text-sm" /></div>
                <div><FieldLabel>Due Date</FieldLabel><input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full h-12 px-4 bg-surface-muted rounded-xl font-bold text-sm" /></div>
              </div>
            </div>

            <div ref={refs.payment} className="bg-surface rounded-3xl border border-border/60 p-8 shadow-sm">
              <SectionTitle icon={CreditCard} title="Payment Details" />
              <FieldLabel>Payment Method</FieldLabel>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {["Cash", "UPI", "Card", "Online"].map((m) => (
                  <button key={m} onClick={() => setPaymentMethod(m)} className={cn("h-12 rounded-xl font-black text-xs uppercase tracking-widest transition-all", paymentMethod === m ? "bg-brand text-brand-foreground scale-105" : "bg-surface-muted text-muted-foreground hover:text-brand")}>{m}</button>
                ))}
              </div>
              <FieldLabel>Status</FieldLabel>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["draft", "pending", "partial", "paid"].map((s) => (
                  <button key={s} onClick={() => setBillStatus(s)} className={cn("h-12 rounded-xl font-black text-xs uppercase tracking-widest transition-all", billStatus === s ? "bg-brand text-brand-foreground scale-105" : "bg-surface-muted text-muted-foreground hover:text-brand")}>{capitalize(s)}</button>
                ))}
              </div>
            </div>

            <div ref={refs.summary} className="bg-brand text-brand-foreground rounded-3xl p-8 shadow-2xl shadow-brand/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center"><Calculator className="w-5 h-5" /></div>
                <h2 className="text-lg font-bold tracking-tight">Summary</h2>
              </div>
              {[["Subtotal", money(subtotal)], [`GST (${Math.round(TAX_RATE * 100)}%)`, money(tax)], ["Discount", `- ${money(discountAmount)}`], ["Insurance", `- ${money(insuranceDeduction)}`]].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 text-sm"><span className="text-emerald-100/60 font-bold uppercase tracking-widest text-[10px]">{k}</span><strong>{v}</strong></div>
              ))}
              <div className="border-t border-white/10 mt-4 pt-4 flex justify-between items-baseline"><span className="text-lg font-bold">Total</span><strong className="text-4xl font-black tracking-tighter">{money(totalAmount)}</strong></div>
              <div className="mt-4 bg-white/10 rounded-xl p-4 text-xs font-bold space-y-1">
                <div className="flex justify-between"><span className="opacity-60">Paid</span><span>{money(paidAmount)}</span></div>
                <div className="flex justify-between"><span className="opacity-60">Due</span><span>{money(dueAmount)}</span></div>
              </div>
              <div className="mt-6"><FieldLabel><span className="text-emerald-100/60">Discount</span></FieldLabel>
                <input type="number" min={0} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-full h-12 px-4 bg-white/10 rounded-xl font-bold text-sm text-white placeholder-white/40" /></div>
            </div>

            <div ref={refs.preview} className="bg-surface rounded-3xl border border-border/60 p-8 shadow-sm">
              <SectionTitle icon={Camera} title="Preview & Save" />
              <div className="bg-surface-muted rounded-2xl p-6 mb-6">
                <p className="font-black text-brand text-lg tracking-tighter">{HOSPITAL_INFO.name}</p>
                <p className="text-sm font-bold text-muted-foreground">{selectedPatientObj?.name || "Select a patient"}</p>
                <div className="mt-3 space-y-1 text-xs font-bold">
                  <p>Invoice: <strong className="text-brand">{generateInvoiceNumber(bills.length)}</strong></p>
                  <p>Total: <strong className="text-brand">{money(totalAmount)}</strong></p>
                  <p>Status: <strong className="text-brand">{capitalize(billStatus)}</strong></p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={saveBill} className="flex-1 h-14 bg-brand text-brand-foreground rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-transform">Save Invoice & Preview</button>
                <button onClick={resetForm} className="h-14 px-6 bg-surface-muted text-muted-foreground rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2"><RotateCcw className="w-4 h-4" /> Reset</button>
              </div>
            </div>

            <div ref={refs.saved} className="bg-surface rounded-3xl border border-border/60 p-8 shadow-sm">
              <SectionTitle icon={ClipboardList} title="Saved Bills" />
              {!bills.length ? <p className="text-sm font-bold text-muted-foreground/60 text-center py-8">No saved bills yet.</p> : (
                <div className="space-y-3">
                  {bills.map((b) => {
                    const p = getPatient(b.patient);
                    return (
                      <div key={b._id} className={cn("flex items-center justify-between bg-surface-muted rounded-2xl p-4 border-l-4", STATUS_COLOR[b.status] || STATUS_COLOR.draft)}>
                        <div>
                          <p className="font-black text-brand">{b.invoiceNumber}</p>
                          <p className="text-[11px] font-bold text-muted-foreground">{fmtDateTime(b.issuedAt)} · {p?.name || "Unknown"}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-black">{money(b.totalAmount)}</p>
                            <p className={cn("text-[10px] font-black uppercase tracking-widest", STATUS_COLOR[b.status])}>{capitalize(b.status)}</p>
                          </div>
                          <button onClick={() => setViewBill(b)} className="h-10 px-4 bg-brand text-brand-foreground rounded-xl font-black uppercase text-[10px] tracking-widest">View</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "list" && (
        <div className="bg-surface rounded-3xl border border-border/60 p-8 shadow-sm">
          <SectionTitle icon={ClipboardList} title="All Saved Bills" />
          {!bills.length ? <p className="text-sm font-bold text-muted-foreground/60 text-center py-12">No bills saved yet. Create one in the New Invoice tab.</p> : (
            <div className="space-y-3">
              {bills.map((b) => {
                const p = getPatient(b.patient);
                return (
                  <div key={b._id} className={cn("flex items-center justify-between bg-surface-muted rounded-2xl p-4 border-l-4", STATUS_COLOR[b.status] || STATUS_COLOR.draft)}>
                    <div>
                      <p className="font-black text-brand">{b.invoiceNumber}</p>
                      <p className="text-[11px] font-bold text-muted-foreground">{fmtDateTime(b.issuedAt)} · {p?.name || "Unknown"}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-black">{money(b.totalAmount)}</p>
                        <p className={cn("text-[10px] font-black uppercase tracking-widest", STATUS_COLOR[b.status])}>{capitalize(b.status)}</p>
                      </div>
                      <button onClick={() => setViewBill(b)} className="h-10 px-4 bg-brand text-brand-foreground rounded-xl font-black uppercase text-[10px] tracking-widest">View</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
