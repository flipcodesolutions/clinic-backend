const { Op } = require("sequelize");
const { User, PatientProfile } = require("../../models");

const listPatients = async (req, res) => {
  try {
    const { search } = req.query;
    const userWhere = {};

    if (search) {
      userWhere[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const patients = await PatientProfile.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: { exclude: ["password"] },
          where: Object.keys(userWhere).length ? userWhere : undefined,
        },
      ],
      order: [["id", "DESC"]],
    });

    return res.json({ success: true, data: patients });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { listPatients };
