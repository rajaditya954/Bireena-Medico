import { useSyncExternalStore, useCallback } from "react";
import { labApi } from "../services/labService.js";

let state = [];
let loading = false;
const listeners = new Set();

function emit() {
  listeners.forEach((l) => l());
}

export const reportsStore = {
  get: () => state,
  subscribe: (l) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  async fetchAll(filters = {}) {
    if (loading) return state;
    loading = true;
    try {
      state = await labApi.getReports(filters);
    } catch (e) {
      console.error("Failed to fetch reports:", e);
    } finally {
      loading = false;
      emit();
    }
    return state;
  },
  async fetchById(id) {
    return await labApi.getReportById(id);
  },
  async create(formData) {
    const report = await labApi.createReport(formData);
    state = [report, ...state];
    emit();
    return report;
  },
  async updateStatus(id, status, notes) {
    const report = await labApi.updateReportStatus(id, status, notes);
    state = state.map((r) => (r._raw?._id === id ? report : r));
    emit();
    return report;
  },
  async approve(id) {
    const report = await labApi.approveReport(id);
    state = state.map((r) => (r._raw?._id === id ? report : r));
    emit();
    return report;
  },
  async update(id, formData) {
    const report = await labApi.updateReport(id, formData);
    state = state.map((r) => (r._raw?._id === id ? report : r));
    emit();
    return report;
  },
  async remove(id) {
    await labApi.deleteReport(id);
    state = state.filter((r) => r._raw?._id !== id);
    emit();
  },
};

export function useReports() {
  const subscribe = useCallback((l) => reportsStore.subscribe(l), []);
  return useSyncExternalStore(subscribe, reportsStore.get, reportsStore.get);
}
