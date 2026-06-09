import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from "recharts";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  Filter,
  Download,
  ArrowUpRight,
  Target,
  Zap
} from "lucide-react";
import { cn } from "../lib/utils";

const DATA = [
  { name: "Week 1", revenue: 2400, patients: 400 },
  { name: "Week 2", revenue: 1398, patients: 300 },
  { name: "Week 3", revenue: 9800, patients: 1200 },
  { name: "Week 4", revenue: 3908, patients: 200 },
  { name: "Week 5", revenue: 4800, patients: 800 },
  { name: "Week 6", revenue: 3800, patients: 500 },
  { name: "Week 7", revenue: 4300, patients: 600 },
];

const PIE_DATA = [
  { name: "General Medicine", value: 400 },
  { name: "Cardiology", value: 300 },
  { name: "Pediatrics", value: 300 },
  { name: "Radiology", value: 200 },
];

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#6366f1"];

export default function Analytics() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#06402B] tracking-tighter italic">Clinical Analytics</h1>
          <p className="text-gray-500 font-medium">Holistic data visualization for medical decisions.</p>
        </div>
        <div className="flex gap-3">
           <button className="h-12 px-6 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-50 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Date Range
           </button>
           <button className="h-12 px-6 bg-[#06402B] text-white rounded-2xl text-sm font-bold shadow-xl shadow-emerald-900/20 hover:scale-105 transition-transform flex items-center gap-2">
              <Download className="w-4 h-4" /> Export Analytics
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Operational Profit" value="$128,400" trend="+15.2%" icon={Zap} color="emerald" />
        <MetricCard title="Patient Satisfaction" value="4.8/5.0" trend="+0.4%" icon={Target} color="blue" />
        <MetricCard title="Avg. Wait Time" value="12m" trend="-4m" icon={Users} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm">
           <h3 className="text-xl font-bold text-[#06402B] mb-8 tracking-tight">Revenue Trends</h3>
           <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={DATA}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 700}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 700}} />
                    <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm">
           <h3 className="text-xl font-bold text-[#06402B] mb-8 tracking-tight">Department Traffic</h3>
           <div className="h-[400px] flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                       data={PIE_DATA}
                       cx="50%"
                       cy="50%"
                       innerRadius={80}
                       outerRadius={140}
                       paddingAngle={8}
                       dataKey="value"
                    >
                       {PIE_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                 </PieChart>
              </ResponsiveContainer>
              <div className="space-y-4 pr-10">
                 {PIE_DATA.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                       <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                       <div>
                          <p className="text-xs font-bold text-gray-900">{item.name}</p>
                          <p className="text-[10px] font-black text-gray-400">{item.value} Patients</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, icon: Icon, color }) {
  return (
    <div className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-sm transition-all hover:shadow-2xl hover:shadow-emerald-900/5 group">
       <div className="flex items-center justify-between mb-8">
          <div className={cn(
             "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500",
             color === "emerald" ? "bg-emerald-50 text-emerald-600" : 
             color === "blue" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
          )}>
             <Icon className="w-7 h-7" />
          </div>
          <div className="text-right">
             <div className="flex items-center justify-end gap-1 text-emerald-600 font-black text-xs">
                <ArrowUpRight className="w-3 h-3" /> {trend}
             </div>
             <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">Growth</p>
          </div>
       </div>
       <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
          <h4 className="text-4xl font-black text-[#06402B] tracking-tighter">{value}</h4>
       </div>
    </div>
  );
}
