import { api } from "../lib/api";

const getEMR = () => JSON.parse(localStorage.getItem("medico_emr") || '{"prescriptions": [], "reports": []}');
const saveEMR = (data) => localStorage.setItem("medico_emr", JSON.stringify(data));

export const emrService = {
  getPatientTimeline: async (patientId) => {
    try {
      const prescriptions = await api.listPrescriptionsByPatient(patientId);
      const reports = await api.listLabReportsByPatient(patientId);
      const pres = prescriptions.data?.prescriptions || prescriptions.data || prescriptions || [];
      const reps = reports.data?.reports || reports.data || reports || [];
      return [...pres, ...reps].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (err) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const data = getEMR();
      const prescriptions = data.prescriptions.filter(p => p.patientId === patientId);
      const reports = data.reports.filter(r => r.patientId === patientId);
      return [...prescriptions, ...reports].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
    }
  },
  
  addPrescription: async (data) => {
    try {
      const payload = data.patientId ? data : { ...data };
      const res = await api.createPrescription(payload);
      return res.data?.prescription || res.data || res;
    } catch (err) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const emr = getEMR();
      const newPrescription = {
        ...data,
        id: `RX-${Date.now().toString().slice(-6)}`,
        type: 'prescription',
        createdAt: new Date().toISOString()
      };
      emr.prescriptions.push(newPrescription);
      saveEMR(emr);
      return newPrescription;
    }
  },
  
  uploadReport: async (data) => {
    try {
      const res = await api.createLabReport(data);
      return res.data?.report || res.data || res;
    } catch (err) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const emr = getEMR();
      const newReport = {
        ...data,
        id: `REP-${Date.now().toString().slice(-6)}`,
        type: 'report',
        createdAt: new Date().toISOString()
      };
      emr.reports.push(newReport);
      saveEMR(emr);
      return newReport;
    }
  },

  addReport: async (patientId, report) => {
    return emrService.uploadReport({ patientId, ...report });
  }
};
