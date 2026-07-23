const { Op } = require("sequelize");
const { Clinic } = require("../../models");

const listClinics = async (req, res) => {
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

    const { count, rows: clinics } = await Clinic.findAndCountAll({
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
      data: clinics,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createClinic = async (req, res) => {
  try {
    const clinic = await Clinic.create({
      ...req.body,
      created_by: req.user ? req.user.id : null,
    });
    return res.status(201).json({ success: true, data: clinic });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getClinic = async (req, res) => {
  try {
    const clinic = await Clinic.findByPk(req.params.id);
    if (!clinic) {
      return res.status(404).json({ success: false, message: "Clinic not found" });
    }
    return res.json({ success: true, data: clinic });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateClinic = async (req, res) => {
  try {
    const clinic = await Clinic.findByPk(req.params.id);
    if (!clinic) {
      return res.status(404).json({ success: false, message: "Clinic not found" });
    }
    await clinic.update(req.body);
    return res.json({ success: true, data: clinic });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteClinic = async (req, res) => {
  try {
    const clinic = await Clinic.findByPk(req.params.id);
    if (!clinic) {
      return res.status(404).json({ success: false, message: "Clinic not found" });
    }
    await clinic.destroy();
    return res.json({ success: true, message: "Clinic deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listClinics,
  createClinic,
  getClinic,
  updateClinic,
  deleteClinic,
};
