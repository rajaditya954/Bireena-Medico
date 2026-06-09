import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { CheckCircle2, FileText, ImageIcon, UploadCloud, X } from "lucide-react";
import { Button, Card, Field, inputCls, SectionHeader, selectCls, textareaCls } from "../../components/lab/ui";
import { useReports } from "../../lib/reports-store";
import { uploadReportRecord } from "../../lib/api";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

export default function UploadReportPage() {
  useEffect(() => {
    document.title = "Upload Report - Lab Admin";
  }, []);

  const allReports = useReports();
  const pendingRecords = allReports.filter(r => r.status !== "Completed");

  const [recordId, setRecordId] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Completed");
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (pendingRecords.length === 0) {
      setRecordId("");
      return;
    }

    if (!recordId || !pendingRecords.some((record) => record.id === recordId)) {
      setRecordId(pendingRecords[0].id);
    }
  }, [pendingRecords, recordId]);

  function addFiles(list) {
    if (!list) return;
    const incoming = Array.from(list);
    const validFiles = [];

    for (const file of incoming) {
      const isAllowed = file.type === "application/pdf" || file.type.startsWith("image/");
      if (!isAllowed) {
        toast.error(`${file.name} is not a supported file type.`);
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
  }

  async function startUpload() {
    if (files.length === 0 || !recordId) return;
    setSuccess(false);
    setErrorMessage("");
    setFiles((current) => current.map((file) => ({ ...file, progress: 0, done: false })));
    setUploading(true);
    try {
      await uploadReportRecord({
        recordId,
        status,
        notes,
        files: files.map((file) => file.file),
        onProgress: (progress) => {
          setFiles((current) =>
            current.map((file) => ({
              ...file,
              progress,
              done: progress >= 100,
            }))
          );
        },
      });
      setFiles((current) => current.map((file) => ({ ...file, progress: 100, done: true })));
      setSuccess(true);
      toast.success("Report uploaded successfully.");
      setNotes("");
      if (status === "Completed") {
        setFiles([]);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed.";
      setErrorMessage(message);
      setFiles((current) => current.map((file) => ({ ...file, progress: 0, done: false })));
      toast.error(message);
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
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  const record = pendingRecords.find((item) => item.id === recordId);

  return (
    <div className="min-h-screen bg-[#F2F9F6] -mx-4 -mt-4 p-4 sm:-mx-6 sm:-mt-6 sm:p-6 lg:-mx-8 lg:-mt-8 lg:p-8 space-y-6">
      <SectionHeader
        title="Upload Report"
        subtitle="Attach signed PDF reports or scanned images to a pending laboratory record."
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <Field label="Pending Record">
              <select className={selectCls} value={recordId} onChange={(event) => setRecordId(event.target.value)}>
                {pendingRecords.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.id} - {item.patientName} - {item.testName}
                  </option>
                ))}
              </select>
            </Field>
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
              {uploading ? "Uploading..." : "Upload Report"}
            </Button>
          </div>
        </Card>

        <aside className="xl:sticky xl:top-24 h-fit">
          <Card className="p-5">
            <div className="text-[10px] uppercase tracking-[0.1em] font-semibold text-muted-foreground">
              Selected Record
            </div>
            {record ? (
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
