// frontend/src/lib/api.js

import axios from "axios";
import { reportsStore } from "./reports-store.js";
import { testsStore } from "./tests-store.js";


// ─────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const TOKEN_KEY = "aarogya_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

// ─────────────────────────────────────────────────────────────
// Axios Instance
// ─────────────────────────────────────────────────────────────

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor – attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – handle 401 and extract error message
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401, the token is invalid/expired – clear it and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("medico_session");
      window.location.href = "/login";
    }
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Network Error";
    return Promise.reject(new Error(message));
  }
);

// ─────────────────────────────────────────────────────────────
// API Methods
// ─────────────────────────────────────────────────────────────

export const api = {
  // ==================== AUTH ====================
  login: (data) => axiosInstance.post("/auth/login", data),
  register: (data) => axiosInstance.post("/auth/register", data),
  logout: () => axiosInstance.post("/auth/logout"),
  me: () => axiosInstance.get("/auth/me"),

  // ==================== PATIENTS ====================
  getPatients: (params) => axiosInstance.get("/patients", { params }),
  getPatientById: (id) => axiosInstance.get(`/patients/${id}`),
  createPatient: (data) => axiosInstance.post("/patients", data),
  updatePatient: (id, data) => axiosInstance.put(`/patients/${id}`, data),
  deletePatient: (id) => axiosInstance.delete(`/patients/${id}`),

  // ==================== APPOINTMENTS ====================
  getAppointments: (params) => axiosInstance.get("/appointments", { params }),
  getAppointmentById: (id) => axiosInstance.get(`/appointments/${id}`),
  createAppointment: (data) => axiosInstance.post("/appointments", data),
  updateAppointment: (id, data) => axiosInstance.put(`/appointments/${id}`, data),
  deleteAppointment: (id) => axiosInstance.delete(`/appointments/${id}`),

  // ==================== SERVICES ====================
  listServices: () => axiosInstance.get("/services"),

  // ==================== BILLING (backend route: /billing) ====================
  createBilling: (data) => axiosInstance.post("/billing", data),
  getBillingById: (id) => axiosInstance.get(`/billing/${id}`),
  getPatientBillings: (patientId) => axiosInstance.get(`/billing/patient/${patientId}`),
  updateBillingStatus: (id, status) => axiosInstance.put(`/billing/${id}/status`, { status }),
  generateInvoice: (billingId) => axiosInstance.post(`/billing/${billingId}/invoice`),
  getPendingBills: (patientId) => axiosInstance.get(`/billing/${patientId}/pending`),

  // ==================== INVOICES ====================
  getInvoiceById: (id) => axiosInstance.get(`/invoices/${id}`),

  // ==================== PAYMENTS ====================
  createPayment: (data) => axiosInstance.post("/payments", data),
  getPaymentById: (id) => axiosInstance.get(`/payments/${id}`),
  getPatientPayments: (patientId) => axiosInstance.get(`/payments/patient/${patientId}`),
  refundPayment: (paymentId, data) => axiosInstance.post(`/payments/${paymentId}/refund`, data),
  getPaymentStatistics: (startDate, endDate) =>
    axiosInstance.get(`/payments/statistics?startDate=${startDate}&endDate=${endDate}`),

  // ==================== DOCTORS ====================
  getDoctors: (params) => axiosInstance.get("/doctors", { params }),
  getDoctorById: (id) => axiosInstance.get(`/doctors/${id}`),
  createDoctor: (data) => axiosInstance.post("/doctors", data),
  updateDoctor: (id, data) => axiosInstance.put(`/doctors/${id}`, data),
  getDoctorDashboard: (params) => axiosInstance.get("/doctors/dashboard", { params }),

  // Doctor-specific portal endpoints
  getMyPatients: (params) => axiosInstance.get("/doctors/my-patients", { params }),
  getMyAppointments: (params) => axiosInstance.get("/doctors/my-appointments", { params }),
  getMyHistory: (params) => axiosInstance.get("/doctors/my-history", { params }),
  getMyPrescriptions: (params) => axiosInstance.get("/doctors/my-prescriptions", { params }),
  getMyReports: (params) => axiosInstance.get("/doctors/my-reports", { params }),

  // ==================== LABORATORY ====================
  getLabTests: (params) => axiosInstance.get("/laboratory/tests", { params }),
  createLabTest: (data) => axiosInstance.post("/laboratory/tests", data),
  getLabReports: (params) => axiosInstance.get("/laboratory/reports", { params }),
  uploadLabReport: (data) => axiosInstance.post("/laboratory/reports", data),

  // ==================== PHARMACY ====================
  getMedicines: (params) => axiosInstance.get("/pharmacy/medicines", { params }),
  addMedicine: (data) => axiosInstance.post("/pharmacy/medicines", data),
  dispenseMedicine: (data) => axiosInstance.post("/pharmacy/dispense", data),

  // ==================== NOTIFICATIONS ====================
  getNotifications: () => axiosInstance.get("/notifications"),
  markNotificationRead: (id) => axiosInstance.put(`/notifications/${id}/read`),
  markAllNotificationsRead: () => axiosInstance.put("/notifications/read-all"),

  // ==================== ANALYTICS & REPORTS ====================
  getDashboardStats: (params) => axiosInstance.get("/analytics/dashboard", { params }),
  getRevenueStats: (params) => axiosInstance.get("/analytics/revenue", { params }),
  getReportSummary: (from, to) => axiosInstance.get("/reports/summary", { params: { from, to } }),

  // ==================== LEGACY / MOCK (keep if needed) ====================
  // Bills (legacy – you may remove if not used)
  listBills: () => axiosInstance.get("/bills"),
  getBill: (id) => axiosInstance.get(`/bills/${id}`),
  createBill: (data) => axiosInstance.post("/bills", data),
  deleteBill: (id) => axiosInstance.delete(`/bills/${id}`),
  payBill: (id, data) => axiosInstance.post(`/bills/${id}/payments`, data),

  // ==================== USERS (ADMIN) ====================
  listUsers: (params) => axiosInstance.get("/users", { params }),
  getUser: (id) => axiosInstance.get(`/users/${id}`),
  createUser: (data) => axiosInstance.post("/auth/create-user", data),
  updateUser: (id, data) => axiosInstance.put(`/users/${id}`, data),
  deactivateUser: (id) => axiosInstance.patch(`/users/${id}/deactivate`),
  activateUser: (id) => axiosInstance.patch(`/users/${id}/activate`),
  deleteUser: (id) => axiosInstance.delete(`/users/${id}`),
  changeUserRole: (id, role) => axiosInstance.patch(`/users/${id}/role`, { role }),
  changePassword: (data) => axiosInstance.post("/users/change-password", data),
  changeUserPassword: (id, newPassword) => axiosInstance.post(`/users/${id}/change-password`, { newPassword }),

  // ==================== PRESCRIPTIONS ====================
  listPrescriptionsByPatient: (patientId) => axiosInstance.get(`/prescriptions/patient/${patientId}`),
  createPrescription: (data) => axiosInstance.post("/prescriptions", data),
  updatePrescription: (id, data) => axiosInstance.put(`/prescriptions/${id}`, data),

  // ==================== EXTRA LABORATORY ====================
  listLabTests: () => axiosInstance.get("/laboratory/tests"),
  createLabReport: (data) => axiosInstance.post("/laboratory/reports", data),
  listLabReportsByPatient: (patientId) => axiosInstance.get(`/laboratory/reports/patient/${patientId}`),

  // ==================== EXTRA PHARMACY ====================
  listMedicines: (params) => axiosInstance.get("/pharmacy", { params }),
  getMedicine: (id) => axiosInstance.get(`/pharmacy/${id}`),
  createMedicine: (data) => axiosInstance.post("/pharmacy", data),
  updateMedicine: (id, data) => axiosInstance.put(`/pharmacy/${id}`, data),
  checkStock: () => axiosInstance.get("/pharmacy/stock/check"),
  lowStock: () => axiosInstance.get("/pharmacy/stock/low"),
};

// ─────────────────────────────────────────────────────────────
// MOCK / SIMULATION FUNCTIONS (for lab reports, tests, etc.)
// ─────────────────────────────────────────────────────────────

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchReports() {
  await delay(300);
  return reportsStore.get();
}

export async function fetchPendingReports() {
  await delay(300);
  return reportsStore.get().filter((r) => r.status !== "Completed");
}

export async function fetchTests() {
  await delay(300);
  return testsStore.get();
}

export async function createTest(payload) {
  await delay(400);
  const test = { id: `T-${String(testsStore.get().length + 1).padStart(3, "0")}`, ...payload };
  testsStore.add(payload);
  return test;
}

export async function updateTest(id, payload) {
  await delay(400);
  testsStore.update(id, payload);
  return testsStore.get().find((t) => t.id === id);
}

export async function deleteTest(id) {
  await delay(400);
  testsStore.remove(id);
}

export async function uploadReportRecord(payload) {
  return new Promise((resolve, reject) => {
    const progressInterval = setInterval(() => {
      const progress = Math.floor(Math.random() * 100);
      payload.onProgress?.(Math.min(progress, 90));
    }, 300);

    setTimeout(() => {
      clearInterval(progressInterval);
      payload.onProgress?.(100);

      const attachments = payload.files.map((file) => ({
        originalName: file.name,
        filename: `${Date.now()}_${file.name}`,
        mimetype: file.type,
        size: file.size,
        path: `/uploads/${Date.now()}_${file.name}`,
        uploadedAt: new Date().toISOString(),
      }));

      reportsStore.update(payload.recordId, {
        status: payload.status,
        notes: payload.notes || "",
        reportDate: payload.status === "Completed" ? new Date().toISOString().split("T")[0] : "—",
      });

      attachments.forEach((attachment) => reportsStore.addAttachment(payload.recordId, attachment));
      resolve(reportsStore.get().find((r) => r.id === payload.recordId));
    }, 2000);
  });
}

export async function updateReportStatus(id, status, notes = "") {
  await delay(400);
  reportsStore.update(id, {
    status,
    notes,
    reportDate: status === "Completed" ? new Date().toISOString().split("T")[0] : "—",
  });
  return reportsStore.get().find((r) => r.id === id);
}