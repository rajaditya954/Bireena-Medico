import Service from "../models/Service.js";

class ServiceService {
  async getAllServices(filters = {}) {
    return await Service.find({ ...filters, isActive: true });
  }

  async getServiceById(id) {
    return await Service.findById(id);
  }

  async getServicesByCategory(category) {
    return await Service.find({ category, isActive: true });
  }

  async createService(serviceData) {
    const service = new Service(serviceData);
    await service.save();
    return service;
  }

  async updateService(id, updateData) {
    return await Service.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteService(id) {
    return await Service.findByIdAndUpdate(id, { isActive: false });
  }

  async searchServices(query) {
    return await Service.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
      isActive: true,
    });
  }
}

export default new ServiceService();
