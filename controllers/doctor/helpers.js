const { DoctorProfile } = require("../../models");

async function getDoctorProfile(userId) {
  return DoctorProfile.findOne({ where: { user_id: userId } });
}

module.exports = { getDoctorProfile };
