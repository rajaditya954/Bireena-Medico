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
    if (!doctorId || doctorId === 'all') return;
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
    if (!doctorId || doctorId === 'all') {
      setLoading(false);
      return;
    }
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
      {/* Top Bar / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#0A3E2A] flex items-center gap-2.5">
            Live Queue Dashboard
            {refreshing && <Loader2 className="w-5 h-5 text-[#0F5C3A] animate-spin" />}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-gray-500 text-sm font-medium">Real-time patient flow management</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchQueueData()} 
            disabled={refreshing} 
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-[#0F5C3A] hover:bg-gray-50 transition-all shadow-sm text-xs font-black text-gray-600 tracking-wider" 
            title="Force Sync"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> REFRESH
          </button>
          <div className="flex items-center gap-2 bg-emerald-50 text-[#0F5C3A] px-4 py-2.5 rounded-full border border-emerald-100">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="font-extrabold text-[10px] tracking-wider uppercase">Live Sync</span>
          </div>
        </div>
      </div>

      {/* Top 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {/* Waiting Card */}
        <div className="apt-card p-6 border border-amber-100 bg-gradient-to-br from-amber-50/40 to-white relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-amber-100/30 rounded-full blur-2xl -mr-5 -mt-5 transition-transform duration-500 group-hover:scale-125"></div>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-amber-800 text-xs font-extrabold uppercase tracking-wider">Waiting</span>
            <div className="p-2 bg-amber-100/60 rounded-xl text-amber-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-1.5 relative z-10">
            <span className="text-4xl font-extrabold text-amber-950 tracking-tight">{stats.waiting}</span>
            <span className="text-amber-700/60 text-xs font-bold uppercase tracking-widest">Patients</span>
          </div>
        </div>

        {/* Active Card */}
        <div className="apt-card p-6 border border-[#0F5C3A]/10 bg-gradient-to-br from-[#0F5C3A]/5 to-white relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-[#0F5C3A]/10 rounded-full blur-2xl -mr-5 -mt-5 transition-transform duration-500 group-hover:scale-125"></div>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[#0F5C3A] text-xs font-extrabold uppercase tracking-wider">Active</span>
            <div className="p-2 bg-[#0F5C3A]/10 rounded-xl text-[#0F5C3A]">
              <PlayCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-1.5 relative z-10">
            <span className="text-4xl font-extrabold text-gray-900 tracking-tight">{stats.inProgress}</span>
            <span className="text-[#0F5C3A]/60 text-xs font-bold uppercase tracking-widest">Serving</span>
          </div>
        </div>

        {/* Finished Card */}
        <div className="apt-card p-6 border border-emerald-100 bg-gradient-to-br from-emerald-50/40 to-white relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-100/30 rounded-full blur-2xl -mr-5 -mt-5 transition-transform duration-500 group-hover:scale-125"></div>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-emerald-800 text-xs font-extrabold uppercase tracking-wider">Finished</span>
            <div className="p-2 bg-emerald-100/60 rounded-xl text-emerald-600">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-1.5 relative z-10">
            <span className="text-4xl font-extrabold text-emerald-950 tracking-tight">{stats.completed}</span>
            <span className="text-emerald-700/60 text-xs font-bold uppercase tracking-widest">Today</span>
          </div>
        </div>

        {/* Est. Wait Card */}
        <div className="apt-card p-6 border border-emerald-100 bg-gradient-to-br from-[#06402B]/5 to-white relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-[#06402B]/10 rounded-full blur-2xl -mr-5 -mt-5 transition-transform duration-500 group-hover:scale-125"></div>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[#06402B] text-xs font-extrabold uppercase tracking-wider">Est. Wait</span>
            <div className="p-2 bg-[#06402B]/10 rounded-xl text-[#06402B]">
              <Timer className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-1.5 relative z-10">
            <span className="text-4xl font-extrabold text-gray-900 tracking-tight">{stats.estimatedWaitMinutes}</span>
            <span className="text-[#06402B]/60 text-xs font-bold uppercase tracking-widest">Mins Left</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Panel + Waiting List on Left (col-span-8), Status Summary on Right (col-span-4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* Current Active Appointment Card */}
          <div className="border border-[#0F5C3A]/15 bg-gradient-to-b from-[#ECFDF5]/50 to-white rounded-2xl shadow-xs overflow-hidden">
            <div className="bg-[#0F5C3A] px-6 py-4 text-white flex items-center justify-between">
              <span className="font-extrabold text-xs tracking-wider uppercase flex items-center gap-2">
                <Clock className="w-4 h-4 opacity-80" /> Current Appointment
              </span>
              {currentPatient && (
                <span className="text-[9px] font-black bg-white/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  In Progress
                </span>
              )}
            </div>
            
            <div className="p-6 md:p-8">
              {currentPatient ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-5 min-w-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-[#0A3E2A] to-[#0F5C3A] text-white rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black shadow-lg shadow-emerald-900/10 shrink-0 select-none">
                      {currentPatient.tokenNumber}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xl sm:text-2xl font-black text-gray-800 tracking-tight truncate">
                        {currentPatient.patientName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2.5 mt-1.5">
                        <span className="apt-badge apt-badge-in-progress text-[10px] tracking-wider py-0.5 px-2">
                          {currentPatient.type}
                        </span>
                        <span className="text-gray-500 text-xs font-medium">
                          Serving since <span className="font-black text-[#0F5C3A]">{currentPatient.scheduledTime || format(new Date(currentPatient.createdAt), 'HH:mm')}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <button 
                      disabled={refreshing} 
                      onClick={() => handleStatusChange(currentPatient.appointmentId, 'complete')} 
                      className="apt-btn-primary h-12 px-6 shadow-md shadow-emerald-950/15 whitespace-nowrap uppercase tracking-wider text-xs font-extrabold"
                    >
                      <CheckCircle className="w-4 h-4" /> Complete Case
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#0F5C3A] flex items-center justify-center">
                    <Users className="w-7 h-7 opacity-80" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-gray-800 tracking-tight">No Active Patient</h3>
                    <p className="text-gray-400 text-xs max-w-xs mx-auto font-medium">
                      The doctor is currently available. Call the next patient from the waiting list.
                    </p>
                  </div>
                  <button 
                    disabled={waitingPatients.length === 0 || refreshing} 
                    onClick={() => handleStatusChange(waitingPatients[0].appointmentId, 'start')} 
                    className="apt-btn-accent h-12 px-8 shadow-md shadow-emerald-800/15 uppercase tracking-wider text-xs font-extrabold"
                  >
                    <UserPlus className="w-4.5 h-4.5" /> Call Next Patient
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Waiting List Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-800 uppercase tracking-wider flex items-center gap-2.5">
                Waiting Queue 
                <span className="bg-[#0F5C3A] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {waitingPatients.length}
                </span>
              </h3>
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                Sorted by Priority & Time
              </span>
            </div>
            
            <div className="space-y-3">
              {waitingPatients.length > 0 ? (
                waitingPatients.map((p) => {
                  const isEmergency = p.priority === 'emergency';
                  return (
                    <div 
                      key={p._id} 
                      className={`apt-card p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 group ${
                        isEmergency 
                          ? 'border-red-200 bg-gradient-to-r from-red-50/60 to-white hover:border-red-400' 
                          : 'bg-white hover:border-[#0F5C3A]/30'
                      }`}
                    >
                      <div className="flex items-center gap-4.5">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg select-none shrink-0 ${
                          isEmergency 
                            ? 'bg-red-600 text-white shadow-md shadow-red-200' 
                            : 'bg-gray-50 text-gray-700 border border-gray-100'
                        }`}>
                          {p.tokenNumber}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="font-extrabold text-gray-850 tracking-tight text-sm">
                              {p.patientName}
                            </span>
                            {isEmergency && (
                              <span className="apt-badge apt-badge-emergency text-[8px] py-0 px-2 tracking-wider">
                                EMERGENCY
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            <span className="flex items-center gap-1.5 font-extrabold text-gray-500">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              {p.type === 'walk-in' ? 'Walk-in' : `Slot: ${p.scheduledTime}`}
                            </span>
                            <span className="text-[#0F5C3A]/70 font-extrabold">
                              • {p.doctorName}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons: Visible always on mobile/tablet, fade-in on desktop hover */}
                      <div className="flex items-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 md:translate-x-2 md:group-hover:translate-x-0">
                        <button 
                          onClick={() => handleStatusChange(p.appointmentId, 'start')} 
                          disabled={refreshing} 
                          className="flex-1 sm:flex-initial px-4 py-2 bg-[#0F5C3A] text-white rounded-lg hover:bg-[#0A3E2A] transition-all shadow-xs flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider" 
                          title="Call Patient"
                        >
                          <PlayCircle className="w-3.5 h-3.5" /> Call
                        </button>
                        <button 
                          onClick={() => handleStatusChange(p.appointmentId, 'cancel')} 
                          disabled={refreshing} 
                          className="flex-1 sm:flex-initial px-4 py-2 bg-red-50 text-red-650 rounded-lg hover:bg-red-100 hover:text-red-700 transition-all flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider" 
                          title="Cancel"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Cancel
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="apt-card p-14 text-center text-gray-400 border-dashed border-2 flex flex-col items-center justify-center gap-3 bg-gray-50/20">
                  <Users className="w-10 h-10 opacity-20" />
                  <p className="font-extrabold uppercase tracking-widest text-[10px] opacity-60">No Patients in Waiting Queue</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Status Summary Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="apt-summary-dark bg-gradient-to-b from-[#0A3E2A] to-[#06291C] border border-[#0F5C3A]/20 relative overflow-hidden">
            {/* Absolute background decoration element */}
            <div className="absolute right-0 bottom-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mb-10"></div>
            
            <h3 className="font-black text-xs uppercase tracking-widest mb-6 text-emerald-100 flex items-center gap-2 relative z-10">
              <PlayCircle className="w-4 h-4 text-emerald-400" /> Status Summary
            </h3>
            
            <div className="space-y-5 relative z-10">
              <div className="flex items-center justify-between border-b border-white/5 pb-3.5 gap-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200/70 whitespace-nowrap">
                  Avg. Consultation
                </span>
                <span className="font-black text-base text-white whitespace-nowrap">
                  12 Mins
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-3.5 gap-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200/70 whitespace-nowrap">
                  Total Appointments
                </span>
                <span className="font-black text-base text-white whitespace-nowrap">
                  {stats.total || 0}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-3.5 gap-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200/70 whitespace-nowrap">
                  Completed Cases
                </span>
                <span className="font-black text-base text-white whitespace-nowrap">
                  {stats.completed}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 gap-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200/70 whitespace-nowrap">
                  Sync Frequency
                </span>
                <span className="text-[9px] font-extrabold px-2.5 py-1 rounded-full text-emerald-100 whitespace-nowrap bg-white/10 uppercase tracking-widest">
                  REAL-TIME
                </span>
              </div>
            </div>
            
            <div className="pt-6 relative z-10">
              <p className="text-[9px] text-emerald-300/40 text-center font-extrabold uppercase tracking-widest">
                Data automatically syncs every 30s
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
