const { Op } = require("sequelize");
const { Department } = require("../../models");

const listDepartments = async (req, res) => {
  try {
    const { search, status, is_parent, parent_id } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }
    if (status) {
      where.status = status;
    }
    if (is_parent !== undefined && is_parent !== "") {
      where.is_parent = is_parent === "true" || is_parent === true || is_parent === "1" || is_parent === 1;
    }
    if (parent_id) {
      where.parent_id = parent_id;
    }

    const { count, rows: departments } = await Department.findAndCountAll({
      where,
      include: [
        {
          model: Department,
          as: "parent",
          attributes: ["id", "name"],
        },
      ],
      order: [["name", "ASC"]],
      limit,
      offset,
    });

    return res.json({
      success: true,
      count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      limit,
      data: departments,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id, {
      include: [
        {
          model: Department,
          as: "parent",
          attributes: ["id", "name"],
        },
        {
          model: Department,
          as: "subDepartments",
          attributes: ["id", "name", "status"],
        },
      ],
    });
    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }
    return res.json({ success: true, data: department });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createDepartment = async (req, res) => {
  try {
    const { name, description, status, is_parent, parent_id } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "name is required" });
    }

    const isParentBool = is_parent === true || is_parent === "true" || is_parent === 1 || is_parent === "1";
    const finalParentId = isParentBool ? null : (parent_id ? Number(parent_id) : null);

    const department = await Department.create({
      name,
      description,
      status: status || "active",
      is_parent: isParentBool,
      parent_id: finalParentId,
    });

    const populated = await Department.findByPk(department.id, {
      include: [{ model: Department, as: "parent", attributes: ["id", "name"] }],
    });

    return res.status(201).json({ success: true, data: populated || department, message: "Department created successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    const updatePayload = { ...req.body };
    if (updatePayload.is_parent !== undefined) {
      const isParentBool =
        updatePayload.is_parent === true ||
        updatePayload.is_parent === "true" ||
        updatePayload.is_parent === 1 ||
        updatePayload.is_parent === "1";
      updatePayload.is_parent = isParentBool;
      updatePayload.parent_id = isParentBool ? null : (updatePayload.parent_id ? Number(updatePayload.parent_id) : null);
    } else if (updatePayload.parent_id !== undefined) {
      updatePayload.parent_id = updatePayload.parent_id ? Number(updatePayload.parent_id) : null;
    }

    await department.update(updatePayload);

    const populated = await Department.findByPk(department.id, {
      include: [{ model: Department, as: "parent", attributes: ["id", "name"] }],
    });

    return res.json({ success: true, data: populated || department, message: "Department updated successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    // Unlink any sub-departments before deleting parent
    await Department.update(
      { parent_id: null },
      { where: { parent_id: department.id } }
    );

    await department.destroy();
    return res.json({ success: true, message: "Department deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
