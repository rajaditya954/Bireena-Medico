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
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – extract error message
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
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

  // ==================== PAYMENTS (with Razorpay) ====================
  createRazorpayOrder: (data) => axiosInstance.post("/payments/order", data),
  createPayment: (data) => axiosInstance.post("/payments", data),
  verifyPayment: (paymentId, data) => axiosInstance.post(`/payments/${paymentId}/verify`, data),
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