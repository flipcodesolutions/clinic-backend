const express = require("express");
const { authenticate } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/authorize.middleware");

const profileController = require("../../controllers/patient/profile.controller");
const appointmentController = require("../../controllers/patient/appointment.controller");
const documentController = require("../../controllers/patient/document.controller");
const reviewController = require("../../controllers/patient/review.controller");
const invoiceController = require("../../controllers/patient/invoice.controller");

const router = express.Router();

router.use(authenticate, authorize("patient"));

router.get("/profile", profileController.getProfile);
router.put("/profile", profileController.updateProfile);

router.get("/appointments", appointmentController.listAppointments);
router.post("/appointments", appointmentController.bookAppointment);
router.get("/appointments/:id", appointmentController.getAppointment);

router.get("/documents", documentController.listDocuments);
router.post("/documents", documentController.createDocument);
router.delete("/documents/:id", documentController.deleteDocument);

router.get("/reviews", reviewController.listReviews);
router.post("/reviews", reviewController.createReview);

router.get("/invoices", invoiceController.listInvoices);

module.exports = router;
