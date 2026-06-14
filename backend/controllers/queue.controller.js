import mongoose from "mongoose";
import queueService from "../services/queue.service.js";
import { generateResponse, generateError } from "../utils/response.js";

export const getQueueByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    const dateStr = date || new Date().toISOString().split("T")[0];

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.json(generateResponse([], "Queue fetched successfully"));
    }

    const queue = await queueService.getQueueByDoctor(doctorId, dateStr);
    res.json(generateResponse(queue, "Queue fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const getQueueStats = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    const dateStr = date || new Date().toISOString().split("T")[0];

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.json(generateResponse({ waiting: 0, inProgress: 0, completed: 0, estimatedWaitMinutes: 0 }, "Queue statistics fetched successfully"));
    }

    const stats = await queueService.getQueueStats(doctorId, dateStr);
    res.json(generateResponse(stats, "Queue statistics fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const addToQueue = async (req, res) => {
  try {
    const queue = await queueService.addToQueue(req.body);

    if (global.io) {
      global.io.emit("queue-updated");
      if (queue.doctorId) {
        global.io.to(`doctor:${queue.doctorId}`).emit("queue-updated");
      }
    }

    res.status(201).json(generateResponse(queue, "Patient added to queue"));
  } catch (error) {
    res.status(400).json(generateError(error.message));
  }
};

export const checkInPatient = async (req, res) => {
  try {
    const queue = await queueService.checkInPatient(req.params.queueId);

    if (global.io) {
      global.io.emit("queue-updated");
      if (queue.doctorId) {
        global.io.to(`doctor:${queue.doctorId}`).emit("queue-updated");
      }
    }

    res.json(generateResponse(queue, "Patient checked in successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const completePatient = async (req, res) => {
  try {
    const queue = await queueService.completePatient(req.params.queueId);

    if (global.io) {
      global.io.emit("queue-updated");
      if (queue.doctorId) {
        global.io.to(`doctor:${queue.doctorId}`).emit("queue-updated");
      }
    }

    res.json(generateResponse(queue, "Patient consultation completed"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const getQueuePosition = async (req, res) => {
  try {
    const position = await queueService.getQueuePosition(req.params.queueId);
    res.json(generateResponse({ position }, "Queue position retrieved"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};
