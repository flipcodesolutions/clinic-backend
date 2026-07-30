const {
  Appointment,
  PatientProfile,
  User,
  MedicalRecord,
  Prescription,
  PrescriptionMedicine,
  Vital,
  PatientDocument,
  Clinic,
} = require("../../models");
const { getDoctorProfile } = require("./helpers");
const { Op } = require("sequelize");

/**
 * List all unique patients who have booked appointments with the doctor
 */
const listPatients = async (req, res) => {
  try {
    const doctor = await getDoctorProfile(req.user.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }

    const { search, gender } = req.query;

    // Find all patient IDs associated with this doctor via Appointments
    const appointments = await Appointment.findAll({
      where: { doctor_id: doctor.id },
      attributes: ["patient_id"],
      group: ["patient_id"],
    });

    const patientIds = appointments.map((app) => app.patient_id).filter(Boolean);

    if (patientIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Build patient filter query
    const patientWhere = { id: { [Op.in]: patientIds } };
    if (gender) {
      patientWhere.gender = gender;
    }

    const userWhere = {};
    if (search) {
      userWhere[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const patients = await PatientProfile.findAll({
      where: patientWhere,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "first_name", "last_name", "email", "phone", "profile_image", "status"],
          where: Object.keys(userWhere).length > 0 ? userWhere : undefined,
        },
      ],
      order: [["updated_at", "DESC"]],
    });

    return res.json({ success: true, data: patients });
  } catch (error) {
    console.error("Error listing doctor patients:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get detailed profile, medical history, vitals, prescriptions & records of a patient
 */
const getPatientDetails = async (req, res) => {
  try {
    const doctor = await getDoctorProfile(req.user.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }

    const patientId = req.params.id;

    const patient = await PatientProfile.findOne({
      where: { id: patientId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "first_name", "last_name", "email", "phone", "profile_image", "status"],
        },
        {
          model: PatientDocument,
          as: "documents",
        },
      ],
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    // Get appointments history with this doctor
    const appointments = await Appointment.findAll({
      where: { doctor_id: doctor.id, patient_id: patientId },
      include: [
        { model: Clinic, as: "clinic", attributes: ["id", "name"] },
        { model: MedicalRecord, as: "medicalRecord" },
        {
          model: Prescription,
          as: "prescription",
          include: [{ model: PrescriptionMedicine, as: "medicines" }],
        },
        { model: Vital, as: "vital" },
      ],
      order: [["appointment_date", "DESC"], ["start_time", "DESC"]],
    });

    return res.json({
      success: true,
      data: {
        patient,
        appointmentsHistory: appointments,
      },
    });
  } catch (error) {
    console.error("Error getting patient details:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listPatients,
  getPatientDetails,
};
