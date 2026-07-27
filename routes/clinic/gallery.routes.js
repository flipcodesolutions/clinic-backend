const express = require("express");
const controller = require("../../controllers/clinic/gallery.controller");

const router = express.Router();

router.get("/", controller.listGallery);
router.post("/", controller.createGalleryItem);
router.put("/:id", controller.updateGalleryItem);
router.delete("/:id", controller.deleteGalleryItem);

module.exports = router;
