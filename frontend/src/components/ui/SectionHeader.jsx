import React from "react";

export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-gray-600">{subtitle}</p>
          )}
        </div>
        {action && (
          <div className="flex gap-3">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
