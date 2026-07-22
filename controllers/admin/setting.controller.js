const { Setting } = require("../../models");

const listSettings = async (req, res) => {
  try {
    const settings = await Setting.findAll({ order: [["setting_key", "ASC"]] });
    return res.json({ success: true, data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const upsertSetting = async (req, res) => {
  try {
    const { setting_key, setting_value, description } = req.body;
    if (!setting_key) {
      return res
        .status(400)
        .json({ success: false, message: "setting_key is required" });
    }

    let setting = await Setting.findOne({ where: { setting_key } });
    if (setting) {
      await setting.update({ setting_value, description });
    } else {
      setting = await Setting.create({
        setting_key,
        setting_value,
        description,
      });
    }

    return res.json({ success: true, data: setting });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listSettings,
  upsertSetting,
};
