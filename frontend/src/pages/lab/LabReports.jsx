import { useEffect, useMemo, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import {
  FileText, Clock, CheckCircle2, AlertCircle, Download, Filter, ChevronLeft, ChevronRight, Search,
  X, Copy, FileDown, Calendar, User, Stethoscope, Activity, Printer, Pencil, Trash2,
  FlaskConical, ShieldCheck, Send, CheckSquare, Square, Minus
} from "lucide-react";
import { Button, Card, EmptyState, Field, inputCls, Modal, PriorityBadge, SectionHeader, selectCls, StatCard, StatusBadge, textareaCls } from "../../components/lab/ui";
import { downloadBlob, toCsvValue } from "../../lib/utils";
import { useReports, reportsStore } from "../../lib/reports-store";

const PAGE_SIZE = 6;

const ALL_STATUSES = [
  "Pending", "Requested", "Sample Collected", "Sample Received",
  "In Testing", "In Progress", "Report Ready", "Uploaded",
  "Verified", "Completed", "Cancelled",
];

const STATUS_TAB_MAP = {
  "all": null,
  "pending": ["Pending", "Requested"],
  "in-progress": ["Sample Collected", "Sample Received", "In Testing", "In Progress"],
  "ready": ["Report Ready", "Uploaded"],
  "verified": ["Verified"],
  "completed": ["Completed"],
};

const PRIORITY_ORDER = { STAT: 0, URGENT: 1, NORMAL: 2 };

// ---------- MOCK DATA (fallback while loading) ----------
const MOCK_REPORTS = [
  {
    id: "RPT-1001", patientName: "Emily Johnson", patientId: "P-001", patientAge: 34, patientGender: "Female",
    testName: "Complete Blood Count", testType: "Hematology", doctor: "Dr. Sarah Miller", doctorSpecialty: "Hematologist",
    sampleDate: "2026-05-15", reportDate: "2026-05-16", status: "Completed", rawPriority: "NORMAL", priority: "Normal",
    sampleId: "SMP-1001", sampleType: "Blood", department: "Hematology",
    notes: "All values within normal range.", history: [
      { date: "2026-05-15 09:30", event: "Sample collected" },
      { date: "2026-05-15 14:00", event: "Processing started" },
      { date: "2026-05-16 08:00", event: "Report completed" },
    ], attachments: [],
  },
  {
    id: "RPT-1002", patientName: "Michael Chen", patientId: "P-002", patientAge: 45, patientGender: "Male",
    testName: "Lipid Profile", testType: "Biochemistry", doctor: "Dr. James Wilson", doctorSpecialty: "Cardiologist",
    sampleDate: "2026-05-16", reportDate: "2026-05-17", status: "Pending", rawPriority: "URGENT", priority: "Urgent",
    sampleId: "SMP-1002", sampleType: "Blood", department: "Biochemistry",
    notes: "", history: [{ date: "2026-05-16 10:15", event: "Sample collected" }], attachments: [],
  },
  {
    id: "RPT-1003", patientName: "Sarah Williams", patientId: "P-003", patientAge: 29, patientGender: "Female",
    testName: "Thyroid Panel", testType: "Endocrinology", doctor: "Dr. Emily Chen", doctorSpecialty: "Endocrinologist",
    sampleDate: "2026-05-14", reportDate: "2026-05-15", status: "In Testing", rawPriority: "NORMAL", priority: "Normal",
    sampleId: "SMP-1003", sampleType: "Blood", department: "Endocrinology",
    notes: "TSH slightly elevated.", history: [
      { date: "2026-05-14 08:45", event: "Sample collected" },
      { date: "2026-05-14 13:00", event: "Testing started" },
    ], attachments: [],
  },
];

export default function LabReportsPage() {
  useEffect(() => { document.title = "Lab Reports - Lab Admin"; }, []);

  const backendReports = useReports();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsStore.fetchAll().finally(() => setLoading(false));
    const onFocus = () => { reportsStore.fetchAll(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

  const allReports = loading ? MOCK_REPORTS : (backendReports.length > 0 ? backendReports : []);
  const detailPanelRef = useRef(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [testType, setTestType] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // Bulk selection
  const [checked, setChecked] = useState(new Set());
  // Verify dialog
  const [verifyTarget, setVerifyTarget] = useState(null);
  const [verifierName, setVerifierName] = useState("");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "all") setStatusFilter("all");
    else setStatusFilter(tab);
    setPage(1);
  };

  useEffect(() => {
    if (allReports.length === 0) { setSelectedId(null); return; }
    if (!selectedId || !allReports.some((report) => report.id === selectedId)) {
      setSelectedId(allReports[0].id);
    }
  }, [allReports, selectedId]);

  const testTypes = useMemo(() => Array.from(new Set(allReports.map((r) => r.testType).filter(Boolean))).sort(), [allReports]);

  const filtered = useMemo(() => {
    return allReports.filter((r) => {
      // Status filter — tab-based or dropdown-based
      if (activeTab !== "all" && STATUS_TAB_MAP[activeTab]) {
        if (!STATUS_TAB_MAP[activeTab].includes(r.status)) return false;
      } else if (statusFilter !== "all" && statusFilter !== r.status) {
        return false;
      }
      if (testType !== "all" && r.testType !== testType) return false;
      if (priorityFilter !== "all" && r.rawPriority !== priorityFilter) return false;
      if (from && r.sampleDate < from) return false;
      if (to && r.sampleDate > to) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !r.id.toLowerCase().includes(q) &&
          !r.patientName.toLowerCase().includes(q) &&
          !(r.patientId || "").toLowerCase().includes(q) &&
          !(r.sampleId || "").toLowerCase().includes(q) &&
          !r.testName.toLowerCase().includes(q) &&
          !r.doctor.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    }).sort((a, b) => {
      // Priority sort: STAT > URGENT > NORMAL
      const pa = PRIORITY_ORDER[a.rawPriority] ?? 2;
      const pb = PRIORITY_ORDER[b.rawPriority] ?? 2;
      if (pa !== pb) return pa - pb;
      // Then by sample date descending
      return (b.sampleDate || "").localeCompare(a.sampleDate || "");
    });
  }, [allReports, activeTab, statusFilter, from, query, testType, priorityFilter, to]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selected = allReports.find((r) => r.id === selectedId) ?? null;

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      total: allReports.length,
      samplesReceived: allReports.filter((r) => ["Sample Received", "In Testing", "In Progress"].includes(r.status)).length,
      inTesting: allReports.filter((r) => ["In Testing", "In Progress"].includes(r.status)).length,
      awaitingUpload: allReports.filter((r) => ["Report Ready"].includes(r.status)).length,
      completedToday: allReports.filter((r) => r.status === "Completed" && r.reportDate === today).length,
      pending: allReports.filter((r) => ["Pending", "Requested"].includes(r.status)).length,
    };
  }, [allReports]);

  function clearFilters() {
    setQuery(""); setStatusFilter("all"); setActiveTab("all"); setTestType("all");
    setPriorityFilter("all"); setFrom(""); setTo(""); setPage(1);
    toast.success("Report filters cleared.");
  }

  function hasActiveFilters() {
    return query || statusFilter !== "all" || testType !== "all" || priorityFilter !== "all" || from || to;
  }

  function exportCsv() {
    const rows = (checked.size > 0 ? filtered.filter(r => checked.has(r.id)) : filtered);
    if (rows.length === 0) { toast.info("There are no report rows to export."); return; }
    const header = [
      "Report ID", "Sample ID", "Patient Name", "Patient ID", "Age", "Gender",
      "Test Name", "Test Type", "Doctor", "Doctor Specialty", "Priority",
      "Sample Date", "Report Date", "Status", "Verified By", "Notes",
    ];
    const csvRows = rows.map((report) => [
      report.id, report.sampleId, report.patientName, report.patientId,
      report.patientAge, report.patientGender, report.testName, report.testType,
      report.doctor, report.doctorSpecialty, report.priority,
      report.sampleDate, report.reportDate, report.status, report.verifierName,
      report.notes ?? "",
    ]);
    const csv = [header, ...csvRows].map((row) => row.map((cell) => toCsvValue(cell)).join(",")).join("\n");
    downloadBlob([csv], `lab-reports-${new Date().toISOString().split('T')[0]}.csv`, "text/csv;charset=utf-8");
    toast.success(`Exported ${csvRows.length} report${csvRows.length === 1 ? "" : "s"} to CSV.`);
  }

  function openEdit(report) {
    setEditing(report);
    const rawStatus = report._raw?.status || report.rawStatus || "PENDING";
    setForm({ status: rawStatus, notes: report.notes || "" });
  }

  async function saveEdit() {
    if (!editing || !form) return;
    const mongoId = editing._raw?._id;
    if (!mongoId) { toast.error("Cannot identify report."); return; }
    toast.info("Saving changes...");
    try {
      await reportsStore.updateStatus(mongoId, form.status, form.notes);
      toast.success("✓ Report updated successfully!");
      setEditing(null); setForm(null);
      reportsStore.fetchAll();
    } catch (e) {
      console.error("Failed to update report:", e);
      toast.error("✗ " + (e.message || "Failed to update report"));
    }
  }

  async function deleteReport(reportId) {
    if (!window.confirm("Are you sure you want to delete this report? This cannot be undone.")) {
      toast.info("Delete cancelled."); return;
    }
    const report = backendReports.find(r => r.id === reportId);
    const mongoId = report?._raw?._id;
    if (!mongoId) { toast.error("Cannot identify report."); return; }
    setIsDeleting(true);
    toast.info("Deleting report...");
    try {
      await reportsStore.remove(mongoId);
      toast.success("✓ Report deleted successfully!");
      if (selectedId === reportId) setSelectedId(null);
    } catch (e) {
      console.error("Failed to delete report:", e);
      toast.error("✗ " + (e.message || "Failed to delete report"));
    } finally { setIsDeleting(false); }
  }

  function focusReport(report) {
    setSelectedId(report.id);
    detailPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function copyText(text, label = "Text") {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  }

  function downloadReport(report) {
    const firstAttachment = report.attachments?.[0];
    if (firstAttachment?.mimetype === "application/pdf") {
      const anchor = document.createElement("a");
      anchor.href = firstAttachment.path;
      anchor.download = firstAttachment.originalName || `${report.id}.pdf`;
      anchor.target = "_blank"; anchor.rel = "noopener noreferrer";
      anchor.click();
      toast.success(`Downloaded PDF for ${report.id}.`);
      return;
    }

    const pdf = new jsPDF();
    const left = 16; const right = 194; let y = 18;
    const writeLine = (label, value) => {
      const lines = pdf.splitTextToSize(`${label}: ${value}`, right - left);
      pdf.text(lines, left, y); y += lines.length * 7;
    };
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(20); pdf.setTextColor(41, 128, 185);
    pdf.text("Laboratory Report", left, y); y += 8;
    pdf.setFontSize(10); pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, left, y); y += 12;
    pdf.setTextColor(0, 0, 0); pdf.setFontSize(11); pdf.setFont("helvetica", "normal");
    pdf.setDrawColor(200, 200, 200); pdf.setFillColor(245, 245, 245);
    pdf.rect(left, y - 4, right - left, 8, 'F');
    writeLine("Report ID", report.id);
    if (report.sampleId) writeLine("Sample ID", report.sampleId);
    y += 4;
    writeLine("Patient", `${report.patientName} (${report.patientId})`);
    writeLine("Age / Gender", `${report.patientAge} / ${report.patientGender}`);
    y += 4;
    writeLine("Test", report.testName); writeLine("Type", report.testType);
    if (report.priority && report.priority !== "Normal") writeLine("Priority", report.priority);
    y += 4;
    writeLine("Doctor", `${report.doctor} (${report.doctorSpecialty})`);
    writeLine("Sample Date", report.sampleDate); writeLine("Report Date", report.reportDate);
    writeLine("Status", report.status);
    if (report.verifierName) writeLine("Verified By", report.verifierName);
    writeLine("Notes", report.notes || "N/A");
    y += 8;
    pdf.setFont("helvetica", "bold"); pdf.setTextColor(41, 128, 185);
    pdf.text("History Timeline", left, y); y += 8;
    pdf.setFont("helvetica", "normal"); pdf.setTextColor(0, 0, 0);
    for (const entry of report.history) {
      const lines = pdf.splitTextToSize(`• ${entry.date}: ${entry.event}`, right - left);
      if (y + lines.length * 7 > 280) { pdf.addPage(); y = 18; }
      pdf.text(lines, left, y); y += lines.length * 7;
    }
    pdf.save(`${report.id}-${report.patientName.replace(/\s/g, '')}.pdf`);
    toast.success(`Downloaded PDF for ${report.id}.`);
  }

  // Bulk operations
  function toggleCheck(id) {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function toggleAllPage() {
    const pageIds = pageRows.map(r => r.id);
    const allChecked = pageIds.every(id => checked.has(id));
    setChecked(prev => {
      const next = new Set(prev);
      pageIds.forEach(id => allChecked ? next.delete(id) : next.add(id));
      return next;
    });
  }
  async function bulkStatusUpdate(status) {
    const ids = [...checked].map(id => {
      const r = allReports.find(rep => rep.id === id);
      return r?._raw?._id;
    }).filter(Boolean);
    if (ids.length === 0) return;
    toast.info(`Updating ${ids.length} reports...`);
    try {
      await reportsStore.updateBulkStatus(ids, status);
      toast.success(`✓ ${ids.length} reports updated.`);
      setChecked(new Set());
    } catch (e) {
      toast.error("✗ " + (e.message || "Bulk update failed"));
    }
  }
  function bulkDownload() {
    const targets = allReports.filter(r => checked.has(r.id));
    targets.forEach(r => downloadReport(r));
    toast.success(`Downloaded ${targets.length} report(s).`);
  }

  // Verify / Release
  async function handleVerify() {
    if (!verifyTarget || !verifierName.trim()) { toast.warning("Please enter verifier name."); return; }
    const mongoId = verifyTarget._raw?._id;
    if (!mongoId) { toast.error("Cannot identify report."); return; }
    toast.info("Verifying report...");
    try {
      await reportsStore.verify(mongoId, verifierName.trim());
      toast.success("✓ Report verified!");
      setVerifyTarget(null); setVerifierName("");
      reportsStore.fetchAll();
    } catch (e) {
      toast.error("✗ " + (e.message || "Verify failed"));
    }
  }
  async function handleRelease(report) {
    const mongoId = report._raw?._id;
    if (!mongoId) { toast.error("Cannot identify report."); return; }
    toast.info("Releasing to patient...");
    try {
      await reportsStore.release(mongoId);
      toast.success("✓ Report released to patient!");
      reportsStore.fetchAll();
    } catch (e) {
      toast.error("✗ " + (e.message || "Release failed"));
    }
  }

  const pageAllChecked = pageRows.length > 0 && pageRows.every(r => checked.has(r.id));
  const pageSomeChecked = pageRows.some(r => checked.has(r.id)) && !pageAllChecked;

  return (
    <div className="min-h-screen bg-[#F2F9F6] -mx-4 -mt-4 p-4 sm:-mx-6 sm:-mt-6 sm:p-6 lg:-mx-8 lg:-mt-8 lg:p-8 space-y-6">
      <SectionHeader
        title="Lab Reports"
        subtitle="Monitor diagnostic reports across patients, doctors and test categories."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setFiltersOpen((open) => !open)} className="transition-all duration-200">
              <Filter className="size-4" />
              {filtersOpen ? "Hide Filters" : "Show Filters"}
              {hasActiveFilters() && filtersOpen === false && (
                <span className="ml-1.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
              )}
            </Button>
            <Button onClick={exportCsv} variant="outline">
              <FileDown className="size-4" /> Export
            </Button>
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Total Reports" value={stats.total} icon={<FileText className="size-5" />}
          hint="All-time records" trend={{ value: `${stats.pending} pending`, direction: "up" }}
          className="shadow-sm hover:shadow-md transition-shadow duration-200"
        />
        <StatCard
          label="Samples Received" value={stats.samplesReceived} icon={<FlaskConical className="size-5" />}
          tone="info" hint="Awaiting testing"
          className="shadow-sm hover:shadow-md transition-shadow duration-200"
        />
        <StatCard
          label="In Testing" value={stats.inTesting} icon={<Clock className="size-5" />}
          tone="warning" hint="Tests in progress"
          className="shadow-sm hover:shadow-md transition-shadow duration-200"
        />
        <StatCard
          label="Completed Today" value={stats.completedToday} icon={<CheckCircle2 className="size-5" />}
          tone="success" hint="Released to patients"
          className="shadow-sm hover:shadow-md transition-shadow duration-200"
        />
      </div>

      {/* Quick Tab Navigation */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {[
          { key: "all", label: "All Reports" },
          { key: "pending", label: "Pending" },
          { key: "in-progress", label: "In Progress" },
          { key: "ready", label: "Ready / Uploaded" },
          { key: "verified", label: "Verified" },
          { key: "completed", label: "Completed" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-5 py-2 text-sm font-medium rounded-t-lg transition-all whitespace-nowrap ${activeTab === tab.key
                ? "bg-[#0B4B34] text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bulk Action Bar */}
      {checked.size > 0 && (
        <div className="flex items-center gap-3 px-5 py-3 bg-[#0B4B34]/5 border border-[#0B4B34]/20 rounded-xl">
          <span className="text-sm font-semibold text-[#0f281e]">{checked.size} selected</span>
          <select
            className="h-8 px-3 rounded-lg bg-white border border-gray-200 text-xs font-medium"
            defaultValue=""
            onChange={(e) => { if (e.target.value) { bulkStatusUpdate(e.target.value); e.target.value = ""; } }}
          >
            <option value="" disabled>Change Status…</option>
            {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <Button size="sm" variant="outline" onClick={bulkDownload}>
            <Download className="size-3.5" /> Download
          </Button>
          <Button size="sm" variant="outline" onClick={exportCsv}>
            <FileDown className="size-3.5" /> Export
          </Button>
          <button onClick={() => setChecked(new Set())} className="ml-auto text-xs text-slate-500 hover:text-[#0f281e]">Clear</button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
        {/* Main Reports Table Card */}
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="px-6 py-5 border-b border-border bg-gradient-to-r from-background to-secondary/5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="font-semibold text-foreground text-base">Reports List</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {filtered.length} {filtered.length === 1 ? 'record' : 'records'} found
                </p>
              </div>
              <div className="relative w-full sm:w-80">
                <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={1.75} />
                <input
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                  placeholder="Search ID, patient, sample, test, doctor…"
                  className={inputCls + " pl-9 pr-4 py-2 text-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20"}
                />
              </div>
            </div>
          </div>

          {/* Advanced Filter Section */}
          {filtersOpen && (
            <div className="px-6 py-5 border-b border-border bg-secondary/10 transition-all duration-300 ease-in-out">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Field label="Status">
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setActiveTab("all"); setPage(1); }}
                    className={selectCls + " transition-all duration-200 focus:ring-2 focus:ring-primary/20"}
                  >
                    <option value="all">All statuses</option>
                    {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Test Type">
                  <select value={testType} onChange={(e) => { setTestType(e.target.value); setPage(1); }}
                    className={selectCls + " transition-all duration-200 focus:ring-2 focus:ring-primary/20"}>
                    <option value="all">All types</option>
                    {testTypes.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Priority">
                  <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
                    className={selectCls + " transition-all duration-200 focus:ring-2 focus:ring-primary/20"}>
                    <option value="all">All priorities</option>
                    <option value="STAT">STAT (Emergency)</option>
                    <option value="URGENT">Urgent</option>
                    <option value="NORMAL">Normal</option>
                  </select>
                </Field>
                <Field label="Sample From">
                  <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
                    className={inputCls + " transition-all duration-200 focus:ring-2 focus:ring-primary/20"} />
                </Field>
                <Field label="Sample To">
                  <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
                    className={inputCls + " transition-all duration-200 focus:ring-2 focus:ring-primary/20"} />
                </Field>
              </div>
              {hasActiveFilters() && (
                <div className="flex justify-end mt-4">
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                    <X className="size-3.5 mr-1" /> Clear all filters
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Reports Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  <th className="px-3 py-4 pl-5 w-10">
                    <button onClick={toggleAllPage} className="text-muted-foreground hover:text-foreground">
                      {pageAllChecked ? <CheckSquare className="size-4" /> : pageSomeChecked ? <Minus className="size-4" /> : <Square className="size-4" />}
                    </button>
                  </th>
                  <th className="px-4 py-4">Report ID</th>
                  <th className="px-4 py-4">Patient</th>
                  <th className="px-4 py-4">Test</th>
                  <th className="px-4 py-4">Doctor</th>
                  <th className="px-4 py-4">Sample Date</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12">
                      <EmptyState title="No reports match your filters" hint="Try adjusting your search criteria or clearing filters"
                        icon={<Search className="size-12 text-muted-foreground/40" />} />
                    </td>
                  </tr>
                )}
                {pageRows.map((r) => {
                  const active = r.id === selectedId;
                  const isChecked = checked.has(r.id);
                  const initials = r.patientName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
                  return (
                    <tr
                      key={r.id}
                      onClick={() => focusReport(r)}
                      className={`cursor-pointer border-b border-gray-100 transition-colors duration-150 hover:bg-gray-50 ${active ? 'bg-emerald-50/50' : ''} ${isChecked ? 'bg-[#0B4B34]/5' : ''}`}
                    >
                      <td className="px-3 py-4 pl-5">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleCheck(r.id); }}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {isChecked ? <CheckSquare className="size-4 text-[#0B4B34]" /> : <Square className="size-4" />}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[12px] font-semibold text-primary">{r.id}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); copyText(r.id, "Report ID"); }}
                            className="opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity"
                            aria-label="Copy ID"
                          >
                            <Copy className="size-3" />
                          </button>
                        </div>
                        {r.sampleId && <div className="text-[10px] text-slate-400 mt-0.5">{r.sampleId}</div>}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-lg bg-[#d1f4e0] text-[#0B4B34] font-bold text-xs flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-[#0f281e] text-[13px]">{r.patientName.toUpperCase()}</div>
                            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                              ID: {r.patientId} • {r.patientAge}y • {r.patientGender}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="text-foreground">{r.testName}</div>
                            <div className="text-[11px] text-muted-foreground">{r.testType}</div>
                          </div>
                          <PriorityBadge priority={r.priority} />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <Stethoscope className="size-3 text-muted-foreground" />
                          <span className="text-foreground">{r.doctor}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground tabular-nums text-[12px]">{r.sampleDate}</td>
                      <td className="px-4 py-4">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-4 pr-6 text-right">
                        <div className="flex gap-1 justify-end">
                          <button type="button"
                            onClick={(event) => { event.stopPropagation(); focusReport(r); }}
                            className="text-primary hover:text-primary/80 text-[12px] font-medium transition-colors duration-150 hover:underline"
                          >View →</button>
                          <button aria-label="Edit"
                            onClick={(event) => { event.stopPropagation(); openEdit(r); }}
                            className="size-8 rounded-lg hover:bg-secondary grid place-items-center text-muted-foreground hover:text-primary transition"
                          ><Pencil className="size-4" /></button>
                          <button aria-label="Delete"
                            onClick={(event) => { event.stopPropagation(); deleteReport(r.id); }}
                            disabled={isDeleting}
                            className="size-8 rounded-lg hover:bg-destructive/10 grid place-items-center text-muted-foreground hover:text-destructive transition disabled:opacity-50"
                          ><Trash2 className="size-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-secondary/5">
            <span className="text-[12px] text-muted-foreground">
              Showing <span className="text-foreground font-semibold">{pageRows.length}</span> of{" "}
              <span className="text-foreground font-semibold">{filtered.length}</span> reports
            </span>
            <div className="flex items-center gap-3">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                className="size-8 rounded-md border border-border bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary transition-all duration-200 flex items-center justify-center shadow-sm">
                <ChevronLeft className="size-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) { pageNum = i + 1; }
                  else if (page <= 3) { pageNum = i + 1; }
                  else if (page >= totalPages - 2) { pageNum = totalPages - 4 + i; }
                  else { pageNum = page - 2 + i; }
                  if (pageNum > 0 && pageNum <= totalPages) {
                    return (
                      <button key={pageNum} onClick={() => setPage(pageNum)}
                        className={`min-w-[32px] h-8 px-2 rounded-md text-[13px] font-medium transition-all duration-200 ${page === pageNum ? 'bg-[#0B4B34] text-white shadow-sm' : 'hover:bg-secondary text-foreground'}`}
                      >{pageNum}</button>
                    );
                  }
                  return null;
                })}
              </div>
              <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}
                className="size-8 rounded-md border border-border bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary transition-all duration-200 flex items-center justify-center shadow-sm">
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </Card>

        {/* Detail Panel */}
        <aside ref={detailPanelRef} className="xl:sticky xl:top-24 h-fit print-area">
          <Card className="p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            {!selected ? (
              <div className="py-12">
                <EmptyState title="Select a report" hint="Click on any report row to view detailed information"
                  icon={<FileText className="size-12 text-muted-foreground/40" />} />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-3 pb-5 border-b border-border">
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-2">
                      <FileText className="size-3" /> Report Details
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-xl font-bold text-foreground font-mono">{selected.id}</div>
                      <button onClick={() => copyText(selected.id, "Report ID")}
                        className="p-1 hover:bg-secondary rounded-md transition-colors" aria-label="Copy ID">
                        <Copy className="size-3.5 text-muted-foreground hover:text-primary" />
                      </button>
                    </div>
                    {selected.sampleId && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs text-muted-foreground">Sample: {selected.sampleId}</span>
                        <button onClick={() => copyText(selected.sampleId, "Sample ID")}
                          className="p-0.5 hover:bg-secondary rounded transition-colors">
                          <Copy className="size-3 text-muted-foreground" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge status={selected.status} />
                    <PriorityBadge priority={selected.priority} />
                  </div>
                </div>

                <div className="space-y-6">
                  <DetailGroup title="Patient Information" icon={<User className="size-3" />}>
                    <Row k="Full Name" v={selected.patientName} />
                    <Row k="Patient ID" v={
                      <span className="inline-flex items-center gap-1">
                        {selected.patientId}
                        <button onClick={() => copyText(selected.patientId, "Patient ID")}
                          className="p-0.5 hover:bg-secondary rounded transition-colors inline-flex">
                          <Copy className="size-3 text-muted-foreground" />
                        </button>
                      </span>
                    } />
                    <Row k="Age / Gender" v={`${selected.patientAge} years • ${selected.patientGender}`} />
                  </DetailGroup>

                  <DetailGroup title="Test Details" icon={<Activity className="size-3" />}>
                    <Row k="Test Name" v={selected.testName} />
                    <Row k="Test Type" v={selected.testType} />
                    {selected.sampleType && <Row k="Sample Type" v={selected.sampleType} />}
                    {selected.department && <Row k="Department" v={selected.department} />}
                    <Row k="Sample Date" v={selected.sampleDate} />
                    <Row k="Report Date" v={selected.reportDate || "—"} />
                    <Row k="Priority" v={selected.priority} />
                    <Row k="Version" v={`v${selected.reportVersion || 1}`} />
                  </DetailGroup>

                  <DetailGroup title="Referring Doctor" icon={<Stethoscope className="size-3" />}>
                    <Row k="Doctor Name" v={selected.doctor} />
                    <Row k="Specialty" v={selected.doctorSpecialty} />
                  </DetailGroup>

                  {(selected.uploadedBy || selected.uploadedTime) && (
                    <DetailGroup title="Upload Info" icon={<FileText className="size-3" />}>
                      {selected.uploadedBy && <Row k="Uploaded By" v={selected.uploadedBy} />}
                      {selected.uploadedTime && <Row k="Upload Time" v={selected.uploadedTime} />}
                    </DetailGroup>
                  )}

                  {(selected.verifierName || selected.verificationTimestamp) && (
                    <DetailGroup title="Verification" icon={<ShieldCheck className="size-3" />}>
                      {selected.verifierName && <Row k="Verified By" v={selected.verifierName} />}
                      {selected.verificationTimestamp && <Row k="Verified At" v={selected.verificationTimestamp} />}
                    </DetailGroup>
                  )}

                  {selected.attachments?.length > 0 && (
                    <DetailGroup title={`Attachments (${selected.attachments.length})`} icon={<FileText className="size-3" />}>
                      {selected.attachments.map((att, i) => (
                        <div key={i} className="flex items-center gap-2 bg-secondary/30 rounded-lg p-2.5">
                          <FileText className="size-4 text-primary shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-medium text-foreground truncate">{att.originalName}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {att.mimetype === "application/pdf" ? "PDF" : "Image"}{att.category ? ` • ${att.category}` : ""}
                            </div>
                          </div>
                          <a href={att.path} target="_blank" rel="noopener noreferrer"
                            className="text-[11px] text-primary font-medium hover:underline shrink-0">Open</a>
                        </div>
                      ))}
                    </DetailGroup>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button className="flex-1" onClick={() => downloadReport(selected)}>
                      <Download className="size-4 mr-2" /> Download PDF
                    </Button>
                    <Button type="button" variant="outline" onClick={() => window.print()} className="flex-1">
                      <Printer className="size-4 mr-2" /> Print
                    </Button>
                  </div>

                  {/* Workflow action buttons */}
                  {selected.status !== "Completed" && selected.status !== "Cancelled" && (
                    <div className="flex gap-2 pt-1">
                      {["Uploaded", "Report Ready", "In Testing", "In Progress"].includes(selected.status) && (
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => { setVerifyTarget(selected); setVerifierName(""); }}>
                          <ShieldCheck className="size-4 mr-1" /> Mark Verified
                        </Button>
                      )}
                      {selected.status === "Verified" && (
                        <Button size="sm" className="flex-1" onClick={() => handleRelease(selected)}>
                          <Send className="size-4 mr-1" /> Release to Patient
                        </Button>
                      )}
                    </div>
                  )}

                  <DetailGroup title="History Timeline" icon={<Clock className="size-3" />}>
                    <div className="relative">
                      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
                      <div className="space-y-4">
                        {selected.history.map((h, i) => (
                          <div key={i} className="relative pl-6">
                            <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-primary/10" />
                            <div className="text-[13px] font-medium text-foreground">{h.event}</div>
                            <div className="text-[11px] text-muted-foreground tabular-nums mt-0.5">
                              {h.date}{h.by ? ` • by ${h.by}` : ""}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DetailGroup>

                  {selected.notes && (
                    <DetailGroup title="Additional Notes" icon={<FileText className="size-3" />}>
                      <div className="text-[13px] text-muted-foreground bg-secondary/20 p-3 rounded-lg">
                        {selected.notes}
                      </div>
                    </DetailGroup>
                  )}
                </div>
              </div>
            )}
          </Card>
        </aside>
      </div>

      {/* Edit Modal */}
      <Modal
        open={!!editing}
        onClose={() => { setEditing(null); setForm(null); }}
        title={editing ? `Edit Report ${editing.id}` : ""}
        footer={
          <>
            <Button variant="outline" onClick={() => { setEditing(null); setForm(null); }}>Cancel</Button>
            <Button onClick={saveEdit}>Save changes</Button>
          </>
        }
      >
        {form && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Status">
              <select className={selectCls} value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value })}>
                <option value="PENDING">Pending</option>
                <option value="REQUESTED">Requested</option>
                <option value="SAMPLE_COLLECTED">Sample Collected</option>
                <option value="SAMPLE_RECEIVED">Sample Received</option>
                <option value="IN_TESTING">In Testing</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="READY">Report Ready</option>
                <option value="UPLOADED">Uploaded</option>
                <option value="VERIFIED">Verified</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Clinical Notes">
                <textarea rows={4} className={textareaCls} value={form.notes}
                  onChange={(event) => setForm({ ...form, notes: event.target.value })}
                  placeholder="Add clinical notes, findings, or remarks..." />
              </Field>
            </div>
          </div>
        )}
      </Modal>

      {/* Verify Modal */}
      <Modal
        open={!!verifyTarget}
        onClose={() => { setVerifyTarget(null); setVerifierName(""); }}
        title={verifyTarget ? `Verify Report ${verifyTarget.id}` : ""}
        footer={
          <>
            <Button variant="outline" onClick={() => { setVerifyTarget(null); setVerifierName(""); }}>Cancel</Button>
            <Button onClick={handleVerify}><ShieldCheck className="size-4 mr-1" /> Verify</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Verifying report <strong>{verifyTarget?.id}</strong> for patient <strong>{verifyTarget?.patientName}</strong>.
            This confirms the results have been reviewed by senior lab staff.
          </p>
          <Field label="Verifier Name (Senior Staff)">
            <input value={verifierName} onChange={(e) => setVerifierName(e.target.value)}
              placeholder="Dr. / Lab Head Name" className={inputCls} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}

function DetailGroup({ title, children, icon }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {icon}
        {title}
      </div>
      <div className="bg-secondary/5 rounded-lg p-3 space-y-2.5">{children}</div>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex justify-between gap-3 text-[13px] items-start">
      <span className="text-muted-foreground font-medium">{k}</span>
      <span className="text-foreground text-right break-words max-w-[60%]">{v}</span>
    </div>
  );
}