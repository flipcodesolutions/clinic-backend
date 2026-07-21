const { DoctorAchievement } = require("../models");
const { faker } = require("./helpers/user.helper");

const TITLES = [
  "Best Doctor Award",
  "Excellence in Patient Care",
  "Research Publication Award",
  "Medical Conference Speaker",
  "Community Health Service Award",
];

/**
 * 1–2 achievements per doctor.
 */
async function seedDoctorAchievements(doctorsByClinic) {
  let createdCount = 0;

  for (const clinicId of Object.keys(doctorsByClinic)) {
    for (const { profile } of doctorsByClinic[clinicId]) {
      const existing = await DoctorAchievement.count({
        where: { doctor_id: profile.id },
      });
      if (existing > 0) continue;

      const count = faker.number.int({ min: 1, max: 2 });

      for (let i = 0; i < count; i += 1) {
        const title = faker.helpers.arrayElement(TITLES);
        await DoctorAchievement.create({
          doctor_id: profile.id,
          title,
          description: `${title} recognizing contribution in ${profile.specialization}.`,
          year: faker.number.int({ min: 2015, max: 2025 }),
        });
        createdCount += 1;
      }
    }
  }

  console.log(`✓ Doctor achievements: ${createdCount}`);
}

module.exports = { seedDoctorAchievements };
