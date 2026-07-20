const { DoctorProfile, ClinicUser } = require("../models");
const { SPECIALIZATIONS, HOSPITALS } = require("./data/constants");
const {
  faker,
  hashDefaultPassword,
  stableEmail,
  uniquePhone,
  indianName,
  upsertUser,
  slugify,
} = require("./helpers/user.helper");

const QUALIFICATIONS = {
  "General Physician": "MBBS, MD (General Medicine)",
  Cardiologist: "MBBS, MD, DM (Cardiology)",
  "Orthopedic Surgeon": "MBBS, MS (Orthopedics)",
  Pediatrician: "MBBS, MD (Pediatrics)",
  Gynecologist: "MBBS, MS (Obstetrics & Gynecology)",
  Dermatologist: "MBBS, MD (Dermatology)",
  Neurologist: "MBBS, MD, DM (Neurology)",
  Ophthalmologist: "MBBS, MS (Ophthalmology)",
  "ENT Specialist": "MBBS, MS (ENT)",
  Dentist: "BDS, MDS",
};

function clinicSlug(clinic) {
  const found = HOSPITALS.find((h) => h.name === clinic.name);
  return found ? found.slug : slugify(clinic.name);
}

async function seedDoctors(clinics) {
  const passwordHash = await hashDefaultPassword();
  const doctorsByClinic = {};

  for (const clinic of clinics) {
    doctorsByClinic[clinic.id] = [];
    const cSlug = clinicSlug(clinic);

    for (const specialization of SPECIALIZATIONS) {
      const gender = faker.helpers.arrayElement(["male", "female"]);
      const { first_name, last_name } = indianName(gender);
      const email = stableEmail("dr", cSlug, specialization);
      const phone = uniquePhone();

      const user = await upsertUser({
        first_name,
        last_name,
        email,
        phone,
        roles: ["doctor"],
        passwordHash,
        profile_image: "https://placehold.co/150x150?text=Dr",
      });

      const [profile] = await DoctorProfile.findOrCreate({
        where: { user_id: user.id },
        defaults: {
          user_id: user.id,
          registration_no: `MCI-${faker.string.numeric(7)}`,
          qualification: QUALIFICATIONS[specialization],
          specialization,
          experience_years: faker.number.int({ min: 2, max: 25 }),
          consultation_fee: faker.number.int({ min: 300, max: 1500 }),
          department: specialization,
          bio: `Experienced ${specialization} practicing at ${clinic.name}.`,
          languages: ["English", "Hindi", "Gujarati"],
          gender,
          dob: faker.date
            .birthdate({ min: 30, max: 60, mode: "age" })
            .toISOString()
            .slice(0, 10),
          opd_timing: "10:00 AM - 01:00 PM, 05:00 PM - 08:00 PM",
          profile_image: user.profile_image,
        },
      });

      await profile.update({
        specialization,
        qualification: QUALIFICATIONS[specialization],
        department: specialization,
      });

      await ClinicUser.findOrCreate({
        where: { clinic_id: clinic.id, user_id: user.id },
        defaults: {
          clinic_id: clinic.id,
          user_id: user.id,
          designation: specialization,
          joining_date: faker.date.past({ years: 5 }).toISOString().slice(0, 10),
          status: "active",
        },
      });

      doctorsByClinic[clinic.id].push({ user, profile });
    }

    console.log(`✓ Doctors for ${clinic.name}: ${doctorsByClinic[clinic.id].length}`);
  }

  return doctorsByClinic;
}

module.exports = { seedDoctors };
