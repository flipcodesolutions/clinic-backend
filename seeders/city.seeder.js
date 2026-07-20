const { City } = require("../models");
const { CITY_NAME } = require("./data/constants");

async function seedCity() {
  const [city] = await City.findOrCreate({
    where: { name: CITY_NAME },
    defaults: {
      name: CITY_NAME,
      status: "active",
    },
  });

  console.log(`✓ City: ${city.name}`);
  return city;
}

module.exports = { seedCity };
