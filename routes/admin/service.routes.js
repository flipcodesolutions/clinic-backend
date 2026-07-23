const express = require("express");
const serviceController = require("../../controllers/admin/service.controller");

const router = express.Router();

router.get("/", serviceController.listServices);
router.get("/:id", serviceController.getServiceById);
router.post("/", serviceController.createService);
router.put("/:id", serviceController.updateService);
router.delete("/:id", serviceController.deleteService);

module.exports = router;
