import { useEffect, useMemo, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import {
  FileText, Clock, CheckCircle2, AlertCircle, Download, Filter, ChevronLeft, ChevronRight, Search,
  X, Copy, FileDown, Calendar, User, Stethoscope, Activity, Printer
} from "lucide-react";
import { Button, Card, EmptyState, Field, inputCls, SectionHeader, selectCls, StatCard, StatusBadge } from "../../components/lab/ui";
import { downloadBlob, toCsvValue } from "../../lib/utils";

const PAGE_SIZE = 6;

// ---------- MOCK DATA (based on the earlier example) ----------
const MOCK_REPORTS = [
  {
    id: "RPT-1001",
    patientName: "Emily Johnson",
    patientId: "P-001",
    patientAge: 34,
    patientGender: "Female",
    testName: "Complete Blood Count",
    testType: "Hematology",
    doctor: "Dr. Sarah Miller",
    doctorSpecialty: "Hematologist",
    sampleDate: "2026-05-15",
    reportDate: "2026-05-16",
    status: "Completed",
    notes: "All values within normal range.",
    history: [
      { date: "2026-05-15 09:30", event: "Sample collected" },
      { date: "2026-05-15 14:00", event: "Processing started" },
      { date: "2026-05-16 08:00", event: "Report completed" },
    ],
    attachments: [],
  },
  {
    id: "RPT-1002",
    patientName: "Michael Chen",
    patientId: "P-002",
    patientAge: 45,
    patientGender: "Male",
    testName: "Lipid Profile",
    testType: "Biochemistry",
    doctor: "Dr. James Wilson",
    doctorSpecialty: "Cardiologist",
    sampleDate: "2026-05-16",
    reportDate: "2026-05-17",
    status: "Pending",
    notes: "",
    history: [
      { date: "2026-05-16 10:15", event: "Sample collected" },
    ],
    attachments: [],
  },
  {
    id: "RPT-1003",
    patientName: "Sarah Williams",
    patientId: "P-003",
    patientAge: 29,
    patientGender: "Female",
    testName: "Thyroid Panel",
    testType: "Endocrinology",
    doctor: "Dr. Emily Chen",
    doctorSpecialty: "Endocrinologist",
    sampleDate: "2026-05-14",
    reportDate: "2026-05-15",
    status: "In Progress",
    notes: "TSH slightly elevated.",
    history: [
      { date: "2026-05-14 08:45", event: "Sample collected" },
      { date: "2026-05-14 13:00", event: "Processing started" },
    ],
    attachments: [],
  },
  {
    id: "RPT-1004",
    patientName: "David Brown",
    patientId: "P-004",
    patientAge: 58,
    patientGender: "Male",
    testName: "Liver Function Test",
    testType: "Biochemistry",
    doctor: "Dr. Robert Lee",
    doctorSpecialty: "Gastroenterologist",
    sampleDate: "2026-05-16",
    reportDate: "2026-05-17",
    status: "Completed",
    notes: "Mild elevation in ALT.",
    history: [
      { date: "2026-05-16 11:00", event: "Sample collected" },
      { date: "2026-05-16 15:30", event: "Processing started" },
      { date: "2026-05-17 09:00", event: "Report completed" },
    ],
    attachments: [],
  },
  {
    id: "RPT-1005",
    patientName: "Lisa Garcia",
    patientId: "P-005",
    patientAge: 41,
    patientGender: "Female",
    testName: "Urinalysis",
    testType: "Microbiology",
    doctor: "Dr. Maria Rodriguez",
    doctorSpecialty: "Nephrologist",
    sampleDate: "2026-05-17",
    reportDate: "2026-05-18",
    status: "Pending",
    notes: "",
    history: [
      { date: "2026-05-17 09:20", event: "Sample collected" },
    ],
    attachments: [],
  },
  {
    id: "RPT-1006",
    patientName: "James Wilson",
    patientId: "P-006",
    patientAge: 52,
    patientGender: "Male",
    testName: "Vitamin D",
    testType: "Immunology",
    doctor: "Dr. Susan Adams",
    doctorSpecialty: "Rheumatologist",
    sampleDate: "2026-05-13",
    reportDate: "2026-05-14",
    status: "Completed",
    notes: "Severe deficiency detected. Supplement recommended.",
    history: [
      { date: "2026-05-13 10:00", event: "Sample collected" },
      { date: "2026-05-13 14:30", event: "Processing started" },
      { date: "2026-05-14 08:00", event: "Report completed" },
    ],
    attachments: [],
  },
  {
    id: "RPT-1007",
    patientName: "Anna Martinez",
    patientId: "P-007",
    patientAge: 37,
    patientGender: "Female",
    testName: "Hemoglobin A1c",
    testType: "Diabetology",
    doctor: "Dr. Thomas White",
    doctorSpecialty: "Endocrinologist",
    sampleDate: "2026-05-16",
    reportDate: "2026-05-17",
    status: "In Progress",
    notes: "Follow-up test for diabetes management.",
    history: [
      { date: "2026-05-16 13:15", event: "Sample collected" },
      { date: "2026-05-16 16:00", event: "Processing started" },
    ],
    attachments: [],
  },
];

export default function LabReportsPage() {
  useEffect(() => {
    document.title = "Lab Reports - Lab Admin";
  }, []);

  const allReports = MOCK_REPORTS; // use mock data instead of hook
  const detailPanelRef = useRef(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // for dropdown
  const [activeTab, setActiveTab] = useState("all"); // for quick tabs
  const [testType, setTestType] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(true);

  // Sync tabs with dropdown (optional: keep both in sync)
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "all") setStatusFilter("all");
    else if (tab === "pending") setStatusFilter("Pending");
    else if (tab === "in-progress") setStatusFilter("In Progress");
    else if (tab === "completed") setStatusFilter("Completed");
    setPage(1);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    if (value === "all") setActiveTab("all");
    else if (value === "Pending") setActiveTab("pending");
    else if (value === "In Progress") setActiveTab("in-progress");
    else if (value === "Completed") setActiveTab("completed");
    else setActiveTab("all");
    setPage(1);
  };

  useEffect(() => {
    if (allReports.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !allReports.some((report) => report.id === selectedId)) {
      setSelectedId(allReports[0].id);
    }
  }, [allReports, selectedId]);

  const testTypes = useMemo(() =>
    Array.from(new Set(allReports.map((r) => r.testType))).sort(),
    [allReports]);

  const filtered = useMemo(() => {
    return allReports.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (testType !== "all" && r.testType !== testType) return false;
      if (from && r.sampleDate < from) return false;
      if (to && r.sampleDate > to) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !r.id.toLowerCase().includes(q) &&
          !r.patientName.toLowerCase().includes(q) &&
          !r.testName.toLowerCase().includes(q) &&
          !r.doctor.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [allReports, from, query, statusFilter, testType, to]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selected = allReports.find((r) => r.id === selectedId) ?? null;

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      total: allReports.length,
      today: allReports.filter((r) => r.sampleDate === today).length,
      pending: allReports.filter((r) => r.status === "Pending").length,
      completed: allReports.filter((r) => r.status === "Completed").length,
    };
  }, [allReports]);

  function clearFilters() {
    setQuery("");
    setStatusFilter("all");
    setActiveTab("all");
    setTestType("all");
    setFrom("");
    setTo("");
    setPage(1);
    toast.success("Report filters cleared.");
  }

  function hasActiveFilters() {
    return query || statusFilter !== "all" || testType !== "all" || from || to;
  }

  function exportCsv() {
    if (filtered.length === 0) {
      toast.info("There are no report rows to export.");
      return;
    }

    const header = [
      "Report ID",
      "Patient Name",
      "Patient ID",
      "Age",
      "Gender",
      "Test Name",
      "Test Type",
      "Doctor",
      "Doctor Specialty",
      "Sample Date",
      "Report Date",
      "Status",
      "Notes",
    ];

    const rows = filtered.map((report) => [
      report.id,
      report.patientName,
      report.patientId,
      report.patientAge,
      report.patientGender,
      report.testName,
      report.testType,
      report.doctor,
      report.doctorSpecialty,
      report.sampleDate,
      report.reportDate,
      report.status,
      report.notes ?? "",
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => toCsvValue(cell)).join(","))
      .join("\n");

    downloadBlob([csv], `lab-reports-${new Date().toISOString().split('T')[0]}.csv`, "text/csv;charset=utf-8");
    toast.success(`Exported ${filtered.length} report${filtered.length === 1 ? "" : "s"} to CSV.`);
  }

  function focusReport(report) {
    setSelectedId(report.id);
    detailPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function copyReportId(id) {
    navigator.clipboard.writeText(id);
    toast.success("Report ID copied to clipboard");
  }

  function downloadReport(report) {
    const firstAttachment = report.attachments?.[0];
    if (firstAttachment?.mimetype === "application/pdf") {
      const anchor = document.createElement("a");
      anchor.href = firstAttachment.path;
      anchor.download = firstAttachment.originalName || `${report.id}.pdf`;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.click();
      toast.success(`Downloaded PDF for ${report.id}.`);
      return;
    }

    const pdf = new jsPDF();
    const left = 16;
    const right = 194;
    let y = 18;

    const writeLine = (label, value) => {
      const lines = pdf.splitTextToSize(`${label}: ${value}`, right - left);
      pdf.text(lines, left, y);
      y += lines.length * 7;
    };

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.setTextColor(41, 128, 185);
    pdf.text("Laboratory Report", left, y);
    y += 8;

    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, left, y);
    y += 12;

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");

    pdf.setDrawColor(200, 200, 200);
    pdf.setFillColor(245, 245, 245);
    pdf.rect(left, y - 4, right - left, 8, 'F');
    writeLine("Report ID", report.id);
    y += 4;

    writeLine("Patient", `${report.patientName} (${report.patientId})`);
    writeLine("Age / Gender", `${report.patientAge} / ${report.patientGender}`);
    y += 4;

    writeLine("Test", report.testName);
    writeLine("Type", report.testType);
    y += 4;

    writeLine("Doctor", `${report.doctor} (${report.doctorSpecialty})`);
    writeLine("Sample Date", report.sampleDate);
    writeLine("Report Date", report.reportDate);
    writeLine("Status", report.status);
    writeLine("Notes", report.notes || "N/A");

    y += 8;
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(41, 128, 185);
    pdf.text("History Timeline", left, y);
    y += 8;
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);

    for (const entry of report.history) {
      const lines = pdf.splitTextToSize(`• ${entry.date}: ${entry.event}`, right - left);
      if (y + lines.length * 7 > 280) {
        pdf.addPage();
        y = 18;
      }
      pdf.text(lines, left, y);
      y += lines.length * 7;
    }

    if (firstAttachment && firstAttachment.mimetype.startsWith("image/")) {
      if (y > 250) {
        pdf.addPage();
        y = 18;
      }
      y += 4;
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(41, 128, 185);
      pdf.text("Attachment", left, y);
      y += 8;
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);
      writeLine("Uploaded File", firstAttachment.originalName);
    }

    pdf.save(`${report.id}-${report.patientName.replace(/\s/g, '')}.pdf`);
    toast.success(`Downloaded PDF for ${report.id}.`);
  }

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
          label="Total Reports"
          value={stats.total}
          icon={<FileText className="size-5" />}
          hint="All-time records"
          trend={{ value: "+12%", direction: "up" }}
          className="shadow-sm hover:shadow-md transition-shadow duration-200"
        />
        <StatCard
          label="Reports Today"
          value={stats.today}
          icon={<Calendar className="size-5" />}
          tone="info"
          hint="Samples collected today"
          className="shadow-sm hover:shadow-md transition-shadow duration-200"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={<Clock className="size-5" />}
          tone="warning"
          hint="Awaiting processing"
          className="shadow-sm hover:shadow-md transition-shadow duration-200"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={<CheckCircle2 className="size-5" />}
          tone="success"
          hint="Released to patient"
          trend={{ value: "98% SLA", direction: "up" }}
          className="shadow-sm hover:shadow-md transition-shadow duration-200"
        />
      </div>

      {/* Quick Tab Navigation */}
      <div className="flex gap-1 border-b border-gray-200">
        {[
          { key: "all", label: "All Reports" },
          { key: "pending", label: "Pending" },
          { key: "in-progress", label: "In Progress" },
          { key: "completed", label: "Completed" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-5 py-2 text-sm font-medium rounded-t-lg transition-all ${activeTab === tab.key
                ? "bg-[#0B4B34] text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

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
                <Search
                  className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  strokeWidth={1.75}
                />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by ID, patient, test, or doctor..."
                  className={inputCls + " pl-9 pr-4 py-2 text-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20"}
                />
              </div>
            </div>
          </div>

          {/* Advanced Filter Section */}
          {filtersOpen && (
            <div className="px-6 py-5 border-b border-border bg-secondary/10 transition-all duration-300 ease-in-out">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Field label="Status">
                  <select
                    value={statusFilter}
                    onChange={(e) => handleStatusFilterChange(e.target.value)}
                    className={selectCls + " transition-all duration-200 focus:ring-2 focus:ring-primary/20"}
                  >
                    <option value="all">All statuses</option>
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                </Field>
                <Field label="Test Type">
                  <select
                    value={testType}
                    onChange={(e) => {
                      setTestType(e.target.value);
                      setPage(1);
                    }}
                    className={selectCls + " transition-all duration-200 focus:ring-2 focus:ring-primary/20"}
                  >
                    <option value="all">All types</option>
                    {testTypes.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Sample From">
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className={inputCls + " transition-all duration-200 focus:ring-2 focus:ring-primary/20"}
                  />
                </Field>
                <Field label="Sample To">
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className={inputCls + " transition-all duration-200 focus:ring-2 focus:ring-primary/20"}
                  />
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
                  <th className="px-4 py-4 first:pl-6 last:pr-6">Report ID</th>
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
                    <td colSpan={7} className="px-6 py-12">
                      <EmptyState
                        title="No reports match your filters"
                        hint="Try adjusting your search criteria or clearing filters"
                        icon={<Search className="size-12 text-muted-foreground/40" />}
                      />
                    </td>
                  </tr>
                )}
                {pageRows.map((r) => {
                  const active = r.id === selectedId;
                  const initials = r.patientName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
                  return (
                    <tr
                      key={r.id}
                      onClick={() => focusReport(r)}
                      className={`
                        cursor-pointer border-b border-gray-100 transition-colors duration-150 hover:bg-gray-50
                        ${active ? 'bg-emerald-50/50' : ''}
                      `}
                    >
                      <td className="px-4 py-4 pl-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[12px] font-semibold text-primary">{r.id}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyReportId(r.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity"
                            aria-label="Copy ID"
                          >
                            <Copy className="size-3" />
                          </button>
                        </div>
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
                        <div className="text-foreground">{r.testName}</div>
                        <div className="text-[11px] text-muted-foreground">{r.testType}</div>
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
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            focusReport(r);
                          }}
                          className="text-primary hover:text-primary/80 text-[12px] font-medium transition-colors duration-150 hover:underline"
                        >
                          View Details →
                        </button>
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
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="size-8 rounded-md border border-border bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary transition-all duration-200 flex items-center justify-center shadow-sm"
              >
                <ChevronLeft className="size-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  if (pageNum > 0 && pageNum <= totalPages) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`min-w-[32px] h-8 px-2 rounded-md text-[13px] font-medium transition-all duration-200 ${page === pageNum
                            ? 'bg-[#0B4B34] text-white shadow-sm'
                            : 'hover:bg-secondary text-foreground'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  return null;
                })}
              </div>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="size-8 rounded-md border border-border bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary transition-all duration-200 flex items-center justify-center shadow-sm"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </Card>

        {/* Detail Panel */}
        <aside ref={detailPanelRef} className="xl:sticky xl:top-24 h-fit">
          <Card className="p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            {!selected ? (
              <div className="py-12">
                <EmptyState
                  title="Select a report"
                  hint="Click on any report row to view detailed information"
                  icon={<FileText className="size-12 text-muted-foreground/40" />}
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-3 pb-5 border-b border-border">
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-2">
                      <FileText className="size-3" />
                      Report Details
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-xl font-bold text-foreground font-mono">{selected.id}</div>
                      <button
                        onClick={() => copyReportId(selected.id)}
                        className="p-1 hover:bg-secondary rounded-md transition-colors"
                        aria-label="Copy ID"
                      >
                        <Copy className="size-3.5 text-muted-foreground hover:text-primary" />
                      </button>
                    </div>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>

                <div className="space-y-6">
                  <DetailGroup title="Patient Information" icon={<User className="size-3" />}>
                    <Row k="Full Name" v={selected.patientName} />
                    <Row k="Patient ID" v={selected.patientId} />
                    <Row k="Age / Gender" v={`${selected.patientAge} years • ${selected.patientGender}`} />
                  </DetailGroup>

                  <DetailGroup title="Test Details" icon={<Activity className="size-3" />}>
                    <Row k="Test Name" v={selected.testName} />
                    <Row k="Test Type" v={selected.testType} />
                    <Row k="Sample Date" v={selected.sampleDate} />
                    <Row k="Report Date" v={selected.reportDate} />
                  </DetailGroup>

                  <DetailGroup title="Referring Doctor" icon={<Stethoscope className="size-3" />}>
                    <Row k="Doctor Name" v={selected.doctor} />
                    <Row k="Specialty" v={selected.doctorSpecialty} />
                  </DetailGroup>

                  <div className="flex gap-3 pt-2">
                    <Button className="flex-1" onClick={() => downloadReport(selected)}>
                      <Download className="size-4 mr-2" /> Download PDF
                    </Button>
                    <Button variant="outline" onClick={() => window.print()} className="flex-1">
                      <Printer className="size-4 mr-2" /> Print
                    </Button>
                  </div>

                  <DetailGroup title="History Timeline" icon={<Clock className="size-3" />}>
                    <div className="relative">
                      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
                      <div className="space-y-4">
                        {selected.history.map((h, i) => (
                          <div key={i} className="relative pl-6">
                            <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-primary/10" />
                            <div className="text-[13px] font-medium text-foreground">{h.event}</div>
                            <div className="text-[11px] text-muted-foreground tabular-nums mt-0.5">{h.date}</div>
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