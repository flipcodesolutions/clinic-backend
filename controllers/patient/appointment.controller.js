const { Op } = require("sequelize");
const {
  Appointment,
  AppointmentStatusHistory,
  Clinic,
  DoctorProfile,
  User,
  Department,
} = require("../../models");
const { getPatientProfile } = require("./helpers");

const appointmentIncludes = [
  {
    model: Clinic,
    as: "clinic",
    attributes: ["id", "name", "phone", "email", "address", "city"],
  },
  {
    model: DoctorProfile,
    as: "doctor",
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "first_name", "last_name", "email", "phone", "profile_image"],
      },
    ],
  },
  {
    model: Department,
    as: "department",
    attributes: ["id", "name"],
  },
];

const listAppointments = async (req, res) => {
  try {
    const profile = await getPatientProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Patient profile not found" });
    }

    const { search, status, page, limit } = req.query;

    const where = { patient_id: profile.id };

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { appointment_number: { [Op.like]: `%${search.trim()}%` } },
        { reason: { [Op.like]: `%${search.trim()}%` } },
      ];
    }

    const order = [["appointment_date", "DESC"], ["start_time", "DESC"]];

    if (page || limit) {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const offset = (pageNum - 1) * limitNum;

      const { count, rows: appointments } = await Appointment.findAndCountAll({
        where,
        include: appointmentIncludes,
        order,
        limit: limitNum,
        offset,
      });

      return res.json({
        success: true,
        count,
        currentPage: pageNum,
        totalPages: Math.ceil(count / limitNum) || 1,
        limit: limitNum,
        data: appointments,
      });
    }

    const appointments = await Appointment.findAll({
      where,
      include: appointmentIncludes,
      order,
    });

    return res.json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error("Error listing patient appointments:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAppointment = async (req, res) => {
  try {
    const profile = await getPatientProfile(req.user.id);
    const appointment = await Appointment.findOne({
      where: { id: req.params.id, patient_id: profile.id },
      include: appointmentIncludes,
    });
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    return res.json({ success: true, data: appointment });
  } catch (error) {
    console.error("Error getting patient appointment:", error);
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

    // Required Field Validation
    if (!clinic_id || !doctor_id || !appointment_date || !start_time) {
      return res.status(400).json({
        success: false,
        message: "clinic_id, doctor_id, appointment_date and start_time are required",
      });
    }

    // Verify Clinic Existence
    const clinicExists = await Clinic.findByPk(clinic_id);
    if (!clinicExists) {
      return res.status(400).json({ success: false, message: "Invalid clinic selected" });
    }

    // Verify Doctor Existence
    const doctorExists = await DoctorProfile.findByPk(doctor_id);
    if (!doctorExists) {
      return res.status(400).json({ success: false, message: "Invalid doctor selected" });
    }

    const appointment = await Appointment.create({
      appointment_number: `APT-${Date.now()}`,
      clinic_id,
      doctor_id,
      patient_id: profile.id,
      department_id: department_id || null,
      appointment_date,
      start_time,
      end_time: end_time || null,
      visit_type: visit_type || "new",
      consultation_type: consultation_type || "in_person",
      reason: reason || null,
      booked_by: req.user.id,
      status: "scheduled",
    });

    await AppointmentStatusHistory.create({
      appointment_id: appointment.id,
      status: "scheduled",
      changed_by: req.user.id,
      remarks: "Appointment booked by patient",
    });

    const fullAppointment = await Appointment.findByPk(appointment.id, {
      include: appointmentIncludes,
    });

    return res.status(201).json({ success: true, message: "Appointment booked successfully", data: fullAppointment });
  } catch (error) {
    console.error("Error booking patient appointment:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const profile = await getPatientProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Patient profile not found" });
    }

    const { id } = req.params;
    const { remarks } = req.body || {};

    const appointment = await Appointment.findOne({
      where: { id, patient_id: profile.id },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({ success: false, message: "Appointment is already cancelled" });
    }

    if (appointment.status === "completed") {
      return res.status(400).json({ success: false, message: "Completed appointment cannot be cancelled" });
    }

    await appointment.update({ status: "cancelled", remarks: remarks || "Cancelled by patient" });

    await AppointmentStatusHistory.create({
      appointment_id: appointment.id,
      status: "cancelled",
      changed_by: req.user.id,
      remarks: remarks || "Cancelled by patient",
    });

    return res.json({ success: true, message: "Appointment cancelled successfully", data: appointment });
  } catch (error) {
    console.error("Error cancelling patient appointment:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listAppointments,
  getAppointment,
  bookAppointment,
  cancelAppointment,
};
