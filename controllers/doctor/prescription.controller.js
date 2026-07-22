const { Prescription, PrescriptionMedicine } = require("../../models");
const { getDoctorProfile } = require("./helpers");

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
      await PrescriptionMedicine.bulkCreate(
        medicines.map((m) => ({
          ...m,
          prescription_id: prescription.id,
        }))
      );
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
  createPrescription,
  getPrescription,
};
