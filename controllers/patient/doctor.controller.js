const { Op } = require("sequelize");
const {
  DoctorProfile,
  User,
  Department,
  DoctorExperience,
  DoctorAchievement,
  DoctorSchedule,
  Review,
  Clinic,
} = require("../../models");

const listDoctors = async (req, res) => {
  try {
    const { search, department_id, clinic_id, specialization } = req.query;

    const where = {};
    if (specialization) {
      where.specialization = { [Op.like]: `%${specialization.trim()}%` };
    }

    const userWhere = {};
    if (search) {
      userWhere[Op.or] = [
        { first_name: { [Op.like]: `%${search.trim()}%` } },
        { last_name: { [Op.like]: `%${search.trim()}%` } },
      ];
    }

    const departmentInclude = {
      model: Department,
      as: "departments",
      through: { attributes: [] },
    };
    if (department_id) {
      departmentInclude.where = { id: department_id };
    }

    const scheduleInclude = {
      model: DoctorSchedule,
      as: "schedules",
      include: [{ model: Clinic, as: "clinic" }],
    };
    if (clinic_id) {
      scheduleInclude.where = { clinic_id };
    }

    const doctors = await DoctorProfile.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "first_name", "last_name", "email", "phone", "profile_image"],
          where: Object.keys(userWhere).length ? userWhere : undefined,
        },
        departmentInclude,
        scheduleInclude,
      ],
      order: [["id", "DESC"]],
    });

    return res.json({ success: true, data: doctors });
  } catch (error) {
    console.error("Error listing doctors for patient:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getDoctorProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await DoctorProfile.findOne({
      where: {
        [Op.or]: [{ id }, { user_id: id }],
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "first_name", "last_name", "email", "phone", "profile_image"],
        },
        {
          model: Department,
          as: "departments",
          through: { attributes: [] },
        },
        {
          model: DoctorExperience,
          as: "experiences",
        },
        {
          model: DoctorAchievement,
          as: "achievements",
        },
        {
          model: DoctorSchedule,
          as: "schedules",
          include: [{ model: Clinic, as: "clinic" }],
        },
        {
          model: Review,
          as: "reviews",
          include: [
            {
              model: User,
              as: "patientUser",
              attributes: ["first_name", "last_name"],
            },
          ],
        },
      ],
    });

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    return res.json({ success: true, data: doctor });
  } catch (error) {
    console.error("Error getting doctor profile for patient:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listDoctors,
  getDoctorProfile,
};
