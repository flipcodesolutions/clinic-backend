const { Op } = require("sequelize");
const { ClinicDepartment, Department, Clinic, User, DoctorProfile, ClinicUser } = require("../../models");

const getClinicId = async (req) => {
  if (req?.user?.id) {
    const cu = await ClinicUser.findOne({ where: { user_id: req.user.id } });
    if (cu) return cu.clinic_id;
  }
  const clinic = await Clinic.findOne({ attributes: ["id"], order: [["id", "ASC"]] });
  return clinic ? clinic.id : 1;
};

const listClinicDepartments = async (req, res) => {
  try {
    const clinicId = await getClinicId(req);
    const { search, status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const deptWhere = {};
    if (search) {
      deptWhere.name = { [Op.like]: `%${search}%` };
    }
    if (status) {
      deptWhere.status = status;
    }

    const { count, rows: clinicDepts } = await ClinicDepartment.findAndCountAll({
      where: { clinic_id: clinicId },
      include: [
        {
          model: Department,
          as: "department",
          where: Object.keys(deptWhere).length > 0 ? deptWhere : undefined,
          required: Object.keys(deptWhere).length > 0,
        },
      ],
      limit,
      offset,
      order: [["id", "DESC"]],
    });

    const data = await Promise.all(
      clinicDepts.map(async (cd) => {
        const dept = cd.department;
        if (!dept) return null;

        const docCount = await User.count({
          where: { status: "active" },
          include: [
            {
              model: DoctorProfile,
              as: "doctorProfile",
              where: { specialization: dept.name },
              required: true,
            },
          ],
        }).catch(() => 0);

        return {
          id: dept.id,
          clinic_department_id: cd.id,
          name: dept.name,
          description: dept.description,
          status: dept.status || "active",
          doctor_count: docCount,
        };
      })
    );

    const filteredData = data.filter(Boolean);

    return res.json({
      success: true,
      count,
      currentPage: page,
      totalPages: Math.ceil(count / limit) || 1,
      limit,
      data: filteredData,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const assignDepartment = async (req, res) => {
  try {
    const clinicId = await getClinicId(req);
    const { department_id, name, description } = req.body;

    let targetDeptId = department_id;

    if (!targetDeptId && name) {
      const [dept] = await Department.findOrCreate({
        where: { name },
        defaults: { name, description: description || "Specialty Department" },
      });
      targetDeptId = dept.id;
    }

    if (!targetDeptId) {
      return res.status(400).json({ success: false, message: "Department ID or Name is required" });
    }

    const existing = await ClinicDepartment.findOne({
      where: { clinic_id: clinicId, department_id: targetDeptId },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: "Department already assigned to clinic" });
    }

    await ClinicDepartment.create({
      clinic_id: clinicId,
      department_id: targetDeptId,
    });

    const deptObj = await Department.findByPk(targetDeptId);

    return res.status(201).json({
      success: true,
      data: {
        id: deptObj.id,
        name: deptObj.name,
        description: deptObj.description,
        doctor_count: 0,
        status: "Active",
      },
      message: "Department assigned to clinic successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const removeDepartment = async (req, res) => {
  try {
    const clinicId = await getClinicId(req);
    const deptId = req.params.id;

    await ClinicDepartment.destroy({
      where: { clinic_id: clinicId, department_id: deptId },
    });

    return res.json({ success: true, message: "Department removed from clinic" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listClinicDepartments,
  assignDepartment,
  removeDepartment,
};
