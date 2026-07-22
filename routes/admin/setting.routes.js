const express = require("express");
const settingController = require("../../controllers/admin/setting.controller");

const router = express.Router();

router.get("/", settingController.listSettings);
router.put("/", settingController.upsertSetting);

module.exports = router;
