// Fallback seed data used when backend is offline. Mirrors the MongoDB schema.
export const HOSPITAL_INFO = {
  name: "Aarogya Multispeciality Hospital",
  tagline: "Compassionate Care, Trusted Expertise",
  address: "12, MG Road, Bengaluru, KA 560001",
  phone: "+91 80 4567 8900",
  email: "billing@aarogya.in",
  gst: "29ABCDE1234F1Z5",
  logo: "🏥",
};

export const TAX_RATE = 0.05;
export const DEFAULT_DISCOUNT = 0;

export const PATIENTS = [
  { _id: "P-4412", name: "Aarav Sharma", age: 34, gender: "Male", phone: "+91 98765 43210", email: "aarav@example.in", address: "Indiranagar, Bengaluru" },
  { _id: "P-4413", name: "Priya Iyer", age: 28, gender: "Female", phone: "+91 99887 76655", email: "priya@example.in", address: "Andheri, Mumbai" },
  { _id: "P-4414", name: "Rohan Mehta", age: 45, gender: "Male", phone: "+91 91234 56780", email: "rohan@example.in", address: "Sector 21, Gurugram" },
  { _id: "P-4415", name: "Ananya Nair", age: 31, gender: "Female", phone: "+91 90909 80808", email: "ananya@example.in", address: "Koramangala, Bengaluru" },
];

export const APPOINTMENTS = [
  { _id: "A-1001", patientId: "P-4412", doctorName: "Dr. Kavita Rao", speciality: "General Medicine", date: "2026-04-22", time: "10:30" },
  { _id: "A-1002", patientId: "P-4413", doctorName: "Dr. Suresh Iyer", speciality: "Cardiology", date: "2026-04-22", time: "12:00" },
  { _id: "A-1003", patientId: "P-4414", doctorName: "Dr. Meera Joshi", speciality: "Orthopedics", date: "2026-04-23", time: "09:00" },
];

export const SERVICE_CATALOG = [
  { id: "s1", type: "CONSULTATION", name: "General Consultation", unitPrice: 500 },
  { id: "s2", type: "CONSULTATION", name: "Specialist Consultation", unitPrice: 900 },
  { id: "s3", type: "LAB", name: "Complete Blood Count (CBC)", unitPrice: 350 },
  { id: "s4", type: "LAB", name: "Lipid Profile", unitPrice: 700 },
  { id: "s5", type: "LAB", name: "Thyroid Panel", unitPrice: 850 },
  { id: "s6", type: "MEDICINE", name: "Paracetamol 500mg (10 tabs)", unitPrice: 45 },
  { id: "s7", type: "MEDICINE", name: "Azithromycin 500mg (5 tabs)", unitPrice: 180 },
  { id: "s8", type: "PROCEDURE", name: "ECG", unitPrice: 400 },
  { id: "s9", type: "PROCEDURE", name: "Wound Dressing", unitPrice: 250 },
  { id: "s10", type: "ROOM", name: "General Ward (per day)", unitPrice: 1500 },
  { id: "s11", type: "ROOM", name: "Private Room (per day)", unitPrice: 4500 },
  { id: "s12", type: "NURSING", name: "Nursing Care (per shift)", unitPrice: 600 },
  { id: "s13", type: "EQUIPMENT", name: "Oxygen Support (per hour)", unitPrice: 200 },
];

export const generateInvoiceNumber = (n) =>
  `INV-${new Date().getFullYear()}-${String(1000 + n + 1).padStart(4, "0")}`;
