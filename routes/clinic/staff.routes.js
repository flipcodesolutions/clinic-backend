const express = require("express");
const controller = require("../../controllers/clinic/staff.controller");

const router = express.Router();

router.get("/", controller.listStaff);
router.post("/", controller.createStaff);

module.exports = router;
