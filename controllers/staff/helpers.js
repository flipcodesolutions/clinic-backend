const { StaffProfile } = require("../../models");

async function getStaffProfile(userId) {
  return StaffProfile.findOne({ where: { user_id: userId } });
}

module.exports = { getStaffProfile };
