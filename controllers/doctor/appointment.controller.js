const { Op } = require("sequelize");
const { Appointment, AppointmentStatusHistory, PatientProfile, User, Clinic, Department } = require("../../models");
const { getDoctorProfile } = require("./helpers");

const listAppointments = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }

    const where = { doctor_id: profile.id };

    if (req.query.status) {
      where.status = req.query.status;
    }
    if (req.query.visit_type) {
      where.visit_type = req.query.visit_type;
    }
    if (req.query.search) {
      const search = req.query.search.trim();
      where[Op.or] = [
        { appointment_number: { [Op.like]: `%${search}%` } },
        { "$patient.user.first_name$": { [Op.like]: `%${search}%` } },
        { "$patient.user.last_name$": { [Op.like]: `%${search}%` } },
        { "$patient.user.phone$": { [Op.like]: `%${search}%` } },
      ];
    }

    const appointments = await Appointment.findAll({
      where,
      include: [
        {
          model: PatientProfile,
          as: "patient",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "first_name", "last_name", "email", "phone"],
            },
          ],
        },
        {
          model: Clinic,
          as: "clinic",
          attributes: ["id", "name"],
        },
        {
          model: Department,
          as: "department",
          attributes: ["id", "name"],
        },
        {
          model: User,
          as: "bookedByUser",
          attributes: ["id", "first_name", "last_name"],
        },
      ],
      order: [["appointment_date", "DESC"], ["start_time", "DESC"]],
    });
    return res.json({ success: true, data: appointments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const ALLOWED_STATUSES = ["booked", "confirmed", "completed", "cancelled", "no_show"];

const updateAppointmentStatus = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    const { status, remarks } = req.body;

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed statuses are: ${ALLOWED_STATUSES.join(", ")}`,
      });
    }

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

    return res.json({
      success: true,
      message: `Appointment status updated to ${status}`,
      data: appointment,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const bulkUpdateAppointmentStatus = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }
    const { appointment_ids, status, remarks } = req.body;
    if (!Array.isArray(appointment_ids) || appointment_ids.length === 0) {
      return res.status(400).json({ success: false, message: "No appointment IDs provided" });
    }

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed statuses are: ${ALLOWED_STATUSES.join(", ")}`,
      });
    }

    const appointments = await Appointment.findAll({
      where: {
        id: { [Op.in]: appointment_ids },
        doctor_id: profile.id,
      },
    });

    if (appointments.length === 0) {
      return res.status(404).json({ success: false, message: "No matching appointments found" });
    }

    const updatedIds = appointments.map((a) => a.id);
    await Appointment.update(
      { status, remarks: remarks || undefined },
      { where: { id: { [Op.in]: updatedIds } } }
    );

    const historyRecords = updatedIds.map((id) => ({
      appointment_id: id,
      status,
      changed_by: req.user.id,
      remarks: remarks || `Bulk updated to ${status}`,
    }));

    await AppointmentStatusHistory.bulkCreate(historyRecords);

    return res.json({
      success: true,
      message: `Successfully updated ${updatedIds.length} appointment(s) to ${status}`,
      updated_count: updatedIds.length,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listAppointments,
  updateAppointmentStatus,
  bulkUpdateAppointmentStatus,
};

