const { MedicalRecord, Appointment, Vital, AppointmentStatusHistory } = require("../../models");
const { getDoctorProfile } = require("./helpers");

const createMedicalRecord = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }

    let {
      appointment_id,
      patient_id,
      chief_complaint,
      symptoms,
      history,
      diagnosis,
      notes,
      follow_up_date,
      vitals,
      medicalRecord,
    } = req.body;

    // Handle nested
    if (medicalRecord) {
      chief_complaint = chief_complaint || medicalRecord.symptoms || medicalRecord.chief_complaint;
      diagnosis = diagnosis || medicalRecord.diagnosis;
      notes = notes || medicalRecord.notes;
    }
    if (!chief_complaint && symptoms) {
      chief_complaint = symptoms;
    }

    // Auto-fetch patient_id from appointment if missing
    let appointment = null;
    if (appointment_id) {
      appointment = await Appointment.findByPk(appointment_id);
      if (appointment && !patient_id) {
        patient_id = appointment.patient_id;
      }
    }

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

    // Save vitals if passed in payload
    if (vitals && typeof vitals === "object") {
      await Vital.create({
        appointment_id,
        height: vitals.height_cm || vitals.height,
        weight: vitals.weight_kg || vitals.weight,
        bp: vitals.blood_pressure || vitals.bp,
        pulse: vitals.pulse_rate || vitals.pulse,
        temperature: vitals.temperature,
      });
    }

    // Update appointment status to 'completed'
    if (appointment && appointment.status !== "completed") {
      await appointment.update({ status: "completed" });
      await AppointmentStatusHistory.create({
        appointment_id: appointment.id,
        status: "completed",
        changed_by: req.user.id,
        remarks: "Consultation completed and medical record logged",
      });
    }

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
