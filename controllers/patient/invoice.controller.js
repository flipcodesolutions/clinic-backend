const { Appointment, Invoice } = require("../../models");
const { getPatientProfile } = require("./helpers");

const listInvoices = async (req, res) => {
  try {
    const profile = await getPatientProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Patient profile not found" });
    }

    const appointments = await Appointment.findAll({
      where: { patient_id: profile.id },
      attributes: ["id"],
    });
    const appointmentIds = appointments.map((a) => a.id);

    if (!appointmentIds.length) {
      return res.json({ success: true, data: [] });
    }

    const invoices = await Invoice.findAll({
      where: { appointment_id: appointmentIds },
      order: [["id", "DESC"]],
    });

    return res.json({ success: true, data: invoices });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { listInvoices };
