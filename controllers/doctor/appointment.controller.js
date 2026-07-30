const { Appointment, AppointmentStatusHistory, PatientProfile, User, Clinic, Department } = require("../../models");
const { getDoctorProfile } = require("./helpers");

const listAppointments = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }
    const appointments = await Appointment.findAll({
      where: { doctor_id: profile.id },
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

module.exports = {
  listAppointments,
  updateAppointmentStatus,
};
