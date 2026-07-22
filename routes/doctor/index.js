const express = require("express");
const { authenticate } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/authorize.middleware");

const profileController = require("../../controllers/doctor/profile.controller");
const experienceController = require("../../controllers/doctor/experience.controller");
const achievementController = require("../../controllers/doctor/achievement.controller");
const scheduleController = require("../../controllers/doctor/schedule.controller");
const leaveController = require("../../controllers/doctor/leave.controller");
const appointmentController = require("../../controllers/doctor/appointment.controller");
const medicalRecordController = require("../../controllers/doctor/medical-record.controller");
const prescriptionController = require("../../controllers/doctor/prescription.controller");

const router = express.Router();

router.use(authenticate, authorize("doctor"));

router.get("/profile", profileController.getProfile);
router.put("/profile", profileController.updateProfile);

router.get("/experiences", experienceController.listExperiences);
router.post("/experiences", experienceController.createExperience);
router.put("/experiences/:id", experienceController.updateExperience);
router.delete("/experiences/:id", experienceController.deleteExperience);

router.get("/achievements", achievementController.listAchievements);
router.post("/achievements", achievementController.createAchievement);
router.put("/achievements/:id", achievementController.updateAchievement);
router.delete("/achievements/:id", achievementController.deleteAchievement);

router.get("/schedules", scheduleController.listSchedules);
router.post("/schedules", scheduleController.createSchedule);
router.put("/schedules/:id", scheduleController.updateSchedule);
router.delete("/schedules/:id", scheduleController.deleteSchedule);

router.get("/leaves", leaveController.listLeaves);
router.post("/leaves", leaveController.createLeave);
router.put("/leaves/:id", leaveController.updateLeave);

router.get("/appointments", appointmentController.listAppointments);
router.put("/appointments/:id/status", appointmentController.updateAppointmentStatus);

router.post("/medical-records", medicalRecordController.createMedicalRecord);
router.get("/medical-records/:appointmentId", medicalRecordController.getMedicalRecord);

router.post("/prescriptions", prescriptionController.createPrescription);
router.get("/prescriptions/:appointmentId", prescriptionController.getPrescription);

module.exports = router;
