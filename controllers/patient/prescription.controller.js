const {
  PatientDocument,
} = require("../../models");
const { getPatientProfile } = require("./helpers");

const listPrescriptions = async (req, res) => {
  try {
    const profile = await getPatientProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Patient profile not found" });
    }

    // Fetch uploaded prescription documents from patient_documents table
    const uploadedDocs = await PatientDocument.findAll({
      where: {
        patient_id: profile.id,
        document_type: "prescription",
      },
      order: [["id", "DESC"]],
    });

    const data = uploadedDocs.map((d) => {
      let title = d.title || "Prescription";
      let doctorName = "";

      if (title.includes(" - Dr. ")) {
        const parts = title.split(" - Dr. ");
        title = parts[0];
        doctorName = parts[1];
      } else if (title.includes(" (Dr. ")) {
        const parts = title.split(" (Dr. ");
        title = parts[0];
        doctorName = parts[1].replace(/\)$/, "");
      }

      const formattedDate = d.created_at
        ? new Date(d.created_at).toISOString().split("T")[0]
        : "";

      return {
        id: d.id,
        title,
        doctor_name: doctorName,
        date: formattedDate,
        file_path: d.file_path,
        created_at: d.created_at,
      };
    });

    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createPrescription = async (req, res) => {
  try {
    const profile = await getPatientProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Patient profile not found" });
    }

    const { title, doctor_name, file_path } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const trimmedTitle = title.trim();
    const trimmedDoctor = doctor_name ? doctor_name.trim() : "";
    const storedTitle = trimmedDoctor
      ? `${trimmedTitle} - Dr. ${trimmedDoctor}`
      : trimmedTitle;

    const doc = await PatientDocument.create({
      patient_id: profile.id,
      document_type: "prescription",
      title: storedTitle,
      file_path: file_path || "/uploads/sample-prescription.pdf",
      uploaded_by: req.user.id,
    });

    const formattedDate = doc.created_at
      ? new Date(doc.created_at).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    return res.status(201).json({
      success: true,
      message: "Prescription uploaded successfully",
      data: {
        id: doc.id,
        title: trimmedTitle,
        doctor_name: trimmedDoctor,
        date: formattedDate,
        file_path: doc.file_path,
        created_at: doc.created_at,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deletePrescription = async (req, res) => {
  try {
    const profile = await getPatientProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Patient profile not found" });
    }

    let docId = req.params.id;
    if (typeof docId === "string" && docId.startsWith("upload_")) {
      docId = docId.replace("upload_", "");
    }

    const doc = await PatientDocument.findOne({
      where: {
        id: docId,
        patient_id: profile.id,
        document_type: "prescription",
      },
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    await doc.destroy();
    return res.json({ success: true, message: "Prescription removed" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listPrescriptions,
  createPrescription,
  deletePrescription,
};
