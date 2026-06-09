
const getAppointments = () => JSON.parse(localStorage.getItem("medico_appointments") || "[]");
const saveAppointments = (apps) => localStorage.setItem("medico_appointments", JSON.stringify(apps));

export const appointmentService = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return getAppointments();
  },
  
  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const apps = getAppointments();
    
    // Check for double booking
    const isConflict = apps.some(a => 
      a.doctorId === data.doctorId && 
      a.startTime === data.startTime && 
      a.status !== 'cancelled'
    );
    
    if (isConflict) {
      throw new Error("This time slot is already booked for the selected doctor.");
    }
    
    const newApp = { 
      ...data, 
      id: String(Date.now()),
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };
    apps.push(newApp);
    saveAppointments(apps);
    return newApp;
  },
  
  updateStatus: async (id, status) => {
    const apps = getAppointments();
    const index = apps.findIndex(a => a.id === id);
    if (index !== -1) {
      apps[index].status = status;
      saveAppointments(apps);
    }
    return apps[index];
  }
};
