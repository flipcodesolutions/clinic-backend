const express = require("express");
const settingController = require("../../controllers/clinic/setting.controller");

const router = express.Router();

router.get("/", settingController.listSettings);
router.put("/", settingController.upsertSetting);

module.exports = router;
