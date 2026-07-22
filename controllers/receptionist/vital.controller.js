const { Vital } = require("../../models");

const createVital = async (req, res) => {
  try {
    const { appointment_id, temperature, pulse, bp, height, weight, oxygen } = req.body;
    if (!appointment_id) {
      return res.status(400).json({
        success: false,
        message: "appointment_id is required",
      });
    }

    const vital = await Vital.create({
      appointment_id,
      temperature,
      pulse,
      bp,
      height,
      weight,
      oxygen,
    });

    return res.status(201).json({ success: true, data: vital });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createVital };
