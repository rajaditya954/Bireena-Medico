import { useEffect, useMemo, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import {
  FileText, Clock, CheckCircle2, AlertCircle, Download, Filter, ChevronLeft, ChevronRight, Search,
} from "lucide-react";
import { Button, Card, EmptyState, Field, inputCls, SectionHeader, selectCls, StatCard, StatusBadge } from "../../components/lab/ui";
import { downloadBlob, toCsvValue } from "../../lib/utils";
import { useReports, reportsStore } from "../../lib/reports-store";

const PAGE_SIZE = 6;

export default function LabReportsPage() {
  useEffect(() => {
    document.title = "Lab Reports - Lab Admin";
    reportsStore.fetchAll();
  }, []);

  const allReports = useReports();
  const detailPanelRef = useRef(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [testType, setTestType] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(true);

  useEffect(() => {
    if (allReports.length === 0) {
      setSelectedId(null);
      return;
    }

    if (!selectedId || !allReports.some((report) => report.id === selectedId)) {
      setSelectedId(allReports[0].id);
    }
  }, [allReports, selectedId]);

  const testTypes = useMemo(() => Array.from(new Set(allReports.map((r) => r.testType))), [allReports]);

  const filtered = useMemo(() => {
    return allReports.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
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
  }, [allReports, from, query, status, testType, to]);

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
    setStatus("all");
    setTestType("all");
    setFrom("");
    setTo("");
    setPage(1);
    toast.success("Report filters cleared.");
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

    downloadBlob([csv], "lab-reports.csv", "text/csv;charset=utf-8");
    toast.success(`Exported ${filtered.length} report${filtered.length === 1 ? "" : "s"} to CSV.`);
  }

  function focusReport(report) {
    setSelectedId(report.id);
    detailPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    pdf.setFontSize(18);
    pdf.text("Laboratory Report Summary", left, y);
    y += 10;

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    writeLine("Report ID", report.id);
    writeLine("Patient", `${report.patientName} (${report.patientId})`);
    writeLine("Age / Gender", `${report.patientAge} / ${report.patientGender}`);
    writeLine("Test", report.testName);
    writeLine("Type", report.testType);
    writeLine("Doctor", `${report.doctor} (${report.doctorSpecialty})`);
    writeLine("Sample Date", report.sampleDate);
    writeLine("Report Date", report.reportDate);
    writeLine("Status", report.status);
    writeLine("Notes", report.notes || "N/A");

    y += 4;
    pdf.setFont("helvetica", "bold");
    pdf.text("History", left, y);
    y += 8;
    pdf.setFont("helvetica", "normal");

    for (const entry of report.history) {
      const lines = pdf.splitTextToSize(`- ${entry.date}: ${entry.event}`, right - left);
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
      pdf.setFont("helvetica", "bold");
      pdf.text("Attachment", left, y);
      y += 8;
      pdf.setFont("helvetica", "normal");
      writeLine("Uploaded File", firstAttachment.originalName);
    }

    pdf.save(`${report.id}.pdf`);
    toast.success(`Downloaded PDF for ${report.id}.`);
  }

  return (
    <div className="min-h-screen bg-[#F2F9F6] -mx-4 -mt-4 p-4 sm:-mx-6 sm:-mt-6 sm:p-6 lg:-mx-8 lg:-mt-8 lg:p-8">
      <SectionHeader
        title="Lab Reports"
        subtitle="Monitor diagnostic reports across patients, doctors and test categories."
        action={
          <>
            <Button variant="outline" onClick={() => setFiltersOpen((open) => !open)}>
              <Filter className="size-4" /> {filtersOpen ? "Hide Filters" : "Show Filters"}
            </Button>
            <Button onClick={exportCsv}>
              <Download className="size-4" /> Export CSV
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Reports" value={stats.total} icon={<FileText className="size-5" />} hint="All-time records" trend={{ value: "+12%", direction: "up" }} />
        <StatCard label="Reports Today" value={stats.today} icon={<Clock className="size-5" />} tone="info" hint="Samples collected today" />
        <StatCard label="Pending" value={stats.pending} icon={<AlertCircle className="size-5" />} tone="warning" hint="Awaiting processing" />
        <StatCard label="Completed" value={stats.completed} icon={<CheckCircle2 className="size-5" />} tone="success" hint="Released to patient" trend={{ value: "98% SLA", direction: "up" }} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3 flex-wrap bg-white">
            <div>
              <h2 className="font-semibold text-[#0f281e] text-[15px]">Reports</h2>
              <p className="text-xs text-slate-500 mt-0.5">{filtered.length} matching records</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search
                className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                strokeWidth={1.75}
              />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search report, patient, test..."
                className={inputCls + " pl-9"}
              />
            </div>
          </div>

          {filtersOpen && (
            <div className="px-5 py-4 border-b border-border bg-gray-50/50">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Field label="Status">
                  <select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      setPage(1);
                    }}
                    className={selectCls}
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
                    className={selectCls}
                  >
                    <option value="all">All types</option>
                    {testTypes.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Field>
                <Field label="From">
                  <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
                </Field>
                <Field label="To">
                  <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} />
                </Field>
              </div>
              <div className="flex justify-end mt-4">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto bg-white">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {["Report", "Patient", "Test", "Doctor", "Sample", "Report", "Status", ""].map((h, i) => (
                    <th key={i} className="px-5 py-4 first:pl-6 last:pr-6">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={8}>
                      <EmptyState
                        title="No reports match your filters"
                        hint="Try clearing the date range or status."
                        icon={<Search className="size-5" />}
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
                      className={`cursor-pointer transition-colors duration-150 hover:bg-gray-50 ${active ? "bg-emerald-50/50" : ""}`}
                    >
                      <td className="px-5 py-4 pl-6 font-mono text-[13px] text-[#0B4B34] font-medium">{r.id}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-lg bg-[#d1f4e0] text-[#0B4B34] font-bold text-xs flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="text-[#0f281e] font-bold text-[13px]">{r.patientName.toUpperCase()}</div>
                            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                              {r.patientAge}Y • {r.patientGender}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-[#0f281e] font-medium">{r.testName}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{r.testType}</div>
                      </td>
                      <td className="px-5 py-4 text-[#0f281e] font-medium">{r.doctor}</td>
                      <td className="px-5 py-4 text-slate-500 text-[12px] tabular-nums font-medium">{r.sampleDate}</td>
                      <td className="px-5 py-4 text-slate-500 text-[12px] tabular-nums font-medium">{r.reportDate}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-5 py-4 pr-6 text-right">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            focusReport(r);
                          }}
                          className="text-[#0B4B34] hover:underline text-[13px] font-semibold"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-white text-[13px] text-slate-500">
            <span>
              Showing <span className="text-[#0f281e] font-medium">{pageRows.length}</span> of{" "}
              <span className="text-[#0f281e] font-medium">{filtered.length}</span> reports
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="size-8 rounded-lg border border-gray-200 bg-white grid place-items-center disabled:opacity-40 hover:bg-gray-50 transition"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="text-[#0f281e] font-medium tabular-nums px-2">
                {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="size-8 rounded-lg border border-gray-200 bg-white grid place-items-center disabled:opacity-40 hover:bg-gray-50 transition"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </Card>

        <aside ref={detailPanelRef} className="xl:sticky xl:top-24 h-fit">
          <Card className="p-6 bg-white">
            {!selected ? (
              <EmptyState title="Select a report" hint="Click any row to see details." />
            ) : (
              <>
                <div className="flex items-start justify-between gap-3 mb-6 pb-6 border-b border-gray-100">
                  <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                      Report
                    </div>
                    <div className="text-2xl font-bold text-[#0f281e] mt-1 font-mono">{selected.id}</div>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>

                <div className="space-y-6">
                  <DetailGroup title="Patient information">
                    <Row k="Name" v={selected.patientName} />
                    <Row k="Patient ID" v={selected.patientId} />
                    <Row
                      k="Age / Gender"
                      v={`${selected.patientAge} years - ${selected.patientGender}`}
                    />
                  </DetailGroup>

                  <DetailGroup title="Test details">
                    <Row k="Test" v={selected.testName} />
                    <Row k="Type" v={selected.testType} />
                    <Row k="Sample date" v={selected.sampleDate} />
                    <Row k="Report date" v={selected.reportDate} />
                  </DetailGroup>

                  <DetailGroup title="Referring doctor">
                    <Row k="Doctor" v={selected.doctor} />
                    <Row k="Specialty" v={selected.doctorSpecialty} />
                  </DetailGroup>

                  <Button className="w-full mt-2" onClick={() => downloadReport(selected)}>
                    <Download className="size-4" /> Download Report
                  </Button>

                  <DetailGroup title="Report history">
                    <ol className="relative border-l-2 border-gray-100 ml-2 space-y-4">
                      {selected.history.map((h, i) => (
                        <li key={i} className="pl-5 relative">
                          <span className="absolute -left-[5px] top-1.5 size-2.5 rounded-full bg-[#0B4B34] ring-4 ring-white" />
                          <div className="text-sm text-[#0f281e] font-semibold">{h.event}</div>
                          <div className="text-xs text-slate-500 tabular-nums mt-0.5">{h.date}</div>
                        </li>
                      ))}
                    </ol>
                  </DetailGroup>
                </div>
              </>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}

function DetailGroup({ title, children }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
        {title}
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-slate-500 font-medium">{k}</span>
      <span className="text-[#0f281e] font-bold text-right">{v}</span>
    </div>
  );
}
