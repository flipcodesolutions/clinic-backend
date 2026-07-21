const { DoctorSchedule } = require("../models");
const { WEEKDAYS } = require("./data/constants");

/**
 * Weekday OPD schedule for each doctor at their clinic.
 * Morning slot Mon–Sat (Sunday off).
 */
async function seedDoctorSchedules(clinics, doctorsByClinic) {
  let createdCount = 0;

  for (const clinic of clinics) {
    const doctors = doctorsByClinic[clinic.id] || [];

    for (const { profile } of doctors) {
      for (const day of WEEKDAYS) {
        const [, created] = await DoctorSchedule.findOrCreate({
          where: {
            doctor_id: profile.id,
            clinic_id: clinic.id,
            day_of_week: day,
            start_time: "10:00:00",
          },
          defaults: {
            doctor_id: profile.id,
            clinic_id: clinic.id,
            day_of_week: day,
            start_time: "10:00:00",
            end_time: "13:00:00",
            slot_duration: 15,
            maximum_booking: 12,
            is_available: true,
          },
        });

        if (created) createdCount += 1;
      }
    }
  }

  console.log(`✓ Doctor schedules: ${createdCount} new slots`);
}

module.exports = { seedDoctorSchedules };
