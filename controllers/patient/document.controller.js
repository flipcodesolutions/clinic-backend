const { PatientDocument } = require("../../models");
const { getPatientProfile } = require("./helpers");

const listDocuments = async (req, res) => {
  try {
    const profile = await getPatientProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Patient profile not found" });
    }

    const where = { patient_id: profile.id };
    if (req.query.document_type) {
      where.document_type = req.query.document_type;
    }

    const documents = await PatientDocument.findAll({
      where,
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

    const { document_type, title, file_path, lab_name, test_date } = req.body;
    if (!document_type || !title) {
      return res.status(400).json({
        success: false,
        message: "document_type and title are required",
      });
    }

    let finalTitle = title.trim();
    if (lab_name) {
      finalTitle += ` - ${lab_name.trim()}`;
    }
    if (test_date) {
      finalTitle += ` (${test_date.trim()})`;
    }

    const document = await PatientDocument.create({
      patient_id: profile.id,
      document_type,
      title: finalTitle,
      file_path: file_path || "/uploads/placeholder-report.pdf",
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

module.exports = {
  listDocuments,
  createDocument,
  deleteDocument,
};
