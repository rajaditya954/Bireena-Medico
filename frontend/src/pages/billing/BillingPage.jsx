import { useEffect, useMemo, useState } from "react";
import {
  ReceiptIndianRupee, Plus, Trash2, CreditCard, Banknote,
  FileText, Search, ArrowRight, Loader2,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { money, fmtDate, capitalize } from "../../lib/format";
import { api } from "../../lib/api";
import { PATIENTS, TAX_RATE, HOSPITAL_INFO } from "../../data/bill";
import { toast } from "sonner";

export default function Billing() {
  const [items, setItems] = useState([
    { id: 1, name: "General Consultation", qty: 1, price: 500 },
    { id: 2, name: "Complete Blood Count (CBC)", qty: 1, price: 350 },
  ]);
  const [patients, setPatients] = useState(PATIENTS);
  const [selectedPatient, setSelectedPatient] = useState(PATIENTS[0]._id);
  const [billDate, setBillDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [recent, setRecent] = useState([]);
  const [saving, setSaving] = useState(false);
  const [backendUp, setBackendUp] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [p, b] = await Promise.all([api.listPatients(), api.listBills()]);
        if (Array.isArray(p) && p.length) {
          setPatients(p);
          setSelectedPatient(p[0]._id);
        }
        setRecent((b || []).slice(0, 5));
        setBackendUp(true);
      } catch {
        setBackendUp(false);
      }
    })();
  }, []);

  const subtotal = useMemo(() => items.reduce((a, i) => a + i.qty * i.price, 0), [items]);
  const tax = +(subtotal * TAX_RATE).toFixed(2);
  const discount = 0;
  const total = +(subtotal + tax - discount).toFixed(2);

  const addItem = () => setItems([...items, { id: Date.now(), name: "", qty: 1, price: 0 }]);
  const removeItem = (id) => setItems(items.filter((i) => i.id !== id));
  const updateItem = (id, key, val) =>
    setItems(items.map((i) => (i.id === id ? { ...i, [key]: key === "name" ? val : Number(val) } : i)));

  const finalize = async () => {
    if (!items.length) return toast.error("Add at least one item");
    setSaving(true);
    const payload = {
      patient: selectedPatient,
      issuedAt: billDate,
      items: items.map((i) => ({
        type: "OTHER",
        name: i.name || "Service",
        quantity: i.qty,
        unitPrice: i.price,
        amount: i.qty * i.price,
      })),
      subtotal, tax, discount,
      totalAmount: total,
      paymentMethod,
      status: paymentMethod === "Cash" ? "paid" : "pending",
      visitType: "OPD",
    };
    try {
      const created = await api.createBill(payload);
      toast.success(`Saved ${created.invoiceNumber || "invoice"}`);
      const b = await api.listBills();
      setRecent(b.slice(0, 5));
    } catch (e) {
      toast.error("Backend unreachable or unauthorized — bill not persisted.");
    } finally {
      setSaving(false);
    }
  };

  const patient = patients.find((p) => p._id === selectedPatient);

  return (
    <div className="flex flex-col xl:flex-row gap-10 min-h-[80vh]">
      <div className="flex-1 space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-brand tracking-tighter italic">Billing & Invoices</h1>
            <p className="text-muted-foreground font-medium">Create and manage patient clinical bills.</p>
          </div>
          {backendUp === false && (
            <div className="text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-lg bg-orange-50 text-orange-600 border border-orange-200">
              Backend offline · using seed data
            </div>
          )}
        </div>

        <div className="bg-surface p-10 rounded-[3.5rem] border border-border/60 shadow-sm space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Patient</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40" />
                <select
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  className="w-full h-14 pl-12 pr-6 bg-surface-muted border-none rounded-2xl outline-none focus:ring-4 focus:ring-brand/10 transition-all font-bold text-sm appearance-none"
                >
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>{p.name} ({p._id})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Bill Date</label>
              <input
                type="date"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                className="w-full h-14 px-6 bg-surface-muted border-none rounded-2xl outline-none focus:ring-4 focus:ring-brand/10 transition-all font-bold text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-brand tracking-tight">Bill Items</h2>
              <button onClick={addItem} className="flex items-center gap-2 text-xs font-black text-brand-accent hover:text-brand transition-colors">
                <Plus className="w-4 h-4" /> ADD SERVICE/MEDICINE
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-border/40">
                  <tr>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Description</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 w-24">Qty</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 w-32">Price</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 w-32 text-right">Amount</th>
                    <th className="pb-4 w-12" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {items.map((item) => (
                    <tr key={item.id} className="group">
                      <td className="py-5 pr-4">
                        <input value={item.name} onChange={(e) => updateItem(item.id, "name", e.target.value)} className="w-full bg-transparent border-none font-bold text-foreground outline-none" placeholder="Service name…" />
                      </td>
                      <td className="py-5 pr-4">
                        <input type="number" min={1} value={item.qty} onChange={(e) => updateItem(item.id, "qty", e.target.value)} className="w-full bg-transparent border-none font-bold text-foreground outline-none" />
                      </td>
                      <td className="py-5 pr-4">
                        <input type="number" min={0} value={item.price} onChange={(e) => updateItem(item.id, "price", e.target.value)} className="w-full bg-transparent border-none font-bold text-foreground outline-none" />
                      </td>
                      <td className="py-5 font-bold text-foreground text-right">{money(item.qty * item.price)}</td>
                      <td className="py-5 text-right pl-4">
                        <button onClick={() => removeItem(item.id)} className="p-2 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <aside className="xl:w-[450px] flex-shrink-0 flex flex-col gap-8">
        <div className="bg-brand p-10 rounded-[3.5rem] text-brand-foreground shadow-2xl shadow-brand/20 space-y-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-[2rem] flex items-center justify-center backdrop-blur-xl border border-white/10">
              <ReceiptIndianRupee className="w-8 h-8 text-emerald-300" />
            </div>
            <h2 className="text-2xl font-bold tracking-tighter">Bill Summary</h2>
          </div>

          {patient && (
            <div className="text-xs font-bold text-emerald-100/70">
              {patient.name} · {patient._id}
            </div>
          )}

          <div className="space-y-6 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-emerald-100/60 font-bold uppercase tracking-widest text-[10px]">Subtotal</span>
              <span className="font-bold">{money(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-100/60 font-bold uppercase tracking-widest text-[10px]">GST (5%)</span>
              <span className="font-bold">{money(tax)}</span>
            </div>
            <div className="flex justify-between items-center text-red-300">
              <span className="font-bold uppercase tracking-widest text-[10px]">Discount</span>
              <span className="font-bold">- {money(discount)}</span>
            </div>
            <div className="pt-6 border-t border-white/10 flex justify-between items-baseline">
              <span className="text-lg font-bold">Total</span>
              <span className="text-4xl font-black tracking-tighter">{money(total)}</span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-emerald-100/40 uppercase tracking-widest ml-1">Payment Method</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setPaymentMethod("Cash")} className={cn("h-16 rounded-2xl flex items-center justify-center gap-3 font-black text-xs transition-all", paymentMethod === "Cash" ? "bg-white text-brand shadow-xl scale-105" : "bg-white/10 text-white border border-white/10 hover:bg-white/20")}>
                <Banknote className="w-5 h-5 text-emerald-600" /> CASH
              </button>
              <button onClick={() => setPaymentMethod("Online")} className={cn("h-16 rounded-2xl flex items-center justify-center gap-3 font-black text-xs transition-all", paymentMethod === "Online" ? "bg-white text-brand shadow-xl scale-105" : "bg-white/10 text-white border border-white/10 hover:bg-white/20")}>
                <CreditCard className="w-5 h-5 text-emerald-300" /> ONLINE
              </button>
            </div>
          </div>

          <button onClick={finalize} disabled={saving} className="w-full h-16 bg-white text-brand rounded-2xl font-black shadow-2xl shadow-black/20 hover:scale-105 transition-transform group flex items-center justify-center gap-2 disabled:opacity-60">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (<><span>FINALIZE & PRINT</span> <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>)}
          </button>
        </div>

        <div className="bg-surface p-8 rounded-[3rem] border border-border/60 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-brand tracking-tight">Recent Invoices</h2>
          <div className="space-y-4">
            {(recent.length ? recent : [
              { _id: "demo1", invoiceNumber: "INV-2026-0001", patient: { name: "Charlie Sheen" }, totalAmount: 1200, status: "paid" },
              { _id: "demo2", invoiceNumber: "INV-2026-0002", patient: { name: "Bob Marley" }, totalAmount: 455, status: "pending" },
            ]).map((inv) => (
              <div key={inv._id} className="flex items-center justify-between p-4 bg-surface-muted rounded-2xl group hover:bg-brand-soft transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center text-muted-foreground/50 group-hover:text-brand-accent shadow-sm border border-border/40">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{inv.patient?.name || "Patient"}</p>
                    <p className="text-[10px] font-bold text-muted-foreground/50 uppercase">{inv.invoiceNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-foreground">{money(inv.totalAmount)}</p>
                  <span className={cn("text-[8px] font-black uppercase tracking-widest", inv.status === "paid" ? "text-brand-accent" : "text-orange-500")}>{capitalize(inv.status)}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest text-center">{HOSPITAL_INFO.name} · {fmtDate(new Date())}</p>
        </div>
      </aside>
    </div>
  );
}
