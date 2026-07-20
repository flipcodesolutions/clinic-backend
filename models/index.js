const sequelize = require("../config/database");

const Role = require("./role.model");
const User = require("./user.model");
const City = require("./city.model");
const Clinic = require("./clinic.model");
const ClinicUser = require("./clinic-user.model");
const Department = require("./department.model");
const Service = require("./service.model");
const ClinicDepartment = require("./clinic-department.model");
const ClinicService = require("./clinic-service.model");
const DoctorProfile = require("./doctor-profile.model");
const DoctorDepartment = require("./doctor-department.model");
const DoctorExperience = require("./doctor-experience.model");
const DoctorAchievement = require("./doctor-achievement.model");
const DoctorSchedule = require("./doctor-schedule.model");
const DoctorLeave = require("./doctor-leave.model");
const StaffProfile = require("./staff-profile.model");
const PatientProfile = require("./patient-profile.model");
const PatientDocument = require("./patient-document.model");
const CareTakerProfile = require("./caretaker-profile.model");
const PatientCareTaker = require("./patient-caretaker.model");
const Appointment = require("./appointment.model");
const AppointmentStatusHistory = require("./appointment-status-history.model");
const MedicalRecord = require("./medical-record.model");
const Prescription = require("./prescription.model");
const PrescriptionMedicine = require("./prescription-medicine.model");
const Vital = require("./vital.model");
const Invoice = require("./invoice.model");
const InvoiceItem = require("./invoice-item.model");
const Payment = require("./payment.model");
const ClinicGallery = require("./clinic-gallery.model");
const Attachment = require("./attachment.model");
const Notification = require("./notification.model");
const Review = require("./review.model");
const ActivityLog = require("./activity-log.model");
const Setting = require("./setting.model");

// User associations
User.hasOne(DoctorProfile, { foreignKey: "user_id", as: "doctorProfile" });
DoctorProfile.belongsTo(User, { foreignKey: "user_id", as: "user" });

User.hasOne(StaffProfile, { foreignKey: "user_id", as: "staffProfile" });
StaffProfile.belongsTo(User, { foreignKey: "user_id", as: "user" });

User.hasOne(PatientProfile, { foreignKey: "user_id", as: "patientProfile" });
PatientProfile.belongsTo(User, { foreignKey: "user_id", as: "user" });

User.hasOne(CareTakerProfile, { foreignKey: "user_id", as: "careTakerProfile" });
CareTakerProfile.belongsTo(User, { foreignKey: "user_id", as: "user" });

User.hasMany(Notification, { foreignKey: "user_id", as: "notifications" });
Notification.belongsTo(User, { foreignKey: "user_id", as: "user" });

User.hasMany(ActivityLog, { foreignKey: "user_id", as: "activityLogs" });
ActivityLog.belongsTo(User, { foreignKey: "user_id", as: "user" });

User.belongsToMany(Clinic, {
  through: ClinicUser,
  foreignKey: "user_id",
  otherKey: "clinic_id",
  as: "clinics",
});
Clinic.belongsToMany(User, {
  through: ClinicUser,
  foreignKey: "clinic_id",
  otherKey: "user_id",
  as: "users",
});

ClinicUser.belongsTo(Clinic, { foreignKey: "clinic_id", as: "clinic" });
ClinicUser.belongsTo(User, { foreignKey: "user_id", as: "user" });
Clinic.hasMany(ClinicUser, { foreignKey: "clinic_id", as: "clinicUsers" });
User.hasMany(ClinicUser, { foreignKey: "user_id", as: "clinicUsers" });

Clinic.belongsTo(User, { foreignKey: "created_by", as: "creator" });

// Clinic - Department / Service
Clinic.belongsToMany(Department, {
  through: ClinicDepartment,
  foreignKey: "clinic_id",
  otherKey: "department_id",
  as: "departments",
});
Department.belongsToMany(Clinic, {
  through: ClinicDepartment,
  foreignKey: "department_id",
  otherKey: "clinic_id",
  as: "clinics",
});

Clinic.belongsToMany(Service, {
  through: ClinicService,
  foreignKey: "clinic_id",
  otherKey: "service_id",
  as: "services",
});
Service.belongsToMany(Clinic, {
  through: ClinicService,
  foreignKey: "service_id",
  otherKey: "clinic_id",
  as: "clinics",
});

Clinic.hasMany(ClinicGallery, { foreignKey: "clinic_id", as: "galleries" });
ClinicGallery.belongsTo(Clinic, { foreignKey: "clinic_id", as: "clinic" });
ClinicGallery.belongsTo(User, { foreignKey: "uploaded_by", as: "uploader" });

// Doctor associations
DoctorProfile.belongsToMany(Department, {
  through: DoctorDepartment,
  foreignKey: "doctor_id",
  otherKey: "department_id",
  as: "departments",
});
Department.belongsToMany(DoctorProfile, {
  through: DoctorDepartment,
  foreignKey: "department_id",
  otherKey: "doctor_id",
  as: "doctors",
});

DoctorProfile.hasMany(DoctorExperience, {
  foreignKey: "doctor_id",
  as: "experiences",
});
DoctorExperience.belongsTo(DoctorProfile, {
  foreignKey: "doctor_id",
  as: "doctor",
});

DoctorProfile.hasMany(DoctorAchievement, {
  foreignKey: "doctor_id",
  as: "achievements",
});
DoctorAchievement.belongsTo(DoctorProfile, {
  foreignKey: "doctor_id",
  as: "doctor",
});

DoctorProfile.hasMany(DoctorSchedule, {
  foreignKey: "doctor_id",
  as: "schedules",
});
DoctorSchedule.belongsTo(DoctorProfile, {
  foreignKey: "doctor_id",
  as: "doctor",
});
DoctorSchedule.belongsTo(Clinic, { foreignKey: "clinic_id", as: "clinic" });
Clinic.hasMany(DoctorSchedule, { foreignKey: "clinic_id", as: "schedules" });

DoctorProfile.hasMany(DoctorLeave, { foreignKey: "doctor_id", as: "leaves" });
DoctorLeave.belongsTo(DoctorProfile, { foreignKey: "doctor_id", as: "doctor" });

// Patient associations
PatientProfile.hasMany(PatientDocument, {
  foreignKey: "patient_id",
  as: "documents",
});
PatientDocument.belongsTo(PatientProfile, {
  foreignKey: "patient_id",
  as: "patient",
});
PatientDocument.belongsTo(User, { foreignKey: "uploaded_by", as: "uploader" });

PatientProfile.belongsToMany(CareTakerProfile, {
  through: PatientCareTaker,
  foreignKey: "patient_id",
  otherKey: "caretaker_id",
  as: "careTakers",
});
CareTakerProfile.belongsToMany(PatientProfile, {
  through: PatientCareTaker,
  foreignKey: "caretaker_id",
  otherKey: "patient_id",
  as: "patients",
});

// Appointment associations
Appointment.belongsTo(Clinic, { foreignKey: "clinic_id", as: "clinic" });
Appointment.belongsTo(DoctorProfile, { foreignKey: "doctor_id", as: "doctor" });
Appointment.belongsTo(PatientProfile, {
  foreignKey: "patient_id",
  as: "patient",
});
Appointment.belongsTo(Department, {
  foreignKey: "department_id",
  as: "department",
});
Appointment.belongsTo(User, { foreignKey: "booked_by", as: "bookedByUser" });

Clinic.hasMany(Appointment, { foreignKey: "clinic_id", as: "appointments" });
DoctorProfile.hasMany(Appointment, {
  foreignKey: "doctor_id",
  as: "appointments",
});
PatientProfile.hasMany(Appointment, {
  foreignKey: "patient_id",
  as: "appointments",
});

Appointment.hasMany(AppointmentStatusHistory, {
  foreignKey: "appointment_id",
  as: "statusHistory",
});
AppointmentStatusHistory.belongsTo(Appointment, {
  foreignKey: "appointment_id",
  as: "appointment",
});
AppointmentStatusHistory.belongsTo(User, {
  foreignKey: "changed_by",
  as: "changedByUser",
});

Appointment.hasOne(MedicalRecord, {
  foreignKey: "appointment_id",
  as: "medicalRecord",
});
MedicalRecord.belongsTo(Appointment, {
  foreignKey: "appointment_id",
  as: "appointment",
});
MedicalRecord.belongsTo(DoctorProfile, { foreignKey: "doctor_id", as: "doctor" });
MedicalRecord.belongsTo(PatientProfile, {
  foreignKey: "patient_id",
  as: "patient",
});

Appointment.hasOne(Prescription, {
  foreignKey: "appointment_id",
  as: "prescription",
});
Prescription.belongsTo(Appointment, {
  foreignKey: "appointment_id",
  as: "appointment",
});
Prescription.belongsTo(DoctorProfile, { foreignKey: "doctor_id", as: "doctor" });
Prescription.belongsTo(PatientProfile, {
  foreignKey: "patient_id",
  as: "patient",
});

Prescription.hasMany(PrescriptionMedicine, {
  foreignKey: "prescription_id",
  as: "medicines",
});
PrescriptionMedicine.belongsTo(Prescription, {
  foreignKey: "prescription_id",
  as: "prescription",
});

Appointment.hasOne(Vital, { foreignKey: "appointment_id", as: "vital" });
Vital.belongsTo(Appointment, { foreignKey: "appointment_id", as: "appointment" });

Appointment.hasOne(Invoice, { foreignKey: "appointment_id", as: "invoice" });
Invoice.belongsTo(Appointment, {
  foreignKey: "appointment_id",
  as: "appointment",
});

Invoice.hasMany(InvoiceItem, { foreignKey: "invoice_id", as: "items" });
InvoiceItem.belongsTo(Invoice, { foreignKey: "invoice_id", as: "invoice" });
InvoiceItem.belongsTo(Service, { foreignKey: "service_id", as: "service" });

Invoice.hasMany(Payment, { foreignKey: "invoice_id", as: "payments" });
Payment.belongsTo(Invoice, { foreignKey: "invoice_id", as: "invoice" });

// Reviews
Review.belongsTo(PatientProfile, { foreignKey: "patient_id", as: "patient" });
Review.belongsTo(DoctorProfile, { foreignKey: "doctor_id", as: "doctor" });
Review.belongsTo(Clinic, { foreignKey: "clinic_id", as: "clinic" });
PatientProfile.hasMany(Review, { foreignKey: "patient_id", as: "reviews" });
DoctorProfile.hasMany(Review, { foreignKey: "doctor_id", as: "reviews" });
Clinic.hasMany(Review, { foreignKey: "clinic_id", as: "reviews" });

Attachment.belongsTo(User, { foreignKey: "uploaded_by", as: "uploader" });

const db = {
  sequelize,
  Role,
  User,
  City,
  Clinic,
  ClinicUser,
  Department,
  Service,
  ClinicDepartment,
  ClinicService,
  DoctorProfile,
  DoctorDepartment,
  DoctorExperience,
  DoctorAchievement,
  DoctorSchedule,
  DoctorLeave,
  StaffProfile,
  PatientProfile,
  PatientDocument,
  CareTakerProfile,
  PatientCareTaker,
  Appointment,
  AppointmentStatusHistory,
  MedicalRecord,
  Prescription,
  PrescriptionMedicine,
  Vital,
  Invoice,
  InvoiceItem,
  Payment,
  ClinicGallery,
  Attachment,
  Notification,
  Review,
  ActivityLog,
  Setting,
};

async function syncDatabase({ alter = false, force = false } = {}) {
  await sequelize.ensureDatabase();
  await sequelize.authenticate();
  await sequelize.sync({ alter, force });
  console.log("Database synced successfully");
}

module.exports = {
  ...db,
  syncDatabase,
};
