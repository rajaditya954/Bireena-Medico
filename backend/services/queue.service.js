import Queue from "../models/Queue.js";

class QueueService {
  async getQueueByDoctor(doctorId, date = new Date().toDateString()) {
    return await Queue.find({ 
      doctorId,
      createdAt: { 
        $gte: new Date(date),
        $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
      }
    })
    .populate("patientId")
    .populate("appointmentId");
  }

  async addToQueue(queueData) {
    const lastQueue = await Queue.findOne({ doctorId: queueData.doctorId })
      .sort({ queueNumber: -1 });
    
    queueData.queueNumber = (lastQueue?.queueNumber || 0) + 1;
    
    const queue = new Queue(queueData);
    await queue.save();
    return await queue.populate(["patientId", "appointmentId"]);
  }

  async checkInPatient(queueId) {
    const queue = await Queue.findByIdAndUpdate(
      queueId,
      { 
        status: "in-progress",
        checkedInAt: new Date(),
      },
      { new: true }
    ).populate(["patientId", "appointmentId"]);
    
    return queue;
  }

  async completePatient(queueId) {
    const queue = await Queue.findByIdAndUpdate(
      queueId,
      { 
        status: "completed",
        completedAt: new Date(),
      },
      { new: true }
    ).populate(["patientId", "appointmentId"]);
    
    return queue;
  }

  async getQueuePosition(queueId) {
    const queue = await Queue.findById(queueId);
    if (!queue) return null;

    const position = await Queue.countDocuments({
      doctorId: queue.doctorId,
      queueNumber: { $lt: queue.queueNumber },
      status: { $ne: "completed" },
    });

    return position + 1;
  }
}

export default new QueueService();
