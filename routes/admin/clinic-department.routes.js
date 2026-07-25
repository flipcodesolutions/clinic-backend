const express = require("express");
const controller = require("../../controllers/admin/clinic-department.controller");

const router = express.Router();

router.get("/", controller.listClinicDepartments);
router.post("/", controller.assignDepartment);
router.delete("/:id", controller.removeDepartment);

module.exports = router;
