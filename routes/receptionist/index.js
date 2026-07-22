const express = require("express");
const { authenticate } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/authorize.middleware");

const patientController = require("../../controllers/receptionist/patient.controller");
const appointmentController = require("../../controllers/receptionist/appointment.controller");
const invoiceController = require("../../controllers/receptionist/invoice.controller");
const paymentController = require("../../controllers/receptionist/payment.controller");
const vitalController = require("../../controllers/receptionist/vital.controller");

const router = express.Router();

router.use(authenticate, authorize("receptionist"));

router.get("/patients", patientController.listPatients);

router.get("/appointments", appointmentController.listAppointments);
router.post("/appointments", appointmentController.createAppointment);
router.put("/appointments/:id", appointmentController.updateAppointment);
router.put("/appointments/:id/status", appointmentController.updateAppointmentStatus);

router.get("/invoices", invoiceController.listInvoices);
router.post("/invoices", invoiceController.createInvoice);
router.post("/payments", paymentController.createPayment);
router.post("/vitals", vitalController.createVital);

module.exports = router;
