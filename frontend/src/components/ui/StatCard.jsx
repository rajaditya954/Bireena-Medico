import React from "react";
import { cn } from "../../lib/utils";

export function StatCard({ label, value, icon, tone = "default" }) {
  const toneClasses = {
    default: "bg-blue-50 border-blue-200",
    info: "bg-cyan-50 border-cyan-200",
    success: "bg-green-50 border-green-200",
    warning: "bg-amber-50 border-amber-200",
    danger: "bg-red-50 border-red-200",
  };

  const iconColorClasses = {
    default: "text-blue-600",
    info: "text-cyan-600",
    success: "text-green-600",
    warning: "text-amber-600",
    danger: "text-red-600",
  };

  return (
    <div
      className={cn(
        "rounded-lg border-2 p-4 flex flex-col gap-2",
        toneClasses[tone]
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className={cn("p-2 rounded-lg bg-white/50", iconColorClasses[tone])}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
