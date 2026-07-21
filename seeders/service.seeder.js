const { Service } = require("../models");
const { SERVICES } = require("./data/constants");

async function seedServices() {
  const services = [];

  for (const item of SERVICES) {
    const [service] = await Service.findOrCreate({
      where: { name: item.name },
      defaults: {
        name: item.name,
        description: item.description,
        price: item.price,
        status: "active",
      },
    });

    await service.update({
      description: item.description,
      price: item.price,
      status: "active",
    });

    services.push(service);
  }

  console.log(`✓ Services: ${services.length}`);
  return services;
}

module.exports = { seedServices };
