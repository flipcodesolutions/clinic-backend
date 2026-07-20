const {
  PatientProfile,
  Appointment,
  PatientDocument,
  Review,
  Invoice,
} = require("../../models");

async function getPatientProfile(userId) {
  return PatientProfile.findOne({ where: { user_id: userId } });
}

const getProfile = async (req, res) => {
  try {
    let profile = await getPatientProfile(req.user.id);
    if (!profile) {
      profile = await PatientProfile.create({ user_id: req.user.id });
    }
    return res.json({ success: true, data: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    let profile = await getPatientProfile(req.user.id);
    if (!profile) {
      profile = await PatientProfile.create({ user_id: req.user.id, ...req.body });
    } else {
      await profile.update(req.body);
    }
    return res.json({ success: true, data: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

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

    const appointment_number = `APT-${Date.now()}`;

    const appointment = await Appointment.create({
      appointment_number,
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

const listDocuments = async (req, res) => {
  try {
    const profile = await getPatientProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Patient profile not found" });
    }
    const documents = await PatientDocument.findAll({
      where: { patient_id: profile.id },
      order: [["id", "DESC"]],
    });
    return res.json({ success: true, data: documents });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createDocument = async (req, res) => {
  try {
    const profile = await getPatientProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Patient profile not found" });
    }

    const { document_type, title, file_path } = req.body;
    if (!document_type || !title || !file_path) {
      return res.status(400).json({
        success: false,
        message: "document_type, title and file_path are required",
      });
    }

    const document = await PatientDocument.create({
      patient_id: profile.id,
      document_type,
      title,
      file_path,
      uploaded_by: req.user.id,
    });

    return res.status(201).json({ success: true, data: document });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const profile = await getPatientProfile(req.user.id);
    const document = await PatientDocument.findOne({
      where: { id: req.params.id, patient_id: profile.id },
    });
    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }
    await document.destroy();
    return res.json({ success: true, message: "Document deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const listReviews = async (req, res) => {
  try {
    const profile = await getPatientProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Patient profile not found" });
    }
    const reviews = await Review.findAll({
      where: { patient_id: profile.id },
      order: [["id", "DESC"]],
    });
    return res.json({ success: true, data: reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createReview = async (req, res) => {
  try {
    const profile = await getPatientProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Patient profile not found" });
    }

    const { doctor_id, clinic_id, rating, review } = req.body;
    if (!rating) {
      return res.status(400).json({ success: false, message: "rating is required" });
    }

    const row = await Review.create({
      patient_id: profile.id,
      doctor_id,
      clinic_id,
      rating,
      review,
      status: "pending",
    });

    return res.status(201).json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

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

module.exports = {
  getProfile,
  updateProfile,
  listAppointments,
  getAppointment,
  bookAppointment,
  listDocuments,
  createDocument,
  deleteDocument,
  listReviews,
  createReview,
  listInvoices,
};
