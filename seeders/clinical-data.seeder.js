const { Op } = require("sequelize");
const {
  Appointment,
  MedicalRecord,
  Prescription,
  PrescriptionMedicine,
  Vital,
  PatientDocument,
  PatientProfile,
  Attachment,
} = require("../models");
const { faker } = require("./helpers/user.helper");

const COMPLAINTS = [
  {
    chief_complaint: "Fever with body ache for 3 days",
    history: "No significant past history. No known drug allergies.",
    diagnosis: "Viral fever",
    notes: "Advised rest, hydration and prescribed medication.",
  },
  {
    chief_complaint: "Headache and dizziness",
    history: "Occasional migraines reported in the past year.",
    diagnosis: "Tension headache",
    notes: "Stress management advised, follow up if symptoms persist.",
  },
  {
    chief_complaint: "Joint pain in knees",
    history: "Pain aggravated by climbing stairs, ongoing for 2 months.",
    diagnosis: "Early osteoarthritis",
    notes: "Physiotherapy recommended along with medication.",
  },
  {
    chief_complaint: "Cough and sore throat",
    history: "Symptoms for 5 days, no fever.",
    diagnosis: "Upper respiratory tract infection",
    notes: "Warm saline gargles and prescribed antibiotics.",
  },
  {
    chief_complaint: "Acidity and stomach discomfort",
    history: "Irregular eating habits, frequent late-night meals.",
    diagnosis: "Gastritis",
    notes: "Dietary changes advised, antacids prescribed.",
  },
];

const MEDICINES = [
  { medicine_name: "Paracetamol", strength: "500mg", dosage: "1 tablet", frequency: "1-1-1", duration: "5 days", instruction: "After food" },
  { medicine_name: "Azithromycin", strength: "500mg", dosage: "1 tablet", frequency: "1-0-0", duration: "3 days", instruction: "Before food" },
  { medicine_name: "Pantoprazole", strength: "40mg", dosage: "1 tablet", frequency: "1-0-0", duration: "7 days", instruction: "Empty stomach in morning" },
  { medicine_name: "Cetirizine", strength: "10mg", dosage: "1 tablet", frequency: "0-0-1", duration: "5 days", instruction: "At bedtime" },
  { medicine_name: "Ibuprofen", strength: "400mg", dosage: "1 tablet", frequency: "1-0-1", duration: "5 days", instruction: "After food" },
  { medicine_name: "Amoxicillin", strength: "250mg", dosage: "1 capsule", frequency: "1-1-1", duration: "5 days", instruction: "After food" },
  { medicine_name: "Vitamin D3", strength: "60000 IU", dosage: "1 sachet", frequency: "Once a week", duration: "8 weeks", instruction: "With milk" },
  { medicine_name: "Cough Syrup", strength: "100ml", dosage: "10ml", frequency: "1-1-1", duration: "5 days", instruction: "After food" },
];

const DOCUMENT_TYPES = [
  { document_type: "Lab Report", title: "Blood Test Report" },
  { document_type: "Radiology", title: "X-Ray Report" },
  { document_type: "Prescription", title: "Old Prescription Copy" },
  { document_type: "ID Proof", title: "Aadhaar Card Copy" },
];

function addDays(dateStr, days) {
  const date = new Date(`${dateStr}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

async function seedMedicalRecord(appointment, template) {
  const [record, created] = await MedicalRecord.findOrCreate({
    where: { appointment_id: appointment.id },
    defaults: {
      appointment_id: appointment.id,
      doctor_id: appointment.doctor_id,
      patient_id: appointment.patient_id,
      chief_complaint: template.chief_complaint,
      history: template.history,
      diagnosis: template.diagnosis,
      notes: template.notes,
      follow_up_date: addDays(appointment.appointment_date, 10),
    },
  });
  return created;
}

async function seedPrescription(appointment) {
  const [prescription, created] = await Prescription.findOrCreate({
    where: { appointment_id: appointment.id },
    defaults: {
      appointment_id: appointment.id,
      doctor_id: appointment.doctor_id,
      patient_id: appointment.patient_id,
      instruction:
        "Take medicines as prescribed. Drink plenty of fluids and rest. Return for follow-up if symptoms persist.",
    },
  });

  let medicineCount = 0;
  if (created) {
    const medicines = faker.helpers.arrayElements(
      MEDICINES,
      faker.number.int({ min: 2, max: 4 })
    );
    await PrescriptionMedicine.bulkCreate(
      medicines.map((medicine) => ({
        ...medicine,
        prescription_id: prescription.id,
      }))
    );
    medicineCount = medicines.length;
  }

  return { created, medicineCount };
}

async function seedVital(appointment) {
  const [, created] = await Vital.findOrCreate({
    where: { appointment_id: appointment.id },
    defaults: {
      appointment_id: appointment.id,
      temperature: faker.number.float({ min: 97, max: 101, fractionDigits: 1 }),
      pulse: faker.number.int({ min: 62, max: 105 }),
      bp: `${faker.number.int({ min: 110, max: 145 })}/${faker.number.int({ min: 70, max: 95 })}`,
      height: faker.number.float({ min: 140, max: 190, fractionDigits: 1 }),
      weight: faker.number.float({ min: 35, max: 110, fractionDigits: 1 }),
      oxygen: faker.number.float({ min: 94, max: 99, fractionDigits: 1 }),
    },
  });
  return created;
}

async function seedAttachments(appointment, uploadedBy) {
  let created = 0;

  const items = [
    {
      module: "appointment",
      module_id: appointment.id,
      file_name: `appointment-${appointment.id}-report.pdf`,
      file_path: `/uploads/appointments/${appointment.id}/consultation-report.pdf`,
    },
    {
      module: "prescription",
      module_id: appointment.id,
      file_name: `appointment-${appointment.id}-prescription.pdf`,
      file_path: `/uploads/appointments/${appointment.id}/prescription.pdf`,
    },
  ];

  for (const item of items) {
    const [, wasCreated] = await Attachment.findOrCreate({
      where: {
        module: item.module,
        module_id: item.module_id,
        file_name: item.file_name,
      },
      defaults: { ...item, uploaded_by: uploadedBy },
    });
    if (wasCreated) created += 1;
  }

  return created;
}

async function seedPatientDocuments() {
  const patients = await PatientProfile.findAll({ attributes: ["id", "user_id"] });
  let created = 0;

  for (const patient of patients) {
    const docs = faker.helpers.arrayElements(
      DOCUMENT_TYPES,
      faker.number.int({ min: 1, max: 2 })
    );

    for (const doc of docs) {
      const [, wasCreated] = await PatientDocument.findOrCreate({
        where: { patient_id: patient.id, title: doc.title },
        defaults: {
          patient_id: patient.id,
          document_type: doc.document_type,
          title: doc.title,
          file_path: `/uploads/patients/${patient.id}/${doc.title
            .toLowerCase()
            .replace(/\s+/g, "-")}.pdf`,
          uploaded_by: patient.user_id,
        },
      });
      if (wasCreated) created += 1;
    }
  }

  return created;
}

/**
 * Seed clinical data (medical records, prescriptions + medicines, vitals,
 * attachments) for completed seeded appointments, plus patient documents.
 */
async function seedClinicalData() {
  const completedAppointments = await Appointment.findAll({
    where: {
      appointment_number: { [Op.like]: "SEED-APT-%" },
      status: "completed",
    },
  });

  let records = 0;
  let prescriptions = 0;
  let medicines = 0;
  let vitals = 0;
  let attachments = 0;

  for (const appointment of completedAppointments) {
    const template = faker.helpers.arrayElement(COMPLAINTS);

    if (await seedMedicalRecord(appointment, template)) records += 1;

    const prescriptionResult = await seedPrescription(appointment);
    if (prescriptionResult.created) {
      prescriptions += 1;
      medicines += prescriptionResult.medicineCount;
    }

    if (await seedVital(appointment)) vitals += 1;

    attachments += await seedAttachments(appointment, appointment.booked_by);
  }

  const documents = await seedPatientDocuments();

  console.log(
    `✓ Clinical data: ${records} medical records, ${prescriptions} prescriptions, ${medicines} medicines, ${vitals} vitals, ${documents} patient documents, ${attachments} attachments`
  );
}

module.exports = { seedClinicalData };
