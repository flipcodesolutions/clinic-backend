const { Clinic } = require("../models");
const { HOSPITALS, CITY_NAME } = require("./data/constants");
const { faker } = require("./helpers/user.helper");

async function seedHospitals(city) {
  const clinics = [];

  for (const hospital of HOSPITALS) {
    const [clinic] = await Clinic.findOrCreate({
      where: { name: hospital.name },
      defaults: {
        name: hospital.name,
        email: hospital.email,
        phone: hospital.phone,
        registration_no: `REG-${hospital.slug.toUpperCase()}-${faker.string.numeric(6)}`,
        gst_number: `24${faker.string.alphanumeric(10).toUpperCase()}1Z5`,
        website: `https://www.${hospital.slug}.com`,
        logo: `https://placehold.co/200x200?text=${encodeURIComponent(hospital.slug)}`,
        address: `${faker.location.streetAddress()}, Near ST Bus Stand, ${CITY_NAME}, Gujarat 363001`,
        city: CITY_NAME,
        state: "Gujarat",
        country: "India",
        postal_code: "363001",
        latitude: 22.7 + Math.random() * 0.05,
        longitude: 71.65 + Math.random() * 0.05,
        description: `${hospital.name} providing multispeciality healthcare in ${CITY_NAME}.`,
        status: "active",
      },
    });

    await clinic.update({
      email: hospital.email,
      phone: hospital.phone,
      city: CITY_NAME,
      state: "Gujarat",
      country: "India",
      status: "active",
    });

    clinics.push(clinic);
    console.log(`✓ Hospital/Clinic: ${clinic.name}`);
  }

  return clinics;
}

module.exports = { seedHospitals };
