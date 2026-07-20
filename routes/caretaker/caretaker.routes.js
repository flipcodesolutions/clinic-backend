const express = require("express");
const { authenticate } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/authorize.middleware");
const caretakerController = require("../../controllers/caretaker/caretaker.controller");

const router = express.Router();

router.use(authenticate, authorize("caretaker"));

router.get("/profile", caretakerController.getProfile);
router.put("/profile", caretakerController.updateProfile);
router.get("/patients", caretakerController.listPatients);
router.get("/appointments", caretakerController.listAppointments);
router.post("/appointments", caretakerController.bookAppointment);

module.exports = router;
