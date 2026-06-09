export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
  trend,
  className = "",
}) {
  const tones = {
    default: "border-l-emerald-500 text-emerald-200",
    success: "border-l-emerald-500 text-emerald-200",
    warning: "border-l-purple-500 text-purple-200", // using purple for pending/warning to match reference
    info: "border-l-blue-500 text-blue-200",
    danger: "border-l-orange-500 text-orange-200",
  };

  const currentTone = tones[tone] || tones.default;

  return (
    <div className={`bg-white rounded-xl p-5 border border-border shadow-sm border-l-4 ${currentTone.split(' ')[0]} hover:shadow-md transition-shadow duration-200 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-600">{label}</div>
          <div className="text-3xl font-bold text-[#0f281e] mt-3 tabular-nums">{value}</div>
        </div>
        <div className={`size-10 flex items-center justify-center shrink-0 ${currentTone.split(' ')[1]}`}>
          {icon}
        </div>
      </div>
      {(hint || trend) && (
        <div className="mt-4 flex items-center gap-2">
          {trend && (
            <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-md ${trend.direction === 'up' ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>{trend.value}</span>
          )}
          {hint && <div className="text-xs text-slate-500">{hint}</div>}
        </div>
      )}
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    Completed: "bg-[#d1f4e0] text-[#0f281e]",
    Pending: "bg-orange-100 text-orange-800",
    "In Progress": "bg-blue-100 text-blue-800",
    Cancelled: "bg-red-100 text-red-800",
    Active: "bg-[#d1f4e0] text-[#0f281e]",
    Inactive: "bg-gray-100 text-gray-800",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${map[status] ?? "bg-gray-100 text-gray-800"}`}
    >
      {status}
    </span>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
}) {
  return (
    <div className="flex items-end justify-between flex-wrap gap-4 mb-7">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-[#0f281e] leading-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1.5 max-w-2xl">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-[#0f281e] mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-xs text-slate-500 mt-1">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full h-10 px-3.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-[#0B4B34]/50 focus:ring-4 focus:ring-[#0B4B34]/10 outline-none text-sm text-[#0f281e] placeholder:text-gray-400 transition-all";

export const selectCls = inputCls + " appearance-none pr-9 bg-no-repeat bg-[length:14px] bg-[position:right_0.75rem_center] bg-[image:url('data:image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2020%2020%22%20fill=%22none%22%20stroke=%22%2364748B%22%20stroke-width=%221.6%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22><polyline%20points=%226%208%2010%2012%2014%208%22/></svg>')]";

export const textareaCls =
  "w-full px-3.5 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-[#0B4B34]/50 focus:ring-4 focus:ring-[#0B4B34]/10 outline-none text-sm text-[#0f281e] placeholder:text-gray-400 transition-all resize-y";

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const map = {
    primary:
      "bg-[#0B4B34] text-white hover:bg-[#063323] shadow-sm focus:ring-4 focus:ring-[#0B4B34]/20",
    ghost: "text-[#0f281e] hover:bg-gray-100",
    outline: "border border-[#0B4B34] bg-white text-[#0B4B34] hover:bg-[#0B4B34] hover:text-white",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
  };
  const sizeCls = size === "sm" ? "h-9 px-3.5 text-[13px]" : "h-10 px-5 text-sm";
  return (
    <button
      {...props}
      className={`${sizeCls} rounded-lg font-semibold inline-flex items-center justify-center gap-2 transition-all duration-150 active:scale-[.98] outline-none disabled:opacity-50 disabled:pointer-events-none ${map[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function EmptyState({ title, hint, icon }) {
  return (
    <div className="py-14 px-6 text-center">
      <div className="mx-auto size-12 rounded-xl bg-gray-50 text-gray-400 grid place-items-center mb-3">
        {icon ?? <span className="text-lg">∅</span>}
      </div>
      <div className="font-semibold text-[#0f281e] text-base">{title}</div>
      {hint && <div className="text-sm text-gray-500 mt-1">{hint}</div>}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-[#0f281e]">{title}</h3>
          <button
            onClick={onClose}
            className="size-8 grid place-items-center rounded-lg text-gray-400 hover:text-[#0f281e] hover:bg-gray-50 transition"
          >
            ✕
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">{footer}</div>
        )}
      </div>
    </div>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}>{children}</div>
  );
}

