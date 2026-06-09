import React, { useState, useEffect } from "react";
import { Users, TrendingUp, BarChart3, Activity } from "lucide-react";

const AdminAnalytics = () => {
  const [stats, setStats] = useState({
    totalUsers: 145,
    totalPatients: 892,
    appointments: 2451,
    revenue: 1250000,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 bg-white rounded-lg shadow-md border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
            </div>
            <Users className="w-12 h-12 text-blue-100" />
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Patients</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalPatients}</p>
            </div>
            <Activity className="w-12 h-12 text-green-100" />
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Appointments</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.appointments}</p>
            </div>
            <BarChart3 className="w-12 h-12 text-purple-100" />
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md border-l-4 border-orange-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">₹{(stats.revenue / 100000).toFixed(1)}L</p>
            </div>
            <TrendingUp className="w-12 h-12 text-orange-100" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Appointments</h2>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-600">Chart coming soon</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Trend</h2>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-600">Chart coming soon</p>
          </div>
        </div>
      </div>

      {/* Department Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Department Performance</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-900">Doctor</span>
            <span className="text-gray-600">45 staff members</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-900">Lab</span>
            <span className="text-gray-600">12 staff members</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-900">Appointment</span>
            <span className="text-gray-600">8 staff members</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-900">Clinic</span>
            <span className="text-gray-600">15 staff members</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
