import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// ─── Appointments ──────────────────────────────────────────
export const createAppointment = (data) => API.post('/appointments', data);
export const getTodayAppointments = (doctorId) => API.get('/appointments', { params: { doctorId } });
export const cancelAppointment = (id) => API.put(`/appointments/${id}/cancel`);
export const startAppointment = (id) => API.put(`/appointments/${id}/start`);
export const completeAppointment = (id) => API.put(`/appointments/${id}/complete`);
export const skipAppointment = (id) => API.put(`/appointments/${id}/skip`);

// ─── Slots ────────────────────────────────────────────────
export const getAvailableSlots = (doctorId, date) => API.get('/slots/available', { params: { doctorId, date } });
export const generateSlots = (data) => API.post('/slots/generate', data);

// ─── Queue ────────────────────────────────────────────────
export const getQueue = (doctorId, date) => API.get(`/queue/${doctorId}`, { params: { date } });
export const getQueueStats = (doctorId, date) => API.get(`/queue/${doctorId}/stats`, { params: { date } });

// ─── Availability ─────────────────────────────────────────
export const getAvailability = (doctorId) => API.get(`/availability/${doctorId}`);

// ─── Patients ─────────────────────────────────────────────
export const searchPatients = (keyword) => API.get('/patients', { params: { search: keyword } });
export const createPatient = (data) => API.post('/patients', data);

// ─── Doctors ──────────────────────────────────────────────
export const getDoctors = () => API.get('/doctors');

export default API;
