const { PatientProfile } = require("../../models");

async function getPatientProfile(userId) {
  let profile = await PatientProfile.findOne({ where: { user_id: userId } });
  if (!profile) {
    profile = await PatientProfile.create({ user_id: userId });
  }
  return profile;
}

module.exports = { getPatientProfile };
