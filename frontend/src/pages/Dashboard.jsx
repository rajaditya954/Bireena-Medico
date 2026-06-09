import { useAuth } from "../hooks/useAuth";
import { Role } from "../types";
import AdminDashboard from "./dashboard/AdminDashboard";
import DoctorDashboard from "./dashboard/DoctorDashboard";
import PatientDashboard from "./dashboard/PatientDashboard";

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === Role.ADMIN) return <AdminDashboard user={user} />;
  if (user?.role === Role.DOCTOR) return <DoctorDashboard user={user} />;
  return <PatientDashboard user={user} />;
}
