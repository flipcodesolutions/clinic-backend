const express = require("express");
const departmentController = require("../../controllers/admin/department.controller");

const router = express.Router();

router.get("/", departmentController.listDepartments);
router.post("/", departmentController.createDepartment);
router.put("/:id", departmentController.updateDepartment);
router.delete("/:id", departmentController.deleteDepartment);

module.exports = router;
