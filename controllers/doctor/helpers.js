const { DoctorProfile, User, Clinic, Department } = require("../../models");

async function getDoctorProfile(userId) {
  return DoctorProfile.findOne({
    where: { user_id: userId },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "first_name", "last_name", "email", "phone", "profile_image"],
        include: [
          {
            model: Clinic,
            as: "clinics",
            attributes: ["id", "name"],
            through: { attributes: [] },
          },
        ],
      },
      {
        model: Department,
        as: "departments",
        attributes: ["id", "name"],
        through: { attributes: [] },
      },
    ],
  });
}

module.exports = { getDoctorProfile };
