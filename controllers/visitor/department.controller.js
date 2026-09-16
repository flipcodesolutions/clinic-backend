const { Op } = require("sequelize");
const { Department } = require("../../models");

const listVisitorDepartments = async (req, res) => {
  try {
    const { search } = req.query;
    const where = { status: "active" };

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search.trim()}%` } },
        { description: { [Op.like]: `%${search.trim()}%` } },
      ];
    }

    const departments = await Department.findAll({
      where,
      include: [
        {
          model: Department,
          as: "parent",
          attributes: ["id", "name"],
        },
      ],
      order: [["name", "ASC"]],
      attributes: ["id", "parent_id", "is_parent", "name", "description", "status", "created_at"],
    });

    return res.json({
      success: true,
      count: departments.length,
      data: departments,
    });
  } catch (error) {
    console.error("Error listing departments for visitor:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getVisitorDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findOne({
      where: { id, status: "active" },
      include: [
        {
          model: Department,
          as: "parent",
          attributes: ["id", "name"],
        },
        {
          model: Department,
          as: "subDepartments",
          attributes: ["id", "name", "description", "status"],
        },
      ],
    });

    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    return res.json({ success: true, data: department });
  } catch (error) {
    console.error("Error getting department for visitor:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const listVisitorCities = async (req, res) => {
  try {
    const { Clinic } = require("../../models");
    const clinics = await Clinic.findAll({
      attributes: ["city"],
      where: {
        city: { [Op.ne]: null },
      },
    });
    const cities = [...new Set(clinics.map((c) => c.city?.trim()).filter(Boolean))].sort();
    return res.json({ success: true, cities });
  } catch (error) {
    console.error("Error listing visitor cities:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listVisitorDepartments,
  getVisitorDepartmentById,
  listVisitorCities,
};
