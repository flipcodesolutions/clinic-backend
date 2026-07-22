const { Review } = require("../../models");
const { getPatientProfile } = require("./helpers");

const listReviews = async (req, res) => {
  try {
    const profile = await getPatientProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Patient profile not found" });
    }
    const reviews = await Review.findAll({
      where: { patient_id: profile.id },
      order: [["id", "DESC"]],
    });
    return res.json({ success: true, data: reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createReview = async (req, res) => {
  try {
    const profile = await getPatientProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Patient profile not found" });
    }

    const { doctor_id, clinic_id, rating, review } = req.body;
    if (!rating) {
      return res.status(400).json({ success: false, message: "rating is required" });
    }

    const row = await Review.create({
      patient_id: profile.id,
      doctor_id,
      clinic_id,
      rating,
      review,
      status: "pending",
    });

    return res.status(201).json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listReviews,
  createReview,
};
