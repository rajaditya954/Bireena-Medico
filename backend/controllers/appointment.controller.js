import appointmentService from "../services/appointment.service.js";
import queueService from "../services/queue.service.js";
import { generateResponse, generateError } from "../utils/response.js";

export const getAllAppointments = async (req, res) => {
  try {
    const { doctorId, date, history } = req.query;

    let query = {};
    if (history !== "true" && date !== "all") {
      const dateStr = date || new Date().toISOString().split("T")[0];
      query.date = dateStr;
    }
    if (doctorId && doctorId !== "all") {
      query.doctorId = doctorId;
    }

    const appointments = await appointmentService.getAllAppointments(query);
    res.json(generateResponse(appointments, "Appointments fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await appointmentService.getAppointmentById(req.params.id);
    if (!appointment) {
      return res.status(404).json(generateError("Appointment not found"));
    }
    res.json(generateResponse(appointment, "Appointment fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const createAppointment = async (req, res) => {
  try {
    const appointment = await appointmentService.createAppointment(req.body);

    // Broadcast update via Socket.io
    if (global.io) {
      global.io.emit("queue-updated");
      if (appointment.doctorId) {
        global.io.to(`doctor:${appointment.doctorId}`).emit("queue-updated");
      }
    }

    res.status(201).json(generateResponse(appointment, "Appointment created successfully"));
  } catch (error) {
    res.status(400).json(generateError(error.message));
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const appointment = await appointmentService.updateAppointment(req.params.id, req.body);
    res.json(generateResponse(appointment, "Appointment updated successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await appointmentService.getAppointmentById(req.params.id);
    await appointmentService.deleteAppointment(req.params.id);

    // Update queue
    if (appointment) {
      await queueService.deleteQueueEntryByAppointment(req.params.id);
      if (global.io) {
        global.io.emit("queue-updated");
        global.io.to(`doctor:${appointment.doctorId}`).emit("queue-updated");
      }
    }

    res.json(generateResponse({}, "Appointment deleted successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await appointmentService.updateAppointment(req.params.id, { status: "cancelled" });
    await queueService.updateQueueStatusByAppointment(req.params.id, "cancelled");

    // Broadcast updates
    if (global.io) {
      global.io.emit("queue-updated");
      if (appointment.doctorId) {
        global.io.to(`doctor:${appointment.doctorId}`).emit("queue-updated");
      }
    }

    res.json(generateResponse(appointment, "Appointment cancelled successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const startAppointment = async (req, res) => {
  try {
    const appointment = await appointmentService.updateAppointment(req.params.id, { status: "in-progress" });
    await queueService.updateQueueStatusByAppointment(req.params.id, "in-progress");

    // Broadcast updates
    if (global.io) {
      global.io.emit("queue-updated");
      if (appointment.doctorId) {
        global.io.to(`doctor:${appointment.doctorId}`).emit("queue-updated");
      }
    }

    res.json(generateResponse(appointment, "Appointment started successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const completeAppointment = async (req, res) => {
  try {
    const appointment = await appointmentService.updateAppointment(req.params.id, { status: "completed" });
    await queueService.updateQueueStatusByAppointment(req.params.id, "completed");

    // Broadcast updates
    if (global.io) {
      global.io.emit("queue-updated");
      if (appointment.doctorId) {
        global.io.to(`doctor:${appointment.doctorId}`).emit("queue-updated");
      }
    }

    res.json(generateResponse(appointment, "Appointment completed successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const skipAppointment = async (req, res) => {
  try {
    const appointment = await appointmentService.updateAppointment(req.params.id, { status: "skipped" });
    await queueService.updateQueueStatusByAppointment(req.params.id, "cancelled");

    // Broadcast updates
    if (global.io) {
      global.io.emit("queue-updated");
      if (appointment.doctorId) {
        global.io.to(`doctor:${appointment.doctorId}`).emit("queue-updated");
      }
    }

    res.json(generateResponse(appointment, "Appointment skipped successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await appointmentService.getAppointmentsByPatient(req.params.patientId);
    res.json(generateResponse(appointments, "Appointments fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await appointmentService.getAppointmentsByDoctor(req.params.doctorId);
    res.json(generateResponse(appointments, "Appointments fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};
