const { Op } = require("sequelize");
const { ClinicService, Service, Clinic, ClinicUser } = require("../../models");

const getClinicId = async (req) => {
  if (req?.user?.id) {
    const cu = await ClinicUser.findOne({ where: { user_id: req.user.id } });
    if (cu) return cu.clinic_id;
  }
  const clinic = await Clinic.findOne({ attributes: ["id"], order: [["id", "ASC"]] });
  return clinic ? clinic.id : 1;
};

const listClinicServices = async (req, res) => {
  try {
    const clinicId = await getClinicId(req);
    const { search, status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const serviceWhere = {};
    if (search) {
      serviceWhere.name = { [Op.like]: `%${search}%` };
    }
    if (status) {
      serviceWhere.status = status;
    }

    const { count, rows: clinicServices } = await ClinicService.findAndCountAll({
      where: { clinic_id: clinicId },
      include: [
        {
          model: Service,
          as: "service",
          where: Object.keys(serviceWhere).length > 0 ? serviceWhere : undefined,
          required: Object.keys(serviceWhere).length > 0,
        },
      ],
      limit,
      offset,
      order: [["id", "DESC"]],
    });

    const data = clinicServices
      .map((cs) => {
        const svc = cs.service;
        if (!svc) return null;

        return {
          id: cs.id,
          service_id: cs.service_id,
          name: svc.name,
          description: svc.description || "",
          price: svc.price || 0,
          status: svc.status || "active",
        };
      })
      .filter(Boolean);

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
    const clinicId = await getClinicId(req);
    const { service_id, service_ids, name, price } = req.body;

    let targetIds = [];
    if (Array.isArray(service_ids) && service_ids.length > 0) {
      targetIds = service_ids.map((id) => parseInt(id)).filter(Boolean);
    } else if (service_id) {
      targetIds = [parseInt(service_id)];
    } else if (name) {
      const [svc] = await Service.findOrCreate({
        where: { name },
        defaults: { name, price: price || 500, status: "active" },
      });
      targetIds = [svc.id];
    }

    if (targetIds.length === 0) {
      return res.status(400).json({ success: false, message: "Service ID(s) or Name is required" });
    }

    let assignedCount = 0;
    for (const targetServiceId of targetIds) {
      let created = await ClinicService.findOne({
        where: { clinic_id: clinicId, service_id: targetServiceId },
        paranoid: false,
      });

      if (created) {
        if (created.deleted_at || created.deletedAt || created.getDataValue("deleted_at") || created.getDataValue("deletedAt")) {
          await created.restore();
          assignedCount++;
        }
      } else {
        await ClinicService.create({
          clinic_id: clinicId,
          service_id: targetServiceId,
        });
        assignedCount++;
      }
    }

    return res.status(201).json({
      success: true,
      message: `${assignedCount || targetIds.length} service(s) assigned to clinic successfully`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const removeService = async (req, res) => {
  try {
    const clinicId = await getClinicId(req);
    const idParam = req.params.id;
    const { ids } = req.body || {};

    let targetIds = [];
    if (Array.isArray(ids) && ids.length > 0) {
      targetIds = ids.map((i) => parseInt(i)).filter(Boolean);
    } else if (idParam && idParam !== "bulk") {
      targetIds = [parseInt(idParam)];
    }

    if (targetIds.length > 0) {
      await ClinicService.destroy({
        where: { clinic_id: clinicId, id: targetIds },
      });
    }

    return res.json({ success: true, message: "Service(s) removed from clinic" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateServiceStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    let targetServiceId = id;
    const cs = await ClinicService.findByPk(id);
    if (cs) {
      targetServiceId = cs.service_id;
    }

    const svc = await Service.findByPk(targetServiceId);
    if (!svc) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    const newStatus = status || (svc.status === "active" ? "inactive" : "active");
    await svc.update({ status: newStatus });

    return res.json({
      success: true,
      message: `Service status updated to ${newStatus}`,
      status: newStatus,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listClinicServices,
  assignService,
  removeService,
  updateServiceStatus,
};
