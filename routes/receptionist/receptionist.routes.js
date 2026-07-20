const express = require("express");
const { authenticate } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/authorize.middleware");
const receptionistController = require("../../controllers/receptionist/receptionist.controller");

const router = express.Router();

router.use(authenticate, authorize("receptionist"));

router.get("/patients", receptionistController.listPatients);

router.get("/appointments", receptionistController.listAppointments);
router.post("/appointments", receptionistController.createAppointment);
router.put("/appointments/:id", receptionistController.updateAppointment);
router.put("/appointments/:id/status", receptionistController.updateAppointmentStatus);

router.get("/invoices", receptionistController.listInvoices);
router.post("/invoices", receptionistController.createInvoice);
router.post("/payments", receptionistController.createPayment);
router.post("/vitals", receptionistController.createVital);

module.exports = router;
