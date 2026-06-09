import React, { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Shield, 
  UserX, 
  UserCheck, 
  Search,
  Filter,
  MoreVertical,
  Activity,
  UserCog,
  BarChart,
  ShieldAlert,
  Eye,
  Lock,
  Key,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  Server,
  Edit,
  Power,
  AlertCircle,
  CheckCircle,
  Circle,
  Briefcase,
  FileText,
  HardDrive
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { Button } from "../../components/common/Button";

// ==================== Mock Data Generator ====================
const generateMockUsers = () => {
  const baseUsers = [
    {
      id: "USR-0001",
      name: "Dr. Sarah Miller",
      email: "sarah.miller@careplus.com",
      role: "Doctor",
      department: "Cardiology Clinic",
      status: "Active",
      lastLogin: "12 May 2025, 10:30 AM",
      ip: "192.168.1.10",
      isOnline: true,
      personalInfo: {
        email: "sarah.miller@careplus.com",
        mobile: "+91 9876543210",
        gender: "Female",
        dateOfBirth: "15 Mar 1988",
        address: "221B Baker Street, London, UK",
        username: "sarah.miller",
        lastLogin: "12 May 2025, 10:30 AM",
        ipAddress: "192.168.1.10",
        assignedClinics: "Cardiology Clinic",
        assignedDepartments: "Cardiology, ECG, Consultation",
        permissions: ["View own patients", "Prescriptions", "Appointments"]
      }
    },
    {
      id: "USR-0002",
      name: "John Lab Assistant",
      email: "john.lab@careplus.com",
      role: "Lab Assistant",
      department: "Pathology Lab / Hematology Reports",
      status: "Active",
      lastLogin: "12 May 2025, 09:15 AM",
      ip: "192.168.1.15",
      isOnline: true,
      personalInfo: {
        email: "john.lab@careplus.com",
        mobile: "+91 9876543211",
        gender: "Male",
        dateOfBirth: "10 Jan 1990",
        address: "123 Lab Street, London, UK",
        username: "john.lab",
        lastLogin: "12 May 2025, 09:15 AM",
        ipAddress: "192.168.1.15",
        assignedClinics: "Pathology Lab",
        assignedDepartments: "Hematology",
        permissions: ["View assigned lab reports", "Update results"]
      }
    },
    {
      id: "USR-0003",
      name: "Priya Lab Assistant",
      email: "priya.lab@careplus.com",
      role: "Lab Assistant",
      department: "Pathology Lab / Biochemistry Reports",
      status: "Active",
      lastLogin: "12 May 2025, 08:45 AM",
      ip: "192.168.1.16",
      isOnline: true,
      personalInfo: {
        email: "priya.lab@careplus.com",
        mobile: "+91 9876543212",
        gender: "Female",
        dateOfBirth: "22 Mar 1992",
        address: "456 Biochemistry Ave, London, UK",
        username: "priya.lab",
        lastLogin: "12 May 2025, 08:45 AM",
        ipAddress: "192.168.1.16",
        assignedClinics: "Pathology Lab",
        assignedDepartments: "Biochemistry",
        permissions: ["View assigned lab reports", "Update results"]
      }
    },
    {
      id: "USR-0004",
      name: "Mike Lab Assistant",
      email: "mike.lab@careplus.com",
      role: "Lab Assistant",
      department: "Pathology Lab / Microbiology Reports",
      status: "Active",
      lastLogin: "11 May 2025, 04:20 PM",
      ip: "192.168.1.17",
      isOnline: false,
      personalInfo: {
        email: "mike.lab@careplus.com",
        mobile: "+91 9876543213",
        gender: "Male",
        dateOfBirth: "5 Aug 1989",
        address: "789 Microbiology Rd, London, UK",
        username: "mike.lab",
        lastLogin: "11 May 2025, 04:20 PM",
        ipAddress: "192.168.1.17",
        assignedClinics: "Pathology Lab",
        assignedDepartments: "Microbiology",
        permissions: ["View assigned lab reports", "Update results"]
      }
    },
    {
      id: "USR-0005",
      name: "Ravi Clinic Staff",
      email: "ravi.clinic@careplus.com",
      role: "Clinic Staff",
      department: "Main Clinic / Medicine Distribution",
      status: "Active",
      lastLogin: "12 May 2025, 11:00 AM",
      ip: "192.168.1.20",
      isOnline: true,
      personalInfo: {
        email: "ravi.clinic@careplus.com",
        mobile: "+91 9876543214",
        gender: "Male",
        dateOfBirth: "17 Jul 1985",
        address: "101 Clinic Street, London, UK",
        username: "ravi.clinic",
        lastLogin: "12 May 2025, 11:00 AM",
        ipAddress: "192.168.1.20",
        assignedClinics: "Main Clinic",
        assignedDepartments: "Medicine Distribution",
        permissions: ["Manage medicine distribution", "View patients"]
      }
    },
    {
      id: "USR-0006",
      name: "Anita Appointment",
      email: "anita.app@careplus.com",
      role: "Appointment Staff",
      department: "Reception / Appointment Booking",
      status: "Active",
      lastLogin: "12 May 2025, 10:05 AM",
      ip: "192.168.1.21",
      isOnline: true,
      personalInfo: {
        email: "anita.app@careplus.com",
        mobile: "+91 9876543215",
        gender: "Female",
        dateOfBirth: "30 Nov 1993",
        address: "202 Reception Blvd, London, UK",
        username: "anita.app",
        lastLogin: "12 May 2025, 10:05 AM",
        ipAddress: "192.168.1.21",
        assignedClinics: "Reception",
        assignedDepartments: "Appointment Booking",
        permissions: ["Manage appointments", "View calendar"]
      }
    },
    {
      id: "USR-0007",
      name: "Suresh Billing",
      email: "suresh.billing@careplus.com",
      role: "Billing Staff",
      department: "Billing Department / Payment & Invoices",
      status: "Active",
      lastLogin: "12 May 2025, 09:50 AM",
      ip: "192.168.1.22",
      isOnline: true,
      personalInfo: {
        email: "suresh.billing@careplus.com",
        mobile: "+91 9876543216",
        gender: "Male",
        dateOfBirth: "25 Apr 1987",
        address: "303 Billing Tower, London, UK",
        username: "suresh.billing",
        lastLogin: "12 May 2025, 09:50 AM",
        ipAddress: "192.168.1.22",
        assignedClinics: "Billing Department",
        assignedDepartments: "Payments & Invoices",
        permissions: ["Manage billing", "Process payments", "Generate invoices"]
      }
    },
    {
      id: "USR-0008",
      name: "Admin User",
      email: "admin@careplus.com",
      role: "Admin",
      department: "System Administration / Full Access",
      status: "Active",
      lastLogin: "12 May 2025, 11:30 AM",
      ip: "192.168.1.23",
      isOnline: true,
      personalInfo: {
        email: "admin@careplus.com",
        mobile: "+91 9876543217",
        gender: "Male",
        dateOfBirth: "1 Jan 1980",
        address: "404 Admin Plaza, London, UK",
        username: "admin",
        lastLogin: "12 May 2025, 11:30 AM",
        ipAddress: "192.168.1.23",
        assignedClinics: "System",
        assignedDepartments: "All Departments",
        permissions: ["Full system access", "User management", "All modules"]
      }
    },
    {
      id: "USR-0009",
      name: "Dr. John Doe",
      email: "john.doe@careplus.com",
      role: "Doctor",
      department: "Neurology Clinic",
      status: "Inactive",
      lastLogin: "05 May 2025, 03:20 PM",
      ip: "192.168.1.25",
      isOnline: false,
      personalInfo: {
        email: "john.doe@careplus.com",
        mobile: "+91 9876543218",
        gender: "Male",
        dateOfBirth: "12 Jun 1982",
        address: "505 Neurology Street, London, UK",
        username: "john.doe",
        lastLogin: "05 May 2025, 03:20 PM",
        ipAddress: "192.168.1.25",
        assignedClinics: "Neurology Clinic",
        assignedDepartments: "Neurology",
        permissions: ["View own patients", "Prescriptions"]
      }
    },
    {
      id: "USR-0010",
      name: "Tom Lab Assistant",
      email: "tom.lab@careplus.com",
      role: "Lab Assistant",
      department: "Pathology Lab / Immunology Reports",
      status: "Locked",
      lastLogin: "02 May 2025, 01:10 PM",
      ip: "192.168.1.18",
      isOnline: false,
      personalInfo: {
        email: "tom.lab@careplus.com",
        mobile: "+91 9876543219",
        gender: "Male",
        dateOfBirth: "19 Sep 1991",
        address: "606 Immunology Lane, London, UK",
        username: "tom.lab",
        lastLogin: "02 May 2025, 01:10 PM",
        ipAddress: "192.168.1.18",
        assignedClinics: "Pathology Lab",
        assignedDepartments: "Immunology",
        permissions: ["View assigned lab reports"]
      }
    }
  ];

  // Generate additional users to reach total 48 with metrics: 42 Active, 6 Inactive, 2 Locked, 12 Online
  const additionalUsers = [];
  const roles = ["Doctor", "Lab Assistant", "Clinic Staff", "Appointment Staff", "Billing Staff", "Admin"];
  const departments = ["General Medicine", "Pediatrics", "Orthopedics", "Radiology", "Pharmacy", "Emergency"];
  
  let activeCount = baseUsers.filter(u => u.status === "Active").length;
  let inactiveCount = baseUsers.filter(u => u.status === "Inactive").length;
  let lockedCount = baseUsers.filter(u => u.status === "Locked").length;

  for (let i = 11; i <= 48; i++) {
    let status = "Active";
    if (activeCount < 42 && inactiveCount < 6 && lockedCount < 2) {
      if (lockedCount < 2 && i % 23 === 0) status = "Locked";
      else if (inactiveCount < 6 && i % 11 === 0) status = "Inactive";
      else status = "Active";
    } else if (activeCount < 42) {
      status = "Active";
    } else if (inactiveCount < 6) {
      status = "Inactive";
    } else if (lockedCount < 2) {
      status = "Locked";
    }
    
    if (status === "Active") activeCount++;
    else if (status === "Inactive") inactiveCount++;
    else if (status === "Locked") lockedCount++;
    
    const role = roles[i % roles.length];
    const isOnline = status === "Active" && (i % 4 === 0 || i % 7 === 0);
    const lastLoginDate = new Date();
    lastLoginDate.setDate(lastLoginDate.getDate() - (i % 14));
    
    additionalUsers.push({
      id: `USR-${String(i).padStart(4, '0')}`,
      name: `User ${i}`,
      email: `user${i}@careplus.com`,
      role: role,
      department: departments[i % departments.length] + (role === "Lab Assistant" ? " Lab" : ""),
      status: status,
      lastLogin: lastLoginDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + 
                 `, ${String(lastLoginDate.getHours()).padStart(2, '0')}:${String(lastLoginDate.getMinutes()).padStart(2, '0')} ${lastLoginDate.getHours() >= 12 ? 'PM' : 'AM'}`,
      ip: `192.168.1.${100 + i}`,
      isOnline: isOnline,
      personalInfo: {
        email: `user${i}@careplus.com`,
        mobile: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        gender: i % 2 === 0 ? "Male" : "Female",
        dateOfBirth: `${Math.floor(Math.random() * 28) + 1} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i % 12]} ${1980 + (i % 20)}`,
        address: `${i} Additional Street, London, UK`,
        username: `user${i}`,
        lastLogin: lastLoginDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + 
                   `, ${String(lastLoginDate.getHours()).padStart(2, '0')}:${String(lastLoginDate.getMinutes()).padStart(2, '0')} ${lastLoginDate.getHours() >= 12 ? 'PM' : 'AM'}`,
        ipAddress: `192.168.1.${100 + i}`,
        assignedClinics: departments[i % departments.length],
        assignedDepartments: departments[i % departments.length],
        permissions: ["Standard permissions"]
      }
    });
  }

  return [...baseUsers, ...additionalUsers];
};

// ==================== Main Component ====================
export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("USR-0001");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "Doctor" });
  const [showRoleDropdown, setShowRoleDropdown] = useState(null);

  useEffect(() => {
    // Load users
    const storedUsers = localStorage.getItem("careplus_users");
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      const mockUsers = generateMockUsers();
      setUsers(mockUsers);
      localStorage.setItem("careplus_users", JSON.stringify(mockUsers));
    }
    setLoading(false);
  }, []);

  // Save to localStorage whenever users change
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem("careplus_users", JSON.stringify(users));
    }
  }, [users]);

  const selectedUser = users.find(u => u.id === selectedUserId);

  // Metrics calculations
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === "Active").length;
  const inactiveUsers = users.filter(u => u.status === "Inactive").length;
  const lockedUsers = users.filter(u => u.status === "Locked").length;
  const onlineNow = users.filter(u => u.isOnline && u.status === "Active").length;

  // Role counts for overview table
  const roleCounts = {
    "Lab Assistant": users.filter(u => u.role === "Lab Assistant").length,
    "Clinic Staff": users.filter(u => u.role === "Clinic Staff").length,
    "Appointment Staff": users.filter(u => u.role === "Appointment Staff").length,
    "Billing Staff": users.filter(u => u.role === "Billing Staff").length,
    "Admin": users.filter(u => u.role === "Admin").length,
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    const matchesStatus = filterStatus === "all" || u.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateUser = (e) => {
    e.preventDefault();
    const newUserId = `USR-${String(users.length + 1).padStart(4, '0')}`;
    const createdUser = {
      id: newUserId,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: "General",
      status: "Active",
      lastLogin: "Never",
      ip: "0.0.0.0",
      isOnline: false,
      personalInfo: {
        email: newUser.email,
        mobile: "Not provided",
        gender: "Not specified",
        dateOfBirth: "Not provided",
        address: "Not provided",
        username: newUser.email.split('@')[0],
        lastLogin: "Never",
        ipAddress: "0.0.0.0",
        assignedClinics: "Not assigned",
        assignedDepartments: "Not assigned",
        permissions: ["Default permissions"]
      }
    };
    setUsers([...users, createdUser]);
    setIsAddModalOpen(false);
    setNewUser({ name: "", email: "", role: "Doctor" });
  };

  const handleToggleStatus = (userId) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        const newStatus = user.status === "Active" ? "Inactive" : 
                         user.status === "Inactive" ? "Active" : "Active";
        return { ...user, status: newStatus, isOnline: newStatus === "Active" ? user.isOnline : false };
      }
      return user;
    }));
  };

  const handleLockAccount = (userId) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        const newStatus = user.status === "Locked" ? "Active" : "Locked";
        return { ...user, status: newStatus, isOnline: false };
      }
      return user;
    }));
  };

  const handleResetPassword = (userId) => {
    alert(`Password reset link sent to ${users.find(u => u.id === userId)?.email}`);
  };

  const handleChangeRole = (userId, newRole) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
    setShowRoleDropdown(null);
  };

  const metricsCards = [
    { label: "Total Users", value: totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Users", value: activeUsers, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Inactive Users", value: inactiveUsers, icon: UserX, color: "text-red-600", bg: "bg-red-50" },
    { label: "Locked Users", value: lockedUsers, icon: Lock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Online Now", value: onlineNow, icon: Activity, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="min-h-screen bg-gray-50/40 p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tight">User Management</h1>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Manage system users, roles, permissions and access control.</p>
          </div>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="h-12 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
          >
            <UserPlus className="w-4 h-4" /> Add New User
          </Button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {metricsCards.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", stat.bg, stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-slate-800">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Two Column Layout: Left Panel (User Details) + Right Panel (Table & Overviews) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT PANEL - User Details */}
          <div className="lg:col-span-4 space-y-6">
            {selectedUser && (
              <motion.div 
                key={selectedUser.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden sticky top-8"
              >
                {/* User Header */}
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl font-black">
                      {selectedUser.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-800">{selectedUser.name}</h2>
                      <p className="text-sm font-bold text-primary">{selectedUser.role}</p>
                      <p className="text-xs text-gray-400 font-mono mt-1">{selectedUser.id}</p>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="p-6 border-b border-gray-50">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <UserCog className="w-3.5 h-3.5" /> Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-slate-600">{selectedUser.personalInfo?.email || selectedUser.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-slate-600">{selectedUser.personalInfo?.mobile || "Not provided"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-slate-600">Gender: {selectedUser.personalInfo?.gender || "Not specified"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-slate-600">DOB: {selectedUser.personalInfo?.dateOfBirth || "Not provided"}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-slate-600">{selectedUser.personalInfo?.address || "Not provided"}</span>
                    </div>
                  </div>
                </div>

                {/* Access Information */}
                <div className="p-6 border-b border-gray-50">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Key className="w-3.5 h-3.5" /> Access Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Username:</span>
                      <span className="font-mono text-slate-700">{selectedUser.personalInfo?.username || selectedUser.email.split('@')[0]}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Password:</span>
                      <span className="font-mono text-slate-700">••••••••</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Last Login:</span>
                      <span className="text-slate-700">{selectedUser.lastLogin}</span>
                    </div>
                  </div>
                </div>

                {/* Login Information */}
                <div className="p-6 border-b border-gray-50">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Server className="w-3.5 h-3.5" /> Login Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">IP Address:</span>
                      <span className="font-mono text-slate-700">{selectedUser.ip}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Status:</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold",
                        selectedUser.status === "Active" ? "bg-emerald-50 text-emerald-600" :
                        selectedUser.status === "Inactive" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                      )}>
                        {selectedUser.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Role & Permissions */}
                <div className="p-6 border-b border-gray-50">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5" /> Role & Permissions
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Role:</span>
                      <span className="font-bold text-primary">{selectedUser.role}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500 block mb-1">Permissions:</span>
                      <ul className="text-slate-600 text-xs space-y-1 pl-4 list-disc">
                        {selectedUser.personalInfo?.permissions.map((p, idx) => (
                          <li key={idx}>{p}</li>
                        )) || <li>Standard access</li>}
                      </ul>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500 block">Assigned Clinics:</span>
                      <p className="text-slate-700">{selectedUser.personalInfo?.assignedClinics || "Not assigned"}</p>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500 block">Assigned Departments:</span>
                      <p className="text-slate-700">{selectedUser.personalInfo?.assignedDepartments || "Not assigned"}</p>
                    </div>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="p-6 bg-gray-50/30">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">Account Actions</h3>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => handleResetPassword(selectedUser.id)}
                      variant="outline"
                      className="flex-1 h-10 rounded-xl text-xs"
                    >
                      <Key className="w-3.5 h-3.5 mr-1" /> Reset Password
                    </Button>
                    <Button 
                      onClick={() => handleLockAccount(selectedUser.id)}
                      className={cn(
                        "flex-1 h-10 rounded-xl text-xs",
                        selectedUser.status === "Locked" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-600 hover:bg-amber-700"
                      )}
                    >
                      <Lock className="w-3.5 h-3.5 mr-1" /> {selectedUser.status === "Locked" ? "Unlock" : "Lock"} Account
                    </Button>
                  </div>
                  <Button 
                    onClick={() => handleToggleStatus(selectedUser.id)}
                    variant="ghost"
                    className="w-full mt-3 h-10 rounded-xl text-xs text-red-600 hover:bg-red-50"
                  >
                    <Power className="w-3.5 h-3.5 mr-1" /> {selectedUser.status === "Active" ? "Deactivate" : "Activate"} User
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* RIGHT PANEL - Table, Role Overview, Lab Access */}
          <div className="lg:col-span-8 space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search by name, email or mobile..."
                    className="w-full h-12 pl-11 pr-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <select 
                    className="h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium text-gray-600 outline-none focus:ring-2 focus:ring-primary/20"
                    value={filterRole}
                    onChange={e => setFilterRole(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Lab Assistant">Lab Assistant</option>
                    <option value="Clinic Staff">Clinic Staff</option>
                    <option value="Appointment Staff">Appointment Staff</option>
                    <option value="Billing Staff">Billing Staff</option>
                    <option value="Admin">Admin</option>
                  </select>
                  <select 
                    className="h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium text-gray-600 outline-none focus:ring-2 focus:ring-primary/20"
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Locked">Locked</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100">
                      <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">User</th>
                      <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Role</th>
                      <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Department / Lab</th>
                      <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Last Login</th>
                      <th className="text-right px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <AnimatePresence mode="popLayout">
                      {filteredUsers.slice(0, 15).map((user) => (
                        <motion.tr 
                          key={user.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setSelectedUserId(user.id)}
                          className={cn(
                            "group hover:bg-gray-50/50 transition-all cursor-pointer",
                            selectedUserId === user.id && "bg-primary/5"
                          )}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-black">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 text-sm">{user.name}</p>
                                <p className="text-xs text-gray-400">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="relative">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setShowRoleDropdown(showRoleDropdown === user.id ? null : user.id); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:border-primary transition-all"
                              >
                                <UserCog className="w-3.5 h-3.5 text-primary" />
                                {user.role}
                              </button>
                              {showRoleDropdown === user.id && (
                                <div className="absolute left-0 top-full mt-1 w-40 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden py-1">
                                  {["Doctor", "Lab Assistant", "Clinic Staff", "Appointment Staff", "Billing Staff", "Admin"].map(role => (
                                    <button 
                                      key={role}
                                      onClick={(e) => { e.stopPropagation(); handleChangeRole(user.id, role); }}
                                      className={cn(
                                        "w-full text-left px-3 py-2 text-xs font-medium transition-colors",
                                        user.role === role ? "text-primary bg-primary/5" : "text-gray-500 hover:bg-gray-50"
                                      )}
                                    >
                                      {role}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-slate-600">{user.department}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className={cn(
                                "inline-flex w-fit px-2 py-0.5 rounded-full text-[10px] font-bold",
                                user.status === "Active" ? "bg-emerald-50 text-emerald-600" :
                                user.status === "Inactive" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                              )}>
                                {user.status}
                              </span>
                              {user.isOnline && user.status === "Active" && (
                                <span className="inline-flex items-center gap-1 text-[9px] text-emerald-600">
                                  <Circle className="w-1.5 h-1.5 fill-emerald-500 text-emerald-500" /> Online
                                </span>
                              )}
                              {!user.isOnline && user.status === "Active" && (
                                <span className="text-[9px] text-gray-400">Offline</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-slate-600">{user.lastLogin}</div>
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">IP: {user.ip}</div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleToggleStatus(user.id); }}
                                className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                  user.status === "Active" ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                )}
                                title={user.status === "Active" ? "Deactivate" : "Activate"}
                              >
                                {user.status === "Active" ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleLockAccount(user.id); }}
                                className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 flex items-center justify-center transition-all"
                                title={user.status === "Locked" ? "Unlock" : "Lock"}
                              >
                                <Lock className="w-4 h-4" />
                              </button>
                              <button className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">No users found</div>
              )}
            </div>

            {/* Role Based Access Overview */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-black text-slate-800 mb-1">Role Based Access Overview</h3>
              <p className="text-xs text-gray-400 mb-6">Each role has specific access permissions to modules and features.</p>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 text-xs font-black text-gray-400 uppercase tracking-wider">Role</th>
                      <th className="text-left py-3 text-xs font-black text-gray-400 uppercase tracking-wider">Access Description</th>
                      <th className="text-right py-3 text-xs font-black text-gray-400 uppercase tracking-wider">Users</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 font-bold text-slate-700">Lab Assistant</td>
                      <td className="py-3 text-sm text-gray-500">Can view & manage assigned lab reports only</td>
                      <td className="py-3 text-right font-bold text-primary">{roleCounts["Lab Assistant"]}</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 font-bold text-slate-700">Clinic Staff</td>
                      <td className="py-3 text-sm text-gray-500">Can manage medicine distribution & patients</td>
                      <td className="py-3 text-right font-bold text-primary">{roleCounts["Clinic Staff"]}</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 font-bold text-slate-700">Appointments Staff</td>
                      <td className="py-3 text-sm text-gray-500">Can manage appointments & calendar</td>
                      <td className="py-3 text-right font-bold text-primary">{roleCounts["Appointment Staff"]}</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 font-bold text-slate-700">Billing Staff</td>
                      <td className="py-3 text-sm text-gray-500">Can manage billing, invoices & payments</td>
                      <td className="py-3 text-right font-bold text-primary">{roleCounts["Billing Staff"]}</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 font-bold text-slate-700">Admin</td>
                      <td className="py-3 text-sm text-gray-500">Full system access & user management</td>
                      <td className="py-3 text-right font-bold text-primary">{roleCounts["Admin"]}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Lab Report Access Control */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-black text-slate-800 mb-1">Lab Report Access Control</h3>
              <p className="text-xs text-gray-400 mb-4">Lab assistants can only access specific report types.</p>
              
              <div className="flex flex-wrap gap-3">
                {["Hematology Reports", "Microbiology Reports", "Immunology Reports", "Pathology (General)", "All Lab Reports"].map((report, idx) => (
                  <button 
                    key={idx}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-50 text-gray-600 hover:bg-primary hover:text-white transition-all"
                  >
                    {report}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsAddModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
            >
              <h2 className="text-2xl font-black text-slate-800 mb-1">Provision New User</h2>
              <p className="text-xs text-gray-400 mb-6">System Access Allocation</p>
              
              <form onSubmit={handleCreateUser} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                    value={newUser.name}
                    onChange={e => setNewUser({...newUser, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                  <input 
                    required
                    type="email" 
                    className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                    value={newUser.email}
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Designated Role</label>
                  <select 
                    className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                    value={newUser.role}
                    onChange={e => setNewUser({...newUser, role: e.target.value})}
                  >
                    <option value="Doctor">Doctor</option>
                    <option value="Lab Assistant">Lab Assistant</option>
                    <option value="Clinic Staff">Clinic Staff</option>
                    <option value="Appointment Staff">Appointment Staff</option>
                    <option value="Billing Staff">Billing Staff</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="flex-1 h-11 rounded-xl">Cancel</Button>
                  <Button type="submit" className="flex-1 h-11 rounded-xl shadow-lg shadow-primary/20">Provision User</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}