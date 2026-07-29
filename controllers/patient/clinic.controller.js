const { Op } = require("sequelize");
const {
  Clinic,
  City,
  Department,
  Service,
  ClinicGallery,
  ClinicService,
} = require("../../models");

const listClinics = async (req, res) => {
  try {
    const { search, city } = req.query;

    const where = { status: "active" };
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search.trim()}%` } },
        { address: { [Op.like]: `%${search.trim()}%` } },
      ];
    }
    if (city) {
      where.city = { [Op.like]: `%${city.trim()}%` };
    }

    const clinics = await Clinic.findAll({
      where,
      include: [
        {
          model: Department,
          as: "departments",
          through: { attributes: [] },
        },
        {
          model: Service,
          as: "services",
          through: { attributes: [] },
        },
      ],
      order: [["name", "ASC"]],
    });

    return res.json({ success: true, data: clinics });
  } catch (error) {
    console.error("Error listing clinics for patient:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getClinicDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const clinic = await Clinic.findByPk(id, {
      include: [
        {
          model: Department,
          as: "departments",
          through: { attributes: [] },
        },
        {
          model: Service,
          as: "services",
          through: { attributes: [] },
        },
        {
          model: ClinicGallery,
          as: "galleries",
        },
      ],
    });

    if (!clinic) {
      return res.status(404).json({ success: false, message: "Clinic not found" });
    }

    return res.json({ success: true, data: clinic });
  } catch (error) {
    console.error("Error getting clinic details for patient:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getClinicGallery = async (req, res) => {
  try {
    const { id } = req.params;

    const gallery = await ClinicGallery.findAll({
      where: { clinic_id: id },
      order: [["id", "DESC"]],
    });

    return res.json({ success: true, data: gallery });
  } catch (error) {
    console.error("Error getting clinic gallery for patient:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getClinicServices = async (req, res) => {
  try {
    const { id } = req.params;

    const clinic = await Clinic.findByPk(id, {
      include: [
        {
          model: Service,
          as: "services",
          through: { attributes: [] },
        },
      ],
    });

    if (!clinic) {
      return res.status(404).json({ success: false, message: "Clinic not found" });
    }

    return res.json({ success: true, data: clinic.services || [] });
  } catch (error) {
    console.error("Error getting clinic services for patient:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listClinics,
  getClinicDetails,
  getClinicGallery,
  getClinicServices,
};
