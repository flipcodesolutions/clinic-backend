const { Op } = require("sequelize");
const {
  DoctorProfile,
  User,
  Department,
  DoctorExperience,
  DoctorAchievement,
  DoctorSchedule,
  Review,
  Clinic,
  PatientProfile,
} = require("../../models");

const listDoctors = async (req, res) => {
  try {
    const { search, department_id, clinic_id, specialization } = req.query;

    const where = {};
    if (specialization) {
      where.specialization = { [Op.like]: `%${specialization.trim()}%` };
    }

    if (search && search.trim()) {
      const q = search.trim();
      const matchingUsers = await User.findAll({
        where: {
          [Op.or]: [
            { first_name: { [Op.like]: `%${q}%` } },
            { last_name: { [Op.like]: `%${q}%` } },
          ],
        },
        attributes: ["id"],
      });
      const matchingUserIds = matchingUsers.map((u) => u.id);

      const matchingClinics = await Clinic.findAll({
        where: {
          name: { [Op.like]: `%${q}%` },
        },
        attributes: ["id"],
      });
      const matchingClinicIds = matchingClinics.map((c) => c.id);

      const matchingSchedules = matchingClinicIds.length > 0
        ? await DoctorSchedule.findAll({
            where: { clinic_id: { [Op.in]: matchingClinicIds } },
            attributes: ["doctor_profile_id"],
          })
        : [];
      const doctorIdsFromSchedules = matchingSchedules.map((s) => s.doctor_profile_id);

      where[Op.or] = [
        { specialization: { [Op.like]: `%${q}%` } },
        ...(matchingUserIds.length > 0 ? [{ user_id: { [Op.in]: matchingUserIds } }] : []),
        ...(doctorIdsFromSchedules.length > 0 ? [{ id: { [Op.in]: doctorIdsFromSchedules } }] : []),
      ];
    }

    const departmentInclude = {
      model: Department,
      as: "departments",
      through: { attributes: [] },
    };
    if (department_id) {
      departmentInclude.where = { id: department_id };
    }

    const scheduleInclude = {
      model: DoctorSchedule,
      as: "schedules",
      include: [
        {
          model: Clinic,
          as: "clinic",
          include: [
            {
              model: Service,
              as: "services",
              through: { attributes: [] },
            },
            {
              model: ClinicGallery,
              as: "galleries",
            },
          ],
        },
      ],
    };
    if (clinic_id) {
      scheduleInclude.where = { clinic_id };
    }

    const doctors = await DoctorProfile.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "first_name", "last_name", "email", "phone", "profile_image"],
          include: [
            {
              model: Clinic,
              as: "clinics",
              attributes: ["id", "name", "address", "city", "phone", "email", "latitude", "longitude", "google_maps_url"],
              through: { attributes: [] },
              include: [
                {
                  model: Service,
                  as: "services",
                  through: { attributes: [] },
                },
                {
                  model: ClinicGallery,
                  as: "galleries",
                },
              ],
            },
          ],
        },
        departmentInclude,
        scheduleInclude,
        {
          model: Review,
          as: "reviews",
          attributes: ["id", "rating"],
        },
      ],
      order: [["id", "DESC"]],
    });

    return res.json({ success: true, data: doctors });
  } catch (error) {
    console.error("Error listing doctors for patient:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getDoctorProfile = async (req, res) => {
  try {
    const { id } = req.params;

    let targetDoctorId = id;
    let targetUserId = id;

    if (String(id).startsWith("clinic-")) {
      const clinicId = id.replace("clinic-", "");
      const schedule = await DoctorSchedule.findOne({
        where: { clinic_id: clinicId },
      });
      if (schedule && schedule.doctor_id) {
        targetDoctorId = schedule.doctor_id;
        targetUserId = schedule.doctor_id;
      }
    }

    const doctor = await DoctorProfile.findOne({
      where: {
        [Op.or]: [{ id: targetDoctorId }, { user_id: targetUserId }],
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "first_name", "last_name", "email", "phone", "profile_image"],
          include: [
            {
              model: Clinic,
              as: "clinics",
              attributes: ["id", "name", "address", "city", "phone", "email", "latitude", "longitude", "google_maps_url"],
              through: { attributes: [] },
            },
          ],
        },
        {
          model: Department,
          as: "departments",
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
          include: [{ model: Clinic, as: "clinic" }],
        },
        {
          model: Review,
          as: "reviews",
          include: [
            {
              model: PatientProfile,
              as: "patient",
              include: [
                {
                  model: User,
                  as: "user",
                  attributes: ["first_name", "last_name"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const doctorJson = doctor.toJSON();

    // Fetch active clinic's services and galleries
    const primaryClinicId =
      doctorJson.schedules?.[0]?.clinic_id ||
      doctorJson.schedules?.[0]?.clinic?.id ||
      doctorJson.user?.clinics?.[0]?.id;

    if (primaryClinicId) {
      const fullClinic = await Clinic.findByPk(primaryClinicId, {
        include: [
          {
            model: Service,
            as: "services",
            through: { attributes: [] },
          },
          {
            model: ClinicGallery,
            as: "galleries",
          },
        ],
      });

      if (fullClinic) {
        doctorJson.clinic = fullClinic.toJSON();
      }

      try {
        // Fetch all doctors practicing in this clinic
        const clinicDoctorProfiles = await DoctorProfile.findAll({
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "first_name", "last_name", "email", "phone", "profile_image"],
              include: [
                {
                  model: Clinic,
                  as: "clinics",
                  where: { id: primaryClinicId },
                  attributes: ["id", "name"],
                  through: { attributes: [] },
                  required: false,
                },
              ],
            },
            {
              model: Department,
              as: "departments",
              through: { attributes: [] },
            },
            {
              model: DoctorSchedule,
              as: "schedules",
              where: { clinic_id: primaryClinicId },
              required: false,
            },
            {
              model: Review,
              as: "reviews",
              attributes: ["id", "rating"],
            },
          ],
        });

        const matchedDoctors = clinicDoctorProfiles
          .filter((d) => {
            const hasClinicInUser = d.user?.clinics?.some((c) => Number(c.id) === Number(primaryClinicId));
            const hasClinicSchedule = d.schedules?.some((s) => Number(s.clinic_id) === Number(primaryClinicId));
            const isCurrentDoc = Number(d.id) === Number(doctorJson.id);
            return hasClinicInUser || hasClinicSchedule || isCurrentDoc;
          })
          .map((d) => d.toJSON());

        const alreadyHasCurrent = matchedDoctors.some((d) => Number(d.id) === Number(doctorJson.id));
        if (!alreadyHasCurrent) {
          matchedDoctors.unshift(doctorJson);
        }

        doctorJson.clinicDoctors = matchedDoctors;
      } catch (err) {
        console.error("Error fetching clinic doctors:", err);
        doctorJson.clinicDoctors = [doctorJson];
      }
    } else {
      doctorJson.clinicDoctors = [doctorJson];
    }

    return res.json({ success: true, data: doctorJson });
  } catch (error) {
    console.error("Error getting doctor profile for patient:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listDoctors,
  getDoctorProfile,
};
