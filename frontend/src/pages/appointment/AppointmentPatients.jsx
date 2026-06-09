import React from "react";

const AppointmentPatients = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">All Patients</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Patient ID
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td colSpan="4" className="px-6 py-8 text-center text-gray-600">
                No patients found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppointmentPatients;
