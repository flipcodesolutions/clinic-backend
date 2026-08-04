const { Op } = require("sequelize");
const { DoctorAchievement } = require("../../models");
const { getDoctorProfile } = require("./helpers");

const listAchievements = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }

    const { search } = req.query;
    const where = { doctor_id: profile.id };

    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      const searchYear = parseInt(search.trim(), 10);
      const orConditions = [
        { title: { [Op.like]: searchTerm } },
        { description: { [Op.like]: searchTerm } },
      ];
      if (!isNaN(searchYear)) {
        orConditions.push({ year: searchYear });
      }
      where[Op.or] = orConditions;
    }

    if (req.query.page || req.query.limit) {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const offset = (page - 1) * limit;

      const { count, rows: achievements } = await DoctorAchievement.findAndCountAll({
        where,
        order: [["year", "DESC"], ["createdAt", "DESC"]],
        limit,
        offset,
      });

      return res.json({
        success: true,
        count,
        currentPage: page,
        totalPages: Math.ceil(count / limit) || 1,
        limit,
        data: achievements,
      });
    }

    const achievements = await DoctorAchievement.findAll({
      where,
      order: [["year", "DESC"], ["createdAt", "DESC"]],
    });

    return res.json({
      success: true,
      count: achievements.length,
      data: achievements,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAchievementById = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }

    const achievement = await DoctorAchievement.findOne({
      where: { id: req.params.id, doctor_id: profile.id },
    });
    if (!achievement) {
      return res.status(404).json({ success: false, message: "Achievement not found" });
    }

    return res.json({ success: true, data: achievement });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createAchievement = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }

    const { title, year, description } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Achievement title is required" });
    }
    if (title.trim().length > 150) {
      return res.status(400).json({ success: false, message: "Title cannot exceed 150 characters" });
    }
    if (!year) {
      return res.status(400).json({ success: false, message: "Year is required" });
    }
    const parsedYear = parseInt(year, 10);
    const currentYear = new Date().getFullYear();
    if (isNaN(parsedYear) || parsedYear <= 0) {
      return res.status(400).json({ success: false, message: "Please provide a valid year" });
    }
    if (parsedYear > currentYear) {
      return res.status(400).json({ success: false, message: `Year cannot be in the future (Maximum allowed year is ${currentYear})` });
    }

    const achievement = await DoctorAchievement.create({
      doctor_id: profile.id,
      title: title.trim(),
      year: parsedYear,
      description: description ? description.trim() : null,
    });

    return res.status(201).json({ success: true, message: "Achievement created successfully", data: achievement });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateAchievement = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }

    const achievement = await DoctorAchievement.findOne({
      where: { id: req.params.id, doctor_id: profile.id },
    });
    if (!achievement) {
      return res.status(404).json({ success: false, message: "Achievement not found" });
    }

    const { title, year, description } = req.body;

    // Validation
    if (title !== undefined) {
      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, message: "Achievement title is required" });
      }
      if (title.trim().length > 150) {
        return res.status(400).json({ success: false, message: "Title cannot exceed 150 characters" });
      }
    }

    if (year !== undefined) {
      if (!year) {
        return res.status(400).json({ success: false, message: "Year is required" });
      }
      const parsedYear = parseInt(year, 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(parsedYear) || parsedYear <= 0) {
        return res.status(400).json({ success: false, message: "Please provide a valid year" });
      }
      if (parsedYear > currentYear) {
        return res.status(400).json({ success: false, message: `Year cannot be in the future (Maximum allowed year is ${currentYear})` });
      }
    }

    await achievement.update({
      ...(title !== undefined && { title: title.trim() }),
      ...(year !== undefined && { year: parseInt(year, 10) }),
      ...(description !== undefined && { description: description ? description.trim() : null }),
    });

    return res.json({ success: true, message: "Achievement updated successfully", data: achievement });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAchievement = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }

    const achievement = await DoctorAchievement.findOne({
      where: { id: req.params.id, doctor_id: profile.id },
    });
    if (!achievement) {
      return res.status(404).json({ success: false, message: "Achievement not found" });
    }

    await achievement.destroy();
    return res.json({ success: true, message: "Achievement deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listAchievements,
  getAchievementById,
  createAchievement,
  updateAchievement,
  deleteAchievement,
};
