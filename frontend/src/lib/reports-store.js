import { useSyncExternalStore } from "react";
import { reports as initialReports } from "./mock-reports.js";

let state = JSON.parse(JSON.stringify(initialReports));
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
  update: (id, updatedData) => {
    state = state.map((report) =>
      report.id === id
        ? {
            ...report,
            ...updatedData,
            history: [
              ...(report.history || []),
              {
                date: new Date().toLocaleString("en-US", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                }).replace(/,/, ""),
                event: `Status changed to ${updatedData.status || report.status}`,
              },
            ],
          }
        : report
    );
    emit();
  },
  addAttachment: (id, attachment) => {
    state = state.map((report) =>
      report.id === id
        ? {
            ...report,
            attachments: [...(report.attachments || []), attachment],
            history: [
              ...(report.history || []),
              {
                date: new Date().toLocaleString("en-US", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                }).replace(/,/, ""),
                event: `File attached: ${attachment.originalName}`,
              },
            ],
          }
        : report
    );
    emit();
  },
};

export function useReports() {
  return useSyncExternalStore(reportsStore.subscribe, reportsStore.get, reportsStore.get);
}
