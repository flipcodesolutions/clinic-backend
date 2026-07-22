const { MedicalRecord } = require("../../models");
const { getDoctorProfile } = require("./helpers");

const createMedicalRecord = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }

    const {
      appointment_id,
      patient_id,
      chief_complaint,
      history,
      diagnosis,
      notes,
      follow_up_date,
    } = req.body;

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

module.exports = {
  createMedicalRecord,
  getMedicalRecord,
};
