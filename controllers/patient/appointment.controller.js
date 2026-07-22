const { Appointment } = require("../../models");
const { getPatientProfile } = require("./helpers");

const listAppointments = async (req, res) => {
  try {
    const profile = await getPatientProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Patient profile not found" });
    }
    const appointments = await Appointment.findAll({
      where: { patient_id: profile.id },
      order: [["appointment_date", "DESC"], ["start_time", "DESC"]],
    });
    return res.json({ success: true, data: appointments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAppointment = async (req, res) => {
  try {
    const profile = await getPatientProfile(req.user.id);
    const appointment = await Appointment.findOne({
      where: { id: req.params.id, patient_id: profile.id },
    });
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    return res.json({ success: true, data: appointment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const bookAppointment = async (req, res) => {
  try {
    const profile = await getPatientProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Patient profile not found" });
    }

    const {
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

    if (!clinic_id || !doctor_id || !appointment_date || !start_time) {
      return res.status(400).json({
        success: false,
        message: "clinic_id, doctor_id, appointment_date and start_time are required",
      });
    }

    const appointment = await Appointment.create({
      appointment_number: `APT-${Date.now()}`,
      clinic_id,
      doctor_id,
      patient_id: profile.id,
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
  listAppointments,
  getAppointment,
  bookAppointment,
};
