const { DoctorDepartment } = require("../models");

/**
 * Link each doctor to the department matching their specialization.
 */
async function seedDoctorDepartments(doctorsByClinic, departments) {
  const departmentByName = Object.fromEntries(
    departments.map((d) => [d.name, d])
  );

  let createdCount = 0;

  for (const clinicId of Object.keys(doctorsByClinic)) {
    for (const { profile } of doctorsByClinic[clinicId]) {
      const department = departmentByName[profile.specialization];
      if (!department) continue;

      const [, created] = await DoctorDepartment.findOrCreate({
        where: {
          doctor_id: profile.id,
          department_id: department.id,
        },
        defaults: {
          doctor_id: profile.id,
          department_id: department.id,
        },
      });

      if (created) createdCount += 1;
    }
  }

  console.log(`✓ Doctor-Department links: ${createdCount} new`);
}

module.exports = { seedDoctorDepartments };
