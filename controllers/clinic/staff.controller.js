const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const { User, StaffProfile, Clinic, ClinicUser, sequelize } = require("../../models");
const { deleteOldFile } = require("../../utils/file.utils");

const getClinicId = async (req) => {
  if (req?.user?.id) {
    const cu = await ClinicUser.findOne({ where: { user_id: req.user.id } });
    if (cu?.clinic_id) return cu.clinic_id;
  }
  const clinic = await Clinic.findOne({ attributes: ["id"], order: [["id", "ASC"]] });
  return clinic ? clinic.id : 1;
};

const formatStaffResponse = (user) => {
  const staff = user.staffProfile ? user.staffProfile.toJSON() : {};
  const clinicUsers = user.clinicUsers || [];
  const clinics = clinicUsers.map((cu) => cu.clinic ? cu.clinic.toJSON() : null).filter(Boolean);

  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    full_name: `${user.first_name} ${user.last_name}`.trim(),
    email: user.email,
    phone: user.phone,
    roles: user.roles || ["staff"],
    designation: staff.designation || "",
    qualification: staff.qualification || "",
    joining_date: staff.joining_date || null,
    salary: staff.salary || null,
    address: staff.address || "",
    city: staff.city || "",
    state: staff.state || "",
    postal_code: staff.postal_code || "",
    emergency_contact: staff.emergency_contact || "",
    profile_image: user.profile_image || null,
    photo_url: user.profile_image || null,
    status: user.status,
    createdAt: user.createdAt,
    clinics,
  };
};

const listStaff = async (req, res) => {
  try {
    const clinicId = await getClinicId(req);
    const { search, designation, status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const userWhere = {
      [Op.and]: [
        sequelize.where(
          sequelize.cast(sequelize.col("User.roles"), "CHAR"),
          "LIKE",
          "%staff%"
        ),
      ],
    };

    if (status) {
      userWhere.status = status;
    }

    if (search) {
      userWhere[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const staffWhere = {};
    if (designation) {
      staffWhere.designation = designation;
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: userWhere,
      include: [
        {
          model: ClinicUser,
          as: "clinicUsers",
          where: { clinic_id: clinicId },
          include: [{ model: Clinic, as: "clinic" }],
        },
        {
          model: StaffProfile,
          as: "staffProfile",
          where: Object.keys(staffWhere).length ? staffWhere : undefined,
          required: false,
        },
      ],
      order: [["id", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    return res.json({
      success: true,
      count,
      currentPage: page,
      totalPages: Math.ceil(count / limit) || 1,
      limit,
      data: users.map(formatStaffResponse),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getStaffById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        { model: StaffProfile, as: "staffProfile" },
        {
          model: ClinicUser,
          as: "clinicUsers",
          include: [{ model: Clinic, as: "clinic" }],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "Staff member not found" });
    }

    return res.json({ success: true, data: formatStaffResponse(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createStaff = async (req, res) => {
  try {
    const clinicId = req.body.clinic_id || (await getClinicId(req));
    const {
      first_name,
      last_name,
      email,
      phone,
      password,
      designation,
      qualification,
      joining_date,
      salary,
      address,
      city,
      state,
      postal_code,
      emergency_contact,
      profile_image,
      photo_url,
    } = req.body;

    const imgUrl = profile_image || photo_url || null;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User with this email already exists" });
    }

    const rawPassword = password || "Password@123";
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const user = await User.create({
      first_name,
      last_name,
      email,
      phone,
      password: hashedPassword,
      roles: ["receptionist", "staff"],
      profile_image: imgUrl,
      status: req.body.status || "active",
    });

    await StaffProfile.create({
      user_id: user.id,
      designation,
      qualification,
      joining_date,
      salary,
      address,
      city,
      state,
      postal_code,
      emergency_contact,
    });

    await ClinicUser.create({
      user_id: user.id,
      clinic_id: clinicId,
      designation,
      joining_date,
    });

    const fullUser = await User.findByPk(user.id, {
      include: [
        { model: StaffProfile, as: "staffProfile" },
        {
          model: ClinicUser,
          as: "clinicUsers",
          include: [{ model: Clinic, as: "clinic" }],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      data: formatStaffResponse(fullUser),
      message: "Staff member created successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateStaff = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: StaffProfile, as: "staffProfile" }],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "Staff member not found" });
    }

    const {
      first_name,
      last_name,
      email,
      phone,
      password,
      status,
      designation,
      qualification,
      joining_date,
      salary,
      address,
      city,
      state,
      postal_code,
      emergency_contact,
      profile_image,
      photo_url,
      clinic_id,
    } = req.body;

    const imgUrl = profile_image !== undefined ? profile_image : photo_url;

    if (imgUrl && user.profile_image && user.profile_image !== imgUrl) {
      deleteOldFile(user.profile_image);
    }

    const updateData = {};
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }
    if (status !== undefined) updateData.status = status;
    if (imgUrl !== undefined) updateData.profile_image = imgUrl;

    await user.update(updateData);

    let staffProfile = user.staffProfile;
    const profileData = {
      designation,
      qualification,
      joining_date,
      salary,
      address,
      city,
      state,
      postal_code,
      emergency_contact,
    };

    if (staffProfile) {
      await staffProfile.update(profileData);
    } else {
      staffProfile = await StaffProfile.create({ user_id: user.id, ...profileData });
    }

    if (clinic_id) {
      const cu = await ClinicUser.findOne({ where: { user_id: user.id } });
      if (cu) {
        await cu.update({ clinic_id });
      } else {
        await ClinicUser.create({ user_id: user.id, clinic_id });
      }
    }

    const updatedUser = await User.findByPk(user.id, {
      include: [
        { model: StaffProfile, as: "staffProfile" },
        {
          model: ClinicUser,
          as: "clinicUsers",
          include: [{ model: Clinic, as: "clinic" }],
        },
      ],
    });

    return res.json({
      success: true,
      data: formatStaffResponse(updatedUser),
      message: "Staff member updated successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteStaff = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { paranoid: false });
    if (!user) {
      return res.status(404).json({ success: false, message: "Staff member not found" });
    }
    if (user.profile_image) {
      deleteOldFile(user.profile_image);
    }
    await ClinicUser.destroy({ where: { user_id: user.id }, force: true });
    await StaffProfile.destroy({ where: { user_id: user.id }, force: true });
    await user.destroy({ force: true });
    return res.json({ success: true, message: "Staff member deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
};
