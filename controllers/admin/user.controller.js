const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const { User, Clinic, ClinicUser, sequelize } = require("../../models");

function publicUser(user) {
  const data = user.toJSON();
  delete data.password;
  return data;
}

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
        { last_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    if (status) {
      where.status = status;
    }

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
      include: [
        {
          model: Clinic,
          as: "clinics",
          attributes: ["id", "name", "city"],
          through: { attributes: [] },
        },
      ],
      order: [["id", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    const activeCount = await User.count({ where: { status: "active" } });
    const inactiveCount = await User.count({ where: { status: "inactive" } });
    const blockedCount = await User.count({ where: { status: "blocked" } });
    const totalCount = await User.count();

    return res.json({
      success: true,
      count,
      currentPage: page,
      totalPages: Math.ceil(count / limit) || 1,
      limit,
      stats: {
        total: totalCount,
        active: activeCount,
        inactive: inactiveCount,
        blocked: blockedCount,
      },
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
      include: [
        {
          model: Clinic,
          as: "clinics",
          attributes: ["id", "name", "city"],
          through: { attributes: [] },
        },
      ],
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
    const { first_name, last_name, email, phone, password, roles, status, clinic_id } = req.body;

    if (!first_name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "First name, email, phone, and password are required",
      });
    }

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: "Email is already registered" });
    }

    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({ success: false, message: "Phone number is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRoles = Array.isArray(roles) && roles.length > 0 ? roles : ["clinic_admin"];

    const user = await User.create({
      first_name,
      last_name: last_name || null,
      email,
      phone,
      password: passwordHash,
      roles: userRoles,
      status: status || "active",
      email_verified_at: new Date(),
      phone_verified_at: new Date(),
    });

    if (clinic_id) {
      await ClinicUser.create({
        clinic_id: parseInt(clinic_id),
        user_id: user.id,
        status: "active",
      });
    }

    return res.status(201).json({ success: true, data: publicUser(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { first_name, last_name, email, phone, password, roles, status, clinic_id } = req.body;

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: "Email is already registered" });
      }
    }

    if (phone && phone !== user.phone) {
      const existingPhone = await User.findOne({ where: { phone } });
      if (existingPhone) {
        return res.status(400).json({ success: false, message: "Phone number is already registered" });
      }
    }

    const updateData = {};
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (status !== undefined) updateData.status = status;
    if (roles !== undefined) updateData.roles = Array.isArray(roles) ? roles : [roles];
    if (password && password.trim().length > 0) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await user.update(updateData);

    if (clinic_id !== undefined) {
      if (clinic_id) {
        const existingCu = await ClinicUser.findOne({ where: { user_id: user.id } });
        if (existingCu) {
          await existingCu.update({ clinic_id: parseInt(clinic_id) });
        } else {
          await ClinicUser.create({
            clinic_id: parseInt(clinic_id),
            user_id: user.id,
            status: "active",
          });
        }
      } else {
        await ClinicUser.destroy({ where: { user_id: user.id } });
      }
    }

    return res.json({ success: true, data: publicUser(user) });
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

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    await user.destroy();
    return res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
};

