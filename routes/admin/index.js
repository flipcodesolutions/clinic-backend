const express = require("express");
const { authenticate } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/authorize.middleware");

const cityRoutes = require("./city.routes");
const clinicRoutes = require("./clinic.routes");
const departmentRoutes = require("./department.routes");
const serviceRoutes = require("./service.routes");
const userRoutes = require("./user.routes");
const settingRoutes = require("./setting.routes");

const router = express.Router();

router.use(authenticate, authorize("super_admin"));

router.use("/cities", cityRoutes);
router.use("/clinics", clinicRoutes);
router.use("/departments", departmentRoutes);
router.use("/services", serviceRoutes);
router.use("/users", userRoutes);
router.use("/settings", settingRoutes);

module.exports = router;
