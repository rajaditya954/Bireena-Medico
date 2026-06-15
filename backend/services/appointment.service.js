import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import Queue from "../models/Queue.js";

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
    // Generate unique appointment ID
    const count = await Appointment.countDocuments();
    appointmentData.appointmentId = `APT-${Date.now()}-${count + 1}`;

    const date = appointmentData.date || new Date().toISOString().split("T")[0];
    const doctorId = appointmentData.doctorId;

    // Fetch patient and doctor to ensure names are populated
    const patient = await Patient.findById(appointmentData.patientId);
    const doctor = await Doctor.findById(doctorId);

    if (patient) {
      appointmentData.patientName = patient.fullName;
      appointmentData.patientPhone = patient.phone;
    }
    if (doctor) {
      appointmentData.doctorName = doctor.name;
    }

    // Get last token number for the doctor today
    const lastApt = await Appointment.findOne({ doctorId, date }).sort({ tokenNumber: -1 });
    const tokenNumber = (lastApt?.tokenNumber || 0) + 1;
    appointmentData.tokenNumber = tokenNumber;

    // Set slot
    if (appointmentData.slotId) {
      appointmentData.slot = appointmentData.slotId; // SlotId is HH:MM in AddAppointment payload
    } else {
      appointmentData.slot = appointmentData.slot || "";
    }

    // Parse appointmentDate
    appointmentData.appointmentDate = new Date(date);
    
    // Status defaults to waiting if it is a walk-in, otherwise scheduled
    appointmentData.status = appointmentData.type === "walk-in" ? "waiting" : "scheduled";

    const appointment = new Appointment(appointmentData);
    await appointment.save();

    // Automatically add to Queue
    await Queue.create({
      appointmentId: appointment._id,
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      doctorId: appointment.doctorId,
      doctorName: appointment.doctorName,
      queueNumber: tokenNumber,
      tokenNumber: tokenNumber,
      type: appointment.type,
      scheduledTime: appointment.slot,
      priority: appointment.priority,
      status: appointment.status,
      date: appointment.date,
    });

    return await appointment.populate(["patientId", "doctorId"]);
  }

  async updateAppointment(id, updateData) {
    const appointment = await Appointment.findByIdAndUpdate(id, updateData, { new: true })
      .populate("patientId")
      .populate("doctorId");
    return appointment;
  }

  async deleteAppointment(id) {
    return await Appointment.findByIdAndDelete(id);
  }

  async getAppointmentsByPatient(patientId) {
    return await Appointment.find({ patientId })
      .populate("patientId")
      .populate("doctorId");
  }

  async getAppointmentsByDoctor(doctorId) {
    return await Appointment.find({ doctorId })
      .populate("patientId")
      .populate("doctorId");
  }
}

export default new AppointmentService();
