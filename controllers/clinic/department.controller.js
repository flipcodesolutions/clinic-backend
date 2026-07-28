const { Op } = require("sequelize");
const { ClinicDepartment, Department, Clinic, ClinicUser } = require("../../models");

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
      deptWhere[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
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

    const filteredData = clinicDepts
      .map((cd) => {
        const dept = cd.department;
        if (!dept) return null;

        return {
          id: dept.id,
          clinic_department_id: cd.id,
          name: dept.name,
          description: dept.description,
          status: dept.status || "active",
        };
      })
      .filter(Boolean);

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
    const { department_id, department_ids, name, description } = req.body;

    let targetIds = [];
    if (Array.isArray(department_ids) && department_ids.length > 0) {
      targetIds = department_ids.map((id) => parseInt(id)).filter(Boolean);
    } else if (department_id) {
      targetIds = [parseInt(department_id)];
    } else if (name) {
      const [dept] = await Department.findOrCreate({
        where: { name },
        defaults: { name, description: description || "Specialty Department" },
      });
      targetIds = [dept.id];
    }

    if (targetIds.length === 0) {
      return res.status(400).json({ success: false, message: "Department ID(s) or Name is required" });
    }

    let assignedCount = 0;
    for (const targetDeptId of targetIds) {
      const existing = await ClinicDepartment.findOne({
        where: { clinic_id: clinicId, department_id: targetDeptId },
        paranoid: false,
      });

      if (existing) {
        if (existing.deleted_at || existing.deletedAt || existing.getDataValue("deleted_at") || existing.getDataValue("deletedAt")) {
          await existing.restore();
          assignedCount++;
        }
      } else {
        await ClinicDepartment.create({
          clinic_id: clinicId,
          department_id: targetDeptId,
        });
        assignedCount++;
      }
    }

    return res.status(201).json({
      success: true,
      message: `${assignedCount || targetIds.length} department(s) assigned to clinic successfully`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const removeDepartment = async (req, res) => {
  try {
    const clinicId = await getClinicId(req);
    const deptId = req.params.id;
    const { ids } = req.body || {};

    let targetIds = [];
    if (Array.isArray(ids) && ids.length > 0) {
      targetIds = ids.map((i) => parseInt(i)).filter(Boolean);
    } else if (deptId && deptId !== "bulk") {
      targetIds = [parseInt(deptId)];
    }

    if (targetIds.length > 0) {
      await ClinicDepartment.destroy({
        where: { clinic_id: clinicId, department_id: targetIds },
      });
    }

    return res.json({ success: true, message: "Department(s) removed from clinic" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateDepartmentStatus = async (req, res) => {
  try {
    const deptId = req.params.id;
    const { status } = req.body;

    const dept = await Department.findByPk(deptId);
    if (!dept) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    const newStatus = status || (dept.status === "active" ? "inactive" : "active");
    await dept.update({ status: newStatus });

    return res.json({
      success: true,
      message: `Department status updated to ${newStatus}`,
      status: newStatus,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const syncClinicDepartments = async (req, res) => {
  try {
    const clinicId = await getClinicId(req);
    const { department_ids } = req.body;

    if (!Array.isArray(department_ids)) {
      return res.status(400).json({ success: false, message: "department_ids array is required" });
    }

    const targetIds = department_ids.map((id) => parseInt(id)).filter(Boolean);

    // Get all existing active clinic department records
    const existingRecords = await ClinicDepartment.findAll({
      where: { clinic_id: clinicId },
    });

    const existingDeptIds = existingRecords.map((r) => r.department_id);

    // Determine IDs to add and remove
    const toAdd = targetIds.filter((id) => !existingDeptIds.includes(id));
    const toRemove = existingDeptIds.filter((id) => !targetIds.includes(id));

    if (toRemove.length > 0) {
      await ClinicDepartment.destroy({
        where: { clinic_id: clinicId, department_id: toRemove },
      });
    }

    for (const deptId of toAdd) {
      const existingDeleted = await ClinicDepartment.findOne({
        where: { clinic_id: clinicId, department_id: deptId },
        paranoid: false,
      });

      if (existingDeleted) {
        await existingDeleted.restore();
      } else {
        await ClinicDepartment.create({
          clinic_id: clinicId,
          department_id: deptId,
        });
      }
    }

    return res.json({
      success: true,
      message: "Clinic departments saved successfully",
      savedCount: targetIds.length,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listClinicDepartments,
  assignDepartment,
  removeDepartment,
  updateDepartmentStatus,
  syncClinicDepartments,
};

