const { Op } = require("sequelize");
const { Clinic, ClinicUser } = require("../../models");
const { deleteOldFile } = require("../../utils/file.utils");

const listClinics = async (req, res) => {
  try {
    const { search, status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const where = {};

    // For Clinic Admin (non Super Admin), restrict to their assigned clinics via ClinicUser
    const userRole = req.user?.role || (Array.isArray(req.user?.roles) ? req.user.roles[0] : '');
    const isSuperAdmin = userRole === 'super_admin' || req.user?.roles?.includes('super_admin');

    if (!isSuperAdmin && req.user?.id) {
      const cuList = await ClinicUser.findAll({ where: { user_id: req.user.id } });
      const assignedClinicIds = cuList.map((cu) => cu.clinic_id).filter(Boolean);
      if (assignedClinicIds.length > 0) {
        where.id = { [Op.in]: assignedClinicIds };
      }
    }

    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }
    if (status) {
      where.status = status;
    }

    const { count, rows: clinics } = await Clinic.findAndCountAll({
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
      data: clinics,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const resolveGoogleMapCoordinates = async (url) => {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();

  // Try direct regex first on provided URL
  let targetUrl = decodeURIComponent(trimmed);
  const mPlaceDirect = targetUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (mPlaceDirect) return { lat: parseFloat(mPlaceDirect[1]), lng: parseFloat(mPlaceDirect[2]) };

  const mAtDirect = targetUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (mAtDirect) return { lat: parseFloat(mAtDirect[1]), lng: parseFloat(mAtDirect[2]) };

  const mQDirect = targetUrl.match(/[?&]q=(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/i);
  if (mQDirect) return { lat: parseFloat(mQDirect[1]), lng: parseFloat(mQDirect[2]) };

  // If it's a short URL, resolve redirect
  if (trimmed.includes("goo.gl") || trimmed.includes("maps.app") || trimmed.includes("bit.ly")) {
    try {
      const resp = await fetch(trimmed, { redirect: "follow" });
      if (resp && resp.url) {
        const resolved = decodeURIComponent(resp.url);
        const mPlace = resolved.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
        if (mPlace) return { lat: parseFloat(mPlace[1]), lng: parseFloat(mPlace[2]), resolvedUrl: resp.url };

        const mAt = resolved.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (mAt) return { lat: parseFloat(mAt[1]), lng: parseFloat(mAt[2]), resolvedUrl: resp.url };

        const mQ = resolved.match(/[?&]q=(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/i);
        if (mQ) return { lat: parseFloat(mQ[1]), lng: parseFloat(mQ[2]), resolvedUrl: resp.url };
      }
    } catch (e) {
      console.warn("Failed to resolve short map url:", e.message);
    }
  }

  return null;
};

const resolveMapUrl = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: "URL is required" });
    }
    const result = await resolveGoogleMapCoordinates(url);
    if (!result) {
      return res.json({ success: false, message: "Could not extract coordinates from link" });
    }
    return res.json({
      success: true,
      data: {
        latitude: result.lat,
        longitude: result.lng,
        resolvedUrl: result.resolvedUrl || url,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createClinic = async (req, res) => {
  try {
    const { name, phone, google_maps_url } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Clinic name is required" });
    }
    if (phone) {
      const cleanPhone = String(phone).replace(/\D/g, "");
      if (cleanPhone.length !== 10) {
        return res.status(400).json({ success: false, message: "Phone number must be exactly 10 digits" });
      }
    }

    let lat = req.body.latitude;
    let lng = req.body.longitude;
    if (google_maps_url) {
      const resolved = await resolveGoogleMapCoordinates(google_maps_url);
      if (resolved) {
        lat = resolved.lat;
        lng = resolved.lng;
      }
    }

    const clinic = await Clinic.create({
      ...req.body,
      latitude: lat ? parseFloat(lat) : null,
      longitude: lng ? parseFloat(lng) : null,
      created_by: req.user ? req.user.id : null,
    });
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
    if (req.body.phone) {
      const cleanPhone = String(req.body.phone).replace(/\D/g, "");
      if (cleanPhone.length !== 10) {
        return res.status(400).json({ success: false, message: "Phone number must be exactly 10 digits" });
      }
    }

    if (req.body.logo && clinic.logo && clinic.logo !== req.body.logo) {
      deleteOldFile(clinic.logo);
    }
    if (req.body.photo && clinic.photo && clinic.photo !== req.body.photo) {
      deleteOldFile(clinic.photo);
    }

    const updatePayload = { ...req.body };
    if (req.body.google_maps_url && (!req.body.latitude || !req.body.longitude || req.body.google_maps_url !== clinic.google_maps_url)) {
      const resolved = await resolveGoogleMapCoordinates(req.body.google_maps_url);
      if (resolved) {
        updatePayload.latitude = resolved.lat;
        updatePayload.longitude = resolved.lng;
      }
    }

    await clinic.update(updatePayload);
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
    if (clinic.logo) deleteOldFile(clinic.logo);
    if (clinic.photo) deleteOldFile(clinic.photo);

    await clinic.destroy();
    return res.json({ success: true, message: "Clinic deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getCurrentClinicProfile = async (req, res) => {
  try {
    let clinic = await Clinic.findOne({ order: [["id", "ASC"]] });
    if (!clinic) {
      clinic = await Clinic.create({
        name: "Medi Growth Clinic",
        description: "Leading multi-specialty healthcare provider.",
        status: "active",
      });
    }
    return res.json({ success: true, data: clinic });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateCurrentClinicProfile = async (req, res) => {
  try {
    const { name, description, address, city, state, phone, email, website } = req.body;
    let clinic = await Clinic.findOne({ order: [["id", "ASC"]] });
    const updatePayload = {};
    if (name !== undefined) updatePayload.name = name;
    if (description !== undefined) updatePayload.description = description;
    if (address !== undefined) updatePayload.address = address;
    if (city !== undefined) updatePayload.city = city;
    if (state !== undefined) updatePayload.state = state;
    if (phone !== undefined) updatePayload.phone = phone;
    if (email !== undefined) updatePayload.email = email;
    if (website !== undefined) updatePayload.website = website;

    if (!clinic) {
      clinic = await Clinic.create({ name: name || "Medi Growth Clinic", ...updatePayload });
    } else {
      await clinic.update(updatePayload);
    }
    return res.json({ success: true, data: clinic, message: "Clinic profile updated successfully" });
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
  getCurrentClinicProfile,
  updateCurrentClinicProfile,
  resolveMapUrl,
};
