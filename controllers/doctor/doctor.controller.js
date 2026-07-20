const {
  DoctorProfile,
  DoctorExperience,
  DoctorAchievement,
  DoctorSchedule,
  DoctorLeave,
  Appointment,
  AppointmentStatusHistory,
  MedicalRecord,
  Prescription,
  PrescriptionMedicine,
} = require("../../models");

async function getDoctorProfile(userId) {
  return DoctorProfile.findOne({ where: { user_id: userId } });
}

const getProfile = async (req, res) => {
  try {
    let profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      profile = await DoctorProfile.create({ user_id: req.user.id });
    }
    return res.json({ success: true, data: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    let profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      profile = await DoctorProfile.create({ user_id: req.user.id, ...req.body });
    } else {
      await profile.update(req.body);
    }
    return res.json({ success: true, data: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const listExperiences = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }
    const experiences = await DoctorExperience.findAll({
      where: { doctor_id: profile.id },
      order: [["start_date", "DESC"]],
    });
    return res.json({ success: true, data: experiences });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createExperience = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }
    const experience = await DoctorExperience.create({
      ...req.body,
      doctor_id: profile.id,
    });
    return res.status(201).json({ success: true, data: experience });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateExperience = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    const experience = await DoctorExperience.findOne({
      where: { id: req.params.id, doctor_id: profile.id },
    });
    if (!experience) {
      return res.status(404).json({ success: false, message: "Experience not found" });
    }
    await experience.update(req.body);
    return res.json({ success: true, data: experience });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteExperience = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    const experience = await DoctorExperience.findOne({
      where: { id: req.params.id, doctor_id: profile.id },
    });
    if (!experience) {
      return res.status(404).json({ success: false, message: "Experience not found" });
    }
    await experience.destroy();
    return res.json({ success: true, message: "Experience deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const listAchievements = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }
    const achievements = await DoctorAchievement.findAll({
      where: { doctor_id: profile.id },
      order: [["year", "DESC"]],
    });
    return res.json({ success: true, data: achievements });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createAchievement = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }
    const achievement = await DoctorAchievement.create({
      ...req.body,
      doctor_id: profile.id,
    });
    return res.status(201).json({ success: true, data: achievement });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateAchievement = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    const achievement = await DoctorAchievement.findOne({
      where: { id: req.params.id, doctor_id: profile.id },
    });
    if (!achievement) {
      return res.status(404).json({ success: false, message: "Achievement not found" });
    }
    await achievement.update(req.body);
    return res.json({ success: true, data: achievement });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAchievement = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    const achievement = await DoctorAchievement.findOne({
      where: { id: req.params.id, doctor_id: profile.id },
    });
    if (!achievement) {
      return res.status(404).json({ success: false, message: "Achievement not found" });
    }
    await achievement.destroy();
    return res.json({ success: true, message: "Achievement deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const listSchedules = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }
    const schedules = await DoctorSchedule.findAll({
      where: { doctor_id: profile.id },
    });
    return res.json({ success: true, data: schedules });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createSchedule = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }
    const schedule = await DoctorSchedule.create({
      ...req.body,
      doctor_id: profile.id,
    });
    return res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    const schedule = await DoctorSchedule.findOne({
      where: { id: req.params.id, doctor_id: profile.id },
    });
    if (!schedule) {
      return res.status(404).json({ success: false, message: "Schedule not found" });
    }
    await schedule.update(req.body);
    return res.json({ success: true, data: schedule });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    const schedule = await DoctorSchedule.findOne({
      where: { id: req.params.id, doctor_id: profile.id },
    });
    if (!schedule) {
      return res.status(404).json({ success: false, message: "Schedule not found" });
    }
    await schedule.destroy();
    return res.json({ success: true, message: "Schedule deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const listLeaves = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }
    const leaves = await DoctorLeave.findAll({
      where: { doctor_id: profile.id },
      order: [["from_date", "DESC"]],
    });
    return res.json({ success: true, data: leaves });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createLeave = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }
    const { from_date, to_date, reason } = req.body;
    if (!from_date || !to_date) {
      return res.status(400).json({
        success: false,
        message: "from_date and to_date are required",
      });
    }
    const leave = await DoctorLeave.create({
      doctor_id: profile.id,
      from_date,
      to_date,
      reason,
      status: "pending",
    });
    return res.status(201).json({ success: true, data: leave });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateLeave = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    const leave = await DoctorLeave.findOne({
      where: { id: req.params.id, doctor_id: profile.id },
    });
    if (!leave) {
      return res.status(404).json({ success: false, message: "Leave not found" });
    }
    await leave.update(req.body);
    return res.json({ success: true, data: leave });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const listAppointments = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }
    const appointments = await Appointment.findAll({
      where: { doctor_id: profile.id },
      order: [["appointment_date", "DESC"], ["start_time", "DESC"]],
    });
    return res.json({ success: true, data: appointments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    const { status, remarks } = req.body;
    const appointment = await Appointment.findOne({
      where: { id: req.params.id, doctor_id: profile.id },
    });
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    await appointment.update({ status, remarks: remarks ?? appointment.remarks });
    await AppointmentStatusHistory.create({
      appointment_id: appointment.id,
      status,
      changed_by: req.user.id,
      remarks,
    });

    return res.json({ success: true, data: appointment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createMedicalRecord = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }

    const { appointment_id, patient_id, chief_complaint, history, diagnosis, notes, follow_up_date } =
      req.body;

    if (!appointment_id || !patient_id) {
      return res.status(400).json({
        success: false,
        message: "appointment_id and patient_id are required",
      });
    }

    const record = await MedicalRecord.create({
      appointment_id,
      doctor_id: profile.id,
      patient_id,
      chief_complaint,
      history,
      diagnosis,
      notes,
      follow_up_date,
    });

    return res.status(201).json({ success: true, data: record });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMedicalRecord = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    const record = await MedicalRecord.findOne({
      where: {
        appointment_id: req.params.appointmentId,
        doctor_id: profile.id,
      },
    });
    if (!record) {
      return res.status(404).json({ success: false, message: "Medical record not found" });
    }
    return res.json({ success: true, data: record });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createPrescription = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }

    const { appointment_id, patient_id, instruction, medicines } = req.body;
    if (!appointment_id || !patient_id) {
      return res.status(400).json({
        success: false,
        message: "appointment_id and patient_id are required",
      });
    }

    const prescription = await Prescription.create({
      appointment_id,
      doctor_id: profile.id,
      patient_id,
      instruction,
    });

    if (Array.isArray(medicines) && medicines.length) {
      const rows = medicines.map((m) => ({
        ...m,
        prescription_id: prescription.id,
      }));
      await PrescriptionMedicine.bulkCreate(rows);
    }

    const full = await Prescription.findByPk(prescription.id, {
      include: [{ model: PrescriptionMedicine, as: "medicines" }],
    });

    return res.status(201).json({ success: true, data: full });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getPrescription = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    const prescription = await Prescription.findOne({
      where: {
        appointment_id: req.params.appointmentId,
        doctor_id: profile.id,
      },
      include: [{ model: PrescriptionMedicine, as: "medicines" }],
    });
    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }
    return res.json({ success: true, data: prescription });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  listExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
  listAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  listSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  listLeaves,
  createLeave,
  updateLeave,
  listAppointments,
  updateAppointmentStatus,
  createMedicalRecord,
  getMedicalRecord,
  createPrescription,
  getPrescription,
};
