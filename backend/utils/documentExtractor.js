import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export async function extractText(buffer, mimetype) {
  if (mimetype === "application/pdf") {
    const parser = new PDFParse({ verbosity: 0, data: buffer });
    const result = await parser.getText();
    parser.destroy();
    return result.text;
  }
  if (
    mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  if (mimetype === "text/plain") {
    return buffer.toString("utf-8");
  }
  throw new Error(`Unsupported file type: ${mimetype}`);
}

export function parseReportFields(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const fullText = lines.join("\n");

  const get = (pattern) => {
    const m = fullText.match(pattern);
    return m ? m[1].trim() : "";
  };

  const patientName =
    get(/Patient\s*Name\s*[:\-]\s*(.+)/i) ||
    get(/Patient\s*[:\-]\s*(.+)/i) ||
    get(/Name\s*[:\-]\s*(.+)/i);

  const patientId =
    get(/Patient\s*ID\s*[:\-]\s*(.+)/i) ||
    get(/UHID\s*[:\-]\s*(.+)/i) ||
    get(/MRN\s*[:\-]\s*(.+)/i);

  const ageGenderRaw =
    get(/Age\s*\/?\s*Gender\s*[:\-]\s*(.+)/i) ||
    get(/Age\s*[:\-]\s*(.+)/i) ||
    "";
  let age = "";
  let gender = "";
  const ageMatch = ageGenderRaw.match(/(\d+)/);
  if (ageMatch) age = ageMatch[1];
  const genderMatch = ageGenderRaw.match(/(Male|Female|Other)/i);
  if (genderMatch) gender = genderMatch[1];

  const doctor =
    get(/Referring\s*Doctor\s*[:\-]\s*(.+)/i) ||
    get(/Doctor\s*[:\-]\s*(.+)/i) ||
    get(/Physician\s*[:\-]\s*(.+)/i) ||
    get(/Dr\.\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);

  const reportId =
    get(/Report\s*ID\s*[:\-]\s*(.+)/i) ||
    get(/Lab\s*Report\s*[:\-]\s*(.+)/i) ||
    "";

  const examDate =
    get(/Exam\s*Date\s*[:\-]\s*(.+)/i) ||
    get(/Sample\s*Date\s*[:\-]\s*(.+)/i) ||
    get(/Date\s*of\s*(?:Collection|Exam|Sample)\s*[:\-]\s*(.+)/i) ||
    "";

  const reportDate =
    get(/Report\s*Date\s*[:\-]\s*(.+)/i) ||
    get(/Date\s*[:\-]\s*(.+)/i) ||
    "";

  const testName =
    get(/Modality\s*[:\-]\s*(.+)/i) ||
    get(/Test\s*(?:Name)?\s*[:\-]\s*(.+)/i) ||
    get(/Examination\s*[:\-]\s*(.+)/i) ||
    get(/Exam\s*[:\-]\s*(.+)/i) ||
    "";

  let findings = "";
  const findingsSection = fullText.match(
    /FINDINGS?\s*\n([\s\S]*?)(?=\n\s*(?:MEASUREMENT|IMPRESSION|CONCLUSION|RECOMMENDATION|RESULT|OBSERVATION|$))/i
  );
  if (findingsSection) {
    findings = findingsSection[1].trim();
  }

  let impression = "";
  const impressionSection = fullText.match(
    /IMPRESSION\s*\n([\s\S]*?)(?=\n\s*(?:Dr\.|Signature|Reg\.|$))/i
  );
  if (impressionSection) {
    impression = impressionSection[1].trim();
  }

  let measurements = [];
  const measSection = fullText.match(
    /MEASUREMENTS?\s*\n([\s\S]*?)(?=\n\s*(?:IMPRESSION|FINDING|CONCLUSION|Dr\.|$))/i
  );
  if (measSection) {
    const rawLines = measSection[1]
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.match(/^(Parameter|Normal Range|Status|[-=]+)/i));
    for (const line of rawLines) {
      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        measurements.push({
          parameter: parts.slice(0, Math.ceil(parts.length / 2)).join(" "),
          value: parts[Math.ceil(parts.length / 2)] || "",
          normalRange: parts.slice(Math.ceil(parts.length / 2) + 1, -1).join(" ") || "",
          status: parts[parts.length - 1] || "",
        });
      }
    }
  }

  let recommendations = "";
  const recSection = fullText.match(
    /RECOMMENDATIONS?\s*\n([\s\S]*?)(?=\n\s*(?:Dr\.|Signature|Reg\.|$))/i
  );
  if (recSection) {
    recommendations = recSection[1].trim();
  }

  return {
    patientName,
    patientId,
    age,
    gender,
    doctor,
    reportId,
    examDate,
    reportDate,
    testName,
    findings,
    impression,
    measurements,
    recommendations,
    rawText: fullText,
  };
}
