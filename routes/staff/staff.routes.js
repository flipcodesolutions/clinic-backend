const express = require("express");
const { authenticate } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/authorize.middleware");
const staffController = require("../../controllers/staff/staff.controller");

const router = express.Router();

router.use(authenticate, authorize("staff"));

router.get("/profile", staffController.getProfile);
router.put("/profile", staffController.updateProfile);
router.get("/appointments", staffController.listAppointments);

module.exports = router;
