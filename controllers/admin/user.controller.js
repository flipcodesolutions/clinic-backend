const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const { User, Clinic, ClinicUser, DoctorProfile, StaffProfile, sequelize } = require("../../models");
const { deleteOldFile } = require("../../utils/file.utils");

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
        {
          model: DoctorProfile,
          as: "doctorProfile",
        },
        {
          model: StaffProfile,
          as: "staffProfile",
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
        {
          model: DoctorProfile,
          as: "doctorProfile",
        },
        {
          model: StaffProfile,
          as: "staffProfile",
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
    const {
      first_name,
      last_name,
      email,
      phone,
      password,
      roles,
      status,
      clinic_id,
      // DoctorProfile fields
      registration_no,
      qualification,
      specialization,
      experience_years,
      consultation_fee,
      bio,
      languages,
      gender,
      dob,
      photo_url,
      // StaffProfile fields
      designation,
      shift,
    } = req.body;

    if (!first_name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "First name, email, phone, and password are required",
      });
    }

    const cleanPhone = String(phone).replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be exactly 10 digits",
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

    // Handle DoctorProfile if role includes doctor or profile details passed
    if (userRoles.includes("doctor") || specialization || registration_no || qualification) {
      await DoctorProfile.create({
        user_id: user.id,
        registration_no: registration_no || null,
        qualification: qualification || null,
        specialization: specialization || null,
        experience_years: parseInt(experience_years) || 0,
        consultation_fee: parseFloat(consultation_fee) || 0,
        bio: bio || null,
        languages: languages ? (typeof languages === "string" ? languages.split(",").map(s => s.trim()) : languages) : null,
        gender: gender || null,
        dob: dob || null,
        profile_image: photo_url || null,
      });
    }

    // Handle StaffProfile if designation or shift passed or staff roles
    const isStaffRole = userRoles.some(r => ["staff", "receptionist", "nurse", "caretaker"].includes(r));
    if (isStaffRole || designation || shift) {
      const validShift = ["morning", "evening", "night"].includes(shift?.toLowerCase()) ? shift.toLowerCase() : null;
      await StaffProfile.create({
        user_id: user.id,
        designation: designation || (userRoles[0] ? userRoles[0].charAt(0).toUpperCase() + userRoles[0].slice(1) : "Staff"),
        shift: validShift,
      });
    }

    const userWithProfile = await User.findByPk(user.id, {
      attributes: { exclude: ["password"] },
      include: [
        { model: DoctorProfile, as: "doctorProfile" },
        { model: StaffProfile, as: "staffProfile" },
      ],
    });

    return res.status(201).json({ success: true, data: publicUser(userWithProfile) });
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

    const {
      first_name,
      last_name,
      email,
      phone,
      password,
      roles,
      status,
      clinic_id,
      // DoctorProfile fields
      registration_no,
      qualification,
      specialization,
      experience_years,
      consultation_fee,
      bio,
      languages,
      gender,
      dob,
      photo_url,
      designation,
      shift,
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
        return res.status(400).json({
          success: false,
          message: "Phone number must be exactly 10 digits",
        });
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

    // Update or Create DoctorProfile
    const profileData = {};
    if (registration_no !== undefined) profileData.registration_no = registration_no;
    if (qualification !== undefined) profileData.qualification = qualification;
    if (specialization !== undefined) profileData.specialization = specialization;
    if (experience_years !== undefined) profileData.experience_years = parseInt(experience_years) || 0;
    if (consultation_fee !== undefined) profileData.consultation_fee = parseFloat(consultation_fee) || 0;
    if (bio !== undefined) profileData.bio = bio;
    if (languages !== undefined) profileData.languages = typeof languages === "string" ? languages.split(",").map(s => s.trim()) : languages;
    if (gender !== undefined) profileData.gender = gender;
    if (dob !== undefined) profileData.dob = dob;
    if (photo_url !== undefined) profileData.profile_image = photo_url;

    if (Object.keys(profileData).length > 0) {
      const existingProfile = await DoctorProfile.findOne({ where: { user_id: user.id } });
      if (photo_url && existingProfile && existingProfile.profile_image && existingProfile.profile_image !== photo_url) {
        deleteOldFile(existingProfile.profile_image);
      }
      const [doctorProfile] = await DoctorProfile.findOrCreate({
        where: { user_id: user.id },
        defaults: { user_id: user.id, ...profileData },
      });
      await doctorProfile.update(profileData);
    }

    // Update or Create StaffProfile
    const staffData = {};
    if (designation !== undefined) staffData.designation = designation;
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
      include: [
        { model: DoctorProfile, as: "doctorProfile" },
        { model: StaffProfile, as: "staffProfile" },
      ],
    });

    return res.json({ success: true, data: publicUser(updatedUser) });
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
    const docProfile = await DoctorProfile.findOne({ where: { user_id: user.id } });
    if (docProfile && docProfile.profile_image) {
      deleteOldFile(docProfile.profile_image);
    }
    await DoctorProfile.destroy({ where: { user_id: user.id } });
    await StaffProfile.destroy({ where: { user_id: user.id } });
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
