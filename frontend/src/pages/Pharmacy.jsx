import { useState } from "react";
import { 
  Package, 
  Search, 
  Plus, 
  AlertTriangle, 
  ShoppingCart, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  MoreVertical,
  Minus,
  CheckCircle2
} from "lucide-react";
import { Button } from "../components/common/Button";
import { cn } from "../lib/utils";

const MOCK_INVENTORY = [
  { id: "M-101", name: "Paracetamol 500mg", stock: 1200, unit: "Tabs", price: 0.15, threshold: 200, category: "Analgesics" },
  { id: "M-102", name: "Amoxicillin 250mg", stock: 150, unit: "Caps", price: 0.45, threshold: 200, category: "Antibiotics" },
  { id: "M-103", name: "Metformin 850mg", stock: 500, unit: "Tabs", price: 0.30, threshold: 100, category: "Antidiabetic" },
  { id: "M-104", name: "Loratadine 10mg", stock: 85, unit: "Tabs", price: 0.25, threshold: 100, category: "Antihistamine" },
  { id: "M-105", name: "Omeprazole 20mg", stock: 300, unit: "Caps", price: 0.55, threshold: 50, category: "Gastrointestinal" },
];

export default function Pharmacy() {
  const [activeTab, setActiveTab] = useState("inventory");

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#06402B] tracking-tighter italic">Pharmacy</h1>
          <p className="text-gray-500 font-medium">Inventory management and dispensing unit.</p>
        </div>
        <div className="flex gap-3">
           <button 
              onClick={() => setActiveTab("inventory")}
              className={cn(
                "h-12 px-6 rounded-2xl text-sm font-bold transition-all",
                activeTab === "inventory" ? "bg-[#06402B] text-white shadow-xl shadow-emerald-900/10" : "bg-white text-gray-500 hover:bg-gray-50"
              )}
           >
              Inventory
           </button>
           <button 
              onClick={() => setActiveTab("dispense")}
              className={cn(
                "h-12 px-6 rounded-2xl text-sm font-bold transition-all",
                activeTab === "dispense" ? "bg-[#06402B] text-white shadow-xl shadow-emerald-900/10" : "bg-white text-gray-500 hover:bg-gray-50"
              )}
           >
              Dispense
           </button>
        </div>
      </div>

      {activeTab === "inventory" ? <InventoryView /> : <DispenseView />}
    </div>
  );
}

function InventoryView() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 flex items-center gap-6 shadow-sm">
            <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600">
               <Package className="w-7 h-7" />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Stock</p>
               <h3 className="text-2xl font-black text-gray-900 tracking-tight">2,440 Units</h3>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 flex items-center gap-6 shadow-sm">
            <div className="w-16 h-16 bg-red-50 rounded-[1.5rem] flex items-center justify-center text-red-600">
               <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Out of Stock</p>
               <h3 className="text-2xl font-black text-gray-900 tracking-tight">12 Items</h3>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 flex items-center gap-6 shadow-sm">
            <div className="w-16 h-16 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center text-emerald-600">
               <ShoppingCart className="w-7 h-7" />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">To be Ordered</p>
               <h3 className="text-2xl font-black text-gray-900 tracking-tight">28 Items</h3>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <div className="relative group flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search inventory..." 
                className="w-full h-12 pl-12 pr-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-sm"
              />
           </div>
           <div className="flex gap-2">
             <Button variant="outline" className="h-12 px-4 rounded-2xl border-none bg-gray-50 hover:bg-emerald-50 text-gray-500">
                <Filter className="w-5 h-5" />
             </Button>
             <Button className="h-12 px-6 rounded-2xl bg-[#06402B] text-white shadow-lg shadow-emerald-900/10">
                <Plus className="w-5 h-5 mr-2" /> Add Item
             </Button>
           </div>
        </div>
        
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                 <tr>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Medicine</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Category</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Stock Status</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Unit Price</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                 {MOCK_INVENTORY.map((item) => (
                   <tr key={item.id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-8 py-5">
                         <div>
                            <p className="font-bold text-gray-900 tracking-tight">{item.name}</p>
                            <p className="text-[10px] font-black text-gray-300 uppercase">{item.id}</p>
                         </div>
                      </td>
                      <td className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{item.category}</td>
                      <td className="px-8 py-5">
                         <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                               <span className={cn(
                                 "text-sm font-black",
                                 item.stock <= item.threshold ? "text-red-500" : "text-emerald-700"
                               )}>
                                  {item.stock} {item.unit}
                               </span>
                               {item.stock <= item.threshold && (
                                 <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                               )}
                            </div>
                            <div className="w-40 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                               <div 
                                  className={cn("h-full rounded-full transition-all duration-1000", item.stock <= item.threshold ? "bg-red-500" : "bg-emerald-500")}
                                  style={{ width: `${Math.min(100, (item.stock / 2000) * 100)}%` }}
                               />
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-5 font-bold text-gray-900">${item.price.toFixed(2)}</td>
                      <td className="px-8 py-5 text-right">
                         <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                            <MoreVertical className="w-5 h-5" />
                         </button>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}

function DispenseView() {
   return (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="xl:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
               <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                     <Search className="w-6 h-6" />
                  </div>
                  <div>
                     <h3 className="text-xl font-bold text-[#06402B]">Quick Dispense</h3>
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Select Patient or Scan Prescription ID</p>
                  </div>
               </div>
               
               <div className="relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300" />
                  <input 
                     type="text" 
                     placeholder="Enter Patient ID, QR Code or Name..." 
                     className="w-full h-16 pl-16 pr-6 bg-gray-50 border-none rounded-[1.5rem] outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-lg text-[#06402B]"
                  />
               </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col min-h-[400px] justify-center items-center text-center">
               <div className="w-32 h-32 bg-gray-50 rounded-[3rem] flex items-center justify-center mb-6 border border-gray-100 shadow-inner group transition-all duration-500 hover:bg-emerald-50">
                  <Package className="w-12 h-12 text-gray-200 group-hover:text-emerald-300 transition-colors" />
               </div>
               <h3 className="text-xl font-bold text-gray-400 mb-2">No Prescription Selected</h3>
               <p className="text-sm text-gray-300 max-w-xs font-medium italic">Search for a patient to load their latest prescriptions automatically from the EMR system.</p>
            </div>
         </div>

         <div className="bg-[#06402B] p-10 rounded-[3.5rem] text-white shadow-2xl shadow-emerald-900/20 flex flex-col">
            <div className="flex items-center gap-4 mb-10">
               <div className="w-14 h-14 bg-white/10 rounded-[2rem] flex items-center justify-center backdrop-blur-xl">
                  <ShoppingCart className="w-7 h-7 text-emerald-300" />
               </div>
               <h3 className="text-2xl font-bold tracking-tighter italic">Bill Summary</h3>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center opacity-30">
                <Minus className="w-12 h-12 mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">Cart is empty</p>
            </div>

            <div className="pt-8 border-t border-white/10 space-y-6">
               <div className="flex justify-between items-center text-emerald-100 font-bold uppercase tracking-widest text-[10px]">
                  <span>Subtotal</span>
                  <span>$0.00</span>
               </div>
               <div className="flex justify-between items-center text-2xl font-black tracking-tight">
                  <span>Total</span>
                  <span>$0.00</span>
               </div>
               <button disabled className="w-full h-16 bg-white/10 text-white/50 rounded-2xl font-bold cursor-not-allowed">
                  Proceed to Payment
               </button>
            </div>
         </div>
      </div>
   );
}
