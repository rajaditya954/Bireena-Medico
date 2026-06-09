// ======================================================
// ROLE ENUMERATION
// ======================================================

export const Role = {
  ADMIN: "ADMIN",
  DOCTOR: "DOCTOR",
  LAB: "LAB",
  APPOINTMENT: "APPOINTMENT",
  CLINIC: "CLINIC",
};

// ======================================================
// MOCK USERS DATABASE
// ======================================================

export const users = [

  // ======================================================
  // ADMIN
  // ======================================================

  {
    id: "admin-1",
    name: "System Admin",
    email: "admin.medico",
    phone: "1234567890",
    password: "medicouseradmin",
    role: Role.ADMIN,
    isActive: true,
  },

  // ======================================================
  // DOCTOR
  // ======================================================

  {
    id: "doctor-1",
    name: "Dr. Alexander Smith",
    email: "doctor.medico",
    phone: "1234567890",
    password: "medicouserdoctor",
    role: Role.DOCTOR,
    isActive: true,
  },

  // ======================================================
  // LAB
  // ======================================================

  {
    id: "lab-1",
    name: "Lab Technician",
    email: "lab.medico",
    phone: "1234567890",
    password: "medicouserlab",
    role: Role.LAB,
    isActive: true,
  },

  // ======================================================
  // APPOINTMENT
  // ======================================================

  {
    id: "appointment-1",
    name: "Appointment Manager",
    email: "appointment.medico",
    phone: "1234567890",
    password: "medicouserappointment",
    role: Role.APPOINTMENT,
    isActive: true,
  },

  // ======================================================
  // CLINIC / DISPENSORY
  // ======================================================

  {
    id: "clinic-1",
    name: "Clinic Staff",
    email: "clinic.medico",
    phone: "1234567890",
    password: "medicouserclinic",
    role: Role.CLINIC,
    isActive: true,
  },

];

// ======================================================
// PATIENTS
// ======================================================

export const initialPatients = [
  {
    id: "1",
    name: "Alice Cooper",
    age: 34,
    gender: "Female",
    status: "In-patient",
    lastVisit: "2024-03-10",
  },

  {
    id: "2",
    name: "Bob Marley",
    age: 45,
    gender: "Male",
    status: "Out-patient",
    lastVisit: "2024-03-12",
  },

  {
    id: "3",
    name: "Charlie Sheen",
    age: 52,
    gender: "Male",
    status: "Emergency",
    lastVisit: "2024-03-14",
  },

  {
    id: "4",
    name: "Diana Ross",
    age: 29,
    gender: "Female",
    status: "In-patient",
    lastVisit: "2024-03-15",
  },
];