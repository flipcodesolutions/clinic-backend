const express = require("express");
const userController = require("../../controllers/admin/user.controller");

const router = express.Router();

router.get("/", userController.listUsers);
router.get("/:id", userController.getUserById);
router.post("/", userController.createUser);
router.put("/:id", userController.updateUser);
router.put("/:id/status", userController.updateUserStatus);
router.delete("/:id", userController.deleteUser);

module.exports = router;

