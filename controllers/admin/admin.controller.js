const {
  Clinic,
  Department,
  Service,
  City,
  User,
  Setting,
} = require("../../models");

function publicUser(user) {
  const data = user.toJSON();
  delete data.password;
  return data;
}

// Clinics
const listClinics = async (req, res) => {
  try {
    const clinics = await Clinic.findAll({ order: [["id", "DESC"]] });
    return res.json({ success: true, data: clinics });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createClinic = async (req, res) => {
  try {
    const clinic = await Clinic.create({ ...req.body, created_by: req.user.id });
    return res.status(201).json({ success: true, data: clinic });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getClinic = async (req, res) => {
  try {
    const clinic = await Clinic.findByPk(req.params.id);
    if (!clinic) {
      return res.status(404).json({ success: false, message: "Clinic not found" });
    }
    return res.json({ success: true, data: clinic });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateClinic = async (req, res) => {
  try {
    const clinic = await Clinic.findByPk(req.params.id);
    if (!clinic) {
      return res.status(404).json({ success: false, message: "Clinic not found" });
    }
    await clinic.update(req.body);
    return res.json({ success: true, data: clinic });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteClinic = async (req, res) => {
  try {
    const clinic = await Clinic.findByPk(req.params.id);
    if (!clinic) {
      return res.status(404).json({ success: false, message: "Clinic not found" });
    }
    await clinic.destroy();
    return res.json({ success: true, message: "Clinic deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Departments
const listDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll({ order: [["id", "DESC"]] });
    return res.json({ success: true, data: departments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createDepartment = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "name is required" });
    }
    const department = await Department.create({ name, description, status });
    return res.status(201).json({ success: true, data: department });
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
    await department.update(req.body);
    return res.json({ success: true, data: department });
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
    await department.destroy();
    return res.json({ success: true, message: "Department deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Services
const listServices = async (req, res) => {
  try {
    const services = await Service.findAll({ order: [["id", "DESC"]] });
    return res.json({ success: true, data: services });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createService = async (req, res) => {
  try {
    const { name, description, price, status } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "name is required" });
    }
    const service = await Service.create({ name, description, price, status });
    return res.status(201).json({ success: true, data: service });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }
    await service.update(req.body);
    return res.json({ success: true, data: service });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }
    await service.destroy();
    return res.json({ success: true, message: "Service deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Cities
const listCities = async (req, res) => {
  try {
    const cities = await City.findAll({ order: [["name", "ASC"]] });
    return res.json({ success: true, data: cities });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createCity = async (req, res) => {
  try {
    const { name, status } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "name is required" });
    }
    const city = await City.create({ name, status });
    return res.status(201).json({ success: true, data: city });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateCity = async (req, res) => {
  try {
    const city = await City.findByPk(req.params.id);
    if (!city) {
      return res.status(404).json({ success: false, message: "City not found" });
    }
    await city.update(req.body);
    return res.json({ success: true, data: city });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCity = async (req, res) => {
  try {
    const city = await City.findByPk(req.params.id);
    if (!city) {
      return res.status(404).json({ success: false, message: "City not found" });
    }
    await city.destroy();
    return res.json({ success: true, message: "City deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Users
const listUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["id", "DESC"]],
    });
    return res.json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "inactive", "blocked"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    await user.update({ status });
    return res.json({ success: true, data: publicUser(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Settings
const listSettings = async (req, res) => {
  try {
    const settings = await Setting.findAll({ order: [["setting_key", "ASC"]] });
    return res.json({ success: true, data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const upsertSetting = async (req, res) => {
  try {
    const { setting_key, setting_value, description } = req.body;
    if (!setting_key) {
      return res.status(400).json({ success: false, message: "setting_key is required" });
    }

    let setting = await Setting.findOne({ where: { setting_key } });
    if (setting) {
      await setting.update({ setting_value, description });
    } else {
      setting = await Setting.create({ setting_key, setting_value, description });
    }

    return res.json({ success: true, data: setting });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listClinics,
  createClinic,
  getClinic,
  updateClinic,
  deleteClinic,
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  listServices,
  createService,
  updateService,
  deleteService,
  listCities,
  createCity,
  updateCity,
  deleteCity,
  listUsers,
  updateUserStatus,
  listSettings,
  upsertSetting,
};
