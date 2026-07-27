const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const { User, ClinicUser, StaffProfile, sequelize } = require("../../models");

function publicStaff(user) {
  const data = user.toJSON();
  delete data.password;
  return data;
}

const listStaff = async (req, res) => {
  try {
    const { search, status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const staffRoles = ["receptionist", "nurse", "staff", "caretaker"];
    const roleConditions = staffRoles.map(r => 
      sequelize.where(sequelize.cast(sequelize.col("User.roles"), "CHAR"), "LIKE", `%${r}%`)
    );

    const where = {
      [Op.or]: roleConditions,
    };

    if (search) {
      where[Op.and] = [
        {
          [Op.or]: [
            { first_name: { [Op.like]: `%${search}%` } },
            { last_name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { phone: { [Op.like]: `%${search}%` } },
          ],
        },
      ];
    }
    if (status) {
      where.status = status;
    }

    const { count, rows: staffMembers } = await User.findAndCountAll({
      where,
      attributes: { exclude: ["password"] },
      include: [{ model: StaffProfile, as: "staffProfile" }],
      limit,
      offset,
      order: [["id", "DESC"]],
    });

    return res.json({
      success: true,
      count,
      currentPage: page,
      totalPages: Math.ceil(count / limit) || 1,
      limit,
      data: staffMembers.map(publicStaff),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createStaff = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      password,
      roles,
      status,
      clinic_id,
      designation,
      qualification,
      joining_date,
      shift,
    } = req.body;

    if (!first_name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: "First name, email, phone, and password are required" });
    }

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: "Email is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRoles = Array.isArray(roles) && roles.length > 0 ? roles : ["receptionist"];

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

    const validShift = ["morning", "evening", "night"].includes(shift?.toLowerCase()) ? shift.toLowerCase() : null;
    await StaffProfile.create({
      user_id: user.id,
      designation: designation || (userRoles[0] ? userRoles[0].charAt(0).toUpperCase() + userRoles[0].slice(1) : "Staff"),
      qualification: qualification || null,
      joining_date: (joining_date && String(joining_date).trim() !== '') ? joining_date : null,
      shift: validShift,
    });

    const staffWithProfile = await User.findByPk(user.id, {
      attributes: { exclude: ["password"] },
      include: [{ model: StaffProfile, as: "staffProfile" }],
    });

    return res.status(201).json({ success: true, data: publicStaff(staffWithProfile) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listStaff,
  createStaff,
};
