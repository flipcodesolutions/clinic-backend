const { DoctorSchedule, Clinic, ClinicUser, sequelize } = require("../../models");
const { Op } = require("sequelize");
const { getDoctorProfile } = require("./helpers");

const ensureShiftTypeColumn = async () => {
  try {
    const [cols] = await sequelize.query("SHOW COLUMNS FROM doctor_schedules LIKE 'shift_type'");
    if (!cols || cols.length === 0) {
      await sequelize.query("ALTER TABLE doctor_schedules ADD COLUMN shift_type VARCHAR(50) DEFAULT 'morning'");
    }
  } catch (err) {
    // Ignore error if table does not exist yet
  }
};

function timeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return null;
  const parts = timeStr.split(":");
  if (parts.length < 2) return null;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }
  return hours * 60 + minutes;
}

const validateSchedulePayload = async (profile, body, reqUser, excludeId = null) => {
  const { clinic_id, day_of_week, start_time, end_time, slot_duration, maximum_booking, shift_type } = body;

  // 1. Clinic validation
  if (!clinic_id) {
    return "Clinic is required. Please select a clinic.";
  }
  const clinic = await Clinic.findByPk(clinic_id);
  if (!clinic) {
    return "Selected clinic does not exist.";
  }
  
  // Check if clinic belongs to doctor
  let belongsToDoctor = false;
  if (ClinicUser) {
    const cu = await ClinicUser.findOne({
      where: { user_id: reqUser.id, clinic_id: parseInt(clinic_id, 10) },
    });
    if (cu) belongsToDoctor = true;
  }
  if (!belongsToDoctor && profile?.user?.clinics?.length > 0) {
    belongsToDoctor = profile.user.clinics.some(
      (c) => String(c.id) === String(clinic_id)
    );
  }
  if (!belongsToDoctor && (!profile?.user?.clinics || profile.user.clinics.length === 0)) {
    belongsToDoctor = true;
  }
  if (!belongsToDoctor) {
    return "Selected clinic does not belong to the logged-in doctor.";
  }

  // 2. Day validation
  const validDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  if (!day_of_week || !validDays.includes(String(day_of_week).toLowerCase())) {
    return "Day is required and must be a valid day of the week (Monday - Sunday).";
  }

  // 3 & 4. Start Time & End Time validation
  const startMins = timeToMinutes(start_time);
  const endMins = timeToMinutes(end_time);

  if (startMins === null) {
    return "Start Time is required and must be a valid time format.";
  }
  if (endMins === null) {
    return "End Time is required and must be a valid time format.";
  }
  if (startMins === endMins) {
    return "Start Time and End Time cannot be the same.";
  }
  if (startMins >= endMins) {
    return "Start Time must be earlier than End Time.";
  }

  // 5. Slot Duration validation
  const duration = Number(slot_duration);
  if (
    slot_duration === undefined ||
    slot_duration === null ||
    slot_duration === "" ||
    isNaN(duration) ||
    !Number.isInteger(duration) ||
    duration <= 0
  ) {
    return "Slot duration must be a positive integer.";
  }

  const totalWorkingMinutes = endMins - startMins;
  if (totalWorkingMinutes % duration !== 0) {
    return `Slot duration (${duration} mins) does not divide total working time (${totalWorkingMinutes} mins) evenly.`;
  }

  // 6. Maximum Booking validation
  const maxBooking = Number(maximum_booking);
  if (
    maximum_booking === undefined ||
    maximum_booking === null ||
    maximum_booking === "" ||
    isNaN(maxBooking) ||
    !Number.isInteger(maxBooking) ||
    maxBooking <= 0
  ) {
    return "Maximum Booking must be a positive integer greater than 0.";
  }

  const maxPossibleSlots = totalWorkingMinutes / duration;
  if (maxBooking > maxPossibleSlots) {
    return `Maximum Booking (${maxBooking}) cannot exceed total available slots (${maxPossibleSlots} slots between ${start_time} and ${end_time}).`;
  }

  // 7. Shift Type validation (Morning / Evening / Afternoon)
  if (shift_type) {
    const validShifts = ["morning", "evening", "afternoon"];
    if (!validShifts.includes(String(shift_type).toLowerCase())) {
      return "Shift / Session must be Morning, Evening, or Afternoon.";
    }
  }

  // 8 & 10. Duplicate / Overlapping Schedule check
  const whereClause = {
    doctor_id: profile.id,
    clinic_id: parseInt(clinic_id, 10),
    day_of_week: String(day_of_week).toLowerCase(),
  };

  if (excludeId) {
    whereClause.id = { [Op.ne]: excludeId };
  }

  const existingSchedules = await DoctorSchedule.findAll({ where: whereClause });

  for (const sch of existingSchedules) {
    const existStart = timeToMinutes(sch.start_time);
    const existEnd = timeToMinutes(sch.end_time);

    if (existStart !== null && existEnd !== null && existStart < existEnd) {
      if (startMins < existEnd && endMins > existStart) {
        const dayFormatted = String(day_of_week).charAt(0).toUpperCase() + String(day_of_week).slice(1);
        return `Slot time (${start_time} - ${end_time}) clashes with an existing schedule (${sch.start_time} - ${sch.end_time}) on ${dayFormatted}. Please select a different time slot!`;
      }
    }
  }

  return null; // Validation passed
};

const listSchedules = async (req, res) => {
  try {
    await ensureShiftTypeColumn();
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }

    const { search, day, page, limit } = req.query;
    const whereClause = { doctor_id: profile.id };

    if (day) {
      whereClause.day_of_week = day.toLowerCase();
    }

    if (search && search.trim() !== "") {
      const searchTerm = `%${search.trim().toLowerCase()}%`;
      whereClause[Op.or] = [
        sequelize.where(sequelize.fn("LOWER", sequelize.col("DoctorSchedule.day_of_week")), "LIKE", searchTerm),
        sequelize.where(sequelize.fn("LOWER", sequelize.col("clinic.name")), "LIKE", searchTerm),
      ];
    }

    const pageNum = parseInt(page, 10) > 0 ? parseInt(page, 10) : null;
    const limitNum = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : null;
    const offset = pageNum && limitNum ? (pageNum - 1) * limitNum : null;

    const queryOptions = {
      where: whereClause,
      include: [
        {
          model: Clinic,
          as: "clinic",
          attributes: ["id", "name"],
        },
      ],
      order: [["created_at", "DESC"]],
      distinct: true,
    };

    if (limitNum) {
      queryOptions.limit = limitNum;
      queryOptions.offset = offset || 0;
    }

    const { count, rows } = await DoctorSchedule.findAndCountAll(queryOptions);

    return res.json({
      success: true,
      data: rows,
      totalCount: count,
      page: pageNum || 1,
      totalPages: limitNum ? Math.ceil(count / limitNum) || 1 : 1,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createSchedule = async (req, res) => {
  try {
    await ensureShiftTypeColumn();
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }

    const validationError = await validateSchedulePayload(profile, req.body, req.user);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const schedule = await DoctorSchedule.create({
      ...req.body,
      doctor_id: profile.id,
      day_of_week: String(req.body.day_of_week).toLowerCase(),
      shift_type: req.body.shift_type ? String(req.body.shift_type).toLowerCase() : "morning",
    });
    return res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to create schedule" });
  }
};

const updateSchedule = async (req, res) => {
  try {
    await ensureShiftTypeColumn();
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }

    const schedule = await DoctorSchedule.findOne({
      where: { id: req.params.id, doctor_id: profile.id },
    });
    if (!schedule) {
      return res.status(404).json({ success: false, message: "Schedule not found" });
    }

    const mergedPayload = {
      clinic_id: req.body.clinic_id !== undefined ? req.body.clinic_id : schedule.clinic_id,
      day_of_week: req.body.day_of_week !== undefined ? req.body.day_of_week : schedule.day_of_week,
      start_time: req.body.start_time !== undefined ? req.body.start_time : schedule.start_time,
      end_time: req.body.end_time !== undefined ? req.body.end_time : schedule.end_time,
      slot_duration: req.body.slot_duration !== undefined ? req.body.slot_duration : schedule.slot_duration,
      maximum_booking: req.body.maximum_booking !== undefined ? req.body.maximum_booking : schedule.maximum_booking,
      is_available: req.body.is_available !== undefined ? req.body.is_available : schedule.is_available,
      shift_type: req.body.shift_type !== undefined ? req.body.shift_type : schedule.shift_type,
    };

    const validationError = await validateSchedulePayload(profile, mergedPayload, req.user, schedule.id);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    await schedule.update({
      ...req.body,
      day_of_week: req.body.day_of_week ? String(req.body.day_of_week).toLowerCase() : schedule.day_of_week,
      shift_type: req.body.shift_type ? String(req.body.shift_type).toLowerCase() : schedule.shift_type,
    });
    return res.json({ success: true, data: schedule });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to update schedule" });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    const profile = await getDoctorProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }

    const schedule = await DoctorSchedule.findOne({
      where: { id: req.params.id, doctor_id: profile.id },
    });
    if (!schedule) {
      return res.status(404).json({ success: false, message: "Schedule not found" });
    }
    await schedule.destroy();
    return res.json({ success: true, message: "Schedule deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
};
