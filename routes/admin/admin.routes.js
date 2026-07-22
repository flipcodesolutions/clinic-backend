const express = require("express");
const { authenticate } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/authorize.middleware");
const adminController = require("../../controllers/admin/admin.controller");

const router = express.Router();

router.use(authenticate, authorize("super_admin"));

router.get("/clinics", adminController.listClinics);
router.post("/clinics", adminController.createClinic);
router.get("/clinics/:id", adminController.getClinic);
router.put("/clinics/:id", adminController.updateClinic);
router.delete("/clinics/:id", adminController.deleteClinic);

router.get("/departments", adminController.listDepartments);
router.post("/departments", adminController.createDepartment);
router.put("/departments/:id", adminController.updateDepartment);
router.delete("/departments/:id", adminController.deleteDepartment);

router.get("/services", adminController.listServices);
router.post("/services", adminController.createService);
router.put("/services/:id", adminController.updateService);
router.delete("/services/:id", adminController.deleteService);

router.get("/cities", adminController.listCities);
router.get("/city/:id", adminController.getCityById);
router.post("/cities", adminController.createCity);
router.put("/cities/:id", adminController.updateCity);
router.delete("/cities/:id", adminController.deleteCity);

router.get("/users", adminController.listUsers);
router.put("/users/:id/status", adminController.updateUserStatus);

router.get("/settings", adminController.listSettings);
router.put("/settings", adminController.upsertSetting);

module.exports = router;
