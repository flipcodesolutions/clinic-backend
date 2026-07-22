const express = require("express");
const clinicController = require("../../controllers/admin/clinic.controller");

const router = express.Router();

router.get("/", clinicController.listClinics);
router.post("/", clinicController.createClinic);
router.get("/:id", clinicController.getClinic);
router.put("/:id", clinicController.updateClinic);
router.delete("/:id", clinicController.deleteClinic);

module.exports = router;
