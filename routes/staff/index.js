const express = require("express");
const { authenticate } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/authorize.middleware");

const profileController = require("../../controllers/staff/profile.controller");
const appointmentController = require("../../controllers/staff/appointment.controller");

const router = express.Router();

router.use(authenticate, authorize("staff"));

router.get("/profile", profileController.getProfile);
router.put("/profile", profileController.updateProfile);
router.get("/appointments", appointmentController.listAppointments);

module.exports = router;
