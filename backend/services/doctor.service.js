import Doctor from "../models/Doctor.js";

class DoctorService {
  async getAllDoctors(filters = {}) {
    return await Doctor.find(filters).populate("userId");
  }

  async getDoctorById(id) {
    return await Doctor.findById(id).populate("userId");
  }

  async getDoctorByUserId(userId) {
    return await Doctor.findOne({ userId }).populate("userId");
  }

  async createDoctor(doctorData) {
    const doctor = new Doctor(doctorData);
    await doctor.save();
    return await doctor.populate("userId");
  }

  async updateDoctor(id, updateData) {
    const doctor = await Doctor.findByIdAndUpdate(id, updateData, { new: true })
      .populate("userId");
    return doctor;
  }

  async deleteDoctor(id) {
    return await Doctor.findByIdAndDelete(id);
  }

  async getDoctorsBySpecialization(specialization) {
    return await Doctor.find({ specialization }).populate("userId");
  }

  async getAvailableDoctors(specialization, date) {
    const doctors = await this.getDoctorsBySpecialization(specialization);
    return doctors.filter((doctor) => doctor.isVerified && doctor.isActive);
  }
}

export default new DoctorService();
