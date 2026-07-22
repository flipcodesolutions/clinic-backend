const { PatientProfile } = require("../../models");

async function getPatientProfile(userId) {
  return PatientProfile.findOne({ where: { user_id: userId } });
}

module.exports = { getPatientProfile };
