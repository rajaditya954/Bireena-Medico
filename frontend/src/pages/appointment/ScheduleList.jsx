import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../../services/appointmentApi';
import toast from 'react-hot-toast';
import { Calendar, Clock, Users, CheckCircle, XCircle, Search, MoreVertical, Filter, RefreshCw, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function ScheduleList({ doctorId }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const res = await api.getDoctors();
        const docs = res.data?.data || [];
        setDoctors(docs);
        const initial = docs.find(d => d.id === doctorId) || docs[0];
        setSelectedDoctor(initial);
      } catch (err) { toast.error('Failed to load doctors'); }
      finally { setLoadingDoctors(false); }
    };
    fetchDoctors();
  }, [doctorId]);

  const fetchAppointments = useCallback(async (isSilent = false) => {
    if (!selectedDoctor?.id) return;
    try {
      if (!isSilent) setRefreshing(true);
      const res = await api.getTodayAppointments(selectedDoctor.id);
      setAppointments(res.data?.data || []);
    } catch (err) {
      console.error('Schedule fetch error:', err);
      if (!isSilent) toast.error('Failed to load schedule');
    } finally { setLoading(false); setRefreshing(false); }
  }, [selectedDoctor?.id]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'waiting': return <span className="apt-badge apt-badge-waiting">Waiting</span>;
      case 'in-progress': return <span className="apt-badge apt-badge-in-progress">In-Progress</span>;
      case 'completed': return <span className="apt-badge apt-badge-completed">Completed</span>;
      case 'cancelled': return <span className="apt-badge apt-badge-cancelled">Cancelled</span>;
      default: return <span className="apt-badge apt-badge-upcoming">{status}</span>;
    }
  };

  const filtered = appointments.filter(a => {
    const matchesSearch = a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || a.tokenNumber.toString() === searchTerm;
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="apt-card p-6 animate-pulse flex items-center justify-between">
            <div className="flex items-center gap-4"><div className="w-12 h-12 bg-gray-100 rounded-xl"></div><div className="space-y-2"><div className="h-4 bg-gray-100 rounded w-32"></div><div className="h-3 bg-gray-100 rounded w-20"></div></div></div>
            <div className="h-4 bg-gray-100 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#0A3E2A] tracking-tight flex items-center gap-2">
            Today's Schedule
            {refreshing && <Loader2 className="w-5 h-5 text-[#0F5C3A] animate-spin" />}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-gray-500 text-sm">Schedule for</span>
            {loadingDoctors ? <Loader2 className="w-4 h-4 animate-spin text-[#0F5C3A]" /> : (
              <select className="bg-transparent border-none p-0 text-sm font-bold text-[#0F5C3A] focus:ring-0 cursor-pointer" value={selectedDoctor?.id || ''} onChange={(e) => { const doc = doctors.find(d => d.id === e.target.value); setSelectedDoctor(doc); }}>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
              </select>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
            <input type="text" placeholder="Search by name or token..." className="apt-input py-2 text-sm" style={{ paddingLeft: '2.5rem' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select className="apt-input py-2 text-sm w-auto bg-gray-50 font-bold text-gray-600" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option><option value="waiting">Waiting</option><option value="in-progress">In-Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
          </select>
          <button onClick={() => fetchAppointments()} disabled={refreshing} className="apt-btn-secondary py-2"><RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />Refresh</button>
        </div>
      </div>

      <div className="apt-card overflow-hidden shadow-xl border-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Token</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Patient / Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time / Type</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Priority</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length > 0 ? filtered.map((a) => (
                <tr key={a._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4"><span className="w-10 h-10 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center font-black group-hover:bg-[#0F5C3A] group-hover:text-white transition-all">{a.tokenNumber}</span></td>
                  <td className="px-6 py-4"><div className="flex flex-col"><span className="font-black text-gray-800 tracking-tight">{a.patientName}</span><span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{a.patientPhone}</span></div></td>
                  <td className="px-6 py-4"><div className="flex flex-col"><span className="flex items-center gap-1.5 font-bold text-gray-700"><Clock className="w-3.5 h-3.5 text-[#0F5C3A]" />{a.type === 'walk-in' ? 'Walk-in' : a.scheduledTime}</span><span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{a.type}</span></div></td>
                  <td className="px-6 py-4">{a.priority === 'emergency' ? <span className="text-red-600 font-black text-xs flex items-center gap-1.5 uppercase tracking-tighter"><span className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-lg shadow-red-200"></span>Emergency</span> : <span className="text-gray-400 text-xs font-bold uppercase tracking-tighter">Normal</span>}</td>
                  <td className="px-6 py-4">{getStatusBadge(a.status)}</td>
                  <td className="px-6 py-4"><button className="p-2 text-gray-300 hover:text-[#0F5C3A] hover:bg-emerald-50 rounded-xl transition-all"><MoreVertical className="w-5 h-5" /></button></td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="px-6 py-20 text-center text-gray-400"><div className="flex flex-col items-center gap-3 opacity-30"><Users className="w-12 h-12" /><p className="font-black text-xs uppercase tracking-widest">No matching appointments</p></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Showing <span className="text-gray-800">{filtered.length}</span> / {appointments.length} Appointments</p>
        <div className="flex gap-2">
          <button className="apt-btn-secondary py-1 text-[10px] px-4 font-black uppercase tracking-widest opacity-50 cursor-not-allowed">Prev</button>
          <button className="apt-btn-secondary py-1 text-[10px] px-4 font-black uppercase tracking-widest opacity-50 cursor-not-allowed">Next</button>
        </div>
      </div>
    </div>
  );
}
