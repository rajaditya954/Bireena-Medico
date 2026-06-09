import { Link } from "react-router-dom";
import { 
  ArrowUpRight, 
  TrendingDown, 
  Users, 
  Calendar, 
  Clock, 
  Plus, 
  ClipboardList, 
  ArrowRight,
  Activity,
  FlaskConical,
  Pill,
  UserCircle,
  Award
} from "lucide-react";
import { cn } from "../../lib/utils";
import AIConsultant from "../../components/dashboard/AIConsultant";

function StatCard({ title, value, icon: Icon, color, trend, trendValue }) {
  const isPositive = trend === "up";
  
  return (
    <div className="bg-bg-secondary p-6 rounded-[2rem] border border-primary/10 shadow-sm transition-all hover:shadow-xl hover:shadow-primary-dark/5 group">
      <div className="flex items-center justify-between mb-6">
        <div className={cn("p-4 rounded-2xl bg-opacity-10 group-hover:scale-110 transition-transform duration-300", color.replace('text-', 'bg-'))}>
          <Icon className={cn("w-6 h-6", color)} />
        </div>
      </div>
      <div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black text-primary-dark tracking-tighter">{value}</p>
      </div>
    </div>
  );
}

export default function DoctorDashboard({ user }) {
  const name = user?.name || "Doctor";
  return (
    <div className="space-y-10">
      <AIConsultant />
      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-primary-dark tracking-tighter italic">Doctor's Lounge</h1>
              <p className="text-gray-500 font-medium">Hello Dr. {name}, you have <span className="text-primary font-black">8 tasks</span> remaining today.</p>
            </div>
            <div className="flex gap-3">
               <Link to="/appointments" className="h-14 px-8 bg-primary/10 text-primary-forest rounded-2xl font-bold flex items-center gap-2 hover:bg-primary/20 transition-colors">
                  <ClipboardList className="w-5 h-5" /> Queue
               </Link>
               <Link to="/emr" className="h-14 px-8 bg-primary text-white rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                  <Plus className="w-5 h-5" /> Consultation
               </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Total Appointments" value="28" icon={Calendar} color="text-primary" />
            <StatCard title="Patients Seen" value="12" icon={Users} color="text-blue-600" />
            <StatCard title="Avg. Time" value="18m" icon={Clock} color="text-orange-600" />
          </div>
        </div>

        {/* Profile Card */}
        <div className="w-full xl:w-80 flex-shrink-0">
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl shadow-primary-dark/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary-dark font-black text-3xl mb-4 border-4 border-white shadow-lg">
                {name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 className="text-xl font-black text-primary-dark tracking-tight mb-1">Dr. {name}</h3>
              <p className="text-xs font-bold text-primary-forest uppercase tracking-widest mb-6 px-4 py-1 bg-primary/10 rounded-full">
                {user?.specializations || "General Practitioner"}
              </p>
              
              <div className="w-full space-y-4 text-left">
                <div className="p-4 bg-bg-primary rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Degrees</p>
                  <p className="text-sm font-bold text-gray-700">{user?.degrees || "MBBS, MD"}</p>
                </div>
                {user?.medals && (
                   <div className="p-4 bg-bg-primary rounded-2xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Honors & Medals</p>
                    <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Award className="w-4 h-4 text-orange-400" /> {user.medals}
                    </p>
                  </div>
                )}
                <div className="flex justify-center gap-2 pt-2">
                   <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary-forest">
                      <Award className="w-5 h-5" />
                   </div>
                   <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <TrendingDown className="w-5 h-5" />
                   </div>
                   <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                      <Activity className="w-5 h-5" />
                   </div>
                </div>

                <div className="pt-8 border-t border-gray-50">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Availability Management</h4>
                  <div className="space-y-3">
                    {["Mon", "Wed", "Fri"].map(day => (
                      <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-xs font-bold text-gray-600">{day}</span>
                        <span className="text-[10px] font-black text-primary italic">09:00 - 17:00</span>
                      </div>
                    ))}
                    <button className="w-full py-3 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/10 transition-colors">
                      Edit Schedule
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-bg-secondary rounded-[3rem] border border-primary/10 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-primary/10 flex items-center justify-between bg-primary/5">
             <div>
                <h3 className="text-xl font-bold text-primary-dark tracking-tight">Today's Schedule</h3>
                <p className="text-xs font-bold text-primary-forest/60 uppercase tracking-widest mt-1">April 22 · Wednesday</p>
             </div>
             <button className="p-3 bg-white/50 rounded-xl shadow-sm text-gray-400 hover:text-primary transition-colors">
                <ArrowRight className="w-5 h-5" />
             </button>
          </div>
          <div className="divide-y divide-gray-50 px-4">
             {[
               { time: "09:30 AM", patient: "Alice Cooper", type: "Follow-up", status: "Waiting" },
               { time: "10:15 AM", patient: "Bob Marley", type: "First Visit", status: "Upcoming" },
               { time: "11:00 AM", patient: "Charlie Sheen", type: "Urgent", status: "Upcoming" },
               { time: "11:45 AM", patient: "Diana Ross", type: "Consultation", status: "Upcoming" },
             ].map((apt, i) => (
               <div key={i} className="p-6 flex items-center gap-8 group hover:bg-primary/5 transition-colors rounded-2xl">
                  <div className="text-center min-w-[70px]">
                     <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Time</p>
                     <p className="text-sm font-black text-gray-900">{apt.time.split(' ')[0]}</p>
                     <p className="text-[8px] font-bold text-primary-forest uppercase">{apt.time.split(' ')[1]}</p>
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                     <div>
                        <h4 className="font-bold text-gray-900 group-hover:text-primary-forest transition-colors">{apt.patient}</h4>
                        <p className="text-xs font-medium text-gray-400">{apt.type}</p>
                     </div>
                     <div className="flex items-center gap-4">
                        <span className={cn(
                          "px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider",
                          apt.status === "Waiting" ? "bg-orange-50 text-orange-600 animate-pulse" : "bg-bg-primary text-gray-400"
                        )}>
                          {apt.status}
                        </span>
                        <button className="h-10 px-4 bg-primary-dark text-white rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 transition-all">
                           Open
                        </button>
                     </div>
                  </div>
               </div>
             ))}
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-primary-dark p-8 rounded-[3rem] text-white shadow-2xl shadow-primary-dark/20 relative overflow-hidden group">
              <div className="relative z-10">
                 <h3 className="text-2xl font-bold mb-4 tracking-tighter">Emergency Calls</h3>
                 <p className="text-primary/60 text-sm font-medium leading-relaxed mb-6">Quickly access the emergency registry and trauma unit alerts.</p>
                 <button className="w-full py-4 bg-white text-primary-dark font-black rounded-2xl flex items-center justify-center gap-2 hover:scale-105 transition-transform">
                    <Activity className="w-5 h-5" /> View Registry
                 </button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
           </div>

           <div className="bg-bg-secondary p-8 rounded-[3rem] border border-primary/10 shadow-sm relative overflow-hidden group">
              <div className="absolute -inset-2 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl" />
              <div className="relative z-10">
                 <h3 className="text-lg font-bold text-primary-dark tracking-tight mb-4">Patient Operations</h3>
                 <div className="space-y-3">
                    <button className="w-full py-3 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-forest transition-colors flex items-center justify-center gap-2">
                       <Users className="w-4 h-4" /> Global Search
                    </button>
                    <button className="w-full py-3 bg-white/50 border border-primary/10 text-primary-forest rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary/10 transition-colors flex items-center justify-center gap-2">
                       <Plus className="w-4 h-4" /> Add Record
                    </button>
                 </div>
              </div>
           </div>

           <div className="bg-bg-secondary p-8 rounded-[3rem] border border-primary/10 shadow-sm">
              <h3 className="text-lg font-bold text-primary-dark tracking-tight mb-6">Quick Access</h3>
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { label: "My Profile", icon: UserCircle, path: "/profile" },
                   { label: "EMR Records", icon: ClipboardList, path: "/emr" },
                   { label: "Patient Search", icon: Users, path: "/patients" },
                   { label: "Lab Results", icon: FlaskConical, path: "/laboratory" },
                   { label: "Manage Pharma", icon: Pill, path: "/pharmacy" },
                   { label: "Settings", icon: Award, path: "/settings" },
                 ].map((nav, i) => (
                   <Link key={i} to={nav.path} className="flex flex-col items-center justify-center p-4 rounded-3xl bg-bg-primary hover:bg-primary/10 transition-colors group">
                      <nav.icon className="w-6 h-6 text-gray-400 group-hover:text-primary mb-2 transition-colors" />
                      <span className="text-[10px] font-bold text-gray-500">{nav.label}</span>
                   </Link>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
