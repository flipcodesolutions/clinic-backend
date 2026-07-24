require("dotenv").config();

const { sequelize, syncDatabase } = require("../models");
const { seedCity } = require("./city.seeder");
const { seedHospitals } = require("./hospital.seeder");
const { seedDepartments } = require("./department.seeder");
const { seedServices } = require("./service.seeder");
const { seedClinicMappings } = require("./clinic-mapping.seeder");
const { seedDoctors } = require("./doctor.seeder");
const { seedDoctorDepartments } = require("./doctor-department.seeder");
const { seedDoctorExperiences } = require("./doctor-experience.seeder");
const { seedDoctorAchievements } = require("./doctor-achievement.seeder");
const { seedDoctorSchedules } = require("./doctor-schedule.seeder");
const { seedDoctorLeaves } = require("./doctor-leave.seeder");
const { seedClinicGalleries } = require("./clinic-gallery.seeder");
const { seedStaff } = require("./staff.seeder");
const { seedPatients } = require("./patient.seeder");
const { seedCaretakers } = require("./caretaker.seeder");
const { seedAppointments } = require("./appointment.seeder");
const { seedClinicalData } = require("./clinical-data.seeder");
const { seedSuperAdmin } = require("./super-admin.seeder");
const { DEFAULT_PASSWORD } = require("./data/constants");

/**
 * Full clinic seed orchestrator.
 * Order respects FK dependencies (city → clinics → masters → doctors → related → patients).
 */
async function run() {
  console.log("\n🌱 Starting clinic database seed...\n");

  try {
    await syncDatabase({ force: true });

    await seedSuperAdmin();
    const city = await seedCity();
    const clinics = await seedHospitals(city);

    const departments = await seedDepartments();
    const services = await seedServices();
    await seedClinicMappings(clinics, departments, services);

    const doctorsByClinic = await seedDoctors(clinics);
    await seedDoctorDepartments(doctorsByClinic, departments);
    await seedDoctorExperiences(doctorsByClinic);
    await seedDoctorAchievements(doctorsByClinic);
    await seedDoctorSchedules(clinics, doctorsByClinic);
    await seedDoctorLeaves(doctorsByClinic);
    await seedClinicGalleries(clinics);

    await seedStaff(clinics);
    const patientsByClinic = await seedPatients(clinics, doctorsByClinic);
    await seedCaretakers(patientsByClinic);
    await seedAppointments(
      clinics,
      patientsByClinic,
      doctorsByClinic,
      departments
    );
    await seedClinicalData();

    console.log("\n✅ Seed completed successfully");
    console.log(`   Default password for all users: ${DEFAULT_PASSWORD}`);
    console.log(
      "   Core: 1 city, 2 clinics, 10 depts, 10 services, 20 doctors, 20 staff, 50 patients, 50 caretakers\n"
    );
  } catch (error) {
    console.error("\n❌ Seed failed:", error.message);
    if (error.parent) console.error(error.parent.message || error.parent);
    console.error(error.stack);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

run();
