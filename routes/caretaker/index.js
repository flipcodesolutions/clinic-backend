const express = require("express");
const { authenticate } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/authorize.middleware");

const profileController = require("../../controllers/caretaker/profile.controller");
const patientController = require("../../controllers/caretaker/patient.controller");
const appointmentController = require("../../controllers/caretaker/appointment.controller");

const router = express.Router();

router.use(authenticate, authorize("caretaker"));

router.get("/profile", profileController.getProfile);
router.put("/profile", profileController.updateProfile);
router.get("/patients", patientController.listPatients);
router.get("/appointments", appointmentController.listAppointments);
router.post("/appointments", appointmentController.bookAppointment);

module.exports = router;
