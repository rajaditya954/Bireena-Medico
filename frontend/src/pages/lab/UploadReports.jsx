import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { CheckCircle2, FileText, ImageIcon, UploadCloud, X, Plus, Edit3 } from "lucide-react";
import { Button, Card, Field, inputCls, SectionHeader, selectCls, textareaCls } from "../../components/lab/ui";
import { useReports, reportsStore } from "../../lib/reports-store";
import { labApi } from "../../services/labService";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

export default function UploadReportPage() {
  useEffect(() => {
    document.title = "Upload Report - Lab Admin";
  }, []);

  useEffect(() => {
    reportsStore.fetchAll();
  }, []);

  const allReports = useReports();
  const pendingRecords = allReports.filter(r => r.status !== "Completed" || !r.attachments?.length);

  const [mode, setMode] = useState("update");
  const [recordId, setRecordId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [testId, setTestId] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Completed");
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef(null);

  const [patients, setPatients] = useState([]);
  const [tests, setTests] = useState([]);
  const [extractedFields, setExtractedFields] = useState(null);

  useEffect(() => {
    labApi.getTests().then((t) => {
      console.log("[Upload] Tests loaded:", t.length);
      setTests(t);
    }).catch(e => {
      console.error("[Upload] Tests fetch error:", e);
      toast.error("Failed to load tests: " + e.message);
    });
  }, []);

  useEffect(() => {
    if (mode !== "create") return;
    labApi.getPatients().then((p) => {
      console.log("[Upload] Patients loaded:", p.length);
      setPatients(p);
    }).catch(e => {
      console.error("[Upload] Patients fetch error:", e);
      toast.error("Failed to load patients: " + e.message);
    });
  }, [mode]);

  useEffect(() => {
    if (pendingRecords.length === 0) {
      setRecordId("");
      return;
    }
    if (!recordId || !pendingRecords.some((record) => record.id === recordId)) {
      setRecordId(pendingRecords[0].id);
    }
  }, [pendingRecords, recordId]);

  async function addFiles(list) {
    if (!list) return;
    const incoming = Array.from(list);
    const validFiles = [];

    for (const file of incoming) {
      const isAllowed = file.type === "application/pdf" || file.type.startsWith("image/") || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.type === "text/plain";
      if (!isAllowed) {
        toast.error(`${file.name} is not a supported file type. Use PDF, DOCX, or images.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is larger than 20 MB.`);
        continue;
      }
      validFiles.push({ file, progress: 0, done: false });
    }

    if (validFiles.length === 0) return;

    setErrorMessage("");
    setSuccess(false);
    setFiles((current) => {
      const existing = new Set(
        current.map((entry) => `${entry.file.name}:${entry.file.size}:${entry.file.lastModified}`)
      );
      const deduped = validFiles.filter(
        (entry) => !existing.has(`${entry.file.name}:${entry.file.size}:${entry.file.lastModified}`)
      );
      if (deduped.length < validFiles.length) {
        toast.info("Duplicate files were skipped.");
      }
      return [...current, ...deduped];
    });
    if (inputRef.current) {
      inputRef.current.value = "";
    }

    if (mode === "create" && validFiles.length > 0) {
      const file = validFiles[0].file;
      toast.info("Extracting report details...");
      try {
        const fields = await labApi.extractReport(file);
        console.log("[Upload] Extracted fields:", fields);
        setExtractedFields(fields);

        if (fields.patientName) {
          const match = patients.find(p =>
            p.fullName?.toLowerCase().includes(fields.patientName.toLowerCase()) ||
            p.patientId?.toLowerCase() === fields.patientId?.toLowerCase()
          );
          if (match) {
            setPatientId(match._id);
            toast.success(`Matched patient: ${match.fullName}`);
          } else if (fields.patientName) {
            toast.info(`Patient "${fields.patientName}" found in report. Select from dropdown.`);
          }
        }

        if (fields.testName) {
          const match = tests.find(t =>
            t.name?.toLowerCase().includes(fields.testName.toLowerCase())
          );
          if (match) {
            setTestId(match.id);
            toast.success(`Matched test: ${match.name}`);
          } else if (fields.testName) {
            toast.info(`Test "${fields.testName}" found in report. Select from dropdown.`);
          }
        }

        if (fields.findings || fields.impression) {
          const summary = [fields.findings, fields.impression].filter(Boolean).join("\n\n");
          setNotes(summary);
        }
      } catch (e) {
        console.error("[Upload] Extraction failed:", e);
        toast.warning("Could not extract details from file. Please fill manually.");
      }
    }
  }

  async function startUpload() {
    console.log("[Upload] startUpload called", { mode, files: files.length, patientId, testId, recordId });
    if (files.length === 0) {
      toast.warning("Please select a file to upload.");
      return;
    }
    if (mode === "update" && !recordId) {
      toast.warning("Please select a pending record.");
      return;
    }
    if (mode === "create" && (!patientId || !testId)) {
      toast.error("Please select both patient and test.");
      return;
    }

    setSuccess(false);
    setErrorMessage("");
    setFiles((current) => current.map((file) => ({ ...file, progress: 0, done: false })));
    setUploading(true);
    
    toast.info(mode === "create" ? "Creating new report..." : "Uploading to existing record...");
    
    try {
      const file = files[0]?.file;
      console.log("[Upload] File:", file?.name, file?.size, file?.type);

      setFiles((current) => current.map((f) => ({ ...f, progress: 50, done: false })));

      const formData = new FormData();
      if (file) formData.append("reportFile", file);
      formData.append("status", status === "Completed" ? "COMPLETED" : status === "In Progress" ? "IN_PROGRESS" : "PENDING");
      if (notes) formData.append("remarks", notes);

      if (mode === "update") {
        const rawRecord = allReports.find(r => r.id === recordId)?._raw;
        const mongoId = rawRecord?._id;
        console.log("[Upload] Update mode, mongoId:", mongoId);
        if (!mongoId) throw new Error("Could not find report ID");
        await labApi.updateReport(mongoId, formData);
      } else {
        formData.append("patientId", patientId);
        formData.append("tests", testId);
        formData.append("sampleDate", new Date().toISOString());
        formData.append("reportDate", new Date().toISOString());
        if (extractedFields?.findings) formData.append("findings", extractedFields.findings);
        console.log("[Upload] Create mode, calling createReport...");
        await labApi.createReport(formData);
      }

      console.log("[Upload] Success!");
      setFiles((current) => current.map((f) => ({ ...f, progress: 100, done: true })));
      setSuccess(true);
      toast.success(mode === "create" ? "✓ New report created successfully!" : "✓ Report uploaded successfully!");
      setNotes("");
      reportsStore.fetchAll();
      if (status === "Completed") {
        setFiles([]);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }
    } catch (error) {
      console.error("[Upload] Error:", error);
      const message = error instanceof Error ? error.message : "Upload failed.";
      setErrorMessage(message);
      setFiles((current) => current.map((f) => ({ ...f, progress: 0, done: false })));
      toast.error("✗ " + message);
    } finally {
      setUploading(false);
    }
  }

  function reset() {
    setFiles([]);
    setNotes("");
    setStatus("Completed");
    setSuccess(false);
    setErrorMessage("");
    setPatientId("");
    setTestId("");
    setExtractedFields(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  const record = pendingRecords.find((item) => item.id === recordId);

  return (
    <div className="min-h-screen bg-[#F2F9F6] -mx-4 -mt-4 p-4 sm:-mx-6 sm:-mt-6 sm:p-6 lg:-mx-8 lg:-mt-8 lg:p-8 space-y-6">
      <SectionHeader
        title="Upload Report"
        subtitle="Attach signed PDF reports or scanned images to a pending record, or create a new one."
      />

      <div className="flex gap-2 mb-2">
        <button
          onClick={() => { 
            setMode("update"); 
            reset(); 
            toast.info("Switched to Upload to Existing mode");
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${mode === "update" ? "bg-primary text-white shadow" : "bg-white text-foreground border border-border hover:bg-secondary"}`}
        >
          <Edit3 className="size-4" /> Upload to Existing
        </button>
        <button
          onClick={() => { 
            setMode("create"); 
            reset(); 
            toast.info("Switched to Create New Report mode");
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${mode === "create" ? "bg-primary text-white shadow" : "bg-white text-foreground border border-border hover:bg-secondary"}`}
        >
          <Plus className="size-4" /> Create New Report
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {mode === "update" ? (
              <Field label="Pending Record">
                <select className={selectCls} value={recordId} onChange={(event) => setRecordId(event.target.value)}>
                  {pendingRecords.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.id} - {item.patientName} - {item.testName}
                    </option>
                  ))}
                </select>
              </Field>
            ) : (
              <>
                <Field label="Patient">
                  <select className={selectCls} value={patientId} onChange={(e) => setPatientId(e.target.value)}>
                    <option value="">Select patient</option>
                    {patients.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.fullName || p.name} ({p.patientId})
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Test">
                  <select className={selectCls} value={testId} onChange={(e) => setTestId(e.target.value)}>
                    <option value="">Select test</option>
                    {tests.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.category})
                      </option>
                    ))}
                  </select>
                </Field>
              </>
            )}

            {extractedFields && (
              <div className="col-span-full bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                <div className="font-medium text-blue-800 mb-1">Auto-extracted from document:</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-blue-700">
                  {extractedFields.patientName && <span>Patient: {extractedFields.patientName}</span>}
                  {extractedFields.doctor && <span>Doctor: {extractedFields.doctor}</span>}
                  {extractedFields.testName && <span>Test: {extractedFields.testName}</span>}
                  {extractedFields.reportId && <span>Report: {extractedFields.reportId}</span>}
                  {extractedFields.age && <span>Age: {extractedFields.age}</span>}
                  {extractedFields.gender && <span>Gender: {extractedFields.gender}</span>}
                  {extractedFields.examDate && <span>Exam: {extractedFields.examDate}</span>}
                </div>
              </div>
            )}
            <Field label="Mark report status as">
              <select className={selectCls} value={status} onChange={(event) => setStatus(event.target.value)}>
                <option>Completed</option>
                <option>In Progress</option>
                <option>Pending</option>
              </select>
            </Field>
          </div>

          <Field label="Clinical notes" hint="Optional - share interpretation or abnormal flags for the doctor.">
            <textarea
              rows={3}
              className={textareaCls}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add interpretation, abnormal flags, or remarks for the doctor..."
            />
          </Field>

          <div className="mt-6">
            <div className="text-xs font-medium text-foreground/80 mb-2">Report files</div>
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragOver(false);
                addFiles(event.dataTransfer.files);
              }}
              onClick={() => inputRef.current?.click()}
              className={`rounded-2xl border-2 border-dashed cursor-pointer transition-all px-6 py-12 text-center ${dragOver
                  ? "border-primary bg-primary/5"
                  : "border-border bg-secondary/40 hover:bg-secondary hover:border-primary/30"
                }`}
            >
              <div className="size-14 mx-auto rounded-2xl bg-primary/10 text-primary grid place-items-center mb-3">
                <UploadCloud className="size-6" />
              </div>
              <div className="font-medium text-foreground">Drag & drop reports here</div>
              <div className="text-[12px] text-muted-foreground mt-1">PDF, PNG, JPG up to 20 MB each</div>
              <button type="button" className="mt-4 text-[13px] font-medium text-primary hover:underline">
                or browse files
              </button>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept="application/pdf,image/*"
                className="hidden"
                onChange={(event) => addFiles(event.target.files)}
              />
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-5 space-y-2">
              {files.map((fileEntry, index) => {
                const isImage = fileEntry.file.type.startsWith("image/");
                return (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-border">
                    <div className="size-10 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                      {isImage ? <ImageIcon className="size-5" /> : <FileText className="size-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <span className="text-sm font-medium text-foreground truncate">
                          {fileEntry.file.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground shrink-0 tabular-nums">
                          {(fileEntry.file.size / 1024).toFixed(0)} KB
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${fileEntry.done ? "bg-[color:var(--success)]" : "bg-primary"
                            }`}
                          style={{ width: `${fileEntry.progress}%` }}
                        />
                      </div>
                    </div>
                    {fileEntry.done ? (
                      <CheckCircle2 className="size-5 text-[color:var(--success)] shrink-0" />
                    ) : (
                      <button
                        aria-label="Remove file"
                        onClick={(event) => {
                          event.stopPropagation();
                          setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
                        }}
                        className="size-8 grid place-items-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition shrink-0"
                      >
                        <X className="size-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {success && (
            <div className="mt-5 p-4 rounded-xl bg-[color:var(--success)]/10 text-[color:var(--success)] flex items-center gap-3 border border-[color:var(--success)]/20">
              <CheckCircle2 className="size-5" />
              <div className="text-sm font-medium">All files uploaded successfully.</div>
            </div>
          )}

          {errorMessage && (
            <div className="mt-5 p-4 rounded-xl bg-destructive/10 text-destructive flex items-center gap-3 border border-destructive/20">
              <X className="size-5" />
              <div className="text-sm font-medium">{errorMessage}</div>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-border flex justify-end gap-2">
            <Button variant="outline" onClick={reset}>
              Reset
            </Button>
            <Button onClick={startUpload} disabled={uploading || files.length === 0}>
              <UploadCloud className="size-4" />
              {uploading ? "Uploading..." : mode === "create" ? "Create & Upload" : "Upload Report"}
            </Button>
          </div>
        </Card>

        <aside className="xl:sticky xl:top-24 h-fit">
          <Card className="p-5">
            <div className="text-[10px] uppercase tracking-[0.1em] font-semibold text-muted-foreground">
              {mode === "update" ? "Selected Record" : "New Report"}
            </div>
            {mode === "update" ? (
              record ? (
                <>
                  <div className="text-lg font-semibold text-foreground mt-1 font-mono">
                    {record.id}
                  </div>
                  <div className="mt-4 space-y-2 text-[13px]">
                    <Row k="Patient" v={`${record.patientName} (${record.patientId})`} />
                    <Row k="Test" v={record.testName} />
                    <Row k="Type" v={record.testType} />
                    <Row k="Doctor" v={record.doctor} />
                    <Row k="Sample date" v={record.sampleDate} />
                    <Row k="Current status" v={record.status} />
                  </div>

                  <div className="mt-5 p-3.5 rounded-xl bg-primary/5 border border-primary/15 text-[12px] text-foreground/70 leading-relaxed">
                    After upload, this record will be marked as{" "}
                    <span className="font-semibold text-primary">{status}</span> and the patient
                    will be notified automatically.
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground mt-2">No pending records.</div>
              )
            ) : (
              <>
                <div className="text-sm text-muted-foreground mt-2">
                  {patientId ? `Patient: ${patients.find(p => p._id === patientId)?.fullName || patientId}` : "No patient selected"}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {testId ? `Test: ${tests.find(t => t.id === testId)?.name || testId}` : "No test selected"}
                </div>
                <div className="mt-5 p-3.5 rounded-xl bg-primary/5 border border-primary/15 text-[12px] text-foreground/70 leading-relaxed">
                  A new report record will be created and marked as{" "}
                  <span className="font-semibold text-primary">{status}</span>.
                </div>
              </>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-foreground font-medium text-right">{v}</span>
    </div>
  );
}
