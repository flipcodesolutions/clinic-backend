const express = require("express");
const { authenticate } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/authorize.middleware");

const profileController = require("../../controllers/doctor/profile.controller");
const experienceController = require("../../controllers/doctor/experience.controller");
const achievementController = require("../../controllers/doctor/achievement.controller");
const scheduleController = require("../../controllers/doctor/schedule.controller");
const leaveController = require("../../controllers/doctor/leave.controller");
const appointmentController = require("../../controllers/doctor/appointment.controller");
const patientController = require("../../controllers/doctor/patient.controller");
const medicalRecordController = require("../../controllers/doctor/medical-record.controller");
const prescriptionController = require("../../controllers/doctor/prescription.controller");
const authController = require("../../controllers/comman/auth.controller");

const router = express.Router();

router.use(authenticate, authorize("doctor"));

// Doctor Profile
router.get("/profile", profileController.getProfile);
router.put("/profile", profileController.updateProfile);

// Doctor Experiences
router.get("/experiences", experienceController.listExperiences);
router.get("/experiences/:id", experienceController.getExperienceById);
router.post("/experiences", experienceController.createExperience);
router.put("/experiences/:id", experienceController.updateExperience);
router.delete("/experiences/:id", experienceController.deleteExperience);

// Doctor Achievements
router.get("/achievements", achievementController.listAchievements);
router.get("/achievements/:id", achievementController.getAchievementById);
router.post("/achievements", achievementController.createAchievement);
router.put("/achievements/:id", achievementController.updateAchievement);
router.delete("/achievements/:id", achievementController.deleteAchievement);

// Doctor Schedule
router.get("/schedules", scheduleController.listSchedules);
router.post("/schedules", scheduleController.createSchedule);
router.put("/schedules/:id", scheduleController.updateSchedule);
router.delete("/schedules/:id", scheduleController.deleteSchedule);

// Doctor Leaves
router.get("/leaves", leaveController.listLeaves);
router.post("/leaves", leaveController.createLeave);
router.put("/leaves/:id", leaveController.updateLeave);
router.delete("/leaves/:id", leaveController.deleteLeave);

// Doctor Appointments
router.get("/appointments", appointmentController.listAppointments);
router.put("/appointments/bulk-status", appointmentController.bulkUpdateAppointmentStatus);
router.put("/appointments/:id/status", appointmentController.updateAppointmentStatus);

// Doctor Patients
router.get("/patients", patientController.listPatients);
router.get("/patients/:id", patientController.getPatientDetails);

// Medical Records
router.post("/medical-records", medicalRecordController.createMedicalRecord);
router.get("/medical-records/:appointmentId", medicalRecordController.getMedicalRecord);

// Prescriptions
router.post("/prescriptions", prescriptionController.createPrescription);
router.get("/prescriptions/:appointmentId", prescriptionController.getPrescription);

// Change Password
router.put("/change-password", authController.changePassword);

module.exports = router;
