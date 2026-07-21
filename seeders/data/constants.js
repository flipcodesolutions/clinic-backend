const CITY_NAME = "Surendranagar";

const HOSPITALS = [
  {
    name: "Flipcare Multispeciality Hospital",
    email: "info@flipcarehospital.com",
    phone: "02752-250001",
    slug: "flipcare",
  },
  {
    name: "Shree Krishna Hospital",
    email: "info@shreekrishnahospital.com",
    phone: "02752-250002",
    slug: "shree-krishna",
  },
];

const SPECIALIZATIONS = [
  "General Physician",
  "Cardiologist",
  "Orthopedic Surgeon",
  "Pediatrician",
  "Gynecologist",
  "Dermatologist",
  "Neurologist",
  "Ophthalmologist",
  "ENT Specialist",
  "Dentist",
];

const STAFF_ROLES = [
  "Receptionist",
  "Nurse",
  "Pharmacist",
  "Lab Technician",
  "X-Ray Technician",
  "Accountant",
  "Admin Executive",
  "Ward Boy",
  "Housekeeping",
  "Security Guard",
];

const CARETAKER_RELATIONSHIPS = [
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Husband",
  "Wife",
  "Son",
  "Daughter",
  "Uncle",
  "Aunt",
  "Grandfather",
  "Grandmother",
  "Friend",
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const DEFAULT_PASSWORD = "Password@123";

const DOCTORS_PER_HOSPITAL = 10;
const STAFF_PER_HOSPITAL = 10;
const PATIENTS_PER_HOSPITAL = 25;

/** Master services offered by hospitals */
const SERVICES = [
  { name: "General Consultation", price: 300, description: "OPD general consultation" },
  { name: "ECG", price: 400, description: "Electrocardiogram test" },
  { name: "Blood Test - CBC", price: 350, description: "Complete blood count" },
  { name: "X-Ray", price: 500, description: "Digital X-Ray imaging" },
  { name: "Ultrasound", price: 800, description: "Ultrasound scan" },
  { name: "Physiotherapy Session", price: 450, description: "Single physiotherapy session" },
  { name: "Dental Cleaning", price: 600, description: "Professional dental cleaning" },
  { name: "Eye Checkup", price: 350, description: "Complete eye examination" },
  { name: "Vaccination", price: 700, description: "Standard vaccination dose" },
  { name: "Emergency Care", price: 1500, description: "Emergency consultation & first aid" },
];

const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

module.exports = {
  CITY_NAME,
  HOSPITALS,
  SPECIALIZATIONS,
  STAFF_ROLES,
  CARETAKER_RELATIONSHIPS,
  BLOOD_GROUPS,
  DEFAULT_PASSWORD,
  DOCTORS_PER_HOSPITAL,
  STAFF_PER_HOSPITAL,
  PATIENTS_PER_HOSPITAL,
  SERVICES,
  WEEKDAYS,
};
