import { api } from "../lib/api";
import { initialPatients } from "./mockData";

// Persist patients in localStorage for demo fallback
if (!localStorage.getItem("medico_patients")) {
  localStorage.setItem("medico_patients", JSON.stringify(initialPatients));
}

const getLocalPatients = () => JSON.parse(localStorage.getItem("medico_patients") || "[]");
const saveLocalPatients = (patients) => localStorage.setItem("medico_patients", JSON.stringify(patients));

export const patientService = {
  getAll: async () => {
    try {
      const res = await api.getPatients();
      return res.data?.patients || res.data || res || [];
    } catch (err) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return getLocalPatients().filter(p => p.isActive !== false);
    }
  },

  getById: async (id) => {
    try {
      const res = await api.getPatientById(id);
      return res.data?.patient || res.data || res;
    } catch (err) {
      const patients = getLocalPatients();
      return patients.find(p => p.id === id || p.patientId === id);
    }
  },

  create: async (data) => {
    try {
      const res = await api.createPatient(data);
      return res.data?.patient || res.data || res;
    } catch (err) {
      const patients = getLocalPatients();
      const newPatient = { 
        ...data, 
        id: String(Date.now()),
        patientId: `PAT-${Date.now().toString().slice(-6)}`,
        isActive: true,
        lastVisitDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      patients.push(newPatient);
      saveLocalPatients(patients);
      return newPatient;
    }
  },

  update: async (id, data) => {
    try {
      const res = await api.updatePatient(id, data);
      return res.data?.patient || res.data || res;
    } catch (err) {
      const patients = getLocalPatients();
      const index = patients.findIndex(p => p.id === id || p.patientId === id);
      if (index !== -1) {
        patients[index] = { ...patients[index], ...data };
        saveLocalPatients(patients);
        return patients[index];
      }
      return null;
    }
  },

  softDelete: async (id) => {
    try {
      await api.deletePatient(id);
    } catch (err) {
      const patients = getLocalPatients();
      const index = patients.findIndex(p => p.id === id || p.patientId === id);
      if (index !== -1) {
        patients[index].isActive = false;
        saveLocalPatients(patients);
      }
    }
  },

  delete: async (id) => {
    try {
      await api.deletePatient(id);
    } catch (err) {
      const patients = getLocalPatients();
      const index = patients.findIndex(p => p.id === id || p.patientId === id);
      if (index !== -1) {
        patients[index].isActive = false;
        saveLocalPatients(patients);
      }
    }
  }
};
