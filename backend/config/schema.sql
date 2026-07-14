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
  "isReminder" BOOLEAN DEFAULT FALSE,
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

-- ============================================================
-- MULTI-TENANT SAAS SCHEMA ADDITIONS
-- ============================================================

-- 23. Hospitals table (Tenant registry)
CREATE TABLE IF NOT EXISTS hospitals (
  _id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  phone TEXT,
  email TEXT,
  logo TEXT,
  "subscriptionPlan" TEXT DEFAULT 'basic',
  "subscriptionStatus" TEXT DEFAULT 'active',
  "subscriptionExpiresAt" TIMESTAMP WITH TIME ZONE,
  "maxUsers" INTEGER DEFAULT 50,
  "isActive" BOOLEAN DEFAULT TRUE,
  settings JSONB DEFAULT '{}'::jsonb,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 24. SaaS Admins table (Super Admin users — separate from hospital users)
CREATE TABLE IF NOT EXISTS saas_admins (
  _id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "isActive" BOOLEAN DEFAULT TRUE,
  "lastLogin" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- ADD hospital_id COLUMN TO ALL TENANT-SCOPED TABLES
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS "hospital_id" TEXT REFERENCES hospitals(_id) ON DELETE CASCADE;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS "hospital_id" TEXT REFERENCES hospitals(_id) ON DELETE CASCADE;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS "hospital_id" TEXT REFERENCES hospitals(_id) ON DELETE CASCADE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS "hospital_id" TEXT REFERENCES hospitals(_id) ON DELETE CASCADE;
ALTER TABLE queues ADD COLUMN IF NOT EXISTS "hospital_id" TEXT REFERENCES hospitals(_id) ON DELETE CASCADE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS "hospital_id" TEXT REFERENCES hospitals(_id) ON DELETE CASCADE;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS "hospital_id" TEXT REFERENCES hospitals(_id) ON DELETE CASCADE;
ALTER TABLE lab_tests ADD COLUMN IF NOT EXISTS "hospital_id" TEXT REFERENCES hospitals(_id) ON DELETE CASCADE;
ALTER TABLE lab_reports ADD COLUMN IF NOT EXISTS "hospital_id" TEXT REFERENCES hospitals(_id) ON DELETE CASCADE;
ALTER TABLE billing ADD COLUMN IF NOT EXISTS "hospital_id" TEXT REFERENCES hospitals(_id) ON DELETE CASCADE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS "hospital_id" TEXT REFERENCES hospitals(_id) ON DELETE CASCADE;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS "hospital_id" TEXT REFERENCES hospitals(_id) ON DELETE CASCADE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS "hospital_id" TEXT REFERENCES hospitals(_id) ON DELETE CASCADE;
ALTER TABLE history ADD COLUMN IF NOT EXISTS "hospital_id" TEXT REFERENCES hospitals(_id) ON DELETE CASCADE;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS "hospital_id" TEXT REFERENCES hospitals(_id) ON DELETE CASCADE;
ALTER TABLE services ADD COLUMN IF NOT EXISTS "hospital_id" TEXT REFERENCES hospitals(_id) ON DELETE CASCADE;
ALTER TABLE patient_histories ADD COLUMN IF NOT EXISTS "hospital_id" TEXT REFERENCES hospitals(_id) ON DELETE CASCADE;
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS "hospital_id" TEXT REFERENCES hospitals(_id) ON DELETE CASCADE;
ALTER TABLE medicine_distributions ADD COLUMN IF NOT EXISTS "hospital_id" TEXT REFERENCES hospitals(_id) ON DELETE CASCADE;
ALTER TABLE medicine_requirements ADD COLUMN IF NOT EXISTS "hospital_id" TEXT REFERENCES hospitals(_id) ON DELETE CASCADE;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS "hospital_id" TEXT REFERENCES hospitals(_id) ON DELETE CASCADE;

-- ============================================================
-- INDEXES ON hospital_id FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_users_hospital_id ON users("hospital_id");
CREATE INDEX IF NOT EXISTS idx_patients_hospital_id ON patients("hospital_id");
CREATE INDEX IF NOT EXISTS idx_doctors_hospital_id ON doctors("hospital_id");
CREATE INDEX IF NOT EXISTS idx_appointments_hospital_id ON appointments("hospital_id");
CREATE INDEX IF NOT EXISTS idx_queues_hospital_id ON queues("hospital_id");
CREATE INDEX IF NOT EXISTS idx_notifications_hospital_id ON notifications("hospital_id");
CREATE INDEX IF NOT EXISTS idx_prescriptions_hospital_id ON prescriptions("hospital_id");
CREATE INDEX IF NOT EXISTS idx_lab_tests_hospital_id ON lab_tests("hospital_id");
CREATE INDEX IF NOT EXISTS idx_lab_reports_hospital_id ON lab_reports("hospital_id");
CREATE INDEX IF NOT EXISTS idx_billing_hospital_id ON billing("hospital_id");
CREATE INDEX IF NOT EXISTS idx_payments_hospital_id ON payments("hospital_id");
CREATE INDEX IF NOT EXISTS idx_inventory_hospital_id ON inventory("hospital_id");
CREATE INDEX IF NOT EXISTS idx_invoices_hospital_id ON invoices("hospital_id");
CREATE INDEX IF NOT EXISTS idx_history_hospital_id ON history("hospital_id");
CREATE INDEX IF NOT EXISTS idx_roles_hospital_id ON roles("hospital_id");
CREATE INDEX IF NOT EXISTS idx_services_hospital_id ON services("hospital_id");
CREATE INDEX IF NOT EXISTS idx_patient_histories_hospital_id ON patient_histories("hospital_id");
CREATE INDEX IF NOT EXISTS idx_medicines_hospital_id ON medicines("hospital_id");
CREATE INDEX IF NOT EXISTS idx_medicine_distributions_hospital_id ON medicine_distributions("hospital_id");
CREATE INDEX IF NOT EXISTS idx_medicine_requirements_hospital_id ON medicine_requirements("hospital_id");
CREATE INDEX IF NOT EXISTS idx_audit_logs_hospital_id ON audit_logs("hospital_id");

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_appointments_hospital_date ON appointments("hospital_id", "appointmentDate");
CREATE INDEX IF NOT EXISTS idx_appointments_hospital_doctor ON appointments("hospital_id", "doctorId");
CREATE INDEX IF NOT EXISTS idx_billing_hospital_patient ON billing("hospital_id", "patientId");
CREATE INDEX IF NOT EXISTS idx_lab_reports_hospital_patient ON lab_reports("hospital_id", "patientId");

-- ============================================================
-- IDEMPOTENT DATA MIGRATION TO DEFAULT HOSPITAL
-- ============================================================
DO $$
DECLARE
  default_hosp_id TEXT;
BEGIN
  -- Check if a default hospital exists, otherwise create it
  SELECT _id INTO default_hosp_id FROM hospitals WHERE slug = 'default-hospital';
  IF default_hosp_id IS NULL THEN
    default_hosp_id := '000000000000000000000000';
    INSERT INTO hospitals (_id, name, slug, email, "isActive")
    VALUES (default_hosp_id, 'Default Hospital', 'default-hospital', 'admin@medico.com', true)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- Now update all tables to assign the default hospital ID if they are NULL
  UPDATE users SET "hospital_id" = default_hosp_id WHERE "hospital_id" IS NULL;
  UPDATE patients SET "hospital_id" = default_hosp_id WHERE "hospital_id" IS NULL;
  UPDATE doctors SET "hospital_id" = default_hosp_id WHERE "hospital_id" IS NULL;
  UPDATE appointments SET "hospital_id" = default_hosp_id WHERE "hospital_id" IS NULL;
  UPDATE queues SET "hospital_id" = default_hosp_id WHERE "hospital_id" IS NULL;
  UPDATE notifications SET "hospital_id" = default_hosp_id WHERE "hospital_id" IS NULL;
  UPDATE prescriptions SET "hospital_id" = default_hosp_id WHERE "hospital_id" IS NULL;
  UPDATE lab_tests SET "hospital_id" = default_hosp_id WHERE "hospital_id" IS NULL;
  UPDATE lab_reports SET "hospital_id" = default_hosp_id WHERE "hospital_id" IS NULL;
  UPDATE billing SET "hospital_id" = default_hosp_id WHERE "hospital_id" IS NULL;
  UPDATE payments SET "hospital_id" = default_hosp_id WHERE "hospital_id" IS NULL;
  UPDATE inventory SET "hospital_id" = default_hosp_id WHERE "hospital_id" IS NULL;
  UPDATE invoices SET "hospital_id" = default_hosp_id WHERE "hospital_id" IS NULL;
  UPDATE history SET "hospital_id" = default_hosp_id WHERE "hospital_id" IS NULL;
  UPDATE roles SET "hospital_id" = default_hosp_id WHERE "hospital_id" IS NULL;
  UPDATE services SET "hospital_id" = default_hosp_id WHERE "hospital_id" IS NULL;
  UPDATE patient_histories SET "hospital_id" = default_hosp_id WHERE "hospital_id" IS NULL;
  UPDATE medicines SET "hospital_id" = default_hosp_id WHERE "hospital_id" IS NULL;
  UPDATE medicine_distributions SET "hospital_id" = default_hosp_id WHERE "hospital_id" IS NULL;
  UPDATE medicine_requirements SET "hospital_id" = default_hosp_id WHERE "hospital_id" IS NULL;
  UPDATE audit_logs SET "hospital_id" = default_hosp_id WHERE "hospital_id" IS NULL;
END $$;

-- ============================================================
-- IDEMPOTENT CONSTRAINT MIGRATION TO MULTI-TENANCY
-- ============================================================
DO $$
BEGIN
  -- users table
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_email_key') THEN
    ALTER TABLE users DROP CONSTRAINT users_email_key;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_email_hospital_unique') THEN
    ALTER TABLE users ADD CONSTRAINT users_email_hospital_unique UNIQUE (email, "hospital_id");
  END IF;

  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_username_key') THEN
    ALTER TABLE users DROP CONSTRAINT users_username_key;
  END IF;
  DROP INDEX IF EXISTS idx_users_username_hospital;
  CREATE UNIQUE INDEX idx_users_username_hospital ON users(username, "hospital_id") WHERE username IS NOT NULL;

  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_employeeId_key') THEN
    ALTER TABLE users DROP CONSTRAINT "users_employeeId_key";
  END IF;
  DROP INDEX IF EXISTS idx_users_employeeid_hospital;
  CREATE UNIQUE INDEX idx_users_employeeid_hospital ON users("employeeId", "hospital_id") WHERE "employeeId" IS NOT NULL;

  -- patients table
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'patients_patientId_key') THEN
    ALTER TABLE patients DROP CONSTRAINT "patients_patientId_key";
  END IF;
  DROP INDEX IF EXISTS idx_patients_patientid_hospital;
  CREATE UNIQUE INDEX idx_patients_patientid_hospital ON patients("patientId", "hospital_id") WHERE "patientId" IS NOT NULL;

  -- doctors table
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'doctors_userId_key') THEN
    ALTER TABLE doctors DROP CONSTRAINT "doctors_userId_key";
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'doctors_userid_hospital_unique') THEN
    ALTER TABLE doctors ADD CONSTRAINT doctors_userid_hospital_unique UNIQUE ("userId", "hospital_id");
  END IF;

  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'doctors_doctorCode_key') THEN
    ALTER TABLE doctors DROP CONSTRAINT "doctors_doctorCode_key";
  END IF;
  DROP INDEX IF EXISTS idx_doctors_doctorcode_hospital;
  CREATE UNIQUE INDEX idx_doctors_doctorcode_hospital ON doctors("doctorCode", "hospital_id") WHERE "doctorCode" IS NOT NULL;

  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'doctors_registrationNumber_key') THEN
    ALTER TABLE doctors DROP CONSTRAINT "doctors_registrationNumber_key";
  END IF;
  DROP INDEX IF EXISTS idx_doctors_registrationnumber_hospital;
  CREATE UNIQUE INDEX idx_doctors_registrationnumber_hospital ON doctors("registrationNumber", "hospital_id") WHERE "registrationNumber" IS NOT NULL;

  -- appointments table
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointments_appointmentId_key') THEN
    ALTER TABLE appointments DROP CONSTRAINT "appointments_appointmentId_key";
  END IF;
  DROP INDEX IF EXISTS idx_appointments_appointmentid_hospital;
  CREATE UNIQUE INDEX idx_appointments_appointmentid_hospital ON appointments("appointmentId", "hospital_id") WHERE "appointmentId" IS NOT NULL;

  -- prescriptions table
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'prescriptions_prescriptionId_key') THEN
    ALTER TABLE prescriptions DROP CONSTRAINT "prescriptions_prescriptionId_key";
  END IF;
  DROP INDEX IF EXISTS idx_prescriptions_prescriptionid_hospital;
  CREATE UNIQUE INDEX idx_prescriptions_prescriptionid_hospital ON prescriptions("prescriptionId", "hospital_id") WHERE "prescriptionId" IS NOT NULL;

  -- lab_tests table
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lab_tests_testCode_key') THEN
    ALTER TABLE lab_tests DROP CONSTRAINT "lab_tests_testCode_key";
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lab_tests_testcode_hospital_unique') THEN
    ALTER TABLE lab_tests ADD CONSTRAINT lab_tests_testcode_hospital_unique UNIQUE ("testCode", "hospital_id");
  END IF;

  -- lab_reports table
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lab_reports_reportId_key') THEN
    ALTER TABLE lab_reports DROP CONSTRAINT "lab_reports_reportId_key";
  END IF;
  DROP INDEX IF EXISTS idx_lab_reports_reportid_hospital;
  CREATE UNIQUE INDEX idx_lab_reports_reportid_hospital ON lab_reports("reportId", "hospital_id") WHERE "reportId" IS NOT NULL;

  -- billing table
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'billing_invoiceNumber_key') THEN
    ALTER TABLE billing DROP CONSTRAINT "billing_invoiceNumber_key";
  END IF;
  DROP INDEX IF EXISTS idx_billing_invoicenumber_hospital;
  CREATE UNIQUE INDEX idx_billing_invoicenumber_hospital ON billing("invoiceNumber", "hospital_id") WHERE "invoiceNumber" IS NOT NULL;

  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'billing_billingId_key') THEN
    ALTER TABLE billing DROP CONSTRAINT "billing_billingId_key";
  END IF;
  DROP INDEX IF EXISTS idx_billing_billingid_hospital;
  CREATE UNIQUE INDEX idx_billing_billingid_hospital ON billing("billingId", "hospital_id") WHERE "billingId" IS NOT NULL;

  -- payments table
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_paymentId_key') THEN
    ALTER TABLE payments DROP CONSTRAINT "payments_paymentId_key";
  END IF;
  DROP INDEX IF EXISTS idx_payments_paymentid_hospital;
  CREATE UNIQUE INDEX idx_payments_paymentid_hospital ON payments("paymentId", "hospital_id") WHERE "paymentId" IS NOT NULL;

  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_transactionId_key') THEN
    ALTER TABLE payments DROP CONSTRAINT "payments_transactionId_key";
  END IF;
  DROP INDEX IF EXISTS idx_payments_transactionid_hospital;
  CREATE UNIQUE INDEX idx_payments_transactionid_hospital ON payments("transactionId", "hospital_id") WHERE "transactionId" IS NOT NULL;

  -- invoices table
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invoices_invoiceNumber_key') THEN
    ALTER TABLE invoices DROP CONSTRAINT "invoices_invoiceNumber_key";
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invoices_invoicenumber_hospital_unique') THEN
    ALTER TABLE invoices ADD CONSTRAINT invoices_invoicenumber_hospital_unique UNIQUE ("invoiceNumber", "hospital_id");
  END IF;

  -- roles table
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'roles_name_key') THEN
    ALTER TABLE roles DROP CONSTRAINT "roles_name_key";
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'roles_name_hospital_unique') THEN
    ALTER TABLE roles ADD CONSTRAINT roles_name_hospital_unique UNIQUE (name, "hospital_id");
  END IF;

  -- services table
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'services_name_key') THEN
    ALTER TABLE services DROP CONSTRAINT "services_name_key";
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'services_name_hospital_unique') THEN
    ALTER TABLE services ADD CONSTRAINT services_name_hospital_unique UNIQUE (name, "hospital_id");
  END IF;

  -- medicines table
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'medicines_medicineCode_key') THEN
    ALTER TABLE medicines DROP CONSTRAINT "medicines_medicineCode_key";
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'medicines_medicinecode_hospital_unique') THEN
    ALTER TABLE medicines ADD CONSTRAINT medicines_medicinecode_hospital_unique UNIQUE ("medicineCode", "hospital_id");
  END IF;

  -- medicine_distributions table
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'medicine_distributions_distributionId_key') THEN
    ALTER TABLE medicine_distributions DROP CONSTRAINT "medicine_distributions_distributionId_key";
  END IF;
  DROP INDEX IF EXISTS idx_medicine_distributions_distributionid_hospital;
  CREATE UNIQUE INDEX idx_medicine_distributions_distributionid_hospital ON medicine_distributions("distributionId", "hospital_id") WHERE "distributionId" IS NOT NULL;
END $$;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR TENANT ISOLATION
-- ============================================================

-- Enable RLS on all 20 tenant tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper to safely drop policies before creating
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'users', 'patients', 'doctors', 'appointments', 'queues', 'notifications',
    'prescriptions', 'lab_tests', 'lab_reports', 'billing', 'payments', 'inventory',
    'invoices', 'history', 'roles', 'services', 'patient_histories', 'medicines',
    'medicine_distributions', 'medicine_requirements', 'audit_logs'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_policy ON %I', t);
    EXECUTE format('
      CREATE POLICY tenant_isolation_policy ON %I
      FOR ALL
      USING (
        NULLIF(current_setting(''app.is_super_admin'', true), '''') = ''true''
        OR "hospital_id" = NULLIF(current_setting(''app.current_hospital_id'', true), '''')
      )
      WITH CHECK (
        NULLIF(current_setting(''app.is_super_admin'', true), '''') = ''true''
        OR "hospital_id" = NULLIF(current_setting(''app.current_hospital_id'', true), '''')
      )
    ', t);
  END LOOP;
END $$;

-- Enable RLS on the remaining global SaaS management tables
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE saas_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

-- Revoke all direct PostgREST API access from public roles for sensitive tables
REVOKE ALL ON TABLE refresh_tokens FROM anon, authenticated;
REVOKE ALL ON TABLE saas_admins FROM anon, authenticated;
REVOKE ALL ON TABLE hospitals FROM anon, authenticated;

-- Create default deny-all policies on global tables to satisfy "RLS Enabled No Policy" warnings
DROP POLICY IF EXISTS deny_all_hospitals ON hospitals;
CREATE POLICY deny_all_hospitals ON hospitals FOR ALL TO public USING (false);

DROP POLICY IF EXISTS deny_all_tokens ON refresh_tokens;
CREATE POLICY deny_all_tokens ON refresh_tokens FOR ALL TO public USING (false);

DROP POLICY IF EXISTS deny_all_saas_admins ON saas_admins;
CREATE POLICY deny_all_saas_admins ON saas_admins FOR ALL TO public USING (false);

-- Create indexes on all foreign key columns to solve "Unindexed foreign keys" performance warnings
CREATE INDEX IF NOT EXISTS idx_fk_appointments_doctorId ON appointments ("doctorId");
CREATE INDEX IF NOT EXISTS idx_fk_appointments_patientId ON appointments ("patientId");
CREATE INDEX IF NOT EXISTS idx_fk_audit_logs_userId ON audit_logs ("userId");
CREATE INDEX IF NOT EXISTS idx_fk_billing_appointmentId ON billing ("appointmentId");
CREATE INDEX IF NOT EXISTS idx_fk_billing_patientId ON billing ("patientId");
CREATE INDEX IF NOT EXISTS idx_fk_history_patientId ON history ("patientId");
CREATE INDEX IF NOT EXISTS idx_fk_invoices_billingId ON invoices ("billingId");
CREATE INDEX IF NOT EXISTS idx_fk_invoices_patientId ON invoices ("patientId");
CREATE INDEX IF NOT EXISTS idx_fk_lab_reports_appointmentId ON lab_reports ("appointmentId");
CREATE INDEX IF NOT EXISTS idx_fk_lab_reports_doctorId ON lab_reports ("doctorId");
CREATE INDEX IF NOT EXISTS idx_fk_lab_reports_patientId ON lab_reports ("patientId");
CREATE INDEX IF NOT EXISTS idx_fk_lab_reports_technicianId ON lab_reports ("technicianId");
CREATE INDEX IF NOT EXISTS idx_fk_medicine_distributions_distributedBy ON medicine_distributions ("distributedBy");
CREATE INDEX IF NOT EXISTS idx_fk_medicine_distributions_patientId ON medicine_distributions ("patientId");
CREATE INDEX IF NOT EXISTS idx_fk_medicine_distributions_prescriptionId ON medicine_distributions ("prescriptionId");
CREATE INDEX IF NOT EXISTS idx_fk_medicine_requirements_approvedBy ON medicine_requirements ("approvedBy");
CREATE INDEX IF NOT EXISTS idx_fk_medicine_requirements_patientId ON medicine_requirements ("patientId");
CREATE INDEX IF NOT EXISTS idx_fk_medicine_requirements_requestedBy ON medicine_requirements ("requestedBy");
CREATE INDEX IF NOT EXISTS idx_fk_notifications_userId ON notifications ("userId");
CREATE INDEX IF NOT EXISTS idx_fk_patient_histories_appointmentId ON patient_histories ("appointmentId");
CREATE INDEX IF NOT EXISTS idx_fk_patient_histories_doctorId ON patient_histories ("doctorId");
CREATE INDEX IF NOT EXISTS idx_fk_patient_histories_patientId ON patient_histories ("patientId");
CREATE INDEX IF NOT EXISTS idx_fk_patients_userId ON patients ("userId");
CREATE INDEX IF NOT EXISTS idx_fk_payments_bill ON payments ("bill");
CREATE INDEX IF NOT EXISTS idx_fk_payments_patientId ON payments ("patientId");
CREATE INDEX IF NOT EXISTS idx_fk_prescriptions_appointmentId ON prescriptions ("appointmentId");
CREATE INDEX IF NOT EXISTS idx_fk_prescriptions_doctorId ON prescriptions ("doctorId");
CREATE INDEX IF NOT EXISTS idx_fk_prescriptions_patientId ON prescriptions ("patientId");
CREATE INDEX IF NOT EXISTS idx_fk_queues_appointmentId ON queues ("appointmentId");
CREATE INDEX IF NOT EXISTS idx_fk_queues_doctorId ON queues ("doctorId");
CREATE INDEX IF NOT EXISTS idx_fk_queues_patientId ON queues ("patientId");
CREATE INDEX IF NOT EXISTS idx_fk_refresh_tokens_userId ON refresh_tokens ("userId");


