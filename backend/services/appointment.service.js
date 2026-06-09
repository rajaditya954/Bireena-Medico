import Appointment from "../models/Appointment.js";
import { sendEmail } from "../utils/email.js";

class AppointmentService {
  async getAllAppointments(filters = {}) {
    return await Appointment.find(filters)
      .populate("patientId")
      .populate("doctorId");
  }

  async getAppointmentById(id) {
    return await Appointment.findById(id)
      .populate("patientId")
      .populate("doctorId");
  }

  async createAppointment(appointmentData) {
    const appointment = new Appointment(appointmentData);
    await appointment.save();
    
    // Send confirmation email
    await this.sendAppointmentConfirmation(appointment);
    
    return await appointment
      .populate("patientId")
      .populate("doctorId");
  }

  async updateAppointment(id, updateData) {
    const appointment = await Appointment.findByIdAndUpdate(id, updateData, { new: true })
      .populate("patientId")
      .populate("doctorId");
    
    if (updateData.status === "cancelled") {
      await this.sendCancellationEmail(appointment);
    }
    
    return appointment;
  }

  async deleteAppointment(id) {
    return await Appointment.findByIdAndDelete(id);
  }

  async getAppointmentsByPatient(patientId) {
    return await Appointment.find({ patientId }).populate("doctorId");
  }

  async getAppointmentsByDoctor(doctorId) {
    return await Appointment.find({ doctorId }).populate("patientId");
  }

  async sendAppointmentConfirmation(appointment) {
    // Implementation will be added later
    console.log("Appointment confirmation email would be sent");
  }

  async sendCancellationEmail(appointment) {
    // Implementation will be added later
    console.log("Cancellation email would be sent");
  }

  async sendReminderNotification(appointmentId) {
    const appointment = await this.getAppointmentById(appointmentId);
    if (appointment && appointment.status === "scheduled") {
      // Will send via email/SMS/notification
      appointment.isReminder = true;
      await appointment.save();
    }
  }
}

export default new AppointmentService();
