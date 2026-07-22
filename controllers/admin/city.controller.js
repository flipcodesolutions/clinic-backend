const { Op } = require("sequelize");
const { City } = require("../../models");

const listCities = async (req, res) => {
  try {
    const { search, status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }
    if (status) {
      where.status = status;
    }

    const { count, rows: cities } = await City.findAndCountAll({
      where,
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
      data: cities,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getCityById = async (req, res) => {
  try {
    const city = await City.findByPk(req.params.id);
    if (!city) {
      return res.status(404).json({ success: false, message: "City not found" });
    }
    return res.json({ success: true, data: city });
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

module.exports = {
  listCities,
  getCityById,
  createCity,
  updateCity,
  deleteCity,
};
