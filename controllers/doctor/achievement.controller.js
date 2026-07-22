const { DoctorAchievement } = require("../../models");
const { getDoctorProfile } = require("./helpers");

const listAchievements = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }
    const achievements = await DoctorAchievement.findAll({
      where: { doctor_id: profile.id },
      order: [["year", "DESC"]],
    });
    return res.json({ success: true, data: achievements });
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
    const achievement = await DoctorAchievement.create({
      ...req.body,
      doctor_id: profile.id,
    });
    return res.status(201).json({ success: true, data: achievement });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateAchievement = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    const achievement = await DoctorAchievement.findOne({
      where: { id: req.params.id, doctor_id: profile.id },
    });
    if (!achievement) {
      return res.status(404).json({ success: false, message: "Achievement not found" });
    }
    await achievement.update(req.body);
    return res.json({ success: true, data: achievement });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAchievement = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    const achievement = await DoctorAchievement.findOne({
      where: { id: req.params.id, doctor_id: profile.id },
    });
    if (!achievement) {
      return res.status(404).json({ success: false, message: "Achievement not found" });
    }
    await achievement.destroy();
    return res.json({ success: true, message: "Achievement deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
};
