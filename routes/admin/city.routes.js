const express = require("express");
const cityController = require("../../controllers/admin/city.controller");

const router = express.Router();

router.get("/", cityController.listCities);
router.get("/:id", cityController.getCityById);
router.post("/", cityController.createCity);
router.put("/:id", cityController.updateCity);
router.delete("/:id", cityController.deleteCity);

module.exports = router;
