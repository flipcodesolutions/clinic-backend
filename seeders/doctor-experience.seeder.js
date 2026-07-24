const { DoctorExperience } = require("../models");
const { faker } = require("./helpers/user.helper");

const PREVIOUS_HOSPITALS = [
  "Civil Hospital Ahmedabad",
  "Sterling Hospital Rajkot",
  "Apollo Hospital Ahmedabad",
  "HCG Hospital",
  "CIMS Hospital",
  "PD Hinduja Hospital",
];

/**
 * 1–2 past work experiences per doctor.
 */
async function seedDoctorExperiences(doctorsByClinic) {
  let createdCount = 0;

  for (const clinicId of Object.keys(doctorsByClinic)) {
    for (const { profile } of doctorsByClinic[clinicId]) {
      const existing = await DoctorExperience.count({
        where: { doctor_id: profile.id },
      });
      if (existing > 0) continue;

      const experienceCount = faker.number.int({ min: 1, max: 2 });

      for (let i = 0; i < experienceCount; i += 1) {
        const start = faker.date.past({ years: 10 + i * 2 });
        const end = faker.date.between({
          from: start,
          to: new Date(),
        });

        await DoctorExperience.create({
          doctor_id: profile.id,
          hospital_name: faker.helpers.arrayElement(PREVIOUS_HOSPITALS),
          designation: profile.specialization || "Doctor",
          start_date: start.toISOString().slice(0, 10),
          end_date: end.toISOString().slice(0, 10),
          description: `Worked as ${profile.specialization} handling OPD and inpatient care.`,
        });
        createdCount += 1;
      }
    }
  }

  console.log(`✓ Doctor experiences: ${createdCount}`);
}

module.exports = { seedDoctorExperiences };
