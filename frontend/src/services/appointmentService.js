import { api } from "../lib/api";

const getLocalAppointments = () => JSON.parse(localStorage.getItem("medico_appointments") || "[]");
const saveLocalAppointments = (apps) => localStorage.setItem("medico_appointments", JSON.stringify(apps));

export const appointmentService = {
  getAll: async (patientId) => {
    try {
      const res = await api.getAppointments({ patient: patientId });
      return res.data?.appointments || res.data || res || [];
    } catch (err) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const apps = getLocalAppointments();
      if (patientId) {
        return apps.filter(a => a.patientId === patientId || a.patient === patientId);
      }
      return apps;
    }
  },
  
  create: async (data) => {
    try {
      const res = await api.createAppointment(data);
      return res.data?.appointment || res.data || res;
    } catch (err) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const apps = getLocalAppointments();
      
      // Check for double booking locally
      const isConflict = apps.some(a => 
        a.doctorId === data.doctorId && 
        a.startTime === data.startTime && 
        a.status !== 'cancelled'
      );
      
      if (isConflict) {
        throw new Error("This time slot is already booked for the selected doctor.");
      }
      
      const newApp = { 
        ...data, 
        id: String(Date.now()),
        status: 'scheduled',
        createdAt: new Date().toISOString()
      };
      apps.push(newApp);
      saveLocalAppointments(apps);
      return newApp;
    }
  },
  
  updateStatus: async (id, status) => {
    try {
      const res = await api.updateAppointment(id, { status });
      return res.data?.appointment || res.data || res;
    } catch (err) {
      const apps = getLocalAppointments();
      const index = apps.findIndex(a => a.id === id);
      if (index !== -1) {
        apps[index].status = status;
        saveLocalAppointments(apps);
        return apps[index];
      }
      return null;
    }
  },

  delete: async (id) => {
    try {
      const res = await api.deleteAppointment(id);
      return res;
    } catch (err) {
      const apps = getLocalAppointments();
      const filtered = apps.filter(a => a.id !== id);
      saveLocalAppointments(filtered);
      return { success: true };
    }
  }
};
