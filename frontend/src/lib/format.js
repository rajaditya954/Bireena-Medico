export const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const fmtDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export const fmtDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  return `${fmtDate(d)} ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
};

export const capitalize = (v) =>
  String(v || "").toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());
