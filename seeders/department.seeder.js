const { Department } = require("../models");
const { SPECIALIZATIONS } = require("./data/constants");

/**
 * Seed departments from doctor specializations (1:1 master list).
 */
async function seedDepartments() {
  const departments = [];

  for (const name of SPECIALIZATIONS) {
    const [department] = await Department.findOrCreate({
      where: { name },
      defaults: {
        name,
        description: `${name} department`,
        status: "active",
      },
    });

    await department.update({ status: "active" });
    departments.push(department);
  }

  console.log(`✓ Departments: ${departments.length}`);
  return departments;
}

module.exports = { seedDepartments };
