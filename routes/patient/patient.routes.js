const express = require("express");
const { authenticate } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/authorize.middleware");
const patientController = require("../../controllers/patient/patient.controller");

const router = express.Router();

router.use(authenticate, authorize("patient"));

router.get("/profile", patientController.getProfile);
router.put("/profile", patientController.updateProfile);

router.get("/appointments", patientController.listAppointments);
router.post("/appointments", patientController.bookAppointment);
router.get("/appointments/:id", patientController.getAppointment);

router.get("/documents", patientController.listDocuments);
router.post("/documents", patientController.createDocument);
router.delete("/documents/:id", patientController.deleteDocument);

router.get("/reviews", patientController.listReviews);
router.post("/reviews", patientController.createReview);

router.get("/invoices", patientController.listInvoices);

module.exports = router;
