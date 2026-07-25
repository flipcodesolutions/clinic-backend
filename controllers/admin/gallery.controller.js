const { Op } = require("sequelize");
const { ClinicGallery, Clinic } = require("../../models");
const { deleteOldFile } = require("../../utils/file.utils");

const getClinicId = async () => {
  const clinic = await Clinic.findOne({ attributes: ["id"], order: [["id", "ASC"]] });
  return clinic ? clinic.id : 1;
};

const listGallery = async (req, res) => {
  try {
    const clinicId = await getClinicId();
    const { search, category } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const where = { clinic_id: clinicId };

    if (category && category !== "All") {
      where.category = category;
    }
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { caption: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: items } = await ClinicGallery.findAndCountAll({
      where,
      order: [["id", "DESC"]],
      limit,
      offset,
    });

    return res.json({
      success: true,
      count,
      currentPage: page,
      totalPages: Math.ceil(count / limit) || 1,
      limit,
      data: items,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createGalleryItem = async (req, res) => {
  try {
    const clinicId = await getClinicId();
    const { title, category, image_url, caption } = req.body;

    if (!image_url) {
      return res.status(400).json({ success: false, message: "Image URL is required" });
    }

    const item = await ClinicGallery.create({
      clinic_id: clinicId,
      title: title || "Clinic Photo",
      category: category || "General",
      image_url,
      caption: caption || "",
      uploaded_by: req.user ? req.user.id : null,
    });

    return res.status(201).json({ success: true, data: item, message: "Gallery image uploaded successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateGalleryItem = async (req, res) => {
  try {
    const item = await ClinicGallery.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Gallery item not found" });
    }

    if (req.body.image_url && item.image_url && item.image_url !== req.body.image_url) {
      deleteOldFile(item.image_url);
    }

    await item.update(req.body);
    return res.json({ success: true, data: item, message: "Gallery image updated successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteGalleryItem = async (req, res) => {
  try {
    const item = await ClinicGallery.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Gallery item not found" });
    }

    if (item.image_url) {
      deleteOldFile(item.image_url);
    }

    await item.destroy();
    return res.json({ success: true, message: "Gallery item deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
};
