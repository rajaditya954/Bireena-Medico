import { reportsStore } from "./reports-store.js";
import { testsStore } from "./tests-store.js";
// Backend API client. Configure VITE_API_URL in .env (default http://localhost:5001/api)
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const TOKEN_KEY = "aarogya_token";
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

export const api = {
  // Auth
  register: (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data) => request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  me: () => request("/auth/me"),

  // Patients
  listPatients: () => request("/patients"),
  // Appointments
  listAppointments: (patientId) =>
    request(`/appointments${patientId ? `?patient=${patientId}` : ""}`),
  // Services
  listServices: () => request("/services"),
  // Bills
  listBills: () => request("/bills"),
  getBill: (id) => request(`/bills/${id}`),
  createBill: (data) => request("/bills", { method: "POST", body: JSON.stringify(data) }),
  deleteBill: (id) => request(`/bills/${id}`, { method: "DELETE" }),
  payBill: (id, data) => request(`/bills/${id}/payments`, { method: "POST", body: JSON.stringify(data) }),

  // Reports
  reportSummary: (from, to) =>
    request(`/reports/summary${from || to ? `?from=${from || ""}&to=${to || ""}` : ""}`),
};
// Simulate API delays for realistic UX
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
  const tests = testsStore.get();
  return tests.find((t) => t.id === id);
}

export async function deleteTest(id) {
  await delay(400);
  testsStore.remove(id);
  return undefined;
}

export async function uploadReportRecord(payload) {
  // Simulate file upload progress
  return new Promise((resolve, reject) => {
    const progressInterval = setInterval(() => {
      const progress = Math.floor(Math.random() * 100);
      payload.onProgress?.(Math.min(progress, 90));
    }, 300);

    setTimeout(() => {
      clearInterval(progressInterval);
      payload.onProgress?.(100);

      // Simulate file uploads by creating local attachment records
      const attachments = payload.files.map((file) => ({
        originalName: file.name,
        filename: `${Date.now()}_${file.name}`,
        mimetype: file.type,
        size: file.size,
        path: `/uploads/${Date.now()}_${file.name}`,
        uploadedAt: new Date().toISOString(),
      }));

      // Update report with new status, notes, and attachments
      reportsStore.update(payload.recordId, {
        status: payload.status,
        notes: payload.notes || "",
        reportDate: payload.status === "Completed" ? new Date().toISOString().split("T")[0] : "—",
      });

      attachments.forEach((attachment) => {
        reportsStore.addAttachment(payload.recordId, attachment);
      });

      const reports = reportsStore.get();
      const updated = reports.find((r) => r.id === payload.recordId);
      resolve(updated);
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
  const reports = reportsStore.get();
  return reports.find((r) => r.id === id);
}
