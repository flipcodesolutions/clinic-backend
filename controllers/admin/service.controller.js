const { Service } = require("../../models");

const listServices = async (req, res) => {
  try {
    const services = await Service.findAll({ order: [["id", "DESC"]] });
    return res.json({ success: true, data: services });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createService = async (req, res) => {
  try {
    const { name, description, price, status } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "name is required" });
    }
    const service = await Service.create({ name, description, price, status });
    return res.status(201).json({ success: true, data: service });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }
    await service.update(req.body);
    return res.json({ success: true, data: service });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }
    await service.destroy();
    return res.json({ success: true, message: "Service deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listServices,
  createService,
  updateService,
  deleteService,
};
