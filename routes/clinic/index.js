const express = require("express");
const { authenticate } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/authorize.middleware");

const doctorRoutes = require("./doctor.routes");
const staffRoutes = require("./staff.routes");
const departmentRoutes = require("./department.routes");
const serviceRoutes = require("./service.routes");
const galleryRoutes = require("./gallery.routes");
const settingRoutes = require("./setting.routes");
const { getClinicDashboard } = require("../../controllers/clinic/dashboard.controller");
const { listClinics, getCurrentClinicProfile, updateCurrentClinicProfile } = require("../../controllers/admin/clinic.controller");
const { listServices } = require("../../controllers/admin/service.controller");
const { listDepartments } = require("../../controllers/admin/department.controller");

const router = express.Router();

router.use(authenticate, authorize("clinic_admin", "super_admin"));

router.get("/dashboard", getClinicDashboard);
router.get("/clinics", listClinics);
router.get("/profile", getCurrentClinicProfile);
router.put("/profile", updateCurrentClinicProfile);

// Read-only master lists for Clinic Admin (assign modal)
router.get("/master-services", listServices);
router.get("/master-departments", listDepartments);

router.use("/doctors", doctorRoutes);
router.use("/staff", staffRoutes);
router.use("/departments", departmentRoutes);
router.use("/services", serviceRoutes);
router.use("/gallery", galleryRoutes);
router.use("/settings", settingRoutes);

module.exports = router;
