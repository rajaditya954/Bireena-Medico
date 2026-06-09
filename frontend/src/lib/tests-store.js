import { useSyncExternalStore } from "react";
import { tests as initialTests } from "./mock-tests.js";

let state = JSON.parse(JSON.stringify(initialTests));
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
  add: (t) => {
    const id = `T-${String(state.length + 1).padStart(3, "0")}`;
    state = [{ id, ...t }, ...state];
    emit();
  },
  update: (id, t) => {
    state = state.map((x) => (x.id === id ? { id, ...t } : x));
    emit();
  },
  remove: (id) => {
    state = state.filter((x) => x.id !== id);
    emit();
  },
};

export function useTests() {
  return useSyncExternalStore(testsStore.subscribe, testsStore.get, testsStore.get);
}
