import { users as initialUsers } from "./mockData";

export const adminService = {
  getUsers: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const registeredUsers = JSON.parse(localStorage.getItem("medico_registered_users") || "[]");
    
    // Combine initial mock users with registered users
    // In a real app, these would all be in one DB
    // We'll mark mock users as having a generic ID if they don't have one
    const normalizedInitial = initialUsers.map(u => ({
      ...u,
      id: u.id || u.email,
      source: 'system'
    }));

    const normalizedRegistered = registeredUsers.map(u => ({
      ...u,
      source: 'registered'
    }));

    return [...normalizedInitial, ...normalizedRegistered];
  },

  updateUser: async (userId, updates) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Update in registered users
    const registeredUsers = JSON.parse(localStorage.getItem("medico_registered_users") || "[]");
    const regIndex = registeredUsers.findIndex(u => u.id === userId);
    
    if (regIndex !== -1) {
      registeredUsers[regIndex] = { ...registeredUsers[regIndex], ...updates };
      localStorage.setItem("medico_registered_users", JSON.stringify(registeredUsers));
      return registeredUsers[regIndex];
    }

    // If it's a system user, we'd normally not update mock data file, 
    // but we can "override" in localStorage for the session
    const systemOverrides = JSON.parse(localStorage.getItem("medico_system_overrides") || "{}");
    systemOverrides[userId] = { ...(systemOverrides[userId] || {}), ...updates };
    localStorage.setItem("medico_system_overrides", JSON.stringify(systemOverrides));
    
    return { id: userId, ...updates };
  },

  getSystemMetrics: async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const patients = JSON.parse(localStorage.getItem("medico_patients") || "[]");
    const appointments = JSON.parse(localStorage.getItem("medico_appointments") || "[]");
    const users = await adminService.getUsers();

    return {
      totalUsers: users.length,
      activePatients: patients.length,
      totalAppointments: appointments.length,
      activeStaff: users.filter(u => u.isActive !== false).length,
      departmentLoads: {
        General: 45,
        Cardiology: 12,
        Neurology: 8,
        Pediatrics: 15
      }
    };
  }
};
