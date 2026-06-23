import React, { useState, useEffect } from "react";
import {
  ArrowUpRight,
  Users,
  Calendar,
  FileText,
  FlaskConical,
  DollarSign,
  TrendingUp,
  Activity,
  RefreshCw,
  AlertCircle,
  Stethoscope,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { api } from "../../lib/api";

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
              {trendValue}
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

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Format numbers with Indian commas
  const formatIndianCurrency = (num) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  useEffect(() => {
    let active = true;
    const fetchDashboard = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.getDashboardStats();
        if (active) {
          setData(res.data.data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to load admin dashboard");
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchDashboard();
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-semibold">Loading admin dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white rounded-3xl border border-red-100 p-8 shadow-sm max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Dashboard Error</h2>
          <p className="text-sm text-slate-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Extract data from API response
  const totalPatients = data?.totalPatients || 0;
  const totalAppointments = data?.totalAppointments || 0;
  const totalPrescriptions = data?.totalPrescriptions || 0;
  const totalLabReports = data?.totalLabReports || 0;
  const totalRevenue = data?.totalRevenue || 0;

  const appointmentStatus = data?.appointmentStatus || {};
  const labReportsStatus = data?.labReportsStatus || {};
  const revenueBreakdown = data?.revenueBreakdown || {};
  const genderDist = data?.genderDistribution || {};
  const topDoctors = data?.topDoctors || [];
  const appointmentsTrend = data?.appointmentsTrend || [];
  const recentActivity = data?.recentActivity || [];

  // Prepare chart data
  const genderData = [
    { name: "Female", value: genderDist.female || 0, color: "#EC4899" },
    { name: "Male", value: genderDist.male || 0, color: "#3B82F6" },
    { name: "Other", value: genderDist.other || 0, color: "#8B5CF6" },
  ].filter(d => d.value > 0);
  const genderTotal = genderData.reduce((s, d) => s + d.value, 0) || 1;

  const appointmentStatusData = [
    { name: "Completed", value: appointmentStatus.completed || 0, color: "#10B981" },
    { name: "Scheduled", value: appointmentStatus.scheduled || 0, color: "#F59E0B" },
    { name: "Cancelled", value: appointmentStatus.cancelled || 0, color: "#EF4444" },
    { name: "No Show", value: appointmentStatus.noShow || 0, color: "#6B7280" },
  ];
  const appointmentTotal = appointmentStatusData.reduce((s, d) => s + d.value, 0) || 1;

  const labData = [
    { name: "Completed", value: labReportsStatus.completed || 0, color: "#10B981" },
    { name: "Pending", value: labReportsStatus.pending || 0, color: "#F59E0B" },
    { name: "In Progress", value: labReportsStatus.inProgress || 0, color: "#3B82F6" },
  ];
  const labTotal = labData.reduce((s, d) => s + d.value, 0) || 1;

  const revTotal = (revenueBreakdown.consultation || 0) + (revenueBreakdown.lab || 0) + (revenueBreakdown.pharmacy || 0) || 1;
  const revenueData = [
    { name: "Consultation", amount: revenueBreakdown.consultation || 0, percent: ((revenueBreakdown.consultation || 0) / revTotal * 100).toFixed(1), color: "#0F5C3A" },
    { name: "Lab Tests", amount: revenueBreakdown.lab || 0, percent: ((revenueBreakdown.lab || 0) / revTotal * 100).toFixed(1), color: "#166A45" },
    { name: "Pharmacy", amount: revenueBreakdown.pharmacy || 0, percent: ((revenueBreakdown.pharmacy || 0) / revTotal * 100).toFixed(1), color: "#1D7A54" },
  ];

  return (
    <div className="min-h-screen bg-[#F2F9F6] p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#06402B] tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Live overview of clinic operations from database</p>
        </div>

        {/* Stats Row - 5 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Total Patients" value={formatIndianCurrency(totalPatients)} icon={Users} />
          <StatCard title="Total Appointments" value={formatIndianCurrency(totalAppointments)} icon={Calendar} />
          <StatCard title="Prescriptions Issued" value={formatIndianCurrency(totalPrescriptions)} icon={FileText} />
          <StatCard title="Lab Reports Issued" value={formatIndianCurrency(totalLabReports)} icon={FlaskConical} />
          <StatCard title="Total Revenue" value={`₹${formatIndianCurrency(totalRevenue)}`} icon={DollarSign} />
        </div>

        {/* Two-Column Layout: Appointments Overview + Gender/Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appointments Overview Chart */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#06402B]">Appointments Trend (Last 8 Days)</h2>
            </div>
            <div className="h-80 relative w-full">
              {appointmentsTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={appointmentsTrend}>
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
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  No appointment data for the last 8 days
                </div>
              )}
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
                <div className="h-48 w-48 relative">
                  {genderData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <PieChart>
                        <Pie data={genderData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" label={({ percent }) => `${(percent * 100).toFixed(1)}%`} labelLine={false}>
                          {genderData.map((entry, idx) => (
                            <Cell key={idx} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">No data</div>
                  )}
                </div>
                <div className="space-y-2">
                  {genderData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between gap-6 text-sm">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div><span>{item.name}</span></div>
                      <span className="font-semibold text-gray-800">{item.value} ({((item.value / genderTotal) * 100).toFixed(1)}%)</span>
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
                      <span className="font-semibold">{item.value} ({((item.value / appointmentTotal) * 100).toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ width: `${(item.value / appointmentTotal) * 100}%`, backgroundColor: item.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Doctors Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-[#06402B]">Doctors (by Appointments)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Doctor</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Specialization</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Appointments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topDoctors.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-gray-400">No doctors found in the database</td>
                  </tr>
                ) : (
                  topDoctors.map((doc, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/30">
                      <td className="px-5 py-3 font-medium text-gray-800">{doc.name}</td>
                      <td className="px-5 py-3 text-gray-500">{doc.specialty}</td>
                      <td className="px-5 py-3 font-semibold text-gray-700">{doc.appointments}</td>
                    </tr>
                  ))
                )}
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
              {labData.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.name}</span>
                    <span className="font-semibold">{item.value} ({((item.value / labTotal) * 100).toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${(item.value / labTotal) * 100}%`, backgroundColor: item.color }}></div>
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
                <p className="text-2xl font-bold text-[#06402B]">₹{formatIndianCurrency(totalRevenue)}</p>
              </div>
            </div>
            <div className="space-y-3 mt-4">
              {revenueData.map((item) => (
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
                {recentActivity.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-gray-400">No recent activity</td>
                  </tr>
                ) : (
                  recentActivity.map((activity, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/30">
                      <td className="px-5 py-3 font-medium text-gray-800">{activity.activity}</td>
                      <td className="px-5 py-3 text-gray-500">{activity.details}</td>
                      <td className="px-5 py-3 text-gray-600">{activity.by}</td>
                      <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{activity.dateTime}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}