const express = require("express");
const { authenticate } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/authorize.middleware");

const profileController = require("../../controllers/patient/profile.controller");
const appointmentController = require("../../controllers/patient/appointment.controller");
const documentController = require("../../controllers/patient/document.controller");
const reviewController = require("../../controllers/patient/review.controller");
const invoiceController = require("../../controllers/patient/invoice.controller");
const doctorController = require("../../controllers/patient/doctor.controller");
const clinicController = require("../../controllers/patient/clinic.controller");

const router = express.Router();

router.use(authenticate, authorize("patient"));

// Profile
router.get("/profile", profileController.getProfile);
router.put("/profile", profileController.updateProfile);

// Appointments
router.get("/appointments", appointmentController.listAppointments);
router.post("/appointments", appointmentController.bookAppointment);
router.get("/appointments/:id", appointmentController.getAppointment);
router.put("/appointments/:id/cancel", appointmentController.cancelAppointment);

// Doctor (Search & View Profile for Patient)
router.get("/doctors", doctorController.listDoctors);
router.get("/doctors/:id", doctorController.getDoctorProfile);

// Clinic (Search & View Details/Gallery/Services for Patient)
router.get("/clinics", clinicController.listClinics);
router.get("/clinics/:id", clinicController.getClinicDetails);
router.get("/clinics/:id/gallery", clinicController.getClinicGallery);
router.get("/clinics/:id/services", clinicController.getClinicServices);

// Documents
router.get("/documents", documentController.listDocuments);
router.post("/documents", documentController.createDocument);
router.delete("/documents/:id", documentController.deleteDocument);

// Reviews
router.get("/reviews", reviewController.listReviews);
router.post("/reviews", reviewController.createReview);

// Invoices
router.get("/invoices", invoiceController.listInvoices);

module.exports = router;
