const express = require("express");
const controller = require("../../controllers/clinic/staff.controller");

const router = express.Router();

router.get("/", controller.listStaff);
router.post("/", controller.createStaff);
router.get("/:id", controller.getStaffById);
router.put("/:id", controller.updateStaff);
router.delete("/:id", controller.deleteStaff);

module.exports = router;
