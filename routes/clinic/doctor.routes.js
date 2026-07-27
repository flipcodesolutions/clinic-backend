const express = require("express");
const controller = require("../../controllers/clinic/doctor.controller");

const router = express.Router();

router.get("/", controller.listDoctors);
router.post("/", controller.createDoctor);
router.put("/:id", controller.updateDoctor);
router.delete("/:id", controller.deleteDoctor);

module.exports = router;
