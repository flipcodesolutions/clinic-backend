const express = require("express");
const { authenticate } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/authorize.middleware");
const doctorController = require("../../controllers/doctor/doctor.controller");

const router = express.Router();

router.use(authenticate, authorize("doctor"));

router.get("/profile", doctorController.getProfile);
router.put("/profile", doctorController.updateProfile);

router.get("/experiences", doctorController.listExperiences);
router.post("/experiences", doctorController.createExperience);
router.put("/experiences/:id", doctorController.updateExperience);
router.delete("/experiences/:id", doctorController.deleteExperience);

router.get("/achievements", doctorController.listAchievements);
router.post("/achievements", doctorController.createAchievement);
router.put("/achievements/:id", doctorController.updateAchievement);
router.delete("/achievements/:id", doctorController.deleteAchievement);

router.get("/schedules", doctorController.listSchedules);
router.post("/schedules", doctorController.createSchedule);
router.put("/schedules/:id", doctorController.updateSchedule);
router.delete("/schedules/:id", doctorController.deleteSchedule);

router.get("/leaves", doctorController.listLeaves);
router.post("/leaves", doctorController.createLeave);
router.put("/leaves/:id", doctorController.updateLeave);

router.get("/appointments", doctorController.listAppointments);
router.put("/appointments/:id/status", doctorController.updateAppointmentStatus);

router.post("/medical-records", doctorController.createMedicalRecord);
router.get("/medical-records/:appointmentId", doctorController.getMedicalRecord);

router.post("/prescriptions", doctorController.createPrescription);
router.get("/prescriptions/:appointmentId", doctorController.getPrescription);

module.exports = router;
