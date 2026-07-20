const { StaffProfile, Appointment } = require("../../models");

async function getStaffProfile(userId) {
  return StaffProfile.findOne({ where: { user_id: userId } });
}

const getProfile = async (req, res) => {
  try {
    let profile = await getStaffProfile(req.user.id);
    if (!profile) {
      profile = await StaffProfile.create({ user_id: req.user.id });
    }
    return res.json({ success: true, data: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    let profile = await getStaffProfile(req.user.id);
    if (!profile) {
      profile = await StaffProfile.create({ user_id: req.user.id, ...req.body });
    } else {
      await profile.update(req.body);
    }
    return res.json({ success: true, data: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const listAppointments = async (req, res) => {
  try {
    const where = {};
    if (req.query.clinic_id) where.clinic_id = req.query.clinic_id;
    if (req.query.date) where.appointment_date = req.query.date;

    const appointments = await Appointment.findAll({
      where,
      order: [["appointment_date", "DESC"], ["start_time", "ASC"]],
    });

    return res.json({ success: true, data: appointments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  listAppointments,
};
