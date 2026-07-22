const express = require("express");
const userController = require("../../controllers/admin/user.controller");

const router = express.Router();

router.get("/", userController.listUsers);
router.put("/:id/status", userController.updateUserStatus);

module.exports = router;
