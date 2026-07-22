const { DoctorSchedule } = require("../../models");
const { getDoctorProfile } = require("./helpers");

const listSchedules = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }
    const schedules = await DoctorSchedule.findAll({
      where: { doctor_id: profile.id },
    });
    return res.json({ success: true, data: schedules });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createSchedule = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }
    const schedule = await DoctorSchedule.create({
      ...req.body,
      doctor_id: profile.id,
    });
    return res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    const schedule = await DoctorSchedule.findOne({
      where: { id: req.params.id, doctor_id: profile.id },
    });
    if (!schedule) {
      return res.status(404).json({ success: false, message: "Schedule not found" });
    }
    await schedule.update(req.body);
    return res.json({ success: true, data: schedule });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    const schedule = await DoctorSchedule.findOne({
      where: { id: req.params.id, doctor_id: profile.id },
    });
    if (!schedule) {
      return res.status(404).json({ success: false, message: "Schedule not found" });
    }
    await schedule.destroy();
    return res.json({ success: true, message: "Schedule deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
};
