import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem("aarogya_token");
    if (!token) {
      const session = localStorage.getItem("medico_session");
      if (session) {
        try {
          const userData = JSON.parse(session);
          let email = "";
          let password = "";
          const role = userData.role;

          if (role === "ADMIN") {
            email = "admin@hospital.com";
            password = "Admin@123";
          } else if (role === "DOCTOR") {
            email = "doctor@hospital.com";
            password = "Doctor@123";
          } else if (role === "LAB") {
            email = "lab@hospital.com";
            password = "Lab@1234";
          } else if (role === "APPOINTMENT") {
            email = "scheduler@hospital.com";
            password = "Schedule@123";
          } else if (role === "CLINIC") {
            email = "dispensary@hospital.com";
            password = "Dispense@123";
          }

          if (email && password) {
            // Import axios dynamically to avoid circular dependency
            const axiosLib = (await import('axios')).default;
            const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await axiosLib.post(`${baseURL}/auth/login`, { email, password });
            token = response.data.data.token;
            localStorage.setItem("aarogya_token", token);
          }
        } catch (err) {
          console.error("Silent login in interceptor failed", err);
        }
      }
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Appointments ──────────────────────────────────────────
export const createAppointment = (data) => API.post('/appointments', data);
export const getTodayAppointments = (doctorId, date) => API.get('/appointments', { params: { doctorId, date } });
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
export const updatePatient = (id, data) => API.put(`/patients/${id}`, data);

// ─── Doctors ──────────────────────────────────────────────
export const getDoctors = () => API.get('/doctors');

export default API;
