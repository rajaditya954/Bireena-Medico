import React, { useState } from "react";
import { 
  Search, Download, Filter, ChevronLeft, ChevronRight, X, Printer, Calendar, FileText,
  CreditCard, Smartphone, Banknote, Wallet, ShieldCheck, Eye, RefreshCw
} from "lucide-react";
import { cn } from "../../lib/utils";
import BillingGenerateTab from "./BillingGenerateTab";

// --- Mock Data ---
const MOCK_BILLS = [
  { id: "INV-2025-0512-001", aptId: "APPT-2025-0512-00123", patient: "Alice Cooper", patId: "PAT-0001", type: "Both", subType: "[Doctor + Lab]", date: "12 May 2025\n09:30 AM", amount: 2257.50, paid: 2257.50, due: 0, status: "Paid" },
  { id: "INV-2025-0512-002", aptId: "APPT-2025-0512-00124", patient: "John Doe", patId: "PAT-0002", type: "Doctor", subType: "", date: "12 May 2025\n09:20 AM", amount: 800.00, paid: 800.00, due: 0, status: "Paid" },
  { id: "INV-2025-0511-018", aptId: "APPT-2025-0511-00098", patient: "Neha Patel", patId: "PAT-0003", type: "Lab", subType: "", date: "11 May 2025\n04:15 PM", amount: 1350.00, paid: 900.00, due: 450.00, status: "Partial" },
  { id: "INV-2025-0511-017", aptId: "APPT-2025-0511-00097", patient: "Robert Brown", patId: "PAT-0004", type: "Both", subType: "[Doctor + Lab]", date: "11 May 2025\n11:30 AM", amount: 1950.00, paid: 1950.00, due: 0, status: "Paid" },
  { id: "INV-2025-0510-011", aptId: "APPT-2025-0510-00088", patient: "Emily Davis", patId: "PAT-0005", type: "Doctor", subType: "", date: "10 May 2025\n03:10 PM", amount: 600.00, paid: 0, due: 600.00, status: "Pending" },
  { id: "INV-2025-0510-010", aptId: "APPT-2025-0510-00089", patient: "Michael Johnson", patId: "PAT-0006", type: "Lab", subType: "", date: "10 May 2025\n12:50 PM", amount: 950.00, paid: 950.00, due: 0, status: "Paid" },
  { id: "INV-2025-0509-009", aptId: "APPT-2025-0509-00078", patient: "Lisa White", patId: "PAT-0007", type: "Both", subType: "[Doctor + Lab]", date: "09 May 2025\n06:40 PM", amount: 2100.00, paid: 1600.00, due: 500.00, status: "Partial" },
  { id: "INV-2025-0509-008", aptId: "APPT-2025-0509-00075", patient: "David Wilson", patId: "PAT-0008", type: "Lab", subType: "", date: "09 May 2025\n02:20 PM", amount: 750.00, paid: 0, due: 750.00, status: "Pending" },
  { id: "INV-2025-0508-006", aptId: "APPT-2025-0508-00068", patient: "Amanda Scott", patId: "PAT-0009", type: "Doctor", subType: "", date: "08 May 2025\n10:05 AM", amount: 800.00, paid: 800.00, due: 0, status: "Paid" },
  { id: "INV-2025-0508-005", aptId: "APPT-2025-0508-00065", patient: "Thomas Smith", patId: "PAT-0010", type: "Lab", subType: "", date: "08 May 2025\n09:15 AM", amount: 650.00, paid: 650.00, due: 0, status: "Paid" },
];

const MOCK_PAYMENTS = [
  { id: "PAY-2025-0001", invId: "INV-2025-0512-001", patient: "Alice Cooper", patId: "PAT-0001", type: "Both", subType: "[Doctor + Lab]", amount: 2257.50, method: "Cash", date: "12 May 2025\n09:45 AM", status: "Completed" },
  { id: "PAY-2025-0002", invId: "INV-2025-0512-002", patient: "John Doe", patId: "PAT-0002", type: "Doctor", subType: "", amount: 800.00, method: "UPI", date: "12 May 2025\n09:25 AM", status: "Completed" },
  { id: "PAY-2025-0003", invId: "INV-2025-0511-018", patient: "Neha Patel", patId: "PAT-0003", type: "Lab", subType: "", amount: 1350.00, method: "Card", date: "11 May 2025\n04:15 PM", status: "Completed" },
  { id: "PAY-2025-0004", invId: "INV-2025-0511-017", patient: "Robert Brown", patId: "PAT-0004", type: "Both", subType: "[Doctor + Lab]", amount: 1950.00, method: "Insurance", date: "11 May 2025\n11:30 AM", status: "Completed" },
  { id: "PAY-2025-0005", invId: "INV-2025-0510-011", patient: "Emily Davis", patId: "PAT-0005", type: "Doctor", subType: "", amount: 600.00, method: "Cash", date: "10 May 2025\n03:10 PM", status: "Completed" },
  { id: "PAY-2025-0006", invId: "INV-2025-0510-012", patient: "Michael Johnson", patId: "PAT-0006", type: "Lab", subType: "", amount: 950.00, method: "UPI", date: "10 May 2025\n12:50 PM", status: "Pending" },
  { id: "PAY-2025-0007", invId: "INV-2025-0509-009", patient: "Lisa White", patId: "PAT-0007", type: "Both", subType: "[Doctor + Lab]", amount: 2100.00, method: "Card", date: "09 May 2025\n06:40 PM", status: "Completed" },
  { id: "PAY-2025-0008", invId: "INV-2025-0509-008", patient: "David Wilson", patId: "PAT-0008", type: "Lab", subType: "", amount: 750.00, method: "Wallet", date: "09 May 2025\n02:20 PM", status: "Failed" },
  { id: "PAY-2025-0009", invId: "INV-2025-0508-006", patient: "Amanda Scott", patId: "PAT-0009", type: "Doctor", subType: "", amount: 800.00, method: "Cash", date: "08 May 2025\n10:05 AM", status: "Completed" },
  { id: "PAY-2025-0010", invId: "INV-2025-0508-005", patient: "Thomas Smith", patId: "PAT-0010", type: "Lab", subType: "", amount: 650.00, method: "UPI", date: "08 May 2025\n09:15 AM", status: "Refunded" },
];

const MOCK_REFUNDS = [
  { id: "REF-2025-0001", invId: "INV-2025-0512-001", patient: "Alice Cooper", patId: "PAT-0001", type: "Both", subType: "[Doctor + Lab]", amount: 2257.50, method: "Original Payment\nMethod", date: "12 May 2025\n10:30 AM", status: "Completed" },
  { id: "REF-2025-0002", invId: "INV-2025-0511-018", patient: "Neha Patel", patId: "PAT-0003", type: "Lab", subType: "", amount: 900.00, method: "UPI", date: "11 May 2025\n04:45 PM", status: "Completed" },
  { id: "REF-2025-0003", invId: "INV-2025-0511-017", patient: "Robert Brown", patId: "PAT-0004", type: "Both", subType: "[Doctor + Lab]", amount: 500.00, method: "Wallet", date: "11 May 2025\n12:15 PM", status: "Pending" },
  { id: "REF-2025-0004", invId: "INV-2025-0510-012", patient: "Michael Johnson", patId: "PAT-0006", type: "Lab", subType: "", amount: 950.00, method: "Card", date: "10 May 2025\n03:20 PM", status: "Completed" },
  { id: "REF-2025-0005", invId: "INV-2025-0509-009", patient: "Lisa White", patId: "PAT-0007", type: "Both", subType: "[Doctor + Lab]", amount: 500.00, method: "Original Payment\nMethod", date: "09 May 2025\n08:00 PM", status: "Rejected" },
  { id: "REF-2025-0006", invId: "INV-2025-0508-006", patient: "Amanda Scott", patId: "PAT-0009", type: "Doctor", subType: "", amount: 800.00, method: "Cash", date: "08 May 2025\n11:00 AM", status: "Completed" },
  { id: "REF-2025-0007", invId: "INV-2025-0508-005", patient: "Thomas Smith", patId: "PAT-0010", type: "Lab", subType: "", amount: 650.00, method: "UPI", date: "08 May 2025\n09:30 AM", status: "Pending" },
  { id: "REF-2025-0008", invId: "INV-2025-0507-004", patient: "David Wilson", patId: "PAT-0008", type: "Doctor", subType: "", amount: 750.00, method: "Card", date: "07 May 2025\n06:45 PM", status: "Completed" },
  { id: "REF-2025-0009", invId: "INV-2025-0506-003", patient: "John Doe", patId: "PAT-0002", type: "Doctor", subType: "", amount: 800.00, method: "Insurance", date: "06 May 2025\n02:10 PM", status: "Completed" },
  { id: "REF-2025-0010", invId: "INV-2025-0505-002", patient: "Emily Davis", patId: "PAT-0005", type: "Doctor", subType: "", amount: 600.00, method: "Cash", date: "05 May 2025\n05:30 PM", status: "Completed" },
];

export default function AppointmentBilling() {
  const [activeTab, setActiveTab] = useState("Payments");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const tabs = ["Generate Bill", "All Bills", "Payments", "Refunds"];

  const renderStatusBadge = (status) => {
    switch (status) {
      case "Paid":
      case "Completed":
        return <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">{status}</span>;
      case "Partial":
      case "Pending":
        return <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-md">{status}</span>;
      case "Failed":
      case "Rejected":
        return <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-md">{status}</span>;
      case "Refunded":
        return <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2.5 py-1 rounded-md">{status}</span>;
      default:
        return <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md">{status}</span>;
    }
  };

  const renderTypeBadge = (type, subType) => {
    if (type === "Both") {
      return (
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">{type}</span>
          {subType && <span className="text-[9px] font-bold text-purple-400 bg-purple-50/50 px-1 py-0.5 rounded">{subType}</span>}
        </div>
      );
    }
    if (type === "Lab") return <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{type}</span>;
    if (type === "Doctor") return <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{type}</span>;
    return <span>{type}</span>;
  };

  const renderPaymentMethod = (method) => {
    if (method.includes("Cash")) return <div className="flex items-center justify-center gap-1"><Banknote className="w-3.5 h-3.5 text-green-600" /><span className="font-bold text-gray-700">Cash</span></div>;
    if (method.includes("UPI")) return <div className="flex items-center justify-center gap-1"><Smartphone className="w-3.5 h-3.5 text-orange-500" /><span className="font-bold text-gray-700">UPI</span></div>;
    if (method.includes("Card")) return <div className="flex items-center justify-center gap-1"><CreditCard className="w-3.5 h-3.5 text-blue-500" /><span className="font-bold text-gray-700">Card</span></div>;
    if (method.includes("Insurance")) return <div className="flex items-center justify-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-purple-500" /><span className="font-bold text-gray-700">Insurance</span></div>;
    if (method.includes("Wallet")) return <div className="flex items-center justify-center gap-1"><Wallet className="w-3.5 h-3.5 text-pink-500" /><span className="font-bold text-gray-700">Wallet</span></div>;
    return <span className="font-bold text-gray-700 whitespace-pre-line leading-tight text-[10px]">{method}</span>;
  };

  const PaginationBar = () => (
    <div className="p-4 border-t border-gray-100 flex items-center justify-between text-[11px] font-medium text-gray-500 bg-white">
      <span>Showing 1 to 10 of 48 items</span>
      <div className="flex items-center gap-1">
        <button className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 rounded text-gray-400"><ChevronLeft className="w-4 h-4" /></button>
        <button className="w-7 h-7 flex items-center justify-center border border-[#0F5C3A] bg-emerald-50 text-[#0F5C3A] font-bold rounded">1</button>
        <button className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 rounded">2</button>
        <button className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 rounded">3</button>
        <button className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 rounded">4</button>
        <button className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 rounded">5</button>
        <button className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 rounded text-gray-400"><ChevronRight className="w-4 h-4" /></button>
      </div>
      <div className="flex items-center gap-2">
        <select className="h-7 px-2 border border-gray-200 rounded outline-none bg-transparent">
          <option>10 / page</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#0A3E2A] tracking-tight">Billing & Payments</h1>
        {activeTab !== "Generate Bill" && (
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
            <Download className="w-4 h-4" /> Export
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSelectedItem(null); }}
            className={cn(
              "px-6 py-3 text-sm font-bold border-b-2 transition-all",
              activeTab === tab ? "border-[#0F5C3A] text-[#0F5C3A]" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-4">
        {activeTab === "Generate Bill" && (
          <BillingGenerateTab onBillGenerated={() => setActiveTab("All Bills")} />
        )}

        {/* --- ALL BILLS --- */}
        {activeTab === "All Bills" && (
          <div className="flex gap-6 relative items-start">
            <div className={cn("flex-1 space-y-6 transition-all", selectedItem ? "w-2/3" : "w-full")}>
              
              <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[250px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input className="w-full h-10 pl-10 pr-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0F5C3A] text-gray-700" placeholder="Search by Invoice ID / Patient Name / Mobile" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <select className="h-10 px-3 pr-8 text-sm border border-gray-200 rounded-lg outline-none text-gray-600 appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010L12%2015L17%2010%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_8px_center]">
                  <option>All Appointment Types</option>
                </select>
                <select className="h-10 px-3 pr-8 text-sm border border-gray-200 rounded-lg outline-none text-gray-600 appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010L12%2015L17%2010%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_8px_center]">
                  <option>All Status</option>
                </select>
                <div className="h-10 px-3 text-sm border border-gray-200 rounded-lg outline-none flex items-center justify-between min-w-[200px] text-gray-600 bg-white">
                  <span>01-05-2025 &rarr; 12-05-2025</span><Calendar className="w-4 h-4 text-gray-400" />
                </div>
                <button className="h-10 px-4 border border-gray-200 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-gray-50 text-gray-700 bg-white shadow-sm">
                  <Filter className="w-4 h-4" /> Filter
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="border border-gray-100 rounded-xl p-4 bg-white flex flex-col shadow-sm">
                  <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center"><FileText className="w-4 h-4" /></div><p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Total Bills</p></div>
                  <p className="font-black text-lg text-gray-900 leading-none">₹ 1,25,680.50</p><p className="text-[10px] text-gray-400 mt-1">48 Bills</p>
                </div>
                <div className="border border-gray-100 rounded-xl p-4 bg-white flex flex-col shadow-sm">
                  <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center"><FileText className="w-4 h-4" /></div><p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Paid Bills</p></div>
                  <p className="font-black text-lg text-gray-900 leading-none">₹ 1,12,930.50</p><p className="text-[10px] text-gray-400 mt-1">42 Bills</p>
                </div>
                <div className="border border-gray-100 rounded-xl p-4 bg-white flex flex-col shadow-sm">
                  <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center"><FileText className="w-4 h-4" /></div><p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Pending Bills</p></div>
                  <p className="font-black text-lg text-gray-900 leading-none">₹ 8,250.00</p><p className="text-[10px] text-gray-400 mt-1">2 Bills</p>
                </div>
                <div className="border border-gray-100 rounded-xl p-4 bg-white flex flex-col shadow-sm">
                  <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center"><FileText className="w-4 h-4" /></div><p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Partially Paid</p></div>
                  <p className="font-black text-lg text-gray-900 leading-none">₹ 4,500.00</p><p className="text-[10px] text-gray-400 mt-1">2 Bills</p>
                </div>
                <div className="border border-gray-100 rounded-xl p-4 bg-white flex flex-col shadow-sm">
                  <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg bg-red-400 text-white flex items-center justify-center"><FileText className="w-4 h-4" /></div><p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Refunded Bills</p></div>
                  <p className="font-black text-lg text-gray-900 leading-none">₹ 2,300.00</p><p className="text-[10px] text-gray-400 mt-1">1 Bills</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="text-[10px] uppercase font-bold text-gray-400 border-b border-gray-100 tracking-wider">
                      <tr>
                        <th className="p-4 w-10"><input type="checkbox" className="rounded border-gray-300 w-3.5 h-3.5" /></th>
                        <th className="p-4">Invoice ID</th><th className="p-4">Appointment ID</th><th className="p-4">Patient</th><th className="p-4">Type</th><th className="p-4">Date & Time</th><th className="p-4">Amount (₹)</th><th className="p-4">Paid (₹)</th><th className="p-4">Due (₹)</th><th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {MOCK_BILLS.map(bill => (
                        <tr key={bill.id} onClick={() => setSelectedItem(bill)} className={cn("transition cursor-pointer", selectedItem?.id === bill.id ? "bg-emerald-50/50" : "hover:bg-gray-50")}>
                          <td className="p-4" onClick={e => e.stopPropagation()}><input type="checkbox" className="rounded border-gray-300 w-3.5 h-3.5" /></td>
                          <td className="p-4 font-bold text-[#0F5C3A] text-[11px]">{bill.id}</td>
                          <td className="p-4 text-[11px] text-gray-500 font-medium">{bill.aptId}</td>
                          <td className="p-4"><div className="font-bold text-gray-800 text-[11px] leading-tight">{bill.patient}</div><div className="text-[9px] text-gray-400 font-medium">{bill.patId}</div></td>
                          <td className="p-4">{renderTypeBadge(bill.type, bill.subType)}</td>
                          <td className="p-4 text-[10px] text-gray-600 font-medium whitespace-pre-line leading-snug">{bill.date}</td>
                          <td className="p-4 font-bold text-gray-700 text-[11px]">{bill.amount.toFixed(2)}</td>
                          <td className="p-4 font-bold text-gray-700 text-[11px]">{bill.paid.toFixed(2)}</td>
                          <td className="p-4 font-bold text-gray-700 text-[11px]">{bill.due.toFixed(2)}</td>
                          <td className="p-4 text-center">{renderStatusBadge(bill.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationBar />
              </div>
            </div>

            {selectedItem && (
              <div className="w-[380px] flex-shrink-0 bg-white border border-gray-200 rounded-xl p-5 sticky top-4 max-h-[calc(100vh-100px)] overflow-y-auto shadow-sm">
                <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-[#0A3E2A]">Bill Details</h3><button onClick={() => setSelectedItem(null)} className="p-1 text-gray-400 hover:text-gray-700 transition"><X className="w-4 h-4" /></button></div>
                <div className="mb-5">{renderStatusBadge(selectedItem.status)}</div>
                <div className="space-y-3 text-[11px]">
                  <div><p className="text-gray-400 mb-0.5">Invoice ID</p><p className="font-bold text-gray-800">{selectedItem.id}</p></div>
                  <div><p className="text-gray-400 mb-0.5">Appointment ID</p><p className="font-bold text-gray-800">{selectedItem.aptId}</p></div>
                  <div><p className="text-gray-400 mb-0.5">Patient</p><p className="font-bold text-gray-800">{selectedItem.patient} ({selectedItem.patId})</p></div>
                  <div><p className="text-gray-400 mb-0.5">Mobile</p><p className="font-bold text-gray-800">+91 9876543210</p></div>
                  <div><p className="text-gray-400 mb-0.5">Date & Time</p><p className="font-bold text-gray-800">{selectedItem.date.replace('\n', ', ')}</p></div>
                  <div><p className="text-gray-400 mb-1.5">Type</p>{renderTypeBadge(selectedItem.type, selectedItem.subType)}</div>
                </div>
                <div className="mt-6 border-t border-gray-100 pt-4 space-y-2.5 text-[11px]">
                  <h4 className="font-bold text-gray-800 mb-3 text-xs">Bill Summary</h4>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Doctor Consultation</span><span className="font-bold">₹ 800.00</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Lab Tests (3)</span><span className="font-bold">₹ 1,350.00</span></div>
                  <div className="border-t border-gray-100 pt-2.5 flex justify-between"><span className="text-gray-500 font-medium">Subtotal</span><span className="font-bold">₹ 2,150.00</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Discount</span><span className="font-bold">₹ 0.00</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Tax (GST 5%)</span><span className="font-bold">₹ 107.50</span></div>
                  <div className="pt-2 flex justify-between items-center"><span className="font-bold text-gray-800 text-xs">Total Amount</span><span className="font-black text-[#0F5C3A] text-sm">₹ {selectedItem.amount.toFixed(2)}</span></div>
                </div>
                <div className="mt-6 border-t border-gray-100 pt-4 space-y-2.5 text-[11px]">
                  <h4 className="font-bold text-gray-800 mb-3 text-xs">Payment Summary</h4>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Payment Method</span><span className="font-bold text-gray-700">Cash</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Paid On</span><span className="font-bold text-gray-700">12 May 2025, 09:45 AM</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Paid Amount</span><span className="font-bold text-gray-700">₹ {selectedItem.paid.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Received By</span><span className="font-bold text-gray-700">Admin User</span></div>
                </div>
                <button className="mt-6 w-full py-2.5 border border-gray-200 text-gray-600 rounded-lg font-bold text-xs hover:bg-gray-50 flex items-center justify-center gap-2 transition">
                  <Printer className="w-3.5 h-3.5" /> Print / Download Invoice
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- PAYMENTS --- */}
        {activeTab === "Payments" && (
          <div className="flex gap-6 relative items-start">
            <div className={cn("flex-1 space-y-6 transition-all", selectedItem ? "w-2/3" : "w-full")}>
              
              <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[250px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input className="w-full h-10 pl-10 pr-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0F5C3A] text-gray-700" placeholder="Search by Invoice ID / Patient Name / Mobile" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <select className="h-10 px-3 pr-8 text-sm border border-gray-200 rounded-lg outline-none text-gray-600 appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010L12%2015L17%2010%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_8px_center]">
                  <option>All Payment Methods</option>
                </select>
                <select className="h-10 px-3 pr-8 text-sm border border-gray-200 rounded-lg outline-none text-gray-600 appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010L12%2015L17%2010%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_8px_center]">
                  <option>All Status</option>
                </select>
                <div className="h-10 px-3 text-sm border border-gray-200 rounded-lg outline-none flex items-center justify-between min-w-[200px] text-gray-600 bg-white">
                  <span>01-05-2025 &rarr; 12-05-2025</span><Calendar className="w-4 h-4 text-gray-400" />
                </div>
                <button className="h-10 px-4 border border-gray-200 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-gray-50 text-gray-700 bg-white shadow-sm">
                  <Filter className="w-4 h-4" /> Filter
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="border border-gray-100 rounded-xl p-4 bg-white flex flex-col shadow-sm">
                  <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center"><FileText className="w-4 h-4" /></div><p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Total Payments</p></div>
                  <p className="font-black text-lg text-gray-900 leading-none">₹ 1,25,680.50</p><p className="text-[10px] text-gray-400 mt-1">All Time</p>
                </div>
                <div className="border border-gray-100 rounded-xl p-4 bg-white flex flex-col shadow-sm">
                  <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center"><FileText className="w-4 h-4" /></div><p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Today's Payments</p></div>
                  <p className="font-black text-lg text-gray-900 leading-none">₹ 12,450.00</p><p className="text-[10px] text-gray-400 mt-1">12 May 2025</p>
                </div>
                <div className="border border-gray-100 rounded-xl p-4 bg-white flex flex-col shadow-sm">
                  <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center"><FileText className="w-4 h-4" /></div><p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">This Month</p></div>
                  <p className="font-black text-lg text-gray-900 leading-none">₹ 78,430.00</p><p className="text-[10px] text-gray-400 mt-1">May 2025</p>
                </div>
                <div className="border border-gray-100 rounded-xl p-4 bg-white flex flex-col shadow-sm">
                  <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center"><FileText className="w-4 h-4" /></div><p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Pending Payments</p></div>
                  <p className="font-black text-lg text-gray-900 leading-none">₹ 8,250.00</p><p className="text-[10px] text-gray-400 mt-1">12 Invoices</p>
                </div>
                <div className="border border-gray-100 rounded-xl p-4 bg-white flex flex-col shadow-sm">
                  <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg bg-red-400 text-white flex items-center justify-center"><FileText className="w-4 h-4" /></div><p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Refunded Amount</p></div>
                  <p className="font-black text-lg text-gray-900 leading-none">₹ 2,300.00</p><p className="text-[10px] text-gray-400 mt-1">All Time</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="text-[10px] uppercase font-bold text-gray-400 border-b border-gray-100 tracking-wider">
                      <tr>
                        <th className="p-4 w-10"><input type="checkbox" className="rounded border-gray-300 w-3.5 h-3.5" /></th>
                        <th className="p-4">Payment ID</th><th className="p-4">Invoice ID</th><th className="p-4">Patient</th><th className="p-4">Type</th><th className="p-4">Amount (₹)</th><th className="p-4 text-center">Payment Method</th><th className="p-4">Date & Time</th><th className="p-4 text-center">Status</th><th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {MOCK_PAYMENTS.map(pay => (
                        <tr key={pay.id} onClick={() => setSelectedItem(pay)} className={cn("transition cursor-pointer", selectedItem?.id === pay.id ? "bg-emerald-50/50" : "hover:bg-gray-50")}>
                          <td className="p-4" onClick={e => e.stopPropagation()}><input type="checkbox" className="rounded border-gray-300 w-3.5 h-3.5" /></td>
                          <td className="p-4 font-bold text-[#0F5C3A] text-[11px]">{pay.id}</td>
                          <td className="p-4 text-[11px] text-gray-500 font-medium">{pay.invId}</td>
                          <td className="p-4"><div className="font-bold text-gray-800 text-[11px] leading-tight">{pay.patient}</div><div className="text-[9px] text-gray-400 font-medium">{pay.patId}</div></td>
                          <td className="p-4">{renderTypeBadge(pay.type, pay.subType)}</td>
                          <td className="p-4 font-bold text-gray-700 text-[11px]">{pay.amount.toFixed(2)}</td>
                          <td className="p-4">{renderPaymentMethod(pay.method)}</td>
                          <td className="p-4 text-[10px] text-gray-600 font-medium whitespace-pre-line leading-snug">{pay.date}</td>
                          <td className="p-4 text-center">{renderStatusBadge(pay.status)}</td>
                          <td className="p-4 text-center">
                            <button className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 mx-auto transition"><Eye className="w-3.5 h-3.5" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationBar />
              </div>
            </div>

            {selectedItem && (
              <div className="w-[380px] flex-shrink-0 bg-white border border-gray-200 rounded-xl p-5 sticky top-4 max-h-[calc(100vh-100px)] overflow-y-auto shadow-sm">
                <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-[#0A3E2A]">Payment Details</h3><button onClick={() => setSelectedItem(null)} className="p-1 text-gray-400 hover:text-gray-700 transition"><X className="w-4 h-4" /></button></div>
                <div className="mb-5 flex items-center gap-3">
                  <span className="font-black text-[#0F5C3A]">{selectedItem.id}</span>
                  {renderStatusBadge(selectedItem.status)}
                </div>
                <div className="space-y-3 text-[11px]">
                  <h4 className="font-bold text-gray-800 text-xs mt-4 mb-2">Invoice Information</h4>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Invoice ID</span><span className="font-bold text-gray-700">{selectedItem.invId}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Appointment ID</span><span className="font-bold text-gray-700">APPT-2025-0512-00123</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Type</span>{renderTypeBadge(selectedItem.type, selectedItem.subType)}</div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Date & Time</span><span className="font-bold text-gray-700">12 May 2025, 09:30 AM</span></div>
                  
                  <h4 className="font-bold text-gray-800 text-xs mt-6 mb-2 border-t pt-4">Patient Information</h4>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Name</span><span className="font-bold text-gray-700">{selectedItem.patient}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Patient ID</span><span className="font-bold text-gray-700">{selectedItem.patId}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Mobile</span><span className="font-bold text-gray-700">+91 9876543210</span></div>

                  <h4 className="font-bold text-gray-800 text-xs mt-6 mb-2 border-t pt-4">Payment Information</h4>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Amount</span><span className="font-bold text-gray-700">₹ {selectedItem.amount.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Payment Method</span><span className="font-bold text-gray-700">{selectedItem.method.replace('\n', ' ')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Paid On</span><span className="font-bold text-gray-700">{selectedItem.date.replace('\n', ', ')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Received By</span><span className="font-bold text-gray-700">Admin User</span></div>

                  <h4 className="font-bold text-gray-800 text-xs mt-6 mb-2 border-t pt-4">Bill Summary</h4>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Doctor Consultation</span><span className="font-bold">₹ 800.00</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Lab Tests (3)</span><span className="font-bold">₹ 1,350.00</span></div>
                  <div className="border-t border-gray-100 pt-2.5 flex justify-between"><span className="text-gray-500 font-medium">Subtotal</span><span className="font-bold">₹ 2,150.00</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Discount</span><span className="font-bold">₹ 0.00</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Tax (GST 5%)</span><span className="font-bold">₹ 107.50</span></div>
                  <div className="pt-2 flex justify-between items-center"><span className="font-bold text-gray-800 text-xs">Total Amount</span><span className="font-black text-[#0F5C3A] text-sm">₹ {selectedItem.amount.toFixed(2)}</span></div>
                </div>
                <button className="mt-6 w-full py-2.5 border border-gray-200 text-gray-600 rounded-lg font-bold text-xs hover:bg-gray-50 flex items-center justify-center gap-2 transition">
                  <Printer className="w-3.5 h-3.5" /> Print Receipt
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- REFUNDS --- */}
        {activeTab === "Refunds" && (
          <div className="flex gap-6 relative items-start">
            <div className={cn("flex-1 space-y-6 transition-all", selectedItem ? "w-2/3" : "w-full")}>
              
              <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[250px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input className="w-full h-10 pl-10 pr-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#0F5C3A] text-gray-700" placeholder="Search by Refund ID / Invoice ID / Patient Name" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <select className="h-10 px-3 pr-8 text-sm border border-gray-200 rounded-lg outline-none text-gray-600 appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010L12%2015L17%2010%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_8px_center]">
                  <option>All Refund Types</option>
                </select>
                <select className="h-10 px-3 pr-8 text-sm border border-gray-200 rounded-lg outline-none text-gray-600 appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010L12%2015L17%2010%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_8px_center]">
                  <option>All Status</option>
                </select>
                <div className="h-10 px-3 text-sm border border-gray-200 rounded-lg outline-none flex items-center justify-between min-w-[200px] text-gray-600 bg-white">
                  <span>01-05-2025 &rarr; 12-05-2025</span><Calendar className="w-4 h-4 text-gray-400" />
                </div>
                <button className="h-10 px-4 border border-gray-200 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-gray-50 text-gray-700 bg-white shadow-sm">
                  <Filter className="w-4 h-4" /> Filter
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="border border-gray-100 rounded-xl p-4 bg-white flex flex-col shadow-sm">
                  <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center"><RefreshCw className="w-4 h-4" /></div><p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Total Refunds</p></div>
                  <p className="font-black text-lg text-gray-900 leading-none">₹ 18,450.00</p><p className="text-[10px] text-gray-400 mt-1">All Time</p>
                </div>
                <div className="border border-gray-100 rounded-xl p-4 bg-white flex flex-col shadow-sm">
                  <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center"><RefreshCw className="w-4 h-4" /></div><p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Refunds This Month</p></div>
                  <p className="font-black text-lg text-gray-900 leading-none">₹ 6,450.00</p><p className="text-[10px] text-gray-400 mt-1">May 2025</p>
                </div>
                <div className="border border-gray-100 rounded-xl p-4 bg-white flex flex-col shadow-sm">
                  <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center"><RefreshCw className="w-4 h-4" /></div><p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Pending Refunds</p></div>
                  <p className="font-black text-lg text-gray-900 leading-none">₹ 8,250.00</p><p className="text-[10px] text-gray-400 mt-1">5 Requests</p>
                </div>
                <div className="border border-gray-100 rounded-xl p-4 bg-white flex flex-col shadow-sm">
                  <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center"><RefreshCw className="w-4 h-4" /></div><p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Processed Refunds</p></div>
                  <p className="font-black text-lg text-gray-900 leading-none">₹ 10,200.00</p><p className="text-[10px] text-gray-400 mt-1">12 Refunded</p>
                </div>
                <div className="border border-gray-100 rounded-xl p-4 bg-white flex flex-col shadow-sm">
                  <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg bg-red-400 text-white flex items-center justify-center"><RefreshCw className="w-4 h-4" /></div><p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Rejected Refunds</p></div>
                  <p className="font-black text-lg text-gray-900 leading-none">₹ 1,750.00</p><p className="text-[10px] text-gray-400 mt-1">2 Rejected</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="text-[10px] uppercase font-bold text-gray-400 border-b border-gray-100 tracking-wider">
                      <tr>
                        <th className="p-4 w-10"><input type="checkbox" className="rounded border-gray-300 w-3.5 h-3.5" /></th>
                        <th className="p-4">Refund ID</th><th className="p-4">Invoice ID</th><th className="p-4">Patient</th><th className="p-4">Type</th><th className="p-4">Amount (₹)</th><th className="p-4 text-center">Refund Method</th><th className="p-4">Date & Time</th><th className="p-4 text-center">Status</th><th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {MOCK_REFUNDS.map(refund => (
                        <tr key={refund.id} onClick={() => setSelectedItem(refund)} className={cn("transition cursor-pointer", selectedItem?.id === refund.id ? "bg-emerald-50/50" : "hover:bg-gray-50")}>
                          <td className="p-4" onClick={e => e.stopPropagation()}><input type="checkbox" className="rounded border-gray-300 w-3.5 h-3.5" /></td>
                          <td className="p-4 font-bold text-[#0F5C3A] text-[11px]">{refund.id}</td>
                          <td className="p-4 text-[11px] text-gray-500 font-medium">{refund.invId}</td>
                          <td className="p-4"><div className="font-bold text-gray-800 text-[11px] leading-tight">{refund.patient}</div><div className="text-[9px] text-gray-400 font-medium">{refund.patId}</div></td>
                          <td className="p-4">{renderTypeBadge(refund.type, refund.subType)}</td>
                          <td className="p-4 font-bold text-gray-700 text-[11px]">{refund.amount.toFixed(2)}</td>
                          <td className="p-4 text-center">{renderPaymentMethod(refund.method)}</td>
                          <td className="p-4 text-[10px] text-gray-600 font-medium whitespace-pre-line leading-snug">{refund.date}</td>
                          <td className="p-4 text-center">{renderStatusBadge(refund.status)}</td>
                          <td className="p-4 text-center">
                            <button className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 mx-auto transition"><Eye className="w-3.5 h-3.5" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationBar />
              </div>
            </div>

            {selectedItem && (
              <div className="w-[380px] flex-shrink-0 bg-white border border-gray-200 rounded-xl p-5 sticky top-4 max-h-[calc(100vh-100px)] overflow-y-auto shadow-sm">
                <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-[#0A3E2A]">Refund Details</h3><button onClick={() => setSelectedItem(null)} className="p-1 text-gray-400 hover:text-gray-700 transition"><X className="w-4 h-4" /></button></div>
                <div className="mb-5 flex flex-col gap-2">
                  <div className="w-fit">{renderStatusBadge(selectedItem.status)}</div>
                  <span className="font-black text-[#0F5C3A]">{selectedItem.id}</span>
                </div>
                <div className="space-y-3 text-[11px]">
                  <h4 className="font-bold text-gray-800 text-xs mt-4 mb-2">Refund Information</h4>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Invoice ID</span><span className="font-bold text-gray-700">{selectedItem.invId}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Appointment ID</span><span className="font-bold text-gray-700">APPT-2025-0512-00123</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Type</span>{renderTypeBadge(selectedItem.type, selectedItem.subType)}</div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Refund Amount</span><span className="font-bold text-gray-700">₹ {selectedItem.amount.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Refund Date & Time</span><span className="font-bold text-gray-700">{selectedItem.date.replace('\n', ', ')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Refund Reason</span><span className="font-bold text-gray-700 text-right w-1/2">Patient cancelled the appointment</span></div>
                  <div className="flex flex-col gap-1 mt-2">
                    <span className="text-gray-500 font-medium">Notes</span>
                    <span className="font-bold text-gray-700">Refund processed to original payment method.</span>
                  </div>
                  
                  <h4 className="font-bold text-gray-800 text-xs mt-6 mb-2 border-t pt-4">Patient Information</h4>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Name</span><span className="font-bold text-gray-700">{selectedItem.patient}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Patient ID</span><span className="font-bold text-gray-700">{selectedItem.patId}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Mobile</span><span className="font-bold text-gray-700">+91 9876543210</span></div>

                  <h4 className="font-bold text-gray-800 text-xs mt-6 mb-2 border-t pt-4">Payment Information</h4>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Paid Amount</span><span className="font-bold text-gray-700">₹ 2,257.50</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Payment Method</span><span className="font-bold text-gray-700">Card</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Paid On</span><span className="font-bold text-gray-700">12 May 2025, 09:45 AM</span></div>

                  <h4 className="font-bold text-gray-800 text-xs mt-6 mb-2 border-t pt-4">Refund Summary</h4>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Doctor Consultation</span><span className="font-bold">₹ 800.00</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Lab Tests (3)</span><span className="font-bold">₹ 1,350.00</span></div>
                  <div className="border-t border-gray-100 pt-2.5 flex justify-between"><span className="text-gray-500 font-medium">Subtotal</span><span className="font-bold">₹ 2,150.00</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Discount</span><span className="font-bold">₹ 0.00</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 font-medium">Tax (GST 5%)</span><span className="font-bold">₹ 107.50</span></div>
                  <div className="pt-2 flex justify-between items-center"><span className="font-bold text-gray-800 text-xs">Refund Amount</span><span className="font-black text-[#0F5C3A] text-sm">₹ {selectedItem.amount.toFixed(2)}</span></div>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-4">
                  <h4 className="font-bold text-gray-800 text-xs mb-3">Refunded To</h4>
                  <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-gray-400" />
                      <div>
                        <p className="text-[11px] font-bold text-gray-700">XXXX XXXX XXXX 4242</p>
                        <p className="text-[9px] text-gray-500">in HDFC Bank</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Refunded</span>
                  </div>
                </div>

                <button className="mt-6 w-full py-2.5 border border-gray-200 text-gray-600 rounded-lg font-bold text-xs hover:bg-gray-50 flex items-center justify-center gap-2 transition">
                  <Download className="w-3.5 h-3.5" /> Download Refund Receipt
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
