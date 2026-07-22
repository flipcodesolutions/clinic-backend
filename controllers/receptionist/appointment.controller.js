const {
  Appointment,
  AppointmentStatusHistory,
} = require("../../models");

const listAppointments = async (req, res) => {
  try {
    const where = {};
    if (req.query.clinic_id) where.clinic_id = req.query.clinic_id;
    if (req.query.date) where.appointment_date = req.query.date;
    if (req.query.status) where.status = req.query.status;

    const appointments = await Appointment.findAll({
      where,
      order: [["appointment_date", "DESC"], ["start_time", "ASC"]],
    });

    return res.json({ success: true, data: appointments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createAppointment = async (req, res) => {
  try {
    const {
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
    } = req.body;

    if (!clinic_id || !doctor_id || !patient_id || !appointment_date || !start_time) {
      return res.status(400).json({
        success: false,
        message:
          "clinic_id, doctor_id, patient_id, appointment_date and start_time are required",
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

const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    await appointment.update(req.body);
    return res.json({ success: true, data: appointment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const appointment = await Appointment.findByPk(req.params.id);
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

module.exports = {
  listAppointments,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
};
