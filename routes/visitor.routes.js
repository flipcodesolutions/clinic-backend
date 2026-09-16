const express = require("express");
const {
  listVisitorDepartments,
  getVisitorDepartmentById,
  listVisitorCities,
} = require("../controllers/visitor/department.controller");
const {
  listDoctors,
  getDoctorProfile,
} = require("../controllers/patient/doctor.controller");

const router = express.Router();

// Public Department / Specialty endpoints
router.get("/departments", listVisitorDepartments);
router.get("/departments/:id", getVisitorDepartmentById);
router.get("/specialties", listVisitorDepartments); // alias

// Public Cities where clinics are available
router.get("/cities", listVisitorCities);

// Public Doctor search & view endpoints
router.get("/doctors", listDoctors);
router.get("/doctors/:id", getDoctorProfile);

module.exports = router;
