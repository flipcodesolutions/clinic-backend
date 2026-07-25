const express = require("express");
const clinicController = require("../../controllers/admin/clinic.controller");

const router = express.Router();

router.get("/", clinicController.listClinics);
router.post("/", clinicController.createClinic);
router.get("/profile/current", clinicController.getCurrentClinicProfile);
router.put("/profile/current", clinicController.updateCurrentClinicProfile);
router.get("/:id", clinicController.getClinic);
router.put("/:id", clinicController.updateClinic);
router.delete("/:id", clinicController.deleteClinic);

module.exports = router;
