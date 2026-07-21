const { ClinicDepartment, ClinicService } = require("../models");

/**
 * Map all departments and services to each clinic.
 */
async function seedClinicMappings(clinics, departments, services) {
  let deptLinks = 0;
  let serviceLinks = 0;

  for (const clinic of clinics) {
    for (const department of departments) {
      const [, created] = await ClinicDepartment.findOrCreate({
        where: {
          clinic_id: clinic.id,
          department_id: department.id,
        },
        defaults: {
          clinic_id: clinic.id,
          department_id: department.id,
        },
      });
      if (created) deptLinks += 1;
    }

    for (const service of services) {
      const [, created] = await ClinicService.findOrCreate({
        where: {
          clinic_id: clinic.id,
          service_id: service.id,
        },
        defaults: {
          clinic_id: clinic.id,
          service_id: service.id,
        },
      });
      if (created) serviceLinks += 1;
    }
  }

  console.log(
    `✓ Clinic mappings: ${deptLinks} new dept links, ${serviceLinks} new service links`
  );
}

module.exports = { seedClinicMappings };
