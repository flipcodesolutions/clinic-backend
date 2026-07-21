const {
  Appointment,
  AppointmentStatusHistory,
} = require("../models");
const { Op } = require("sequelize");
const { faker } = require("./helpers/user.helper");

const APPOINTMENTS_PER_PATIENT = 4;

const REASONS = [
  "Routine health checkup",
  "Fever and body ache",
  "Follow-up consultation",
  "Headache and dizziness",
  "Joint pain",
  "Skin irritation",
  "General weakness",
  "Blood pressure review",
];

const PAST_STATUSES = ["completed", "completed", "cancelled"];

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function dateWithOffset(days) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
}

function historyStatuses(finalStatus) {
  if (finalStatus === "completed") {
    return ["scheduled", "confirmed", "checked_in", "in_progress", "completed"];
  }

  if (finalStatus === "cancelled") {
    return ["scheduled", "confirmed", "cancelled"];
  }

  return finalStatus === "confirmed"
    ? ["scheduled", "confirmed"]
    : ["scheduled"];
}

async function seedStatusHistory(appointment, changedBy) {
  const statuses = historyStatuses(appointment.status);
  const appointmentDate = new Date(`${appointment.appointment_date}T09:00:00`);

  // Remove stale synthetic states when the seeder is re-run.
  await AppointmentStatusHistory.destroy({
    where: {
      appointment_id: appointment.id,
      status: { [Op.notIn]: statuses },
    },
    force: true,
  });

  for (const [index, status] of statuses.entries()) {
    const createdAt = new Date(appointmentDate);
    createdAt.setMinutes(createdAt.getMinutes() + index * 10);

    await AppointmentStatusHistory.findOrCreate({
      where: {
        appointment_id: appointment.id,
        status,
      },
      defaults: {
        appointment_id: appointment.id,
        status,
        changed_by: changedBy,
        remarks: `Appointment ${status.replace("_", " ")}`,
        createdAt,
      },
    });
  }
}

/**
 * Seed three historical and one upcoming appointment per patient.
 * Doctors are always selected from the same clinic as the patient.
 */
async function seedAppointments(
  clinics,
  patientsByClinic,
  doctorsByClinic,
  departments
) {
  const departmentByName = Object.fromEntries(
    departments.map((department) => [department.name, department])
  );

  let createdCount = 0;
  let pastCount = 0;
  let upcomingCount = 0;

  for (const clinic of clinics) {
    const patients = patientsByClinic[clinic.id] || [];
    const doctors = doctorsByClinic[clinic.id] || [];

    if (!doctors.length) {
      throw new Error(`No doctors available for ${clinic.name}`);
    }

    for (const { user, profile, index: patientIndex } of patients) {
      const primaryDoctor =
        doctors.find(({ profile: doctor }) => doctor.id === profile.primary_doctor_id) ||
        faker.helpers.arrayElement(doctors);

      for (let slot = 0; slot < APPOINTMENTS_PER_PATIENT; slot += 1) {
        const isPast = slot < PAST_STATUSES.length;
        const doctor =
          slot === 0 ? primaryDoctor : faker.helpers.arrayElement(doctors);
        const department = departmentByName[doctor.profile.specialization];
        const status = isPast
          ? PAST_STATUSES[slot]
          : faker.helpers.arrayElement(["scheduled", "confirmed"]);
        const dayOffset = isPast
          ? -(15 + patientIndex * 3 + slot * 12)
          : 7 + (patientIndex % 20);
        const appointmentDate = formatDate(dateWithOffset(dayOffset));
        const startHour = 10 + ((patientIndex + slot) % 3);
        const startTime = `${String(startHour).padStart(2, "0")}:00:00`;
        const endTime = `${String(startHour).padStart(2, "0")}:15:00`;
        const appointmentNumber = `SEED-APT-${clinic.id}-${profile.id}-${slot + 1}`;

        const [appointment, created] = await Appointment.findOrCreate({
          where: { appointment_number: appointmentNumber },
          defaults: {
            appointment_number: appointmentNumber,
            clinic_id: clinic.id,
            doctor_id: doctor.profile.id,
            patient_id: profile.id,
            department_id: department?.id || null,
            appointment_date: appointmentDate,
            start_time: startTime,
            end_time: endTime,
            visit_type: slot === 0 ? "new" : "follow_up",
            consultation_type: faker.helpers.arrayElement([
              "in_person",
              "in_person",
              "online",
            ]),
            reason: faker.helpers.arrayElement(REASONS),
            booked_by: user.id,
            status,
            remarks:
              status === "completed"
                ? "Consultation completed successfully"
                : status === "cancelled"
                  ? "Cancelled by patient"
                  : null,
          },
        });

        await seedStatusHistory(appointment, user.id);

        if (created) {
          createdCount += 1;
          if (isPast) pastCount += 1;
          else upcomingCount += 1;
        }
      }
    }
  }

  console.log(
    `✓ Appointments: ${createdCount} new (${pastCount} past, ${upcomingCount} upcoming)`
  );

  return {
    created: createdCount,
    past: pastCount,
    upcoming: upcomingCount,
  };
}

module.exports = { seedAppointments };
