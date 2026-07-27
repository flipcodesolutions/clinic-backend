const { Op } = require("sequelize");
const { ClinicGallery, Clinic, ClinicUser } = require("../../models");
const { deleteOldFile } = require("../../utils/file.utils");

const getClinicId = async (req) => {
  if (req?.user?.id) {
    const cu = await ClinicUser.findOne({ where: { user_id: req.user.id } });
    if (cu?.clinic_id) return cu.clinic_id;
  }
  const clinic = await Clinic.findOne({ attributes: ["id"], order: [["id", "ASC"]] });
  return clinic ? clinic.id : 1;
};

const listGallery = async (req, res) => {
  try {
    const clinicId = await getClinicId(req);
    const { search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const where = { clinic_id: clinicId };

    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }

    const { count, rows: items } = await ClinicGallery.findAndCountAll({
      where,
      order: [["id", "DESC"]],
      limit,
      offset,
    });

    const formattedData = items.map((item) => {
      const json = item.toJSON();
      return {
        ...json,
        photo: json.photo || json.image_url,
        image_url: json.photo || json.image_url,
      };
    });

    return res.json({
      success: true,
      count,
      currentPage: page,
      totalPages: Math.ceil(count / limit) || 1,
      limit,
      data: formattedData,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createGalleryItem = async (req, res) => {
  try {
    const clinicId = await getClinicId(req);
    const { title, image_url, photo } = req.body;
    const photoUrl = photo || image_url;

    if (!photoUrl) {
      return res.status(400).json({ success: false, message: "Photo URL or file is required" });
    }

    const item = await ClinicGallery.create({
      clinic_id: clinicId,
      title: title || "Clinic Photo",
      photo: photoUrl,
      uploaded_by: req.user ? req.user.id : null,
    });

    const json = item.toJSON();
    const formatted = {
      ...json,
      photo: json.photo || json.image_url,
      image_url: json.photo || json.image_url,
    };

    return res.status(201).json({ success: true, data: formatted, message: "Gallery image uploaded successfully" });
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

    const newPhoto = req.body.photo || req.body.image_url;

    if (newPhoto && item.photo && item.photo !== newPhoto) {
      deleteOldFile(item.photo);
    }

    const updateData = {};
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (newPhoto) updateData.photo = newPhoto;

    await item.update(updateData);

    const json = item.toJSON();
    const formatted = {
      ...json,
      photo: json.photo || json.image_url,
      image_url: json.photo || json.image_url,
    };

    return res.json({ success: true, data: formatted, message: "Gallery image updated successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteGalleryItem = async (req, res) => {
  try {
    const item = await ClinicGallery.findByPk(req.params.id, { paranoid: false });
    if (!item) {
      return res.status(404).json({ success: false, message: "Gallery item not found" });
    }

    if (item.photo) {
      deleteOldFile(item.photo);
    }

    await item.destroy({ force: true });
    return res.json({ success: true, message: "Gallery item deleted permanently" });
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
