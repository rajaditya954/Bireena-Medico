const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_ORIGIN = BASE.replace(/\/api\/?$/, "");

const TOKEN_KEY = "aarogya_token";
const getToken = () => localStorage.getItem(TOKEN_KEY);

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  } else {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

function calcAge(dob) {
  if (!dob) return 0;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const STATUS_DISPLAY = {
  PENDING: "Pending",
  REQUESTED: "Requested",
  SAMPLE_COLLECTED: "Sample Collected",
  SAMPLE_RECEIVED: "Sample Received",
  IN_TESTING: "In Testing",
  IN_PROGRESS: "In Progress",
  READY: "Report Ready",
  UPLOADED: "Uploaded",
  VERIFIED: "Verified",
  APPROVED: "Completed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const PRIORITY_DISPLAY = {
  NORMAL: "Normal",
  URGENT: "Urgent",
  STAT: "STAT",
};

function formatStatus(status) {
  return STATUS_DISPLAY[status] || status;
}

function formatPriority(priority) {
  return PRIORITY_DISPLAY[priority] || priority || "Normal";
}

function transformReport(r) {
  const patient = r.patientId || {};
  const doctor = r.doctorId || {};
  const firstTest = r.tests?.[0] || {};

  // Build attachments array from both legacy reportFile and new attachments array
  let attachments = [];
  if (r.attachments && r.attachments.length > 0) {
    attachments = r.attachments.map((a) => ({
      originalName: a.originalName || a.filename || "report-file",
      filename: a.filename,
      mimetype: a.mimetype || "application/pdf",
      size: a.size || 0,
      path: a.path?.startsWith("http") ? a.path : `${API_ORIGIN}${a.path}`,
      category: a.category || "Report",
      uploadedAt: a.uploadedAt,
    }));
  } else if (r.reportFile) {
    attachments = [{
      originalName: "report-file",
      filename: r.reportFile,
      mimetype: r.reportFile.endsWith(".pdf") ? "application/pdf" : "image/png",
      size: 0,
      path: r.reportFile.startsWith("http") ? r.reportFile : `${API_ORIGIN}${r.reportFile}`,
      category: "Report",
      uploadedAt: r.createdAt,
    }];
  }

  return {
    id: r.reportId || r._id,
    patientName: patient.fullName || patient.name || "Unknown",
    patientId: patient.patientId || patient._id || "",
    patientAge: calcAge(patient.dob),
    patientGender: patient.gender || "",
    testName: firstTest.testName || "N/A",
    testType: firstTest.category || "",
    doctor: doctor.name || "Unknown",
    doctorSpecialty: doctor.specialization || "",
    sampleDate: r.sampleDate ? new Date(r.sampleDate).toISOString().split("T")[0] : "",
    reportDate: r.reportDate ? new Date(r.reportDate).toISOString().split("T")[0] : "",
    status: formatStatus(r.status),
    rawStatus: r.status,
    notes: r.findings || r.remarks || "",
    // New metadata fields
    sampleId: r.sampleId || "",
    sampleCollectionTime: r.sampleCollectionTime ? new Date(r.sampleCollectionTime).toLocaleString() : "",
    sampleType: r.sampleType || "",
    department: r.department || "",
    priority: formatPriority(r.priority),
    rawPriority: r.priority || "NORMAL",
    uploadedBy: r.uploadedBy || "",
    uploadedTime: r.uploadedTime ? new Date(r.uploadedTime).toLocaleString() : "",
    reportVersion: r.reportVersion || 1,
    verifierName: r.verifierName || "",
    verificationTimestamp: r.verificationTimestamp ? new Date(r.verificationTimestamp).toLocaleString() : "",
    // History
    history: (r.history && r.history.length > 0)
      ? r.history.map((h) => ({
          date: new Date(h.date).toLocaleString(),
          event: h.event,
          by: h.by || "",
        }))
      : [
          r.sampleDate && { date: new Date(r.sampleDate).toLocaleString(), event: "Sample collected" },
          r.reportDate && { date: new Date(r.reportDate).toLocaleString(), event: "Report completed" },
        ].filter(Boolean),
    attachments,
    _raw: r,
  };
}

function transformTest(t) {
  return {
    id: t._id,
    code: t.testCode,
    name: t.testName,
    category: t.category || "",
    price: t.price || 0,
    normalRange: t.normalRange || "",
    status: t.isActive ? "Active" : "Inactive",
    sampleType: t.sampleType || "",
    method: t.method || "",
    tat: t.tat || "",
    description: t.description || "",
    _raw: t,
  };
}

export const labApi = {
  async getReports(filters = {}) {
    const params = new URLSearchParams();
    if (filters.patientId) params.set("patientId", filters.patientId);
    if (filters.status) params.set("status", filters.status);
    const query = params.toString();
    const data = await request(`/laboratory/reports${query ? `?${query}` : ""}`);
    const reports = data.data?.reports || data.data || [];
    return Array.isArray(reports) ? reports.map(transformReport) : [];
  },

  async getReportById(id) {
    const data = await request(`/laboratory/reports/${id}`);
    return transformReport(data.data?.report || data.data);
  },

  async createReport(formData) {
    const data = await request("/laboratory/reports", {
      method: "POST",
      body: formData,
    });
    return transformReport(data.data?.report || data.data);
  },

  async updateReportStatus(id, status, remarks) {
    const statusMap = {
      "Pending": "PENDING",
      "Requested": "REQUESTED",
      "Sample Collected": "SAMPLE_COLLECTED",
      "Sample Received": "SAMPLE_RECEIVED",
      "In Testing": "IN_TESTING",
      "In Progress": "IN_PROGRESS",
      "Report Ready": "READY",
      "Uploaded": "UPLOADED",
      "Verified": "VERIFIED",
      "Completed": "COMPLETED",
      "Cancelled": "CANCELLED",
    };
    const data = await request(`/laboratory/reports/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status: statusMap[status] || status, remarks }),
    });
    return transformReport(data.data?.report || data.data);
  },

  async approveReport(id) {
    const data = await request(`/laboratory/reports/${id}/approve`, { method: "PUT" });
    return transformReport(data.data?.report || data.data);
  },

  async verifyReport(id, verifierName) {
    const data = await request(`/laboratory/reports/${id}/verify`, {
      method: "PUT",
      body: JSON.stringify({ verifierName }),
    });
    return transformReport(data.data?.report || data.data);
  },

  async releaseReport(id) {
    const data = await request(`/laboratory/reports/${id}/release`, { method: "PUT" });
    return transformReport(data.data?.report || data.data);
  },

  async updateReport(id, formData) {
    const data = await request(`/laboratory/reports/${id}`, {
      method: "PUT",
      body: formData,
    });
    return transformReport(data.data?.report || data.data);
  },

  async deleteReport(id) {
    await request(`/laboratory/reports/${id}`, { method: "DELETE" });
  },

  async getPatients() {
    const data = await request("/patients");
    const patients = data.data?.patients || data.data || [];
    return Array.isArray(patients) ? patients : [];
  },

  async getTests() {
    const data = await request("/laboratory/tests");
    const tests = data.data?.tests || data.data || [];
    return Array.isArray(tests) ? tests.map(transformTest) : [];
  },

  async createTest(testData) {
    const payload = {
      testCode: testData.code,
      testName: testData.name,
      category: testData.category,
      sampleType: testData.sampleType || "",
      method: testData.method || "",
      tat: testData.tat || "",
      description: testData.description || "",
      price: testData.price,
      normalRange: testData.normalRange || "",
      isActive: testData.status === "Active",
    };
    const data = await request("/laboratory/tests", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return transformTest(data.data?.test || data.data);
  },

  async updateTest(id, testData) {
    const payload = {
      testCode: testData.code,
      testName: testData.name,
      category: testData.category,
      sampleType: testData.sampleType || "",
      method: testData.method || "",
      tat: testData.tat || "",
      description: testData.description || "",
      price: testData.price,
      normalRange: testData.normalRange || "",
      isActive: testData.status === "Active",
    };
    const data = await request(`/laboratory/tests/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return transformTest(data.data?.test || data.data);
  },

  async deleteTest(id) {
    await request(`/laboratory/tests/${id}`, { method: "DELETE" });
  },

  async uploadReportFile(reportId, file) {
    const formData = new FormData();
    formData.append("reportFile", file);
    const data = await request(`/laboratory/reports/${reportId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status: undefined }),
    });
    return transformReport(data.data?.report || data.data);
  },

  async extractReport(file) {
    const formData = new FormData();
    formData.append("file", file);
    const data = await request("/laboratory/extract", {
      method: "POST",
      body: formData,
    });
    return data.data;
  },
};
