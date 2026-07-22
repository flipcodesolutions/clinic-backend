const { StaffProfile } = require("../../models");
const { getStaffProfile } = require("./helpers");

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

module.exports = { getProfile, updateProfile };
