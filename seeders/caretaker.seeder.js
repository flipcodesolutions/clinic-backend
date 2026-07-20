const { CareTakerProfile, PatientCareTaker } = require("../models");
const { CARETAKER_RELATIONSHIPS, CITY_NAME } = require("./data/constants");
const {
  faker,
  hashDefaultPassword,
  stableEmail,
  uniquePhone,
  indianName,
  upsertUser,
} = require("./helpers/user.helper");

async function seedCaretakers(patientsByClinic) {
  const passwordHash = await hashDefaultPassword();
  let total = 0;

  for (const clinicId of Object.keys(patientsByClinic)) {
    const patients = patientsByClinic[clinicId];

    for (const { profile: patientProfile, index, cSlug } of patients) {
      const relationship = faker.helpers.arrayElement(CARETAKER_RELATIONSHIPS);
      const gender = [
        "Mother",
        "Sister",
        "Wife",
        "Daughter",
        "Aunt",
        "Grandmother",
      ].includes(relationship)
        ? "female"
        : "male";

      const { first_name, last_name } = indianName(gender);
      const email = stableEmail("caretaker", cSlug, String(index));
      const phone = uniquePhone();

      const user = await upsertUser({
        first_name,
        last_name,
        email,
        phone,
        roles: ["caretaker"],
        passwordHash,
      });

      const [caretakerProfile] = await CareTakerProfile.findOrCreate({
        where: { user_id: user.id },
        defaults: {
          user_id: user.id,
          occupation: faker.helpers.arrayElement([
            "Homemaker",
            "Business",
            "Service",
            "Retired",
            "Farmer",
          ]),
          address: `${faker.location.streetAddress()}, ${CITY_NAME}, Gujarat`,
        },
      });

      // Exactly one primary caretaker per patient
      const existingPrimary = await PatientCareTaker.findOne({
        where: { patient_id: patientProfile.id, is_primary: true },
      });

      if (!existingPrimary) {
        await PatientCareTaker.create({
          patient_id: patientProfile.id,
          caretaker_id: caretakerProfile.id,
          relationship,
          is_primary: true,
        });
      } else {
        await existingPrimary.update({
          caretaker_id: caretakerProfile.id,
          relationship,
          is_primary: true,
        });
      }

      total += 1;
    }
  }

  console.log(`✓ Caretakers: ${total} (1 per patient)`);
  return total;
}

module.exports = { seedCaretakers };
