const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const { User, ClinicUser, StaffProfile, sequelize } = require("../../models");
const { deleteOldFile } = require("../../utils/file.utils");

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

const getStaffById = async (req, res) => {
  try {
    const staff = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
      include: [{ model: StaffProfile, as: "staffProfile" }],
    });
    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff member not found" });
    }
    return res.json({ success: true, data: publicStaff(staff) });
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
      photo_url,
    } = req.body;

    if (!first_name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: "First name, email, phone, and password are required" });
    }

    const cleanPhone = String(phone).replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ success: false, message: "Phone number must be exactly 10 digits" });
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
    const userRoles = Array.isArray(roles) && roles.length > 0 ? roles : ["receptionist"];

    const user = await User.create({
      first_name,
      last_name: last_name || null,
      email,
      phone,
      password: passwordHash,
      roles: userRoles,
      status: status || "active",
      profile_image: photo_url || null,
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

const updateStaff = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Staff member not found" });
    }

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
      photo_url,
    } = req.body;

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: "Email is already registered" });
      }
    }

    if (phone) {
      const cleanPhone = String(phone).replace(/\D/g, "");
      if (cleanPhone.length !== 10) {
        return res.status(400).json({ success: false, message: "Phone number must be exactly 10 digits" });
      }
      if (phone !== user.phone) {
        const existingPhone = await User.findOne({ where: { phone } });
        if (existingPhone) {
          return res.status(400).json({ success: false, message: "Phone number is already registered" });
        }
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
    if (photo_url !== undefined) {
      if (photo_url && user.profile_image && user.profile_image !== photo_url) {
        deleteOldFile(user.profile_image);
      }
      updateData.profile_image = photo_url || null;
    }

    await user.update(updateData);

    if (clinic_id !== undefined && clinic_id) {
      const existingCu = await ClinicUser.findOne({ where: { user_id: user.id }, paranoid: false });
      if (existingCu) {
        await existingCu.restore();
        await existingCu.update({ clinic_id: parseInt(clinic_id), status: "active" });
      } else {
        await ClinicUser.create({
          clinic_id: parseInt(clinic_id),
          user_id: user.id,
          status: "active",
        });
      }
    }

    const staffData = {};
    if (designation !== undefined) staffData.designation = designation || null;
    if (qualification !== undefined) staffData.qualification = qualification || null;
    if (joining_date !== undefined) staffData.joining_date = (joining_date && String(joining_date).trim() !== '') ? joining_date : null;
    if (shift !== undefined) {
      staffData.shift = ["morning", "evening", "night"].includes(shift?.toLowerCase()) ? shift.toLowerCase() : null;
    }
    if (Object.keys(staffData).length > 0) {
      const [staffProfile] = await StaffProfile.findOrCreate({
        where: { user_id: user.id },
        defaults: { user_id: user.id, ...staffData },
      });
      await staffProfile.update(staffData);
    }

    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ["password"] },
      include: [{ model: StaffProfile, as: "staffProfile" }],
    });

    return res.json({ success: true, data: publicStaff(updatedUser) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteStaff = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Staff member not found" });
    }
    if (user.profile_image) {
      deleteOldFile(user.profile_image);
    }
    await user.destroy();
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
