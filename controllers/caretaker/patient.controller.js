const { PatientCareTaker, PatientProfile, User } = require("../../models");
const { getCareTakerProfile } = require("./helpers");

const listPatients = async (req, res) => {
  try {
    const profile = await getCareTakerProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Caretaker profile not found" });
    }

    const links = await PatientCareTaker.findAll({
      where: { caretaker_id: profile.id },
    });
    const patientIds = links.map((l) => l.patient_id);

    if (!patientIds.length) {
      return res.json({ success: true, data: [] });
    }

    const patients = await PatientProfile.findAll({
      where: { id: patientIds },
      include: [
        {
          model: User,
          as: "user",
          attributes: { exclude: ["password"] },
        },
      ],
    });

    return res.json({ success: true, data: patients });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { listPatients };
