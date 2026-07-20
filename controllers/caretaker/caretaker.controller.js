const {
  CareTakerProfile,
  PatientCareTaker,
  PatientProfile,
  Appointment,
  User,
} = require("../../models");

async function getCareTakerProfile(userId) {
  return CareTakerProfile.findOne({ where: { user_id: userId } });
}

const getProfile = async (req, res) => {
  try {
    let profile = await getCareTakerProfile(req.user.id);
    if (!profile) {
      profile = await CareTakerProfile.create({ user_id: req.user.id });
    }
    return res.json({ success: true, data: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    let profile = await getCareTakerProfile(req.user.id);
    if (!profile) {
      profile = await CareTakerProfile.create({ user_id: req.user.id, ...req.body });
    } else {
      await profile.update(req.body);
    }
    return res.json({ success: true, data: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

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

const listAppointments = async (req, res) => {
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

    const appointments = await Appointment.findAll({
      where: { patient_id: patientIds },
      order: [["appointment_date", "DESC"]],
    });

    return res.json({ success: true, data: appointments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const bookAppointment = async (req, res) => {
  try {
    const profile = await getCareTakerProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Caretaker profile not found" });
    }

    const {
      patient_id,
      clinic_id,
      doctor_id,
      department_id,
      appointment_date,
      start_time,
      end_time,
      visit_type,
      consultation_type,
      reason,
    } = req.body;

    if (!patient_id || !clinic_id || !doctor_id || !appointment_date || !start_time) {
      return res.status(400).json({
        success: false,
        message:
          "patient_id, clinic_id, doctor_id, appointment_date and start_time are required",
      });
    }

    const link = await PatientCareTaker.findOne({
      where: { caretaker_id: profile.id, patient_id },
    });
    if (!link) {
      return res.status(403).json({
        success: false,
        message: "Patient is not linked to this caretaker",
      });
    }

    const appointment = await Appointment.create({
      appointment_number: `APT-${Date.now()}`,
      clinic_id,
      doctor_id,
      patient_id,
      department_id,
      appointment_date,
      start_time,
      end_time,
      visit_type,
      consultation_type,
      reason,
      booked_by: req.user.id,
      status: "scheduled",
    });

    return res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  listPatients,
  listAppointments,
  bookAppointment,
};
