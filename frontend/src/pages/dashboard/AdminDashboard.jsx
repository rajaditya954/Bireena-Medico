import React, { useState } from "react";
import {
  ArrowUpRight,
  Users,
  Calendar,
  FileText,
  FlaskConical,
  DollarSign,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  XCircle,
  User,
  Stethoscope,
  Heart,
  Brain,
  Droplet,
} from "lucide-react";
import { cn } from "../../lib/utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// ========== Mock Data ==========
const appointmentsData = [
  { date: "05 May", appointments: 145, completed: 98 },
  { date: "06 May", appointments: 162, completed: 112 },
  { date: "07 May", appointments: 158, completed: 108 },
  { date: "08 May", appointments: 170, completed: 125 },
  { date: "09 May", appointments: 165, completed: 118 },
  { date: "10 May", appointments: 180, completed: 132 },
  { date: "11 May", appointments: 175, completed: 128 },
  { date: "12 May", appointments: 168, completed: 120 },
];

const genderData = [
  { name: "Female", value: 1328, color: "#EC4899" },
  { name: "Male", value: 1047, color: "#3B82F6" },
  { name: "Other", value: 83, color: "#8B5CF6" },
];

const appointmentStatusData = [
  { name: "Completed", value: 628, color: "#10B981" },
  { name: "Scheduled", value: 412, color: "#F59E0B" },
  { name: "Cancelled", value: 89, color: "#EF4444" },
  { name: "No Show", value: 60, color: "#6B7280" },
];

const topDoctors = [
  { name: "Dr. Michael Brown", specialty: "General Physician", appointments: 312 },
  { name: "Dr. Sarah Johnson", specialty: "Pediatrics", appointments: 278 },
  { name: "Dr. James Wilson", specialty: "Cardiology", appointments: 241 },
  { name: "Dr. Emily Davis", specialty: "Dermatology", appointments: 185 },
  { name: "Dr. Rahul Sharma", specialty: "Orthopedics", appointments: 173 },
];

const labReportsStatus = [
  { name: "Completed", value: 512, percent: 60.5, color: "#10B981" },
  { name: "Pending", value: 246, percent: 29.1, color: "#F59E0B" },
  { name: "In Progress", value: 88, percent: 10.4, color: "#3B82F6" },
];

const revenueBreakdown = [
  { name: "Consultation", amount: 725450, percent: 58.2, color: "#0F5C3A" },
  { name: "Lab Tests", amount: 345230, percent: 27.7, color: "#166A45" },
  { name: "Pharmacy", amount: 175210, percent: 14.1, color: "#1D7A54" },
];

const recentActivity = [
  {
    activity: "Lab Report Issued",
    details: "CBC (Complete Blood Count) - Patient: Alice Cooper",
    by: "Dr. Michael Brown",
    dateTime: "12 May 2025, 10:30 AM",
  },
  {
    activity: "Appointment Scheduled",
    details: "Dr. Sarah Johnson - Patient: John Doe",
    by: "Reception",
    dateTime: "12 May 2025, 10:15 AM",
  },
  {
    activity: "Prescription Issued",
    details: "Paracetamol 500mg - Patient: Robert Brown",
    by: "Dr. James Wilson",
    dateTime: "11 May 2025, 04:45 PM",
  },
  {
    activity: "Payment Received",
    details: "Invoice #INV-2025-0012 - Amount ₹2,500",
    by: "Online",
    dateTime: "11 May 2025, 02:30 PM",
  },
];

// ========== Helper Components ==========
const StatCard = ({ title, value, icon: Icon, trend, trendValue }) => {
  const isPositive = trend === "up";
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-[#06402B] mt-2">{value}</p>
          {trendValue && (
            <div className={cn("flex items-center gap-1 mt-2 text-xs font-semibold", isPositive ? "text-green-600" : "text-red-600")}>
              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
              {trendValue} vs last 7 days
            </div>
          )}
        </div>
        <div className="p-3 bg-emerald-50 rounded-xl">
          <Icon className="w-5 h-5 text-emerald-600" />
        </div>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100 text-sm">
        <p className="font-semibold text-gray-800">{label}</p>
        {payload.map((p, idx) => (
          <p key={idx} className="text-gray-600">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminAnalytics() {
  const [dateRange, setDateRange] = useState("7days");

  // Format numbers with Indian commas
  const formatIndianCurrency = (num) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  return (
    <div className="min-h-screen bg-[#F2F9F6] p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#06402B] tracking-tight">Admin Analytics</h1>
          <p className="text-gray-500 text-sm">Overview of clinic operations and performance</p>
        </div>

        {/* Stats Row - 5 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Total Patients" value="2,458" icon={Users} trend="up" trendValue="↑ 12.5%" />
          <StatCard title="Total Appointments" value="1,189" icon={Calendar} trend="up" trendValue="↑ 8.3%" />
          <StatCard title="Prescriptions Issued" value="1,024" icon={FileText} trend="up" trendValue="↑ 9.6%" />
          <StatCard title="Lab Reports Issued" value="846" icon={FlaskConical} trend="up" trendValue="↑ 15.2%" />
          <StatCard title="Total Revenue" value="₹12,45,890" icon={DollarSign} trend="up" trendValue="↑ 18.7%" />
        </div>

        {/* Two-Column Layout: Appointments Overview + Gender/Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appointments Overview Chart */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#06402B]">Appointments Overview</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setDateRange("7days")}
                  className={cn("px-3 py-1 text-xs rounded-lg transition", dateRange === "7days" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600")}
                >
                  7 Days
                </button>
                <button
                  onClick={() => setDateRange("30days")}
                  className={cn("px-3 py-1 text-xs rounded-lg transition", dateRange === "30days" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600")}
                >
                  30 Days
                </button>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={appointmentsData}>
                  <defs>
                    <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F5C3A" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0F5C3A" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#6B7280" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#6B7280" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="appointments" stroke="#0F5C3A" strokeWidth={2} fill="url(#colorAppointments)" name="Total Appointments" />
                  <Area type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} fill="url(#colorCompleted)" name="Completed" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#0F5C3A]"></div><span>Total Appointments</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#10B981]"></div><span>Completed</span></div>
            </div>
          </div>

          {/* Gender Distribution + Appointment Status */}
          <div className="space-y-6">
            {/* Gender Donut */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-base font-bold text-[#06402B] mb-2">Patient Demographics</h2>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="h-48 w-48">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <PieChart>
                      <Pie data={genderData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" label={({ percent }) => `${(percent * 100).toFixed(1)}%`} labelLine={false}>
                        {genderData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {genderData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between gap-6 text-sm">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div><span>{item.name}</span></div>
                      <span className="font-semibold text-gray-800">{item.value} ({((item.value / (1328+1047+83)) * 100).toFixed(1)}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Appointment Status */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-base font-bold text-[#06402B] mb-3">Appointment Status</h2>
              <div className="space-y-3">
                {appointmentStatusData.map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.name}</span>
                      <span className="font-semibold">{item.value} ({((item.value / 1189) * 100).toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ width: `${(item.value / 1189) * 100}%`, backgroundColor: item.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Doctors Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-[#06402B]">Top Doctors (by Appointments)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Doctor</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Specialist</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Appointments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topDoctors.map((doc, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/30">
                    <td className="px-5 py-3 font-medium text-gray-800">{doc.name}</td>
                    <td className="px-5 py-3 text-gray-500">{doc.specialty}</td>
                    <td className="px-5 py-3 font-semibold text-gray-700">{doc.appointments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Two-Column: Lab Reports Status + Revenue Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lab Reports by Status */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-base font-bold text-[#06402B] mb-3">Lab Reports by Status</h2>
            <div className="space-y-4">
              {labReportsStatus.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.name}</span>
                    <span className="font-semibold">{item.value} ({item.percent}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${item.percent}%`, backgroundColor: item.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Overview */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-base font-bold text-[#06402B]">Revenue Overview</h2>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#06402B]">₹12,45,890</p>
                <p className="text-xs text-green-600 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> ↑ 18.7% vs last 7 days</p>
              </div>
            </div>
            <div className="space-y-3 mt-4">
              {revenueBreakdown.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.name}</span>
                    <span className="font-semibold">₹{formatIndianCurrency(item.amount)} ({item.percent}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${item.percent}%`, backgroundColor: item.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-[#06402B]">Recent Activity</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Activity</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Details</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">By</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentActivity.map((activity, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/30">
                    <td className="px-5 py-3 font-medium text-gray-800">{activity.activity}</td>
                    <td className="px-5 py-3 text-gray-500">{activity.details}</td>
                    <td className="px-5 py-3 text-gray-600">{activity.by}</td>
                    <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{activity.dateTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}