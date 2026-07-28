const { Op } = require("sequelize");
const { User, DoctorProfile, StaffProfile, ClinicDepartment, ClinicService, Appointment, ClinicUser, Clinic, sequelize } = require("../../models");

const getClinicId = async (req) => {
  if (req?.user?.id) {
    const cu = await ClinicUser.findOne({ where: { user_id: req.user.id } });
    if (cu?.clinic_id) return cu.clinic_id;
  }
  const clinic = await Clinic.findOne({ attributes: ["id"], order: [["id", "ASC"]] });
  return clinic ? clinic.id : 1;
};

const getClinicDashboard = async (req, res) => {
  try {
    const clinicId = await getClinicId(req);
    const today = new Date().toISOString().slice(0, 10);

    const clinicUserInclude = {
      model: ClinicUser,
      as: "clinicUsers",
      where: { clinic_id: clinicId },
      attributes: [],
    };

    // Today's appointments count & list for this clinic
    const appointments = await Appointment.findAll({
      where: {
        appointment_date: today,
        clinic_id: clinicId,
      },
      include: [
        { model: User, as: "patient", attributes: ["first_name", "last_name"] },
        { model: DoctorProfile, as: "doctor", include: [{ model: User, as: "user", attributes: ["first_name", "last_name"] }] },
      ],
      order: [["id", "DESC"]],
      limit: 10,
    }).catch(() => []);

    const formattedAppointments = appointments.map((app) => ({
      id: app.id,
      patient_name: app.patient ? `${app.patient.first_name || ""} ${app.patient.last_name || ""}`.trim() : "Patient",
      doctor_name: app.doctor?.user ? `Dr. ${app.doctor.user.first_name} ${app.doctor.user.last_name}` : "Doctor",
      specialty: app.doctor?.specialization || "General",
      time: app.slot_time || "10:00 AM",
      type: app.type || "In-Clinic",
      status: app.status || "confirmed",
    }));

    // Active doctors count & preview list for this clinic
    const doctorsCount = await User.count({
      where: { status: "active" },
      include: [
        {
          model: DoctorProfile,
          as: "doctorProfile",
          required: true,
        },
        clinicUserInclude,
      ],
      distinct: true,
    }).catch(() => 0);

    const doctorsList = await User.findAll({
      where: { status: "active" },
      include: [
        {
          model: DoctorProfile,
          as: "doctorProfile",
          required: true,
        },
        clinicUserInclude,
      ],
      limit: 10,
    }).catch(() => []);

    const formattedDoctors = doctorsList.map((doc) => ({
      id: doc.id,
      first_name: doc.first_name,
      last_name: doc.last_name,
      email: doc.email,
      specialty: doc.doctorProfile?.specialization || "General Medicine",
      qualification: doc.doctorProfile?.qualification || "MBBS",
      status: doc.status || "active",
      photo_url: doc.doctorProfile?.profile_image || "",
    }));

    // Staff list & total count for this clinic
    const staffRoles = ["receptionist", "nurse", "staff", "caretaker"];
    const staffWhere = {
      status: "active",
      [Op.or]: staffRoles.map((r) =>
        sequelize.where(
          sequelize.cast(sequelize.col("User.roles"), "CHAR"),
          "LIKE",
          `%${r}%`
        )
      ),
    };

    const staffUsers = await User.findAll({
      where: staffWhere,
      include: [clinicUserInclude],
      attributes: ["id", "roles"],
    }).catch(() => []);

    const totalStaffCount = staffUsers.length;

    const staffList = await User.findAll({
      where: staffWhere,
      include: [
        {
          model: StaffProfile,
          as: "staffProfile",
        },
        clinicUserInclude,
      ],
      limit: 10,
    }).catch(() => []);

    const formattedStaff = staffList.map((st) => ({
      id: st.id,
      first_name: st.first_name,
      last_name: st.last_name,
      email: st.email,
      phone: st.phone,
      role: Array.isArray(st.roles) ? st.roles[0] : "staff",
      designation: st.staffProfile?.designation || "Staff Member",
      shift: st.staffProfile?.shift ? st.staffProfile.shift.charAt(0).toUpperCase() + st.staffProfile.shift.slice(1) : null,
      status: st.status || "active",
    }));

    const departmentsCount = await ClinicDepartment.count({ where: { clinic_id: clinicId } }).catch(() => 0);
    const servicesCount = await ClinicService.count({ where: { clinic_id: clinicId } }).catch(() => 0);
    const todayAppointmentsCount = await Appointment.count({ where: { appointment_date: today, clinic_id: clinicId } }).catch(() => formattedAppointments.length);

    return res.json({
      success: true,
      stats: {
        todayAppointments: todayAppointmentsCount,
        doctorsCount: doctorsCount,
        staffCount: totalStaffCount,
        departmentsCount,
        servicesCount,
      },
      appointments: formattedAppointments,
      doctors: formattedDoctors,
      staff: formattedStaff,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getClinicDashboard,
};
