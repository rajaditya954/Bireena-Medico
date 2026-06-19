import { useSyncExternalStore, useCallback } from "react";
import { labApi } from "../services/labService.js";

let state = [];
let loading = false;
const listeners = new Set();

function emit() {
  listeners.forEach((l) => l());
}

export const testsStore = {
  get: () => state,
  subscribe: (l) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  async fetchAll() {
    if (loading) return state;
    loading = true;
    try {
      state = await labApi.getTests();
    } catch (e) {
      console.error("Failed to fetch tests:", e);
    } finally {
      loading = false;
      emit();
    }
    return state;
  },
  async add(testData) {
    const test = await labApi.createTest(testData);
    state = [test, ...state];
    emit();
    return test;
  },
  async update(id, testData) {
    const test = await labApi.updateTest(id, testData);
    state = state.map((t) => (t.id === id ? test : t));
    emit();
    return test;
  },
  async remove(id) {
    await labApi.deleteTest(id);
    state = state.filter((t) => t.id !== id);
    emit();
  },
};

export function useTests() {
  const subscribe = useCallback((l) => testsStore.subscribe(l), []);
  return useSyncExternalStore(subscribe, testsStore.get, testsStore.get);
}
