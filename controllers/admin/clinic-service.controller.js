const { Op } = require("sequelize");
const { ClinicService, Service, Clinic } = require("../../models");

const getClinicId = async () => {
  const clinic = await Clinic.findOne({ attributes: ["id"], order: [["id", "ASC"]] });
  return clinic ? clinic.id : 1;
};

const listClinicServices = async (req, res) => {
  try {
    const clinicId = await getClinicId();
    const { search, status, category } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const where = { clinic_id: clinicId };
    if (status) {
      where.status = status;
    }
    if (category) {
      where.category = category;
    }

    const serviceWhere = {};
    if (search) {
      serviceWhere.name = { [Op.like]: `%${search}%` };
    }

    const { count, rows: clinicServices } = await ClinicService.findAndCountAll({
      where,
      include: [
        {
          model: Service,
          as: "service",
          where: Object.keys(serviceWhere).length > 0 ? serviceWhere : undefined,
        },
      ],
      limit,
      offset,
      order: [["id", "DESC"]],
    });

    const data = clinicServices.map((cs) => ({
      id: cs.id,
      service_id: cs.service_id,
      name: cs.service ? cs.service.name : "Custom Service",
      price: cs.price,
      duration: cs.duration || "20 mins",
      category: cs.category || (cs.service ? cs.service.category : "General"),
      status: cs.status || "active",
    }));

    return res.json({
      success: true,
      count,
      currentPage: page,
      totalPages: Math.ceil(count / limit) || 1,
      limit,
      data,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const assignService = async (req, res) => {
  try {
    const clinicId = await getClinicId();
    const { service_id, name, price, duration, category } = req.body;

    let targetServiceId = service_id;

    if (!targetServiceId && name) {
      const [svc] = await Service.findOrCreate({
        where: { name },
        defaults: { name, price: price || 500, category: category || "Consultation" },
      });
      targetServiceId = svc.id;
    }

    if (!targetServiceId) {
      return res.status(400).json({ success: false, message: "Service ID or Name is required" });
    }

    const created = await ClinicService.create({
      clinic_id: clinicId,
      service_id: targetServiceId,
      price: price || 500,
      duration: duration || "20 mins",
      category: category || "General",
      status: "active",
    });

    const svcObj = await Service.findByPk(targetServiceId);

    return res.status(201).json({
      success: true,
      data: {
        id: created.id,
        service_id: targetServiceId,
        name: svcObj ? svcObj.name : name,
        price: created.price,
        duration: created.duration,
        category: created.category,
        status: created.status,
      },
      message: "Service assigned to clinic successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const removeService = async (req, res) => {
  try {
    const cs = await ClinicService.findByPk(req.params.id);
    if (!cs) {
      return res.status(404).json({ success: false, message: "Clinic service not found" });
    }

    await cs.destroy();
    return res.json({ success: true, message: "Service removed from clinic" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listClinicServices,
  assignService,
  removeService,
};
