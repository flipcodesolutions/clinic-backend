const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const { User, ClinicUser, sequelize } = require("../../models");

const listUsers = async (req, res) => {
  try {
    const { search, status, role } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name:  { [Op.like]: `%${search}%` } },
        { email:      { [Op.like]: `%${search}%` } },
        { phone:      { [Op.like]: `%${search}%` } },
      ];
    }

    if (status) where.status = status;

    if (role) {
      where[Op.and] = [
        sequelize.where(
          sequelize.cast(sequelize.col("User.roles"), "CHAR"),
          "LIKE",
          `%${role}%`
        ),
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ["password"] },
      order: [["id", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    const [activeCount, inactiveCount, blockedCount, totalCount] = await Promise.all([
      User.count({ where: { status: "active"   } }),
      User.count({ where: { status: "inactive" } }),
      User.count({ where: { status: "blocked"  } }),
      User.count(),
    ]);

    return res.json({
      success: true,
      count,
      currentPage: page,
      totalPages: Math.ceil(count / limit) || 1,
      limit,
      stats: { total: totalCount, active: activeCount, inactive: inactiveCount, blocked: blockedCount },
      data: users,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password, roles, status, profile_image, clinic_id } = req.body;

    if (!first_name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: "First name, email, phone, and password are required" });
    }

    const cleanPhone = String(phone).replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ success: false, message: "Phone number must be exactly 10 digits" });
    }

    if (await User.findOne({ where: { email } })) {
      return res.status(400).json({ success: false, message: "Email is already registered" });
    }

    if (await User.findOne({ where: { phone } })) {
      return res.status(400).json({ success: false, message: "Phone number is already registered" });
    }

    const user = await User.create({
      first_name,
      last_name:         last_name     || null,
      email,
      phone,
      password:          await bcrypt.hash(password, 10),
      roles:             Array.isArray(roles) && roles.length > 0 ? roles : ["clinic_admin"],
      status:            status        || "active",
      profile_image:     profile_image || null,
      email_verified_at: new Date(),
      phone_verified_at: new Date(),
    });

    if (clinic_id) {
      await ClinicUser.create({ clinic_id: parseInt(clinic_id), user_id: user.id, status: "active" });
    }

    const { password: _, ...userData } = user.toJSON();
    return res.status(201).json({ success: true, data: userData });
  } catch (error) {
    if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
      const msg = error.errors?.length ? error.errors.map((e) => e.message).join(", ") : error.message;
      return res.status(400).json({ success: false, message: msg || "Validation error" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { first_name, last_name, email, phone, password, roles, status, profile_image, clinic_id } = req.body;

    if (email && email !== user.email && await User.findOne({ where: { email } })) {
      return res.status(400).json({ success: false, message: "Email is already registered" });
    }

    if (phone) {
      const cleanPhone = String(phone).replace(/\D/g, "");
      if (cleanPhone.length !== 10) {
        return res.status(400).json({ success: false, message: "Phone number must be exactly 10 digits" });
      }
      if (phone !== user.phone && await User.findOne({ where: { phone } })) {
        return res.status(400).json({ success: false, message: "Phone number is already registered" });
      }
    }

    const updateData = {};
    if (first_name    !== undefined) updateData.first_name    = first_name;
    if (last_name     !== undefined) updateData.last_name     = last_name;
    if (email         !== undefined) updateData.email         = email;
    if (phone         !== undefined) updateData.phone         = phone;
    if (status        !== undefined) updateData.status        = status;
    if (roles         !== undefined) updateData.roles         = Array.isArray(roles) ? roles : [roles];
    if (profile_image !== undefined) updateData.profile_image = profile_image;
    if (password && password.trim().length > 0) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await user.update(updateData);

    if (clinic_id !== undefined) {
      if (clinic_id) {
        const existingCu = await ClinicUser.findOne({ where: { user_id: user.id }, paranoid: false });
        if (existingCu) {
          await existingCu.restore();
          await existingCu.update({ clinic_id: parseInt(clinic_id), status: "active" });
        } else {
          await ClinicUser.create({ clinic_id: parseInt(clinic_id), user_id: user.id, status: "active" });
        }
      } else {
        await ClinicUser.destroy({ where: { user_id: user.id }, force: true });
      }
    }

    const updatedUser = await User.findByPk(user.id, { attributes: { exclude: ["password"] } });
    return res.json({ success: true, data: updatedUser });
  } catch (error) {
    if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
      const msg = error.errors?.length ? error.errors.map((e) => e.message).join(", ") : error.message;
      return res.status(400).json({ success: false, message: msg || "Validation error" });
    }
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
    return res.json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    await ClinicUser.destroy({ where: { user_id: user.id }, force: true });
    await user.destroy();
    return res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { listUsers, getUserById, createUser, updateUser, updateUserStatus, deleteUser };
