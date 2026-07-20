require("dotenv").config();

const { sequelize, syncDatabase } = require("../models");
const { seedCity } = require("./city.seeder");
const { seedHospitals } = require("./hospital.seeder");
const { seedDoctors } = require("./doctor.seeder");
const { seedStaff } = require("./staff.seeder");
const { seedPatients } = require("./patient.seeder");
const { seedCaretakers } = require("./caretaker.seeder");
const { DEFAULT_PASSWORD } = require("./data/constants");

/**
 * Node/Sequelize seeder orchestrator.
 * Mirrors the hospital seed plan: 1 city, 2 clinics, 20 doctors, 20 staff, 50 patients, 50 caretakers.
 */
async function run() {
  console.log("\n🌱 Starting clinic database seed...\n");

  try {
    await syncDatabase({ alter: true });

    await sequelize.transaction(async () => {
      const city = await seedCity();
      const clinics = await seedHospitals(city);
      const doctorsByClinic = await seedDoctors(clinics);
      await seedStaff(clinics);
      const patientsByClinic = await seedPatients(clinics, doctorsByClinic);
      await seedCaretakers(patientsByClinic);
    });

    console.log("\n✅ Seed completed successfully");
    console.log(`   Default password for all users: ${DEFAULT_PASSWORD}`);
    console.log(
      "   Totals: 1 city, 2 clinics, 20 doctors, 20 staff, 50 patients, 50 caretakers\n"
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
