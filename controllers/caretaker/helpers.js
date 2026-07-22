const { CareTakerProfile } = require("../../models");

async function getCareTakerProfile(userId) {
  return CareTakerProfile.findOne({ where: { user_id: userId } });
}

module.exports = { getCareTakerProfile };
