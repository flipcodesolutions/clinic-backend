const { DoctorExperience } = require("../../models");
const { getDoctorProfile } = require("./helpers");

const listExperiences = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }
    const experiences = await DoctorExperience.findAll({
      where: { doctor_id: profile.id },
      order: [["start_date", "DESC"]],
    });
    return res.json({ success: true, data: experiences });
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
    const experience = await DoctorExperience.create({
      ...req.body,
      doctor_id: profile.id,
    });
    return res.status(201).json({ success: true, data: experience });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateExperience = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    const experience = await DoctorExperience.findOne({
      where: { id: req.params.id, doctor_id: profile.id },
    });
    if (!experience) {
      return res.status(404).json({ success: false, message: "Experience not found" });
    }
    await experience.update(req.body);
    return res.json({ success: true, data: experience });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteExperience = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    const experience = await DoctorExperience.findOne({
      where: { id: req.params.id, doctor_id: profile.id },
    });
    if (!experience) {
      return res.status(404).json({ success: false, message: "Experience not found" });
    }
    await experience.destroy();
    return res.json({ success: true, message: "Experience deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
};
