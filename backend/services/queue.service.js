import Queue from "../models/Queue.js";

class QueueService {
  async getQueueByDoctor(doctorId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await Queue.find({
      doctorId,
      $or: [
        { date },
        {
          date: { $exists: false },
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        }
      ]
    }).sort({ queueNumber: 1 });
  }

  async getQueueStats(doctorId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const todayQueue = await Queue.find({
      doctorId,
      $or: [
        { date },
        {
          date: { $exists: false },
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        }
      ]
    });

    const waiting = todayQueue.filter(p => p.status === "waiting" || p.status === "scheduled").length;
    const inProgress = todayQueue.filter(p => p.status === "in-progress").length;
    const completed = todayQueue.filter(p => p.status === "completed").length;
    const estimatedWaitMinutes = waiting * 10; // Assume 10 mins per patient

    return {
      waiting,
      inProgress,
      completed,
      estimatedWaitMinutes,
    };
  }

  async addToQueue(queueData) {
    const date = queueData.date || new Date().toISOString().split("T")[0];
    queueData.date = date;
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get last queue number today
    const lastQueue = await Queue.findOne({
      doctorId: queueData.doctorId,
      $or: [
        { date },
        {
          date: { $exists: false },
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        }
      ]
    }).sort({ queueNumber: -1 });

    queueData.queueNumber = (lastQueue?.queueNumber || 0) + 1;

    const queue = new Queue(queueData);
    await queue.save();
    return queue;
  }

  async checkInPatient(queueId) {
    return await Queue.findByIdAndUpdate(
      queueId,
      {
        status: "in-progress",
        calledAt: new Date(),
      },
      { new: true }
    );
  }

  async completePatient(queueId) {
    return await Queue.findByIdAndUpdate(
      queueId,
      {
        status: "completed",
        completedAt: new Date(),
      },
      { new: true }
    );
  }

  async updateQueueStatusByAppointment(appointmentId, status) {
    const update = { status };
    if (status === "in-progress") {
      update.calledAt = new Date();
    } else if (status === "completed") {
      update.completedAt = new Date();
    }
    return await Queue.findOneAndUpdate({ appointmentId }, update, { new: true });
  }

  async deleteQueueEntryByAppointment(appointmentId) {
    return await Queue.findOneAndDelete({ appointmentId });
  }

  async getQueuePosition(queueId) {
    const queue = await Queue.findById(queueId);
    if (!queue) return null;

    const date = queue.date || (queue.createdAt ? queue.createdAt.toISOString().split("T")[0] : new Date().toISOString().split("T")[0]);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const position = await Queue.countDocuments({
      doctorId: queue.doctorId,
      $or: [
        { date },
        {
          date: { $exists: false },
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        }
      ],
      queueNumber: { $lt: queue.queueNumber },
      status: { $in: ["waiting", "scheduled"] },
    });

    return position + 1;
  }
}

export default new QueueService();
