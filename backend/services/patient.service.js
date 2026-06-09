import Patient from "../models/Patient.js";

class PatientService {
  async getAllPatients(filters = {}) {
    return await Patient.find(filters).populate("userId");
  }

  async getPatientById(id) {
    return await Patient.findById(id).populate("userId");
  }

  async getPatientByUserId(userId) {
    return await Patient.findOne({ userId }).populate("userId");
  }

  async createPatient(patientData) {
    const patient = new Patient(patientData);
    await patient.save();
    return await patient.populate("userId");
  }

  async updatePatient(id, updateData) {
    const patient = await Patient.findByIdAndUpdate(id, updateData, { new: true })
      .populate("userId");
    return patient;
  }

  async deletePatient(id) {
    return await Patient.findByIdAndDelete(id);
  }

  async generateUHID() {
    const count = await Patient.countDocuments();
    return `P-${Date.now()}-${count + 1}`;
  }
}

export default new PatientService();
