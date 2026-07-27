const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const { User, Clinic, ClinicUser, DoctorProfile, DoctorDepartment, DoctorExperience, DoctorAchievement, DoctorSchedule, Department, sequelize } = require("../../models");
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

function publicDoctor(user) {
  const data = user.toJSON();
  delete data.password;
  if (data.doctorProfile && data.doctorProfile.languages) {
    data.doctorProfile.languages = cleanLanguagesArray(data.doctorProfile.languages);
  }
  return data;
}

const listDoctors = async (req, res) => {
  try {
    const { search, status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const where = {
      [Op.and]: [
        sequelize.where(
          sequelize.cast(sequelize.col("User.roles"), "CHAR"),
          "LIKE",
          "%doctor%"
        ),
      ],
    };

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

    const { count, rows: doctors } = await User.findAndCountAll({
      where,
      attributes: { exclude: ["password"] },
      include: [
        {
          model: DoctorProfile,
          as: "doctorProfile",
          include: [
            { model: Department, as: "departments", attributes: ["id", "name"], through: { attributes: [] } },
            { model: DoctorExperience, as: "experiences" },
            { model: DoctorAchievement, as: "achievements" },
            { model: DoctorSchedule, as: "schedules" },
          ],
        },
      ],
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
      data: doctors.map(publicDoctor),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createDoctor = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      password,
      status,
      clinic_id,
      department_id,
      experiences,
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
    } = req.body;

    if (!first_name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: "First name, email, phone, and password are required" });
    }

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: "Email is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      first_name,
      last_name: last_name || null,
      email,
      phone,
      password: passwordHash,
      roles: ["doctor"],
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

    const doctorWithProfile = await User.findByPk(user.id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: DoctorProfile,
          as: "doctorProfile",
          include: [
            { model: Department, as: "departments", attributes: ["id", "name"], through: { attributes: [] } },
            { model: DoctorExperience, as: "experiences" },
          ],
        },
      ],
    });

    return res.status(201).json({ success: true, data: publicDoctor(doctorWithProfile) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listDoctors,
  createDoctor,
};
