const { DoctorLeave } = require("../../models");
const { getDoctorProfile } = require("./helpers");

const listLeaves = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }
    const leaves = await DoctorLeave.findAll({
      where: { doctor_id: profile.id },
      order: [["from_date", "DESC"]],
    });
    return res.json({ success: true, data: leaves });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createLeave = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }
    const { from_date, to_date, reason } = req.body;
    if (!from_date || !to_date) {
      return res.status(400).json({
        success: false,
        message: "from_date and to_date are required",
      });
    }
    const leave = await DoctorLeave.create({
      doctor_id: profile.id,
      from_date,
      to_date,
      reason,
      status: "pending",
    });
    return res.status(201).json({ success: true, data: leave });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateLeave = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    const leave = await DoctorLeave.findOne({
      where: { id: req.params.id, doctor_id: profile.id },
    });
    if (!leave) {
      return res.status(404).json({ success: false, message: "Leave not found" });
    }
    await leave.update(req.body);
    return res.json({ success: true, data: leave });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listLeaves,
  createLeave,
  updateLeave,
};
