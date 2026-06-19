import Prescription from "../models/Prescription.js";

class PrescriptionService {
  async getPrescriptionsByPatient(patientId) {
    return await Prescription.find({ patientId })
      .populate("appointmentId")
      .populate("doctorId");
  }

  async getPrescriptionById(id) {
    return await Prescription.findById(id)
      .populate("appointmentId")
      .populate("doctorId");
  }

  async createPrescription(prescriptionData) {
    const count = await Prescription.countDocuments();
    prescriptionData.prescriptionId = prescriptionData.prescriptionId || `RX${String(count + 1).padStart(3, "0")}`;
    const prescription = new Prescription(prescriptionData);
    await prescription.save();
    return await prescription.populate(["appointmentId", "doctorId"]);
  }

  async updatePrescription(id, updateData) {
    const prescription = await Prescription.findByIdAndUpdate(id, updateData, { new: true })
      .populate(["appointmentId", "doctorId"]);
    return prescription;
  }

  async deletePrescription(id) {
    return await Prescription.findByIdAndDelete(id);
  }

  async getActivePrescriptions(patientId) {
    return await Prescription.find({
      patientId,
      isActive: true,
      expiryDate: { $gt: new Date() },
    });
  }
}

export default new PrescriptionService();
