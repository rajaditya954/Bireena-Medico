import { useState } from "react";
import { 
  FlaskConical, 
  Search, 
  Plus, 
  FileText, 
  Upload, 
  Download, 
  CheckCircle2, 
  Clock, 
  Filter,
  MoreVertical,
  Activity,
  Layers,
  ChevronRight
} from "lucide-react";
import { Button } from "../components/common/Button";
import { cn } from "../lib/utils";

const MOCK_LAB_REPORTS = [
  { id: "LAB-9901", patient: "Alice Cooper", test: "Complete Blood Count", date: "2026-04-20", status: "Completed", urgency: "Normal" },
  { id: "LAB-9902", patient: "Bob Marley", test: "Lipid Profile", date: "2026-04-21", status: "Pending", urgency: "Critical" },
  { id: "LAB-9903", patient: "Charlie Sheen", test: "Liver Function Test", date: "2026-04-21", status: "In Progress", urgency: "Urgent" },
  { id: "LAB-9904", patient: "Diana Ross", test: "Thyroid Profile", date: "2026-04-22", status: "Pending", urgency: "Normal" },
];

export default function Laboratory() {
  const [activeTab, setActiveTab] = useState("tests");

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-primary-dark tracking-tighter">Laboratory</h1>
          <p className="text-gray-500 font-medium">Diagnostic services and medical report center.</p>
        </div>
        <div className="flex gap-3">
           <Button className="h-14 px-8 bg-primary-dark text-white rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-primary-dark/10 hover:scale-105 transition-transform">
              <Plus className="w-5 h-5" /> Book New Test
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-bg-secondary p-8 rounded-[3rem] border border-primary/10 shadow-sm transition-all hover:shadow-xl hover:shadow-primary-dark/5 group text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform">
               <Layers className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-primary-dark">1,240</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Tests Conducted</p>
         </div>
         <div className="bg-bg-secondary p-8 rounded-[3rem] border border-primary/10 shadow-sm transition-all hover:shadow-xl hover:shadow-primary-dark/5 group text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-[1.5rem] flex items-center justify-center text-orange-600 mx-auto mb-4 group-hover:scale-110 transition-transform animate-pulse">
               <Clock className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-primary-dark">14</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Pending Reports</p>
         </div>
         <div className="bg-bg-secondary p-8 rounded-[3rem] border border-primary/10 shadow-sm transition-all hover:shadow-xl hover:shadow-primary-dark/5 group text-center">
            <div className="w-16 h-16 bg-red-50 rounded-[1.5rem] flex items-center justify-center text-red-600 mx-auto mb-4 group-hover:scale-110 transition-transform">
               <Activity className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-primary-dark">3</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Critical Findings</p>
         </div>
      </div>

      <div className="bg-bg-secondary rounded-[3rem] border border-primary/10 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <h3 className="text-xl font-bold text-primary-dark tracking-tight">Recent Diagnostic Tests</h3>
           <div className="flex gap-4 items-center">
              <div className="relative group flex-1 min-w-[240px]">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                 <input type="text" placeholder="Search by patient or ID..." className="h-10 pl-10 pr-4 bg-bg-primary border-none rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/10 focus:bg-bg-secondary transition-all w-full" />
              </div>
              <Button variant="outline" className="h-10 px-4 rounded-xl border-primary/10 text-gray-400 hover:text-primary hover:bg-primary/5">
                 <Filter className="w-4 h-4" />
              </Button>
           </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-primary/5 text-primary-forest">
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest opacity-60">Patient</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest opacity-60">Test Type</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest opacity-60">Date</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest opacity-60">Status</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest opacity-60 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                 {MOCK_LAB_REPORTS.map((report) => (
                   <tr key={report.id} className="hover:bg-primary/5 transition-colors group">
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary-forest font-bold text-[10px]">
                               {report.patient.split(' ').map(n=>n[0]).join('')}
                            </div>
                            <span className="font-bold text-primary-dark">{report.patient}</span>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                         <p className="text-sm font-bold text-gray-600">{report.test}</p>
                         <p className="text-[10px] font-black text-gray-300 uppercase">{report.id}</p>
                      </td>
                      <td className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{report.date}</td>
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-2">
                            <span className={cn(
                               "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider",
                               report.status === "Completed" ? "bg-primary/10 text-primary-forest" : 
                               report.status === "Pending" ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
                            )}>
                               {report.status}
                            </span>
                            {report.urgency === "Critical" && (
                               <Activity className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                            )}
                         </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                         <div className="flex items-center justify-end gap-2">
                             {report.status === "Completed" ? (
                                <button className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all">
                                   <Download className="w-5 h-5" />
                                </button>
                             ) : (
                                <button className="p-2 text-gray-400 hover:text-primary-dark hover:bg-primary/5 rounded-xl transition-all">
                                   <Upload className="w-5 h-5" />
                                </button>
                             )}
                             <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                                <MoreVertical className="w-5 h-5" />
                             </button>
                          </div>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
        
        <div className="p-8 bg-primary/5 border-t border-primary/5 text-center">
            <button className="text-xs font-bold text-primary uppercase tracking-widest flex items-center justify-center gap-2 mx-auto hover:gap-3 transition-all">
               View Full Archive <ChevronRight className="w-4 h-4" />
            </button>
        </div>
      </div>
    </div>
  );
}
