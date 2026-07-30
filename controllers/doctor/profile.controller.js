const { DoctorProfile, User } = require("../../models");
const { getDoctorProfile } = require("./helpers");

const getProfile = async (req, res) => {
  try {
    let profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      await DoctorProfile.create({ user_id: req.user.id });
      profile = await getDoctorProfile(req.user.id);
    }
    return res.json({ success: true, data: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { first_name, last_name, profile_photo, consultation_fee, languages, gender, dob, bio } = req.body;

    // 1. Update User fields (first_name, last_name, profile_image)
    const userUpdates = {};
    if (first_name !== undefined) userUpdates.first_name = first_name;
    if (last_name !== undefined) userUpdates.last_name = last_name;
    if (profile_photo !== undefined) userUpdates.profile_image = profile_photo;

    if (Object.keys(userUpdates).length > 0) {
      await User.update(userUpdates, { where: { id: req.user.id } });
    }

    // 2. Update DoctorProfile editable fields
    let profile = await DoctorProfile.findOne({ where: { user_id: req.user.id } });
    const profileUpdates = {};
    if (consultation_fee !== undefined) profileUpdates.consultation_fee = consultation_fee;
    if (languages !== undefined) profileUpdates.languages = languages;
    if (gender !== undefined) profileUpdates.gender = gender;
    if (dob !== undefined) profileUpdates.dob = dob;
    if (bio !== undefined) profileUpdates.bio = bio;
    if (profile_photo !== undefined) profileUpdates.profile_image = profile_photo;

    if (!profile) {
      profile = await DoctorProfile.create({ user_id: req.user.id, ...profileUpdates });
    } else {
      await profile.update(profileUpdates);
    }

    const updatedProfile = await getDoctorProfile(req.user.id);
    return res.json({ success: true, data: updatedProfile, message: "Profile updated successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProfile, updateProfile };
