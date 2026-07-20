const { StaffProfile, ClinicUser } = require("../models");
const { STAFF_ROLES, HOSPITALS } = require("./data/constants");
const {
  faker,
  hashDefaultPassword,
  stableEmail,
  uniquePhone,
  indianName,
  upsertUser,
  slugify,
} = require("./helpers/user.helper");

const ROLE_META = {
  Receptionist: { department: "Front Desk" },
  Nurse: { department: "Nursing" },
  Pharmacist: { department: "Pharmacy" },
  "Lab Technician": { department: "Laboratory" },
  "X-Ray Technician": { department: "Radiology" },
  Accountant: { department: "Accounts" },
  "Admin Executive": { department: "Administration" },
  "Ward Boy": { department: "Ward" },
  Housekeeping: { department: "Housekeeping" },
  "Security Guard": { department: "Security" },
};

function clinicSlug(clinic) {
  const found = HOSPITALS.find((h) => h.name === clinic.name);
  return found ? found.slug : slugify(clinic.name);
}

async function seedStaff(clinics) {
  const passwordHash = await hashDefaultPassword();
  let total = 0;

  for (const clinic of clinics) {
    const cSlug = clinicSlug(clinic);
    let index = 1;

    for (const role of STAFF_ROLES) {
      const meta = ROLE_META[role];
      const gender = faker.helpers.arrayElement(["male", "female"]);
      const { first_name, last_name } = indianName(gender);
      const email = stableEmail("staff", cSlug, role);
      const phone = uniquePhone();
      const prefix = cSlug === "flipcare" ? "FC" : "SK";
      const employeeCode = `${prefix}-STF-${String(index).padStart(3, "0")}`;

      const userRoles =
        role === "Receptionist" ? ["receptionist", "staff"] : ["staff"];

      const user = await upsertUser({
        first_name,
        last_name,
        email,
        phone,
        roles: userRoles,
        passwordHash,
      });

      const [profile] = await StaffProfile.findOrCreate({
        where: { user_id: user.id },
        defaults: {
          user_id: user.id,
          designation: role,
          qualification: `${role} Diploma / Certification`,
          joining_date: faker.date.past({ years: 8 }).toISOString().slice(0, 10),
          employee_code: employeeCode,
          salary: faker.number.int({ min: 12000, max: 45000 }),
          department: meta.department,
          shift: faker.helpers.arrayElement(["morning", "evening", "night"]),
          experience_years: faker.number.int({ min: 1, max: 20 }),
        },
      });

      await profile.update({
        designation: role,
        department: meta.department,
        employee_code: profile.employee_code || employeeCode,
      });

      await ClinicUser.findOrCreate({
        where: { clinic_id: clinic.id, user_id: user.id },
        defaults: {
          clinic_id: clinic.id,
          user_id: user.id,
          designation: role,
          joining_date: faker.date.past({ years: 8 }).toISOString().slice(0, 10),
          status: "active",
        },
      });

      index += 1;
      total += 1;
    }

    console.log(`✓ Staff for ${clinic.name}: ${STAFF_ROLES.length}`);
  }

  return total;
}

module.exports = { seedStaff };
