const { Op } = require("sequelize");
const { DoctorExperience } = require("../../models");
const { getDoctorProfile } = require("./helpers");

const listExperiences = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }

    const { search } = req.query;
    const where = { doctor_id: profile.id };

    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      where[Op.or] = [
        { hospital_name: { [Op.like]: searchTerm } },
        { designation: { [Op.like]: searchTerm } },
        { description: { [Op.like]: searchTerm } },
      ];
    }

    if (req.query.page || req.query.limit) {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const offset = (page - 1) * limit;

      const { count, rows: experiences } = await DoctorExperience.findAndCountAll({
        where,
        order: [["start_date", "DESC"], ["createdAt", "DESC"]],
        limit,
        offset,
      });

      return res.json({
        success: true,
        count,
        currentPage: page,
        totalPages: Math.ceil(count / limit) || 1,
        limit,
        data: experiences,
      });
    }

    const experiences = await DoctorExperience.findAll({
      where,
      order: [["start_date", "DESC"], ["createdAt", "DESC"]],
    });

    return res.json({
      success: true,
      count: experiences.length,
      data: experiences,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getExperienceById = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }

    const experience = await DoctorExperience.findOne({
      where: { id: req.params.id, doctor_id: profile.id },
    });
    if (!experience) {
      return res.status(404).json({ success: false, message: "Experience not found" });
    }

    return res.json({ success: true, data: experience });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createExperience = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }

    const { hospital_name, designation, start_date, end_date, description } = req.body;

    // Validation
    if (!hospital_name || !hospital_name.trim()) {
      return res.status(400).json({ success: false, message: "Hospital/Clinic name is required" });
    }
    if (hospital_name.trim().length > 150) {
      return res.status(400).json({ success: false, message: "Hospital name cannot exceed 150 characters" });
    }

    if (!designation || !designation.trim()) {
      return res.status(400).json({ success: false, message: "Designation is required" });
    }
    if (designation.trim().length > 100) {
      return res.status(400).json({ success: false, message: "Designation cannot exceed 100 characters" });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    if (!start_date) {
      return res.status(400).json({ success: false, message: "Start date is required" });
    }

    if (start_date > todayStr) {
      return res.status(400).json({ success: false, message: "Start date cannot be a future date" });
    }

    if (end_date) {
      if (end_date > todayStr) {
        return res.status(400).json({ success: false, message: "End date cannot be a future date" });
      }
      if (new Date(end_date) < new Date(start_date)) {
        return res.status(400).json({ success: false, message: "End date cannot be earlier than start date" });
      }
    }

    const experience = await DoctorExperience.create({
      doctor_id: profile.id,
      hospital_name: hospital_name.trim(),
      designation: designation.trim(),
      start_date,
      end_date: end_date || null,
      description: description ? description.trim() : null,
    });

    return res.status(201).json({ success: true, message: "Experience added successfully", data: experience });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateExperience = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }

    const experience = await DoctorExperience.findOne({
      where: { id: req.params.id, doctor_id: profile.id },
    });
    if (!experience) {
      return res.status(404).json({ success: false, message: "Experience not found" });
    }

    const { hospital_name, designation, start_date, end_date, description } = req.body;

    // Validation
    if (hospital_name !== undefined) {
      if (!hospital_name || !hospital_name.trim()) {
        return res.status(400).json({ success: false, message: "Hospital/Clinic name is required" });
      }
      if (hospital_name.trim().length > 150) {
        return res.status(400).json({ success: false, message: "Hospital name cannot exceed 150 characters" });
      }
    }

    if (designation !== undefined) {
      if (!designation || !designation.trim()) {
        return res.status(400).json({ success: false, message: "Designation is required" });
      }
      if (designation.trim().length > 100) {
        return res.status(400).json({ success: false, message: "Designation cannot exceed 100 characters" });
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const effectiveStartDate = start_date || experience.start_date;
    const effectiveEndDate = end_date !== undefined ? end_date : experience.end_date;

    if (effectiveStartDate && effectiveStartDate > todayStr) {
      return res.status(400).json({ success: false, message: "Start date cannot be a future date" });
    }

    if (effectiveEndDate) {
      if (effectiveEndDate > todayStr) {
        return res.status(400).json({ success: false, message: "End date cannot be a future date" });
      }
      if (effectiveStartDate && new Date(effectiveEndDate) < new Date(effectiveStartDate)) {
        return res.status(400).json({ success: false, message: "End date cannot be earlier than start date" });
      }
    }

    await experience.update({
      ...(hospital_name !== undefined && { hospital_name: hospital_name.trim() }),
      ...(designation !== undefined && { designation: designation.trim() }),
      ...(start_date !== undefined && { start_date }),
      ...(end_date !== undefined && { end_date: end_date || null }),
      ...(description !== undefined && { description: description ? description.trim() : null }),
    });

    return res.json({ success: true, message: "Experience updated successfully", data: experience });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteExperience = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }

    const experience = await DoctorExperience.findOne({
      where: { id: req.params.id, doctor_id: profile.id },
    });
    if (!experience) {
      return res.status(404).json({ success: false, message: "Experience not found" });
    }

    await experience.destroy();
    return res.json({ success: true, message: "Experience deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listExperiences,
  getExperienceById,
  createExperience,
  updateExperience,
  deleteExperience,
};
