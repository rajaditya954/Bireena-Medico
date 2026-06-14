import "dotenv/config";
import { connectDB } from "../config/database.js";
import { config } from "../config/env.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import Queue from "../models/Queue.js";
import Prescription from "../models/Prescription.js";
import LabTest from "../models/LabTest.js";
import LabReport from "../models/LabReport.js";
import Medicine from "../models/Medicine.js";
import Inventory from "../models/Inventory.js";
import Billing from "../models/Billing.js";
import Invoice from "../models/Invoice.js";
import Payment from "../models/Payment.js";
import Notification from "../models/Notification.js";
import AuditLog from "../models/AuditLog.js";
import Service from "../models/Service.js";
import PatientHistory from "../models/PatientHistory.js";
import MedicineRequirement from "../models/MedicineRequirement.js";
import MedicineDistribution from "../models/MedicineDistribution.js";

const seed = async () => {
  await connectDB(config.mongoUri);

  console.log("Cleaning previous seed data...");
  await Promise.all([
    Role.deleteMany(),
    User.deleteMany(),
    Patient.deleteMany(),
    Doctor.deleteMany(),
    Appointment.deleteMany(),
    Queue.deleteMany(),
    Prescription.deleteMany(),
    LabTest.deleteMany(),
    LabReport.deleteMany(),
    Medicine.deleteMany(),
    Inventory.deleteMany(),
    Billing.deleteMany(),
    Invoice.deleteMany(),
    Payment.deleteMany(),
    Notification.deleteMany(),
    AuditLog.deleteMany(),
    Service.deleteMany(),
    PatientHistory.deleteMany(),
    MedicineRequirement.deleteMany(),
    MedicineDistribution.deleteMany(),
  ]);

  const roles = [
    { name: "admin", permissions: ["ALL"] },
    { name: "doctor", permissions: ["READ_PATIENTS", "WRITE_PRESCRIPTIONS", "READ_HISTORY"] },
    { name: "lab_assistant", permissions: ["CRUD_LAB_TESTS", "CRUD_LAB_REPORTS"] },
    { name: "dispensary_staff", permissions: ["CRUD_MEDICINES", "CRUD_INVENTORY"] },
    { name: "appointment_manager", permissions: ["CRUD_APPOINTMENTS", "CRUD_QUEUES", "CRUD_BILLINGS"] },
    { name: "patient", permissions: ["READ_SELF"] },
  ];

  const createdRoles = await Role.insertMany(roles);

  const adminUser = new User({
    employeeId: "EMP001",
    name: "Admin User",
    email: "admin@hospital.com",
    phone: "9876543210",
    role: "admin",
    isActive: true,
  });
  await adminUser.setPassword("Admin@123");
  await adminUser.save();

  const doctorUser = new User({
    employeeId: "EMP002",
    name: "Dr. Raj Sharma",
    email: "doctor@hospital.com",
    phone: "9999999999",
    role: "doctor",
    isActive: true,
  });
  await doctorUser.setPassword("Doctor@123");
  await doctorUser.save();

  const labAssistantUser = new User({
    employeeId: "EMP003",
    name: "Lab Assistant",
    email: "lab@hospital.com",
    phone: "9988776655",
    role: "lab_assistant",
    isActive: true,
  });
  await labAssistantUser.setPassword("Lab@1234");
  await labAssistantUser.save();

  const dispensaryUser = new User({
    employeeId: "EMP004",
    name: "Dispensary Staff",
    email: "dispensary@hospital.com",
    phone: "9988554411",
    role: "dispensary_staff",
    isActive: true,
  });
  await dispensaryUser.setPassword("Dispense@123");
  await dispensaryUser.save();

  const appointmentManagerUser = new User({
    employeeId: "EMP005",
    name: "Appointment Manager",
    email: "scheduler@hospital.com",
    phone: "9977553311",
    role: "appointment_manager",
    isActive: true,
  });
  await appointmentManagerUser.setPassword("Schedule@123");
  await appointmentManagerUser.save();

  const patientUser = new User({
    name: "Rahul Verma",
    email: "rahul.verma@hospital.com",
    phone: "9999999998",
    role: "patient",
    isActive: true,
  });
  await patientUser.setPassword("Patient@123");
  await patientUser.save();

  const patient = await Patient.create({
    userId: patientUser._id,
    patientId: "PAT001",
    fullName: "Rahul Verma",
    dob: new Date("1990-05-22"),
    gender: "Male",
    bloodGroup: "O+",
    maritalStatus: "Single",
    phone: "9999999998",
    alternatePhone: "9999999997",
    email: "rahul.verma@example.com",
    address: "12 Green Street",
    city: "Indore",
    state: "Madhya Pradesh",
    pincode: "452001",
    occupation: "Engineer",
    allergies: ["Penicillin"],
    chronicDiseases: ["Diabetes"],
    emergencyContact: {
      name: "Sunita Verma",
      relation: "Mother",
      phone: "9988776655",
    },
  });

  const doctor = await Doctor.create({
    userId: doctorUser._id,
    doctorCode: "DOC001",
    name: "Dr. Raj Sharma",
    specialization: "Cardiology",
    consultantType: "doctor",
    qualification: "MBBS, MD",
    qualifications: ["MBBS", "MD"],
    registrationNumber: "MP123456",
    experience: 12,
    consultationFee: 500,
    roomNumber: "101",
    schedule: [
      { day: "Monday", startTime: "09:00", endTime: "17:00", isAvailable: true },
      { day: "Wednesday", startTime: "10:00", endTime: "16:00", isAvailable: true },
    ],
    clinic: {
      name: "Bireena Hospital",
      address: "15 Medical Lane",
      phone: "9876501234",
    },
    isVerified: true,
  });

  const labDoctorUser = new User({
    employeeId: "EMP006",
    name: "Dr. Kavya Sen",
    email: "kavya@hospital.com",
    phone: "9999999991",
    role: "doctor",
    isActive: true,
  });
  await labDoctorUser.setPassword("Doctor@123");
  await labDoctorUser.save();

  const labDoctor = await Doctor.create({
    userId: labDoctorUser._id,
    doctorCode: "DOC002",
    name: "Dr. Kavya Sen",
    specialization: "Pathology",
    consultantType: "lab",
    qualification: "MBBS, MD Pathology",
    qualifications: ["MBBS", "MD"],
    registrationNumber: "MP123457",
    experience: 8,
    consultationFee: 300,
    roomNumber: "102",
    schedule: [
      { day: "Monday", startTime: "09:00", endTime: "17:00", isAvailable: true },
      { day: "Tuesday", startTime: "09:00", endTime: "17:00", isAvailable: true },
      { day: "Wednesday", startTime: "09:00", endTime: "17:00", isAvailable: true },
      { day: "Thursday", startTime: "09:00", endTime: "17:00", isAvailable: true },
      { day: "Friday", startTime: "09:00", endTime: "17:00", isAvailable: true },
      { day: "Saturday", startTime: "09:00", endTime: "17:00", isAvailable: true },
    ],
    clinic: {
      name: "Bireena Lab",
      address: "15 Medical Lane",
      phone: "9876501234",
    },
    isVerified: true,
  });

  const consultationService = await Service.create({
    name: "Doctor Consultation",
    description: "Standard consultation with a specialist doctor.",
    category: "Consultation",
    price: 500,
    duration: 30,
    isActive: true,
  });

  const labTest1 = await LabTest.create({
    name: "Complete Blood Count",
    code: "CBC001",
    description: "Routine blood count test.",
    category: "Hematology",
    sampleType: "Blood",
    normalRange: "4.5-11 x10^9/L",
    unit: "cells/mcL",
    price: 500,
    turnaroundTime: 24,
  });

  const medicine1 = await Medicine.create({
    name: "Paracetamol 650",
    genericName: "Paracetamol",
    manufacturer: "ABC Pharma",
    dosage: "650mg",
    form: "tablet",
    price: 25,
    stock: 350,
    expiryDate: new Date("2025-12-31"),
    sideEffects: ["Nausea", "Dizziness"],
    contraindications: ["Liver disease"],
  });

  const inventory1 = await Inventory.create({
    medicineId: medicine1._id,
    quantity: 350,
    minimumThreshold: 50,
    maximumCapacity: 500,
    batchNumber: "B001",
    expiryDate: new Date("2025-12-31"),
    suppliedBy: "ABC Pharma",
    costPrice: 15,
    sellingPrice: 25,
    lastRestockedAt: new Date(),
  });

  const appointment = await Appointment.create({
    appointmentId: "APT001",
    patientId: patient._id,
    doctorId: doctor._id,
    appointmentDate: new Date(),
    appointmentType: "WALK_IN",
    priority: "NORMAL",
    tokenNumber: 12,
    slot: "11:00",
    status: "WAITING",
    notes: "Routine checkup",
    reason: "Chest discomfort",
    createdBy: appointmentManagerUser._id,
  });

  const queue = await Queue.create({
    appointmentId: appointment._id,
    patientId: patient._id,
    doctorId: doctor._id,
    queueNumber: 12,
    tokenNumber: 12,
    currentPosition: 3,
    queueStatus: "ACTIVE",
    status: "waiting",
    estimatedWaitTime: 20,
    calledAt: null,
  });

  const prescription = await Prescription.create({
    prescriptionId: "RX001",
    appointmentId: appointment._id,
    patientId: patient._id,
    doctorId: doctor._id,
    diagnosis: "Viral Fever",
    symptoms: ["Fever", "Cold"],
    medicines: [
      {
        medicineId: medicine1._id,
        medicineName: "Paracetamol 650",
        dosage: "1-0-1",
        frequency: "twice daily",
        days: 5,
        quantity: 10,
        instructions: "After meals",
      },
    ],
    advice: "Drink plenty of water and rest.",
    followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const labReport = await LabReport.create({
    reportId: "LAB001",
    patientId: patient._id,
    doctorId: doctor._id,
    appointmentId: appointment._id,
    technicianId: labAssistantUser._id,
    tests: [labTest1._id],
    status: "COMPLETED",
    sampleDate: new Date(),
    reportDate: new Date(),
    reportFile: "https://example.com/reports/lab001.pdf",
    findings: "All parameters are within normal range.",
    remarks: "No follow-up required.",
    approvedBy: doctorUser._id,
  });

  const billing = await Billing.create({
    billingId: "BILL001",
    patientId: patient._id,
    appointmentId: appointment._id,
    items: [
      {
        serviceId: consultationService._id,
        serviceName: "Doctor Consultation",
        description: "Consultation fee",
        quantity: 1,
        unitPrice: 500,
        amount: 500,
      },
    ],
    subtotal: 500,
    discount: 0,
    tax: 90,
    total: 590,
    paymentStatus: "PAID",
    status: "paid",
  });

  const invoice = await Invoice.create({
    invoiceNumber: "INV001",
    billingId: billing._id,
    patientId: patient._id,
    amount: 590,
    status: "paid",
    invoiceDate: new Date(),
    generatedAt: new Date(),
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    invoicePdf: "https://example.com/invoices/inv001.pdf",
  });

  await Payment.create({
    paymentId: "PAY001",
    invoiceId: invoice._id,
    billingId: billing._id,
    patientId: patient._id,
    amount: 590,
    paymentMethod: "upi",
    transactionId: "TXN123",
    status: "success",
    paymentStatus: "SUCCESS",
    paidAt: new Date(),
  });

  await Notification.create({
    userId: patientUser._id,
    type: "report",
    title: "Lab Report Uploaded",
    message: "Your lab report is now available.",
    data: { reportId: labReport._id },
    isRead: false,
  });

  await AuditLog.create({
    userId: adminUser._id,
    action: "CREATE_PATIENT",
    resource: "Patient",
    resourceId: patient._id,
    oldValues: {},
    newValues: patient.toObject(),
    ipAddress: "127.0.0.1",
    status: "success",
  });

  await PatientHistory.create({
    patientId: patient._id,
    doctorId: doctor._id,
    appointmentId: appointment._id,
    diagnosis: "Viral Fever",
    notes: "Patient presented with fever, cold, and body ache.",
  });

  await MedicineRequirement.create({
    requirementId: "REQ001",
    medicineId: medicine1._id,
    requestedQty: 100,
    approvedQty: 0,
    status: "PENDING",
    requestedBy: dispensaryUser._id,
  });

  await MedicineDistribution.create({
    distributionId: "DIST001",
    patientId: patient._id,
    prescriptionId: prescription._id,
    medicineId: medicine1._id,
    quantity: 10,
    distributedBy: dispensaryUser._id,
    distributedAt: new Date(),
  });

  console.log("✅ Seed data created successfully.");
  process.exit(0);
};

seed().catch((error) => {
  console.error("❌ Seed script failed:", error);
  process.exit(1);
});
