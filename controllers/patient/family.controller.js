const { PatientFamilyMember, User } = require("../../models");
const { getPatientProfile } = require("./helpers");

const listFamilyMembers = async (req, res) => {
  try {
    const profile = await getPatientProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Patient profile not found" });
    }

    let members = await PatientFamilyMember.findAll({
      where: { patient_id: profile.id },
      order: [["id", "ASC"]],
    });

    // If no members exist yet, seed the initial "Self" profile from user details
    if (members.length === 0) {
      const user = await User.findByPk(req.user.id);
      const fullName = user
        ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Primary Patient"
        : "Primary Patient";

      const selfMember = await PatientFamilyMember.create({
        patient_id: profile.id,
        name: fullName,
        relation: "Self",
        gender: profile.gender || "male",
        dob: profile.dob || null,
        blood_group: profile.blood_group || "B+",
        phone: user?.phone || null,
      });

      members = [selfMember];
    }

    return res.json({ success: true, data: members });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const addFamilyMember = async (req, res) => {
  try {
    const profile = await getPatientProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Patient profile not found" });
    }

    const currentCount = await PatientFamilyMember.count({
      where: { patient_id: profile.id },
    });

    if (currentCount >= 6) {
      return res.status(400).json({
        success: false,
        message: "Maximum 6 family members limit reached.",
      });
    }

    const { name, relation, gender, dob, blood_group, phone } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Full name is required",
      });
    }

    const member = await PatientFamilyMember.create({
      patient_id: profile.id,
      name: name.trim(),
      relation: relation || "Other",
      gender: gender || "other",
      dob: dob || null,
      blood_group: blood_group || "B+",
      phone: phone ? phone.trim() : null,
    });

    return res.status(201).json({ success: true, data: member });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateFamilyMember = async (req, res) => {
  try {
    const profile = await getPatientProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Patient profile not found" });
    }

    const member = await PatientFamilyMember.findOne({
      where: { id: req.params.id, patient_id: profile.id },
    });

    if (!member) {
      return res.status(404).json({ success: false, message: "Family member not found" });
    }

    const { name, relation, gender, dob, blood_group, phone } = req.body;
    await member.update({
      name: name !== undefined ? name.trim() : member.name,
      relation: relation !== undefined ? relation : member.relation,
      gender: gender !== undefined ? gender : member.gender,
      dob: dob !== undefined ? dob : member.dob,
      blood_group: blood_group !== undefined ? blood_group : member.blood_group,
      phone: phone !== undefined ? phone : member.phone,
    });

    return res.json({ success: true, data: member });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteFamilyMember = async (req, res) => {
  try {
    const profile = await getPatientProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Patient profile not found" });
    }

    const member = await PatientFamilyMember.findOne({
      where: { id: req.params.id, patient_id: profile.id },
    });

    if (!member) {
      return res.status(404).json({ success: false, message: "Family member not found" });
    }

    await member.destroy();
    return res.json({ success: true, message: "Family member removed successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listFamilyMembers,
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
};
