import React, { useState } from "react";
import { Clock, CheckCircle, Users } from "lucide-react";

const AppointmentDashboard = () => {
  const [stats, setStats] = useState({
    totalAppointments: 28,
    todayAppointments: 5,
    completedToday: 3,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Appointment Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-white rounded-lg shadow-md border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Appointments</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalAppointments}</p>
            </div>
            <Users className="w-12 h-12 text-blue-100" />
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md border-l-4 border-orange-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Today's Appointments</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.todayAppointments}</p>
            </div>
            <Clock className="w-12 h-12 text-orange-100" />
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Completed Today</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completedToday}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-100" />
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Appointments</h2>
        <div className="space-y-4">
          <p className="text-gray-600 text-center py-8">No appointments scheduled for today</p>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDashboard;
