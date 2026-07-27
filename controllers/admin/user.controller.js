const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const { User, Clinic, ClinicUser, DoctorProfile, DoctorDepartment, DoctorExperience, DoctorAchievement, DoctorSchedule, Department, StaffProfile, sequelize } = require("../../models");
const { deleteOldFile } = require("../../utils/file.utils");

function unwrapLanguages(val) {
  if (!val) return '';
  if (Array.isArray(val)) {
    const items = val.flatMap((item) => unwrapLanguages(item));
    return items.filter(Boolean).join(', ');
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{') || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
      try {
        const parsed = JSON.parse(trimmed);
        return unwrapLanguages(parsed);
      } catch (e) {
        return trimmed;
      }
    }
    return trimmed;
  }
  return String(val);
}

function cleanLanguagesArray(val) {
  if (!val) return null;
  const unwrappedStr = unwrapLanguages(val);
  if (!unwrappedStr || unwrappedStr.trim() === '') return null;
  const list = unwrappedStr
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length > 0 ? list : null;
}

function publicUser(user) {
  const data = user.toJSON();
  delete data.password;
  if (data.doctorProfile && data.doctorProfile.languages) {
    data.doctorProfile.languages = cleanLanguagesArray(data.doctorProfile.languages);
  }
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
          include: [
            {
              model: Department,
              as: "departments",
              attributes: ["id", "name"],
              through: { attributes: [] },
            },
            {
              model: DoctorExperience,
              as: "experiences",
            },
            {
              model: DoctorAchievement,
              as: "achievements",
            },
            {
              model: DoctorSchedule,
              as: "schedules",
            },
          ],
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
          include: [
            {
              model: Department,
              as: "departments",
              attributes: ["id", "name"],
              through: { attributes: [] },
            },
            {
              model: DoctorExperience,
              as: "experiences",
            },
            {
              model: DoctorAchievement,
              as: "achievements",
            },
            {
              model: DoctorSchedule,
              as: "schedules",
            },
          ],
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
      department_id,
      experiences,
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
      joining_date,
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
      const doctorProfile = await DoctorProfile.create({
        user_id: user.id,
        registration_no: registration_no || null,
        qualification: qualification || null,
        specialization: specialization || null,
        experience_years: parseInt(experience_years) || 0,
        consultation_fee: parseFloat(consultation_fee) || 0,
        bio: bio || null,
        languages: cleanLanguagesArray(languages),
        gender: (gender && String(gender).trim() !== '') ? gender.toLowerCase() : null,
        dob: (dob && String(dob).trim() !== '') ? dob : null,
        profile_image: photo_url || null,
      });

      if (department_id) {
        await DoctorDepartment.create({
          doctor_id: doctorProfile.id,
          department_id: parseInt(department_id),
        });
      }

      if (Array.isArray(experiences) && experiences.length > 0) {
        for (const exp of experiences) {
          if (exp.hospital_name || exp.hospital) {
            await DoctorExperience.create({
              doctor_id: doctorProfile.id,
              hospital_name: exp.hospital_name || exp.hospital,
              designation: exp.designation || null,
              start_date: (exp.start_date || exp.startDate) && String(exp.start_date || exp.startDate).trim() !== '' ? (exp.start_date || exp.startDate) : null,
              end_date: (exp.end_date || exp.endDate) && String(exp.end_date || exp.endDate).trim() !== '' ? (exp.end_date || exp.endDate) : null,
              description: exp.description || null,
            });
          }
        }
      }
    }

    // Handle StaffProfile if designation, qualification, joining_date or shift passed or staff roles
    const isStaffRole = userRoles.some(r => ["staff", "receptionist", "nurse", "caretaker"].includes(r));
    if (isStaffRole || designation || qualification || joining_date || shift) {
      const validShift = ["morning", "evening", "night"].includes(shift?.toLowerCase()) ? shift.toLowerCase() : null;
      await StaffProfile.create({
        user_id: user.id,
        designation: designation || (userRoles[0] ? userRoles[0].charAt(0).toUpperCase() + userRoles[0].slice(1) : "Staff"),
        qualification: qualification || null,
        joining_date: (joining_date && String(joining_date).trim() !== '') ? joining_date : null,
        shift: validShift,
      });
    }

    const userWithProfile = await User.findByPk(user.id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: DoctorProfile,
          as: "doctorProfile",
          include: [
            {
              model: Department,
              as: "departments",
              attributes: ["id", "name"],
              through: { attributes: [] },
            },
            {
              model: DoctorExperience,
              as: "experiences",
            },
          ],
        },
        { model: StaffProfile, as: "staffProfile" },
      ],
    });

    return res.status(201).json({ success: true, data: publicUser(userWithProfile) });
  } catch (error) {
    if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
      const msg = error.errors && error.errors.length > 0
        ? error.errors.map(e => e.message).join(", ")
        : error.message;
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

    const {
      first_name,
      last_name,
      email,
      phone,
      password,
      roles,
      status,
      clinic_id,
      department_id,
      experiences,
      achievements,
      schedules,
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
      joining_date,
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
      } else {
        await ClinicUser.destroy({ where: { user_id: user.id }, force: true });
      }
    }

    // Update or Create DoctorProfile
    const profileData = {};
    if (registration_no !== undefined) profileData.registration_no = registration_no || null;
    if (qualification !== undefined) profileData.qualification = qualification || null;
    if (specialization !== undefined) profileData.specialization = specialization || null;
    if (experience_years !== undefined) profileData.experience_years = parseInt(experience_years) || 0;
    if (consultation_fee !== undefined) profileData.consultation_fee = parseFloat(consultation_fee) || 0;
    if (bio !== undefined) profileData.bio = bio || null;
    if (languages !== undefined) profileData.languages = cleanLanguagesArray(languages);
    if (gender !== undefined) profileData.gender = (gender && String(gender).trim() !== '') ? gender.toLowerCase() : null;
    if (dob !== undefined) profileData.dob = (dob && String(dob).trim() !== '') ? dob : null;
    if (photo_url !== undefined) profileData.profile_image = photo_url || null;

    if (Object.keys(profileData).length > 0 || department_id !== undefined || experiences !== undefined || achievements !== undefined || schedules !== undefined) {
      const existingProfile = await DoctorProfile.findOne({ where: { user_id: user.id } });
      if (photo_url && existingProfile && existingProfile.profile_image && existingProfile.profile_image !== photo_url) {
        deleteOldFile(existingProfile.profile_image);
      }
      const [doctorProfile] = await DoctorProfile.findOrCreate({
        where: { user_id: user.id },
        defaults: { user_id: user.id, ...profileData },
      });
      await doctorProfile.update(profileData);

      if (department_id !== undefined) {
        await DoctorDepartment.destroy({ where: { doctor_id: doctorProfile.id }, force: true });
        if (department_id) {
          const existingDd = await DoctorDepartment.findOne({
            where: { doctor_id: doctorProfile.id, department_id: parseInt(department_id) },
            paranoid: false,
          });
          if (existingDd) {
            await existingDd.restore();
          } else {
            await DoctorDepartment.create({
              doctor_id: doctorProfile.id,
              department_id: parseInt(department_id),
            });
          }
        }
      }

      if (Array.isArray(experiences)) {
        await DoctorExperience.destroy({ where: { doctor_id: doctorProfile.id }, force: true });
        for (const exp of experiences) {
          if (exp.hospital_name || exp.hospital) {
            await DoctorExperience.create({
              doctor_id: doctorProfile.id,
              hospital_name: exp.hospital_name || exp.hospital,
              designation: exp.designation || null,
              start_date: (exp.start_date || exp.startDate) && String(exp.start_date || exp.startDate).trim() !== '' ? (exp.start_date || exp.startDate) : null,
              end_date: (exp.end_date || exp.endDate) && String(exp.end_date || exp.endDate).trim() !== '' ? (exp.end_date || exp.endDate) : null,
              description: exp.description || null,
            });
          }
        }
      }

      if (Array.isArray(achievements)) {
        await DoctorAchievement.destroy({ where: { doctor_id: doctorProfile.id }, force: true });
        for (const ach of achievements) {
          if (ach.title && String(ach.title).trim() !== '') {
            await DoctorAchievement.create({
              doctor_id: doctorProfile.id,
              title: String(ach.title).trim(),
              description: ach.description || ach.organization || null,
              year: ach.year ? parseInt(ach.year) : null,
            });
          }
        }
      }

      if (Array.isArray(schedules)) {
        await DoctorSchedule.destroy({ where: { doctor_id: doctorProfile.id }, force: true });
        const assignedClinic = clinic_id || (await ClinicUser.findOne({ where: { user_id: user.id } }))?.clinic_id || 1;
        for (const sc of schedules) {
          if (sc.day || sc.day_of_week) {
            const rawDay = String(sc.day || sc.day_of_week).toLowerCase();
            const validDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
            const day_of_week = validDays.includes(rawDay) ? rawDay : "monday";
            await DoctorSchedule.create({
              doctor_id: doctorProfile.id,
              clinic_id: parseInt(assignedClinic),
              day_of_week,
              start_time: sc.start_time || "09:00:00",
              end_time: sc.end_time || "17:00:00",
              slot_duration: sc.slot_duration ? parseInt(sc.slot_duration) : 15,
              maximum_booking: sc.max_patients || sc.maximum_booking ? parseInt(sc.max_patients || sc.maximum_booking) : 10,
              is_available: sc.is_available !== undefined ? Boolean(sc.is_available) : true,
            });
          }
        }
      }
    }

    // Update or Create StaffProfile
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
      include: [
        {
          model: DoctorProfile,
          as: "doctorProfile",
          include: [
            {
              model: Department,
              as: "departments",
              attributes: ["id", "name"],
              through: { attributes: [] },
            },
            {
              model: DoctorExperience,
              as: "experiences",
            },
            {
              model: DoctorAchievement,
              as: "achievements",
            },
            {
              model: DoctorSchedule,
              as: "schedules",
            },
          ],
        },
        { model: StaffProfile, as: "staffProfile" },
      ],
    });

    return res.json({ success: true, data: publicUser(updatedUser) });
  } catch (error) {
    if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
      const msg = error.errors && error.errors.length > 0
        ? error.errors.map(e => e.message).join(", ")
        : error.message;
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
