const { Appointment } = require("../../models");

const listAppointments = async (req, res) => {
  try {
    const where = {};
    if (req.query.clinic_id) where.clinic_id = req.query.clinic_id;
    if (req.query.date) where.appointment_date = req.query.date;

    const appointments = await Appointment.findAll({
      where,
      order: [["appointment_date", "DESC"], ["start_time", "ASC"]],
    });

    return res.json({ success: true, data: appointments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { listAppointments };
