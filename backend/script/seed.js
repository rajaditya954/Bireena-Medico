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

  console.log("Syncing database collection indexes...");
  try {
    await Patient.syncIndexes();
    await LabTest.syncIndexes();
    await Medicine.syncIndexes();
    console.log("✅ Indexes synchronized successfully");
  } catch (err) {
    console.log("⚠️ Index synchronization warning:", err.message);
  }

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
    username: "admin.medico",
    email: "admin@medico.com",
    phone: "9876543210",
    role: "admin",
    isActive: true,
  });
  await adminUser.setPassword("medicouseradmin");
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
    username: "lab.medico",
    email: "lab@medico.com",
    phone: "9988776655",
    role: "lab_assistant",
    isActive: true,
  });
  await labAssistantUser.setPassword("medicouserlab");
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

  const medicine1 = await Medicine.create({
    medicineCode: "MED001",
    medicineName: "Paracetamol 650",
    category: "Analgesics",
    manufacturer: "ABC Pharma",
    mrp: 25,
    unit: "tablet",
    expiryDate: new Date("2025-12-31"),
    batchNo: "B001",
  });

  const inventory1 = await Inventory.create({
    medicineId: medicine1._id,
    currentStock: 350,
    minimumStock: 50,
    reorderLevel: 50,
    supplier: "ABC Pharma",
    stockValue: 350 * 25,
    location: "Store A",
  });

  const appointment = await Appointment.create({
    appointmentId: "APT001",
    patientId: patient._id,
    doctorId: doctor._id,
    appointmentDate: new Date(),
    date: new Date().toISOString().split("T")[0],
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
    date: new Date().toISOString().split("T")[0],
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
    patientId: patient._id,
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

  const labTests = await LabTest.insertMany([
    { testCode: "CBC", testName: "Complete Blood Count", category: "Hematology", price: 500, sampleType: "Blood", method: "Automated Analyzer", tat: "2 hours", description: "Evaluates overall health and detects disorders", normalRange: "WBC: 4000-11000, RBC: 4.5-5.5M, Hb: 12-16g/dL", isActive: true },
    { testCode: "LFT", testName: "Liver Function Test", category: "Biochemistry", price: 800, sampleType: "Blood", method: "Spectrophotometry", tat: "4 hours", description: "Assesses liver health and function", normalRange: "SGOT: 5-40, SGPT: 7-56, Bilirubin: 0.1-1.2", isActive: true },
    { testCode: "RFT", testName: "Renal Function Test", category: "Biochemistry", price: 700, sampleType: "Blood", method: "Colorimetric", tat: "4 hours", description: "Evaluates kidney function", normalRange: "Creatinine: 0.6-1.2, Urea: 15-40, Uric Acid: 3.5-7.0", isActive: true },
    { testCode: "TSH", testName: "Thyroid Stimulating Hormone", category: "Endocrinology", price: 600, sampleType: "Blood", method: "CLIA", tat: "6 hours", description: "Screens for thyroid disorders", normalRange: "0.4-4.0 mIU/L", isActive: true },
    { testCode: "HBA1C", testName: "Glycated Hemoglobin", category: "Endocrinology", price: 900, sampleType: "Blood", method: "HPLC", tat: "24 hours", description: "Average blood sugar over 2-3 months", normalRange: "< 5.7%", isActive: true },
    { testCode: "UA", testName: "Urinalysis", category: "Clinical Pathology", price: 200, sampleType: "Urine", method: "Dipstick + Microscopy", tat: "1 hour", description: "Evaluates urine for infections and kidney disease", normalRange: "pH: 4.5-8.0, Protein: Negative, Glucose: Negative", isActive: true },
    { testCode: "LIPID", testName: "Lipid Profile", category: "Biochemistry", price: 650, sampleType: "Blood", method: "Enzymatic", tat: "4 hours", description: "Measures cholesterol and triglycerides", normalRange: "Total Cholesterol: <200, LDL: <100, HDL: >40, Triglycerides: <150", isActive: true },
    { testCode: "XRAY_CHEST", testName: "X-Ray Chest PA View", category: "Radiology", price: 400, sampleType: "N/A", method: "Digital Radiography", tat: "2 hours", description: "Imaging of chest for lungs and heart", normalRange: "No active lung pathology", isActive: true },
    { testCode: "ECG", testName: "Electrocardiogram", category: "Cardiology", price: 350, sampleType: "N/A", method: "12-Lead ECG", tat: "30 minutes", description: "Records electrical activity of the heart", normalRange: "Normal sinus rhythm", isActive: true },
    { testCode: "USG_ABD", testName: "Ultrasound Abdomen", category: "Radiology", price: 1200, sampleType: "N/A", method: "Ultrasonography", tat: "24 hours", description: "Imaging of abdominal organs", normalRange: "No significant abnormality", isActive: true },
  ]);

  const patient2User = new User({
    name: "Priya Singh",
    email: "priya@hospital.com",
    phone: "9876543211",
    role: "patient",
    isActive: true,
  });
  await patient2User.setPassword("Patient@123");
  await patient2User.save();

  const patient2 = await Patient.create({
    userId: patient2User._id,
    patientId: "PAT002",
    fullName: "Priya Singh",
    dob: new Date("1985-08-14"),
    gender: "Female",
    bloodGroup: "B+",
    phone: "9876543211",
    email: "priya.singh@example.com",
    address: "45 Lake Road",
    city: "Indore",
    state: "Madhya Pradesh",
    pincode: "452002",
  });

  const patient3User = new User({
    name: "Amit Patel",
    email: "amit@hospital.com",
    phone: "9876543212",
    role: "patient",
    isActive: true,
  });
  await patient3User.setPassword("Patient@123");
  await patient3User.save();

  const patient3 = await Patient.create({
    userId: patient3User._id,
    patientId: "PAT003",
    fullName: "Amit Patel",
    dob: new Date("1978-03-30"),
    gender: "Male",
    bloodGroup: "A+",
    phone: "9876543212",
    email: "amit.patel@example.com",
    address: "78 Hill Street",
    city: "Bhopal",
    state: "Madhya Pradesh",
    pincode: "462001",
  });

  await LabReport.insertMany([
    {
      reportId: "LAB1001",
      patientId: patient._id,
      doctorId: doctor._id,
      technicianId: labAssistantUser._id,
      tests: [labTests[0]._id],
      status: "COMPLETED",
      findings: "All parameters within normal limits. WBC: 7200/µL, RBC: 5.1M/µL, Hb: 14.2 g/dL, Platelets: 250000/µL, Hematocrit: 42%. No signs of infection or anemia.",
      remarks: "Routine checkup - no abnormalities detected. Patient is in good health.",
      reportFile: "",
      sampleDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      reportDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      history: [
        { event: "Report created by Dr. Raj Sharma for Complete Blood Count", date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
        { event: "Blood sample collected from Rahul Verma (PAT001)", date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 3600000) },
        { event: "Sample processed using Automated Analyzer", date: new Date(Date.now() - 4.5 * 24 * 60 * 60 * 1000) },
        { event: "Results reviewed by Lab Assistant — all values within normal range", date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
        { event: "Report completed and verified", date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 1800000) },
      ],
    },
    {
      reportId: "LAB1002",
      patientId: patient2._id,
      doctorId: doctor._id,
      technicianId: labAssistantUser._id,
      tests: [labTests[1]._id, labTests[6]._id],
      status: "COMPLETED",
      findings: "Liver Function: SGOT 45 U/L (slightly elevated, normal: 5-40), SGPT 38 U/L (normal), Bilirubin 0.9 mg/dL (normal), ALP 72 U/L (normal). Lipid Profile: Total Cholesterol 210 mg/dL (borderline high), LDL 108 mg/dL (borderline high), HDL 48 mg/dL (normal), Triglycerides 145 mg/dL (normal).",
      remarks: "SGOT mildly elevated — likely due to recent medication. Lipid borderline — dietary changes recommended. Follow up in 3 months with repeat LFT and Lipid Profile.",
      reportFile: "",
      sampleDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      reportDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      history: [
        { event: "Report created by Dr. Raj Sharma for Liver Function Test, Lipid Profile", date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { event: "Blood sample collected from Priya Singh (PAT002)", date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 3600000) },
        { event: "LFT processed via Spectrophotometry, Lipid via Enzymatic method", date: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000) },
        { event: "Results flagged: SGOT elevated (45 U/L), LDL borderline (108 mg/dL)", date: new Date(Date.now() - 2.2 * 24 * 60 * 60 * 1000) },
        { event: "Report completed — dietary changes advised, follow-up in 3 months", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      ],
    },
    {
      reportId: "LAB1003",
      patientId: patient3._id,
      doctorId: doctor._id,
      technicianId: labAssistantUser._id,
      tests: [labTests[4]._id],
      status: "PENDING",
      findings: "",
      remarks: "Awaiting results — HbA1c sample sent to lab",
      reportFile: "",
      sampleDate: new Date(),
      reportDate: null,
      history: [
        { event: "Report created by Dr. Raj Sharma for HbA1c test", date: new Date() },
        { event: "Blood sample collected from Amit Patel (PAT003)", date: new Date(Date.now() + 1800000) },
        { event: "Sample sent to analysis — estimated TAT: 24 hours", date: new Date(Date.now() + 3600000) },
      ],
    },
    {
      reportId: "LAB1004",
      patientId: patient._id,
      doctorId: doctor._id,
      technicianId: labAssistantUser._id,
      tests: [labTests[3]._id],
      status: "IN_PROGRESS",
      findings: "",
      remarks: "TSH analysis in progress — CLIA method underway",
      reportFile: "",
      sampleDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      reportDate: null,
      history: [
        { event: "Report created by Dr. Raj Sharma for TSH screening", date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
        { event: "Blood sample collected from Rahul Verma (PAT001)", date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 3600000) },
        { event: "Sample loaded on CLIA analyzer for TSH measurement", date: new Date(Date.now() - 12 * 3600000) },
        { event: "Analysis started — estimated completion in 6 hours", date: new Date() },
      ],
    },
    {
      reportId: "LAB1005",
      patientId: patient2._id,
      doctorId: doctor._id,
      technicianId: labAssistantUser._id,
      tests: [labTests[7]._id],
      status: "APPROVED",
      findings: "Chest PA View: Clear lung fields bilaterally. Normal cardiac silhouette. No mediastinal widening. Costophrenic angles sharp. No active lung pathology or pleural effusion.",
      remarks: "Normal chest X-ray. No abnormalities detected.",
      reportFile: "",
      sampleDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      reportDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      history: [
        { event: "Report created by Dr. Raj Sharma for Chest X-Ray PA View", date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        { event: "X-ray imaging completed at Radiology department", date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 7200000) },
        { event: "Digital radiograph analyzed — no pathology found", date: new Date(Date.now() - 6.5 * 24 * 60 * 60 * 1000) },
        { event: "Report completed and sent for approval", date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
        { event: "Report approved by Dr. Raj Sharma", date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 3600000) },
      ],
    },
  ]);

  console.log("✅ Seed data created successfully.");
  process.exit(0);
};

seed().catch((error) => {
  console.error("❌ Seed script failed:", error);
  process.exit(1);
});
