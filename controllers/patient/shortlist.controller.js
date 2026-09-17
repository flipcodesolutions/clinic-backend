const {
  PatientShortlist,
  DoctorProfile,
  User,
  Department,
  Clinic,
} = require("../../models");
const { getPatientProfile } = require("./helpers");

const listShortlist = async (req, res) => {
  try {
    const profile = await getPatientProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Patient profile not found" });
    }

    const shortlists = await PatientShortlist.findAll({
      where: { patient_id: profile.id },
      include: [
        {
          model: DoctorProfile,
          as: "doctor",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "first_name", "last_name", "email", "phone", "profile_image"],
            },
            {
              model: Department,
              as: "departments",
              attributes: ["id", "name"],
              through: { attributes: [] },
            },
          ],
        },
      ],
      order: [["id", "DESC"]],
    });

    // Format list of doctors nicely
    const doctors = shortlists.map((s) => ({
      shortlist_id: s.id,
      doctor_id: s.doctor_id,
      created_at: s.created_at,
      doctor: s.doctor,
    }));

    return res.json({ success: true, data: doctors });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const addShortlist = async (req, res) => {
  try {
    const profile = await getPatientProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Patient profile not found" });
    }

    const doctor_id = req.body.doctor_id || req.params.doctorId;
    if (!doctor_id) {
      return res.status(400).json({ success: false, message: "doctor_id is required" });
    }

    // Verify doctor exists
    const doctor = await DoctorProfile.findByPk(doctor_id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const [item, created] = await PatientShortlist.findOrCreate({
      where: {
        patient_id: profile.id,
        doctor_id,
      },
    });

    return res.status(created ? 201 : 200).json({
      success: true,
      message: created ? "Doctor added to shortlist" : "Doctor already in shortlist",
      data: item,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const removeShortlist = async (req, res) => {
  try {
    const profile = await getPatientProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Patient profile not found" });
    }

    const doctor_id = req.params.doctorId || req.body.doctor_id;
    if (!doctor_id) {
      return res.status(400).json({ success: false, message: "doctor_id is required" });
    }

    const deletedCount = await PatientShortlist.destroy({
      where: {
        patient_id: profile.id,
        doctor_id,
      },
    });

    return res.json({
      success: true,
      message: deletedCount > 0 ? "Doctor removed from shortlist" : "Not in shortlist",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listShortlist,
  addShortlist,
  removeShortlist,
};
