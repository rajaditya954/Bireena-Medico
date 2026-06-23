-- Bireena Medico Supabase Database Schema

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  _id TEXT PRIMARY KEY,
  "employeeId" TEXT UNIQUE,
  username TEXT UNIQUE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  "passwordHash" TEXT NOT NULL,
  phone TEXT,
  "profileImage" TEXT,
  role TEXT NOT NULL DEFAULT 'PATIENT',
  "isActive" BOOLEAN DEFAULT TRUE,
  "failedLoginAttempts" INTEGER DEFAULT 0,
  "lockedUntil" TIMESTAMP WITH TIME ZONE,
  "resetToken" TEXT,
  "resetTokenExpires" TIMESTAMP WITH TIME ZONE,
  "lastLogin" TIMESTAMP WITH TIME ZONE,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Patients table
CREATE TABLE IF NOT EXISTS patients (
  _id TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES users(_id) ON DELETE SET NULL,
  "patientId" TEXT UNIQUE,
  "fullName" TEXT NOT NULL,
  dob TIMESTAMP WITH TIME ZONE,
  age INTEGER,
  gender TEXT,
  "bloodGroup" TEXT,
  "maritalStatus" TEXT,
  phone TEXT,
  "alternatePhone" TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  occupation TEXT,
  "referredBy" TEXT,
  allergies JSONB DEFAULT '[]'::jsonb,
  "chronicDiseases" JSONB DEFAULT '[]'::jsonb,
  "medicalHistory" JSONB DEFAULT '[]'::jsonb,
  "emergencyContact" JSONB DEFAULT '{}'::jsonb,
  "insuranceInfo" JSONB DEFAULT '{}'::jsonb,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Doctors table
CREATE TABLE IF NOT EXISTS doctors (
  _id TEXT PRIMARY KEY,
  "userId" TEXT UNIQUE REFERENCES users(_id) ON DELETE CASCADE,
  "doctorCode" TEXT UNIQUE,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  "consultantType" TEXT DEFAULT 'doctor',
  qualification TEXT,
  description TEXT,
  qualifications JSONB DEFAULT '[]'::jsonb,
  "registrationNumber" TEXT UNIQUE,
  experience INTEGER,
  "consultationFee" NUMERIC DEFAULT 500,
  "roomNumber" TEXT,
  schedule JSONB DEFAULT '[]'::jsonb,
  clinic JSONB DEFAULT '{}'::jsonb,
  "isVerified" BOOLEAN DEFAULT FALSE,
  rating NUMERIC DEFAULT 0,
  "totalConsultations" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  _id TEXT PRIMARY KEY,
  "appointmentId" TEXT UNIQUE,
  "patientId" TEXT REFERENCES patients(_id) ON DELETE CASCADE,
  "patientName" TEXT,
  "patientPhone" TEXT,
  "doctorId" TEXT REFERENCES doctors(_id) ON DELETE CASCADE,
  "doctorName" TEXT,
  "appointmentDate" TIMESTAMP WITH TIME ZONE NOT NULL,
  date TEXT,
  "appointmentType" TEXT DEFAULT 'WALK_IN',
  type TEXT,
  "consultantType" TEXT,
  priority TEXT DEFAULT 'normal',
  "tokenNumber" INTEGER,
  slot TEXT,
  "slotId" TEXT,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  reason TEXT,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Queues table
CREATE TABLE IF NOT EXISTS queues (
  _id TEXT PRIMARY KEY,
  "appointmentId" TEXT REFERENCES appointments(_id) ON DELETE CASCADE,
  "patientId" TEXT REFERENCES patients(_id) ON DELETE CASCADE,
  "patientName" TEXT,
  "doctorId" TEXT REFERENCES doctors(_id) ON DELETE CASCADE,
  "doctorName" TEXT,
  "queueNumber" INTEGER,
  "tokenNumber" INTEGER,
  type TEXT,
  "scheduledTime" TEXT,
  priority TEXT,
  "currentPosition" INTEGER DEFAULT 0,
  status TEXT DEFAULT 'waiting',
  date TEXT,
  "estimatedWaitTime" INTEGER,
  "calledAt" TIMESTAMP WITH TIME ZONE,
  "completedAt" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  _id TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES users(_id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  "isRead" BOOLEAN DEFAULT FALSE,
  "readAt" TIMESTAMP WITH TIME ZONE,
  "expiresAt" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
  _id TEXT PRIMARY KEY,
  "prescriptionId" TEXT UNIQUE,
  "appointmentId" TEXT REFERENCES appointments(_id) ON DELETE CASCADE,
  "patientId" TEXT REFERENCES patients(_id) ON DELETE CASCADE,
  "doctorId" TEXT REFERENCES doctors(_id) ON DELETE CASCADE,
  diagnosis TEXT,
  symptoms JSONB DEFAULT '[]'::jsonb,
  medicines JSONB DEFAULT '[]'::jsonb,
  advice TEXT,
  "followUpDate" TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  "fileUrl" TEXT,
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Lab Tests table
CREATE TABLE IF NOT EXISTS lab_tests (
  _id TEXT PRIMARY KEY,
  "testCode" TEXT UNIQUE NOT NULL,
  "testName" TEXT NOT NULL,
  category TEXT,
  "sampleType" TEXT,
  method TEXT,
  tat TEXT,
  description TEXT,
  price NUMERIC NOT NULL,
  "normalRange" TEXT,
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Lab Reports table
CREATE TABLE IF NOT EXISTS lab_reports (
  _id TEXT PRIMARY KEY,
  "reportId" TEXT UNIQUE,
  "patientId" TEXT REFERENCES patients(_id) ON DELETE CASCADE,
  "doctorId" TEXT REFERENCES doctors(_id) ON DELETE SET NULL,
  "appointmentId" TEXT REFERENCES appointments(_id) ON DELETE SET NULL,
  "technicianId" TEXT REFERENCES users(_id) ON DELETE SET NULL,
  tests JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'PENDING',
  "sampleDate" TIMESTAMP WITH TIME ZONE,
  "reportDate" TIMESTAMP WITH TIME ZONE,
  "reportFile" TEXT,
  findings TEXT,
  remarks TEXT,
  history JSONB DEFAULT '[]'::jsonb,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Billing table
CREATE TABLE IF NOT EXISTS billing (
  _id TEXT PRIMARY KEY,
  "invoiceNumber" TEXT UNIQUE,
  "billingId" TEXT UNIQUE,
  "patientId" TEXT REFERENCES patients(_id) ON DELETE CASCADE,
  "appointmentId" TEXT REFERENCES appointments(_id) ON DELETE SET NULL,
  items JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  "paymentSummary" JSONB DEFAULT '{"paidAmount": 0, "dueAmount": 0}'::jsonb,
  "paymentStatus" TEXT DEFAULT 'PENDING',
  status TEXT DEFAULT 'pending',
  "issuedAt" TIMESTAMP WITH TIME ZONE,
  "paidAt" TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  "dueDate" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Payments table
CREATE TABLE IF NOT EXISTS payments (
  _id TEXT PRIMARY KEY,
  "paymentId" TEXT UNIQUE,
  "invoiceId" TEXT,
  bill TEXT REFERENCES billing(_id) ON DELETE SET NULL,
  "patientId" TEXT REFERENCES patients(_id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  "paymentMethod" TEXT DEFAULT 'cash',
  status TEXT DEFAULT 'pending',
  "transactionId" TEXT UNIQUE,
  "razorpayPaymentId" TEXT,
  "razorpayOrderId" TEXT,
  signature TEXT,
  "paymentDate" TIMESTAMP WITH TIME ZONE,
  "completedAt" TIMESTAMP WITH TIME ZONE,
  "failureReason" TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  _id TEXT PRIMARY KEY,
  "medicineId" TEXT,
  "currentStock" INTEGER,
  "minimumStock" INTEGER,
  "reorderLevel" INTEGER,
  supplier TEXT,
  "stockValue" NUMERIC,
  location TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  _id TEXT PRIMARY KEY,
  "invoiceNumber" TEXT UNIQUE NOT NULL,
  "billingId" TEXT REFERENCES billing(_id) ON DELETE CASCADE,
  "patientId" TEXT REFERENCES patients(_id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'draft',
  "invoiceDate" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "generatedAt" TIMESTAMP WITH TIME ZONE,
  "dueDate" TIMESTAMP WITH TIME ZONE,
  "invoicePdf" TEXT,
  "pdfUrl" TEXT,
  notes TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. History table
CREATE TABLE IF NOT EXISTS history (
  _id TEXT PRIMARY KEY,
  "patientId" TEXT REFERENCES patients(_id) ON DELETE CASCADE,
  medicines JSONB DEFAULT '[]'::jsonb,
  "requestedMedicines" JSONB DEFAULT '[]'::jsonb,
  total NUMERIC,
  "paymentMethod" TEXT,
  "amountPaid" NUMERIC,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. Roles table
CREATE TABLE IF NOT EXISTS roles (
  _id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  permissions JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. Services table
CREATE TABLE IF NOT EXISTS services (
  _id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT,
  price NUMERIC NOT NULL,
  duration INTEGER,
  icon TEXT,
  "isActive" BOOLEAN DEFAULT TRUE,
  "serviceItems" JSONB DEFAULT '[]'::jsonb,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. Patient Histories table
CREATE TABLE IF NOT EXISTS patient_histories (
  _id TEXT PRIMARY KEY,
  "patientId" TEXT REFERENCES patients(_id) ON DELETE CASCADE,
  "doctorId" TEXT REFERENCES doctors(_id) ON DELETE CASCADE,
  "appointmentId" TEXT REFERENCES appointments(_id) ON DELETE CASCADE,
  diagnosis TEXT,
  notes TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. Medicines table
CREATE TABLE IF NOT EXISTS medicines (
  _id TEXT PRIMARY KEY,
  "medicineCode" TEXT UNIQUE NOT NULL,
  "medicineName" TEXT NOT NULL,
  category TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  mrp NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  "expiryDate" TIMESTAMP WITH TIME ZONE,
  "batchNo" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. Medicine Distributions table
CREATE TABLE IF NOT EXISTS medicine_distributions (
  _id TEXT PRIMARY KEY,
  "distributionId" TEXT UNIQUE,
  "patientId" TEXT REFERENCES patients(_id) ON DELETE CASCADE,
  "prescriptionId" TEXT REFERENCES prescriptions(_id) ON DELETE CASCADE,
  "medicineId" TEXT,
  quantity INTEGER,
  items JSONB DEFAULT '[]'::jsonb,
  "totalAmount" NUMERIC DEFAULT 0,
  "distributedBy" TEXT REFERENCES users(_id) ON DELETE SET NULL,
  "distributedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 20. Medicine Requirements table
CREATE TABLE IF NOT EXISTS medicine_requirements (
  _id TEXT PRIMARY KEY,
  "requirementId" TEXT,
  "patientId" TEXT REFERENCES patients(_id) ON DELETE CASCADE,
  "medicineId" TEXT,
  "requestedMedicineName" TEXT,
  strength TEXT,
  "unitType" TEXT,
  "requestedQty" INTEGER NOT NULL,
  "approvedQty" INTEGER DEFAULT 0,
  status TEXT DEFAULT 'PENDING',
  "requestedBy" TEXT REFERENCES users(_id) ON DELETE SET NULL,
  "approvedBy" TEXT REFERENCES users(_id) ON DELETE SET NULL,
  notes TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 21. Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  _id TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES users(_id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  "resourceId" JSONB,
  "oldValues" JSONB,
  "newValues" JSONB,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  status TEXT DEFAULT 'success',
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 22. Refresh Tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  _id TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES users(_id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "isRevoked" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
