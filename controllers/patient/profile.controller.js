const { PatientProfile, User } = require("../../models");
const { getPatientProfile } = require("./helpers");

const getProfile = async (req, res) => {
  try {
    let profile = await PatientProfile.findOne({
      where: { user_id: req.user.id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "first_name", "last_name", "email", "phone", "profile_image"],
        },
      ],
    });

    if (!profile) {
      profile = await PatientProfile.create({ user_id: req.user.id });
      profile = await PatientProfile.findOne({
        where: { user_id: req.user.id },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "first_name", "last_name", "email", "phone", "profile_image"],
          },
        ],
      });
    }

    return res.json({ success: true, data: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    let profile = await getPatientProfile(req.user.id);
    if (!profile) {
      profile = await PatientProfile.create({ user_id: req.user.id, ...req.body });
    } else {
      await profile.update(req.body);
    }

    // If user fields (first_name, last_name, phone) are provided, update User record as well
    const { first_name, last_name, phone } = req.body;
    if (first_name !== undefined || last_name !== undefined || phone !== undefined) {
      const user = await User.findByPk(req.user.id);
      if (user) {
        await user.update({
          first_name: first_name !== undefined ? first_name.trim() : user.first_name,
          last_name: last_name !== undefined ? last_name.trim() : user.last_name,
          phone: phone !== undefined ? phone.trim() : user.phone,
        });
      }
    }

    const updated = await PatientProfile.findOne({
      where: { user_id: req.user.id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "first_name", "last_name", "email", "phone", "profile_image"],
        },
      ],
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProfile, updateProfile };
