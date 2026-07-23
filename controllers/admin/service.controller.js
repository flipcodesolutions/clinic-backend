const { Op } = require("sequelize");
const { Service } = require("../../models");

const listServices = async (req, res) => {
  try {
    const { search, status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }
    if (status) {
      where.status = status;
    }

    const { count, rows: services } = await Service.findAndCountAll({
      where,
      order: [["name", "ASC"]],
      limit,
      offset,
    });

    return res.json({
      success: true,
      count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      limit,
      data: services,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getServiceById = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }
    return res.json({ success: true, data: service });
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
  getServiceById,
  createService,
  updateService,
  deleteService,
};
