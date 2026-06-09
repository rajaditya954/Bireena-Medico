import { useState } from "react";
import { 
  ReceiptIndianRupee, 
  Plus, 
  Trash2, 
  User, 
  CreditCard, 
  Banknote, 
  Download, 
  CheckCircle2, 
  FileText,
  Search,
  ArrowRight
} from "lucide-react";
import { Button } from "../components/common/Button";
import { cn } from "../lib/utils";

export default function Billing() {
  const [items, setItems] = useState([
    { id: 1, name: "Consultation Fee", qty: 1, price: 50.00 },
    { id: 2, name: "Laboratory: CBC Test", qty: 1, price: 25.00 },
  ]);

  const subtotal = items.reduce((acc, item) => acc + (item.qty * item.price), 0);
  const tax = subtotal * 0.05;
  const discount = 0;
  const total = subtotal + tax - discount;

  const addItem = () => {
    setItems([...items, { id: Date.now(), name: "", qty: 1, price: 0 }]);
  };

  const removeItem = (id) => {
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <div className="flex flex-col xl:flex-row gap-10 min-h-[80vh]">
      <div className="flex-1 space-y-8">
        <div>
          <h1 className="text-4xl font-black text-[#06402B] tracking-tighter italic">Billing & Invoices</h1>
          <p className="text-gray-500 font-medium">Create and manage patient clinical bills.</p>
        </div>

        <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm space-y-10">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Patient Details</label>
                 <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                    <input 
                       type="text" 
                       placeholder="Find patient by name or ID..."
                       className="w-full h-14 pl-12 pr-6 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-sm"
                       defaultValue="Alice Cooper (P-4412)"
                    />
                 </div>
              </div>
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bill Date</label>
                 <input 
                    type="date" 
                    className="w-full h-14 px-6 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-sm"
                    defaultValue="2026-04-22"
                 />
              </div>
           </div>

           <div>
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-lg font-bold text-[#06402B] tracking-tight">Bill Items</h3>
                 <button 
                  onClick={addItem}
                  className="flex items-center gap-2 text-xs font-black text-emerald-600 hover:text-[#06402B] transition-colors"
                 >
                    <Plus className="w-4 h-4" /> ADD SERVICE/MEDICINE
                 </button>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="border-b border-gray-50">
                       <tr>
                          <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-300">Description</th>
                          <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-300 w-24">Qty</th>
                          <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-300 w-32">Price</th>
                          <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-300 w-32 text-right">Amount</th>
                          <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-gray-300 w-12"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       {items.map((item) => (
                         <tr key={item.id} className="group transition-colors">
                            <td className="py-5 pr-4">
                               <input 
                                 type="text" 
                                 className="w-full bg-transparent border-none font-bold text-gray-900 outline-none"
                                 defaultValue={item.name}
                                 placeholder="Service name..."
                               />
                            </td>
                            <td className="py-5 pr-4">
                               <input 
                                 type="number" 
                                 className="w-full bg-transparent border-none font-bold text-gray-900 outline-none"
                                 defaultValue={item.qty}
                               />
                            </td>
                            <td className="py-5 pr-4">
                               <input 
                                 type="number" 
                                 className="w-full bg-transparent border-none font-bold text-gray-900 outline-none"
                                 defaultValue={item.price}
                               />
                            </td>
                            <td className="py-5 font-bold text-gray-900 text-right">
                               ${(item.qty * item.price).toFixed(2)}
                            </td>
                            <td className="py-5 text-right pl-4">
                               <button 
                                onClick={() => removeItem(item.id)}
                                className="p-2 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                               >
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
         <div className="bg-[#06402B] p-10 rounded-[3.5rem] text-white shadow-2xl shadow-emerald-900/20 space-y-10">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-white/10 rounded-[2rem] flex items-center justify-center backdrop-blur-xl border border-white/10">
                  <ReceiptIndianRupee className="w-8 h-8 text-emerald-300" />
               </div>
               <h3 className="text-2xl font-bold tracking-tighter">Bill Summary</h3>
            </div>

            <div className="space-y-6 pt-4">
               <div className="flex justify-between items-center">
                  <span className="text-emerald-100/60 font-bold uppercase tracking-widest text-[10px]">Subtotal</span>
                  <span className="font-bold">${subtotal.toFixed(2)}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-emerald-100/60 font-bold uppercase tracking-widest text-[10px]">Tax (5%)</span>
                  <span className="font-bold">${tax.toFixed(2)}</span>
               </div>
               <div className="flex justify-between items-center text-red-300">
                  <span className="font-bold uppercase tracking-widest text-[10px]">Discount</span>
                  <span className="font-bold">-$0.00</span>
               </div>
               
               <div className="pt-6 border-t border-white/10 flex justify-between items-baseline">
                  <span className="text-lg font-bold">Total Amount</span>
                  <span className="text-4xl font-black tracking-tighter">${total.toFixed(2)}</span>
               </div>
            </div>

            <div className="space-y-4">
               <p className="text-[10px] font-black text-emerald-100/40 uppercase tracking-widest ml-1">Payment Method</p>
               <div className="grid grid-cols-2 gap-4">
                  <button className="h-16 bg-white rounded-2xl flex items-center justify-center gap-3 text-[#06402B] font-black text-xs hover:scale-105 transition-transform shadow-xl">
                     <Banknote className="w-5 h-5 text-emerald-600" /> CASH
                  </button>
                  <button className="h-16 bg-white/10 rounded-2xl flex items-center justify-center gap-3 text-white font-black text-xs hover:bg-white/20 transition-all border border-white/10">
                     <CreditCard className="w-5 h-5 text-emerald-300" /> ONLINE
                  </button>
               </div>
            </div>

            <button className="w-full h-16 bg-white text-[#06402B] rounded-2xl font-black shadow-2xl shadow-black/20 hover:scale-105 transition-transform group flex items-center justify-center gap-2">
               FINALIZE & PRINT <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
         </div>

         <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-[#06402B] tracking-tight">Recent Invoices</h3>
            <div className="space-y-4">
               {[
                 { id: "INV-001", patient: "Charlie Sheen", amount: "$120.00", status: "Paid" },
                 { id: "INV-002", patient: "Bob Marley", amount: "$45.50", status: "Unpaid" },
               ].map((inv) => (
                 <div key={inv.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group hover:bg-emerald-50 transition-colors">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 group-hover:text-emerald-600 shadow-sm border border-gray-100">
                          <FileText className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="text-xs font-bold text-gray-900">{inv.patient}</p>
                          <p className="text-[10px] font-bold text-gray-300 uppercase">{inv.id}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-black text-gray-900">{inv.amount}</p>
                       <span className={cn(
                         "text-[8px] font-black uppercase tracking-widest",
                         inv.status === "Paid" ? "text-emerald-600" : "text-orange-500"
                       )}>{inv.status}</span>
                    </div>
                 </div>
               ))}
            </div>
            <button className="w-full py-3 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">View Billing History</button>
         </div>
      </aside>
    </div>
  );
}
