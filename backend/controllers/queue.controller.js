import queueService from "../services/queue.service.js";
import { generateResponse, generateError } from "../utils/response.js";

export const getQueueByDoctor = async (req, res) => {
  try {
    const queue = await queueService.getQueueByDoctor(req.params.doctorId, req.query.date);
    res.json(generateResponse({ queue }, "Queue fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const addToQueue = async (req, res) => {
  try {
    const queue = await queueService.addToQueue(req.body);
    res.status(201).json(generateResponse({ queue }, "Patient added to queue"));
  } catch (error) {
    res.status(400).json(generateError(error.message));
  }
};

export const checkInPatient = async (req, res) => {
  try {
    const queue = await queueService.checkInPatient(req.params.queueId);
    res.json(generateResponse({ queue }, "Patient checked in successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const completePatient = async (req, res) => {
  try {
    const queue = await queueService.completePatient(req.params.queueId);
    res.json(generateResponse({ queue }, "Patient consultation completed"));
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
