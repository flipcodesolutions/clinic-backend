const { Op } = require("sequelize");
const { Clinic } = require("../../models");

const listClinics = async (req, res) => {
  try {
    const { search, status } = req.query;
    const where = {};

    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }
    if (status) {
      where.status = status;
    }

    const clinics = await Clinic.findAll({
      where,
      order: [["id", "DESC"]],
    });

    return res.json({
      success: true,
      count: clinics.length,
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
      created_by: req.user.id,
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
