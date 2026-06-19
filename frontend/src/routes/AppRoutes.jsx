import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import RoleGuard from "../components/RoleGuard";
import Layout from "../components/Layout";

import Landing from "../pages/Landing";
import Login from "../pages/auth/Login";

import { Role } from "../types";

/* ===================================================== */
/* COMMON PAGES */
/* ===================================================== */

import Settings from "../pages/Settings";
import Dashboard from "../pages/Dashboard";

/* ===================================================== */
/* ADMIN PAGES */
/* ===================================================== */

import DoctorsManagement from "../pages/admin/DoctorsManagement";
import AdminAnalytics from "../pages/admin/AdminAnalytics";
import UserManagement from "../pages/admin/UserManagement";
import UserRoleManagement from "../pages/admin/UserRoleManagement";
import UserAdd from "../pages/admin/UserAdd"; 

import Patients from "../pages/patient/PatientList";
import PatientProfile from "../pages/patient/PatientProfile";

import Appointments from "../pages/appointment/AppointmentListNew";

import EMR from "../pages/EMR";
import Billing from "../pages/Billing";
import Addtest from "../pages/lab/add-test";
import TestManagementPage from "../pages/lab/tests";
import AddMedicine from "../pages/clinic/AddMedicine";
import ExpiredMedicine from "../pages/clinic/ExpiredMedicine";
/* ===================================================== */
/* DOCTOR PAGES */
/* ===================================================== */

import DoctorDashboard from "../pages/doctor/DoctorDashboard";
import DoctorReports from "../pages/doctor/DoctorReports";
import DoctorHistory from "../pages/doctor/DoctorHistory";
import PrescriptionCenter from "../pages/doctor/PrescriptionCenter";

/* ===================================================== */
/* LAB PAGES */
/* ===================================================== */

import Laboratory from "../pages/Laboratory";

import LabDashboard from "../pages/lab/LabDashboard";
import LabReports from "../pages/lab/LabReports";
import PendingSamples from "../pages/lab/PendingSamples";
import UploadReports from "../pages/lab/UploadReports";

/* ===================================================== */
/* APPOINTMENT PAGES */
/* ===================================================== */
import AppointmentDashboard from "../pages/appointment/AppointmentListNew";
import AppointmentScheduler from "../pages/appointment/AppointmentScheduler";
import PatientQueue from "../pages/appointment/PatientQueue";
import AddAppointment from "../pages/appointment/AddAppointment";
import AppointmentPatients from "../pages/appointment/AppointmentPatients";
import AddPatientAppointment from "../pages/appointment/AddPatientAppointment";
import AppointmentBilling from "../pages/appointment/AppointmentBilling";
import AppointmentHistory from "../pages/appointment/AppointmentHistory";

/* ===================================================== */
/* CLINIC / DISPENSORY PAGES */
/* ===================================================== */

import Pharmacy from "../pages/Pharmacy";
import Patient from "../pages/clinic/Patients";
import ClinicDashboard from "../pages/clinic/ClinicDashboard";
import NewPatientClinic from "../pages/clinic/NewPatientClinic";
import ClinicHistory from "../pages/clinic/ClinicHistory";
import ClinicBilling from "../pages/clinic/ClinicBilling";
import MedicineInventory from "../pages/clinic/MedicineInventory";
import MedicineDispense from "../pages/clinic/MedicineDispense";
import Stocks from "../pages/clinic/StockMedicine"

/* ===================================================== */
/* ROLE BASED DASHBOARD REDIRECT */
/* ===================================================== */

import { useAuth } from "../hooks/useAuth";

function RoleBasedDashboard() {
  const { user } = useAuth();

  switch (user?.role) {
    case Role.ADMIN:
      return <Navigate to="/admin/dashboard" replace />;
    case Role.DOCTOR:
      return <Navigate to="/doctor/dashboard" replace />;
    case Role.LAB:
      return <Navigate to="/lab/dashboard" replace />;
    case Role.APPOINTMENT:
      return <Navigate to="/appointment/dashboard" replace />;
    case Role.CLINIC:
      return <Navigate to="/clinic/dashboard" replace />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
}

/* ===================================================== */
/* COMING SOON */
/* ===================================================== */

const ComingSoon = ({ title }) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-white rounded-[3rem] shadow-sm border border-gray-100">
    <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mb-6">
      <div className="w-12 h-12 bg-emerald-600 rounded-2xl animate-pulse" />
    </div>
    <h1 className="text-3xl font-bold text-[#06402B] mb-2">{title}</h1>
    <p className="text-gray-500 font-medium">
      This module is currently being optimized for your workflow.
    </p>
  </div>
);

function UnauthorizedPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <h1 className="text-9xl font-black text-emerald-50 mb-4 select-none">403</h1>
      <div className="text-center relative -top-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-gray-500 mb-8 max-w-sm">
          You do not have permission to access this module.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="h-12 px-8 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-600/20 hover:scale-105 transition-transform"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

/* ===================================================== */
/* APP ROUTES */
/* ===================================================== */

export default function AppRoutes() {
  return (
    <Routes>
      {/* ========== PUBLIC ROUTES ========== */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* ========== SHARED AUTH ROUTES (accessible to all logged-in users) ========== */}
      <Route
        element={
          <RoleGuard
            allowedRoles={[
              Role.ADMIN,
              Role.DOCTOR,
              Role.LAB,
              Role.APPOINTMENT,
              Role.CLINIC,
            ]}
          />
        }
      >
        <Route path="/dashboard" element={<RoleBasedDashboard />} />
        <Route
          path="/settings"
          element={
            <Layout>
              <Settings />
            </Layout>
          }
        />
        <Route
          path="/profile"
          element={
            <Layout>
              <ComingSoon title="My Profile" />
            </Layout>
          }
        />
      </Route>

      {/* ========== ADMIN ROUTES (Admin only) ========== */}
      <Route element={<RoleGuard allowedRoles={[Role.ADMIN]} />}>
        <Route
          path="/admin/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/clinic/stock"
          element={
            <Layout>
              <Stocks />
            </Layout>
          }
        />
        <Route
          path="/lab/add-test"
          element={
            <Layout>
              <Addtest/>
            </Layout>
          }
        />
        <Route
          path="/lab/tests"
          element={
            <Layout>
              <TestManagementPage />
            </Layout>
          }
        />
        <Route
          path="/admin/doctors"
          element={
            <Layout>
              <DoctorsManagement />
            </Layout>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <Layout>
              <AdminAnalytics />
            </Layout>
          }
        />
        <Route
          path="/admin/users"
          element={
            <Layout>
              <UserManagement />
            </Layout>
          }
        />
        <Route
          path="/admin/users/add"      // 👈 NEW: Add user form
          element={
            <Layout>
              <UserAdd />
            </Layout>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <Layout>
              <UserRoleManagement />
            </Layout>
          }
        />
        <Route
          path="/patients"
          element={
            <Layout>
              <Patients />
            </Layout>
          }
        />
        <Route
          path="/patients/:id"
          element={
            <Layout>
              <PatientProfile />
            </Layout>
          }
        />
        <Route
          path="/appointments"
          element={
            <Layout>
              <Appointments />
            </Layout>
          }
        />
        <Route
          path="/billing"
          element={
            <Layout>
              <Billing />
            </Layout>
          }
        />
        <Route
          path="/emr"
          element={
            <Layout>
              <EMR />
            </Layout>
          }
        />
        
        
        <Route
          path="/clinic/dispense"
          element={
            <Layout>
              <MedicineDispense />
            </Layout>
          }
        />
        <Route
          path="/clinic/add-medicine"
          element={
            <Layout>
              <AddMedicine />
            </Layout>
          }
        />
      </Route>
      <Route
        path="/clinic/expired-medicines"
        element={
          <Layout>
            <ExpiredMedicine />
          </Layout>
        }
      />

      {/* ========== DOCTOR ROUTES (Doctor + Admin) ========== */}
      <Route element={<RoleGuard allowedRoles={[Role.DOCTOR, Role.ADMIN]} />}>
        <Route
          path="/doctor/dashboard"
          element={
            <Layout>
              <DoctorDashboard />
            </Layout>
          }
        />
        <Route
          path="/doctor/patients"
          element={
            <Layout>
              <Patients />
            </Layout>
          }
        />
        <Route
          path="/doctor/patients/:id"
          element={
            <Layout>
              <PatientProfile />
            </Layout>
          }
        />
        <Route
          path="/doctor/prescriptions"
          element={
            <Layout>
              <PrescriptionCenter />
            </Layout>
          }
        />
        <Route
          path="/doctor/reports"
          element={
            <Layout>
              <DoctorReports />
            </Layout>
          }
        />
        <Route
          path="/doctor/history"
          element={
            <Layout>
              <DoctorHistory />
            </Layout>
          }
        />
      </Route>

      {/* ========== LAB ROUTES (Lab + Admin) ========== */}
      <Route element={<RoleGuard allowedRoles={[Role.LAB, Role.ADMIN]} />}>
        <Route
          path="/lab/dashboard"
          element={
            <Layout>
              <LabDashboard />
            </Layout>
          }
        />
        <Route
          path="/lab"
          element={
            <Layout>
              <Laboratory />
            </Layout>
          }
        />
        <Route
          path="/lab/reports"
          element={
            <Layout>
              <LabReports />
            </Layout>
          }
        />
        <Route
          path="/lab/upload"
          element={
            <Layout>
              <UploadReports />
            </Layout>
          }
        />
        <Route
          path="/lab/pending"
          element={
            <Layout>
              <PendingSamples />
            </Layout>
          }
        />
      </Route>

      {/* ========== APPOINTMENT ROUTES (Appointment + Admin) ========== */}
      <Route element={<RoleGuard allowedRoles={[Role.APPOINTMENT, Role.ADMIN]} />}>
        <Route
          path="/appointment/dashboard"
          element={
            <Layout>
              <AppointmentDashboard />
            </Layout>
          }
        />
        <Route
          path="/appointment/add"
          element={
            <Layout>
              <AddAppointment />
            </Layout>
          }
        />
        <Route
          path="/appointment/patients"
          element={
            <Layout>
              <AppointmentPatients />
            </Layout>
          }
        />
        <Route
          path="/appointment/add-patient"
          element={
            <Layout>
              <AddPatientAppointment />
            </Layout>
          }
        />
        <Route
          path="/appointment/billing"
          element={
            <Layout>
              <AppointmentBilling />
            </Layout>
          }
        />
        <Route
          path="/appointment/history"
          element={
            <Layout>
              <AppointmentHistory />
            </Layout>
          }
        />
        <Route
          path="/appointment/scheduler"
          element={
            <Layout>
              <AppointmentScheduler />
            </Layout>
          }
        />
        <Route
          path="/appointment/queue"
          element={
            <Layout>
              <PatientQueue />
            </Layout>
          }
        />
      </Route>

      {/* ========== CLINIC ROUTES (Clinic + Admin) ========== */}
      <Route element={<RoleGuard allowedRoles={[Role.CLINIC, Role.ADMIN]} />}>
        
        

          <Route
          path="/clinic/dashboard"
          element={
            <Layout>
              <ClinicDashboard />
            </Layout>
          }
        />
        
        <Route
          path="/clinic/expired-medicines"
          element={
            <Layout>
              <ExpiredMedicine />
            </Layout>
          }
        />
        <Route
          path="/clinic/patients"
          element={
            <Layout>
              <Patient />
            </Layout>
          }
        />
        <Route
          path="/clinic/history"
          element={
            <Layout>
              <ClinicHistory />
            </Layout>
          }
        />
        <Route
          path="/clinic/billing"
          element={
            <Layout>
              <ClinicBilling />
            </Layout>
          }
        />
        <Route
          path="/clinic/stocks"
          element={
            <Layout>
              <Stocks />
            </Layout>
          }
        />
        <Route
          path="/clinic/dispense"
          element={
            <Layout>
              <MedicineDispense />
            </Layout>
          }
        />
      </Route>

      {/* ========== UNAUTHORIZED ========== */}
      <Route
        path="/unauthorized"
        element={<UnauthorizedPage />}
      />

      {/* ========== FALLBACK ========== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}