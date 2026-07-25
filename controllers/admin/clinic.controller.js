const { Op } = require("sequelize");
const { Clinic } = require("../../models");
const { deleteOldFile } = require("../../utils/file.utils");

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
    const { name, phone } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Clinic name is required" });
    }
    if (phone) {
      const cleanPhone = String(phone).replace(/\D/g, "");
      if (cleanPhone.length !== 10) {
        return res.status(400).json({ success: false, message: "Phone number must be exactly 10 digits" });
      }
    }
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
    if (req.body.phone) {
      const cleanPhone = String(req.body.phone).replace(/\D/g, "");
      if (cleanPhone.length !== 10) {
        return res.status(400).json({ success: false, message: "Phone number must be exactly 10 digits" });
      }
    }

    if (req.body.logo && clinic.logo && clinic.logo !== req.body.logo) {
      deleteOldFile(clinic.logo);
    }
    if (req.body.photo && clinic.photo && clinic.photo !== req.body.photo) {
      deleteOldFile(clinic.photo);
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
    if (clinic.logo) deleteOldFile(clinic.logo);
    if (clinic.photo) deleteOldFile(clinic.photo);

    await clinic.destroy();
    return res.json({ success: true, message: "Clinic deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getCurrentClinicProfile = async (req, res) => {
  try {
    let clinic = await Clinic.findOne({ order: [["id", "ASC"]] });
    if (!clinic) {
      clinic = await Clinic.create({
        name: "Medi Growth Clinic",
        description: "Leading multi-specialty healthcare provider.",
        status: "active",
      });
    }
    return res.json({ success: true, data: clinic });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateCurrentClinicProfile = async (req, res) => {
  try {
    const { name, description, address, city, state, phone, email, website } = req.body;
    let clinic = await Clinic.findOne({ order: [["id", "ASC"]] });
    const updatePayload = {};
    if (name !== undefined) updatePayload.name = name;
    if (description !== undefined) updatePayload.description = description;
    if (address !== undefined) updatePayload.address = address;
    if (city !== undefined) updatePayload.city = city;
    if (state !== undefined) updatePayload.state = state;
    if (phone !== undefined) updatePayload.phone = phone;
    if (email !== undefined) updatePayload.email = email;
    if (website !== undefined) updatePayload.website = website;

    if (!clinic) {
      clinic = await Clinic.create({ name: name || "Medi Growth Clinic", ...updatePayload });
    } else {
      await clinic.update(updatePayload);
    }
    return res.json({ success: true, data: clinic, message: "Clinic profile updated successfully" });
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
  getCurrentClinicProfile,
  updateCurrentClinicProfile,
};
