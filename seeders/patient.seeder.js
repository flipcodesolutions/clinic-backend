const { PatientProfile, ClinicUser } = require("../models");
const {
  PATIENTS_PER_HOSPITAL,
  BLOOD_GROUPS,
  CITY_NAME,
  HOSPITALS,
} = require("./data/constants");
const {
  faker,
  hashDefaultPassword,
  stableEmail,
  uniquePhone,
  indianName,
  upsertUser,
  randomYesNo,
  randomAadhaar,
  slugify,
} = require("./helpers/user.helper");

const OCCUPATIONS = [
  "Teacher",
  "Engineer",
  "Business Owner",
  "Farmer",
  "Student",
  "Homemaker",
  "Accountant",
  "Driver",
  "Shopkeeper",
  "Government Employee",
];

const ALLERGIES = [
  "None",
  "Dust",
  "Pollen",
  "Penicillin",
  "Peanuts",
  "Seafood",
  "Sulfa drugs",
];

const CHRONIC = [
  "None",
  "Asthma",
  "Thyroid",
  "Arthritis",
  "Migraine",
  "Heart disease",
];

function clinicSlug(clinic) {
  const found = HOSPITALS.find((h) => h.name === clinic.name);
  return found ? found.slug : slugify(clinic.name);
}

async function seedPatients(clinics, doctorsByClinic) {
  const passwordHash = await hashDefaultPassword();
  const patientsByClinic = {};

  for (const clinic of clinics) {
    patientsByClinic[clinic.id] = [];
    const doctors = doctorsByClinic[clinic.id] || [];
    const cSlug = clinicSlug(clinic);

    if (!doctors.length) {
      throw new Error(`No doctors found for clinic ${clinic.name}`);
    }

    for (let i = 1; i <= PATIENTS_PER_HOSPITAL; i += 1) {
      const gender = faker.helpers.arrayElement(["male", "female"]);
      const { first_name, last_name } = indianName(gender);
      const email = stableEmail("patient", cSlug, String(i));
      const phone = uniquePhone();
      const doctor = faker.helpers.arrayElement(doctors);

      const user = await upsertUser({
        first_name,
        last_name,
        email,
        phone,
        roles: ["patient"],
        passwordHash,
      });

      const [profile] = await PatientProfile.findOrCreate({
        where: { user_id: user.id },
        defaults: {
          user_id: user.id,
          dob: faker.date
            .birthdate({ min: 5, max: 75, mode: "age" })
            .toISOString()
            .slice(0, 10),
          gender,
          blood_group: faker.helpers.arrayElement(BLOOD_GROUPS),
          height: faker.number.float({ min: 140, max: 190, fractionDigits: 1 }),
          weight: faker.number.float({ min: 35, max: 110, fractionDigits: 1 }),
          marital_status: faker.helpers.arrayElement([
            "single",
            "married",
            "divorced",
            "widowed",
          ]),
          occupation: faker.helpers.arrayElement(OCCUPATIONS),
          address: `${faker.location.streetAddress()}, ${CITY_NAME}, Gujarat`,
          city: CITY_NAME,
          state: "Gujarat",
          country: "India",
          emergency_contact_name: faker.person.fullName(),
          emergency_contact_number: uniquePhone(),
          primary_doctor_id: doctor.profile.id,
          aadhaar_number: randomAadhaar(),
          diabetes: randomYesNo(),
          blood_pressure: faker.helpers.arrayElement(["normal", "high"]),
          allergy: faker.helpers.arrayElement(ALLERGIES),
          chronic_disease: faker.helpers.arrayElement(CHRONIC),
          smoking: randomYesNo(),
          alcohol: randomYesNo(),
          medical_notes: faker.lorem.sentence(),
        },
      });

      await profile.update({
        primary_doctor_id: doctor.profile.id,
        city: CITY_NAME,
        state: "Gujarat",
        country: "India",
      });

      await ClinicUser.findOrCreate({
        where: { clinic_id: clinic.id, user_id: user.id },
        defaults: {
          clinic_id: clinic.id,
          user_id: user.id,
          designation: "Patient",
          joining_date: faker.date.recent({ days: 365 }).toISOString().slice(0, 10),
          status: "active",
        },
      });

      patientsByClinic[clinic.id].push({
        user,
        profile,
        clinic,
        index: i,
        cSlug,
      });
    }

    console.log(`✓ Patients for ${clinic.name}: ${PATIENTS_PER_HOSPITAL}`);
  }

  return patientsByClinic;
}

module.exports = { seedPatients };
