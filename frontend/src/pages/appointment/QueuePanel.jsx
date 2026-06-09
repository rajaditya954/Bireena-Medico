import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../../services/appointmentApi';
import { connectSocket, joinDoctorQueue, onQueueUpdated } from '../../services/appointmentSocket';
import toast from 'react-hot-toast';
import {
  PlayCircle,
  CheckCircle,
  XCircle,
  UserPlus,
  Clock,
  Users,
  Timer,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

export default function QueuePanel({ doctorId, date, onStatusChange }) {
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState({ waiting: 0, inProgress: 0, completed: 0, estimatedWaitMinutes: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchQueueData = useCallback(async (isAuto = false) => {
    if (!doctorId) return;
    try {
      if (!isAuto) setRefreshing(true);
      const [queueRes, statsRes] = await Promise.all([
        api.getQueue(doctorId, date),
        api.getQueueStats(doctorId, date)
      ]);
      setQueue(queueRes.data?.data || []);
      setStats(statsRes.data?.data || { waiting: 0, inProgress: 0, completed: 0, estimatedWaitMinutes: 0 });
    } catch (err) {
      console.error('Queue fetch error:', err);
      if (!isAuto) toast.error('Failed to sync queue data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [doctorId, date]);

  useEffect(() => {
    if (!doctorId) return;
    fetchQueueData();
    connectSocket();
    joinDoctorQueue(doctorId);
    const unsubscribe = onQueueUpdated(() => {
      fetchQueueData(true);
      toast('Live Update: Queue changed', { icon: '🔄', duration: 3000 });
      if (onStatusChange) onStatusChange();
    });
    const pollInterval = setInterval(() => fetchQueueData(true), 30000);
    return () => {
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, [doctorId, date, fetchQueueData, onStatusChange]);

  const handleStatusChange = async (id, action) => {
    try {
      setRefreshing(true);
      if (action === 'start') { await api.startAppointment(id); toast.success('Patient called in'); }
      if (action === 'complete') { await api.completeAppointment(id); toast.success('Appointment completed ✅'); }
      if (action === 'cancel') { await api.cancelAppointment(id); toast.success('Appointment cancelled'); }
      if (onStatusChange) onStatusChange(action);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      await fetchQueueData();
      setRefreshing(false);
    }
  };

  if (!doctorId || doctorId === 'all') {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 bg-white rounded-xl border border-dashed border-gray-300">
        <Users className="w-12 h-12 text-gray-300" />
        <h3 className="text-lg font-bold text-gray-700">Select a Doctor</h3>
        <p className="text-gray-500 text-sm">Please select a specific doctor from the filter dropdown above to view their live queue.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="w-10 h-10 text-[#0F5C3A] animate-spin" />
        <p className="text-gray-500 font-medium">Syncing Live Queue...</p>
      </div>
    );
  }

  const currentPatient = (queue || []).find(p => p.status === 'in-progress');
  const waitingPatients = (queue || []).filter(p => p.status === 'waiting' || p.status === 'scheduled');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A3E2A] flex items-center gap-2">
            Live Queue Dashboard
            {refreshing && <Loader2 className="w-5 h-5 text-[#0F5C3A] animate-spin" />}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-gray-500 text-sm">Real-time patient flow management</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => fetchQueueData()} disabled={refreshing} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm text-sm font-bold text-gray-600" title="Force Refresh">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> REFRESH
          </button>
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-100">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="font-bold text-xs tracking-tight uppercase">Live</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="apt-card p-5 border-l-4 border-l-amber-400">
          <div className="flex items-center justify-between"><span className="text-gray-500 text-sm font-bold uppercase tracking-wider">Waiting</span><Users className="w-5 h-5 text-amber-400" /></div>
          <div className="mt-2 flex items-baseline gap-2"><span className="text-3xl font-black text-gray-800">{stats.waiting}</span><span className="text-gray-400 text-xs font-medium">Patients</span></div>
        </div>
        <div className="apt-card p-5 border-l-4 border-l-[#0F5C3A]">
          <div className="flex items-center justify-between"><span className="text-gray-500 text-sm font-bold uppercase tracking-wider">Active</span><PlayCircle className="w-5 h-5 text-[#0F5C3A]" /></div>
          <div className="mt-2 flex items-baseline gap-2"><span className="text-3xl font-black text-gray-800">{stats.inProgress}</span><span className="text-gray-400 text-xs font-medium">Serving</span></div>
        </div>
        <div className="apt-card p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between"><span className="text-gray-500 text-sm font-bold uppercase tracking-wider">Finished</span><CheckCircle className="w-5 h-5 text-emerald-500" /></div>
          <div className="mt-2 flex items-baseline gap-2"><span className="text-3xl font-black text-gray-800">{stats.completed}</span><span className="text-gray-400 text-xs font-medium">Today</span></div>
        </div>
        <div className="apt-card p-5 border-l-4 border-l-[#06402B]">
          <div className="flex items-center justify-between"><span className="text-gray-500 text-sm font-bold uppercase tracking-wider">Est. Wait</span><Timer className="w-5 h-5 text-[#06402B]" /></div>
          <div className="mt-2 flex items-baseline gap-2"><span className="text-3xl font-black text-gray-800">{stats.estimatedWaitMinutes}</span><span className="text-gray-400 text-xs font-medium">Mins Left</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div style={{ background: 'rgba(236, 253, 245, 0.3)', border: '1px solid #0F5C3A', borderRadius: '0.75rem', overflow: 'visible' }}>
            <div style={{ backgroundColor: '#0F5C3A' }} className="px-6 py-3 text-white flex items-center justify-between rounded-t-xl">
              <span className="font-black text-sm uppercase tracking-widest flex items-center gap-2"><RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Current Appointment</span>
              {currentPatient && <span className="text-[10px] font-black bg-white/20 px-2 py-1 rounded-full uppercase tracking-tighter">In Progress</span>}
            </div>
            <div className="p-8">
              {currentPatient ? (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-[#0F5C3A] text-white rounded-3xl flex items-center justify-center text-3xl font-black shadow-xl shadow-emerald-600/20 transform -rotate-3 hover:rotate-0 transition-transform">{currentPatient.tokenNumber}</div>
                    <div>
                      <h3 className="text-2xl font-black text-gray-800 tracking-tight">{currentPatient.patientName}</h3>
                      <p className="text-gray-500 font-medium flex items-center gap-2 mt-1">
                        <span className="apt-badge apt-badge-in-progress uppercase">{currentPatient.type}</span>
                        <span className="text-sm">at <span className="font-bold text-[#0F5C3A]">{currentPatient.scheduledTime || format(new Date(currentPatient.createdAt), 'HH:mm')}</span></span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button disabled={refreshing} onClick={() => handleStatusChange(currentPatient._id, 'complete')} className="apt-btn-primary h-14 px-8 shadow-lg shadow-emerald-600/20">
                      <CheckCircle className="w-5 h-5" /> COMPLETE CASE
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-white shadow-inner flex items-center justify-center"><Users className="w-10 h-10 text-gray-200" /></div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-gray-800">No Active Patient</h3>
                    <p className="text-gray-400 max-w-xs mx-auto">The doctor is currently available. Call the next patient from the waiting list.</p>
                  </div>
                  <button disabled={waitingPatients.length === 0 || refreshing} onClick={() => handleStatusChange(waitingPatients[0]._id, 'start')} className="apt-btn-accent h-14 px-10 shadow-lg shadow-emerald-800/20">
                    <UserPlus className="w-6 h-6" /> CALL NEXT PATIENT
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">Waiting List <span className="bg-[#0F5C3A] text-white text-[10px] px-2 py-0.5 rounded-full">{waitingPatients.length}</span></h3>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Sorted by Priority & Time</span>
            </div>
            <div className="space-y-3">
              {waitingPatients.length > 0 ? waitingPatients.map((p) => (
                <div key={p._id} className={`apt-card p-5 flex items-center justify-between transition-all hover:border-[#0F5C3A]/50 group ${p.priority === 'emergency' ? 'border-red-300 bg-red-50/50' : 'bg-white'}`}>
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${p.priority === 'emergency' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-gray-100 text-gray-800'}`}>{p.tokenNumber}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-gray-800 tracking-tight">{p.patientName}</span>
                        {p.priority === 'emergency' && <span className="apt-badge apt-badge-emergency">EMERGENCY</span>}
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400">
                        <span className="flex items-center gap-1.5 uppercase tracking-tighter"><Clock className="w-3 h-3" />{p.type === 'walk-in' ? 'Walk-in' : `Scheduled ${p.scheduledTime}`}</span>
                        <span className="text-[#0F5C3A] uppercase tracking-tighter">• {p.doctorName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                    <button onClick={() => handleStatusChange(p._id, 'start')} disabled={refreshing} className="px-4 py-2.5 bg-[#0F5C3A] text-white rounded-xl hover:bg-[#0A3E2A] transition-colors shadow-md shadow-emerald-600/20 flex items-center gap-2 text-xs font-bold" title="Call Patient"><PlayCircle className="w-4 h-4" />Call</button>
                    <button onClick={() => handleStatusChange(p._id, 'cancel')} disabled={refreshing} className="px-4 py-2.5 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors flex items-center gap-2 text-xs font-bold" title="Cancel Appointment"><XCircle className="w-4 h-4" />Cancel</button>
                  </div>
                </div>
              )) : (
                <div className="apt-card p-16 text-center text-gray-400 border-dashed border-2 flex flex-col items-center gap-3 bg-gray-50/30">
                  <Users className="w-12 h-12 opacity-10" />
                  <p className="font-bold uppercase tracking-widest text-xs opacity-40">No patients waiting</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="apt-summary-dark">
            <h3 className="font-black text-sm uppercase tracking-widest mb-6 text-white" style={{ opacity: 0.6 }}>Status Summary</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4"><span className="text-xs font-bold uppercase tracking-tighter text-white" style={{ opacity: 0.6 }}>Avg. Consultation</span><span className="font-black text-lg text-white">12 Mins</span></div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4"><span className="text-xs font-bold uppercase tracking-tighter text-white" style={{ opacity: 0.6 }}>Total Appointments</span><span className="font-black text-lg text-white">{stats.total || 0}</span></div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4"><span className="text-xs font-bold uppercase tracking-tighter text-white" style={{ opacity: 0.6 }}>Completed Cases</span><span className="font-black text-lg text-white">{stats.completed}</span></div>
              <div className="flex items-center justify-between pt-2"><span className="text-xs font-bold uppercase tracking-tighter text-white" style={{ opacity: 0.6 }}>Sync Frequency</span><span className="text-[10px] font-black px-2 py-1 rounded-full text-white" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>REAL-TIME</span></div>
            </div>
            <div className="pt-4"><p className="text-[10px] text-white/40 text-center font-medium uppercase tracking-widest">Data automatically syncs every 30s</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
