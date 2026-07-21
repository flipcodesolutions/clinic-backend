const { DoctorLeave } = require("../models");
const { faker } = require("./helpers/user.helper");

const REASONS = [
  "Personal leave",
  "Medical conference",
  "Family function",
  "Health checkup",
  "Training program",
];

/**
 * One sample leave record per doctor (idempotent).
 */
async function seedDoctorLeaves(doctorsByClinic) {
  let createdCount = 0;

  for (const clinicId of Object.keys(doctorsByClinic)) {
    for (const { profile } of doctorsByClinic[clinicId]) {
      const existing = await DoctorLeave.count({
        where: { doctor_id: profile.id },
      });
      if (existing > 0) continue;

      const from = faker.date.soon({ days: 30 });
      const to = new Date(from);
      to.setDate(to.getDate() + faker.number.int({ min: 1, max: 3 }));

      await DoctorLeave.create({
        doctor_id: profile.id,
        from_date: from.toISOString().slice(0, 10),
        to_date: to.toISOString().slice(0, 10),
        reason: faker.helpers.arrayElement(REASONS),
        status: faker.helpers.arrayElement(["pending", "approved"]),
      });
      createdCount += 1;
    }
  }

  console.log(`✓ Doctor leaves: ${createdCount}`);
}

module.exports = { seedDoctorLeaves };
