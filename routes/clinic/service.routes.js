const express = require("express");
const controller = require("../../controllers/clinic/service.controller");

const router = express.Router();

router.get("/", controller.listClinicServices);
router.post("/", controller.assignService);
router.put("/:id/status", controller.updateServiceStatus);
router.delete("/:id", controller.removeService);

module.exports = router;
