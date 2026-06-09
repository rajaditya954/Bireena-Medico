import React, { useState, useEffect } from "react";

const PatientQueue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQueue();
    // Refresh queue every 30 seconds
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await appointmentService.getPatientQueue();
      // setQueue(response.data);
      setQueue([]);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching queue:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsServed = async (patientId) => {
    try {
      // TODO: Replace with actual API call
      // await appointmentService.markAsServed(patientId);
      fetchQueue();
    } catch (err) {
      setError(err.message);
      console.error("Error marking patient as served:", err);
    }
  };

  const handleMoveToNext = async (patientId) => {
    try {
      // TODO: Replace with actual API call
      // await appointmentService.movePatientInQueue(patientId, 'next');
      fetchQueue();
    } catch (err) {
      setError(err.message);
      console.error("Error moving patient:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Queue</h1>
        <p className="text-gray-600">
          Total patients in queue: <span className="font-bold text-lg">{queue.length}</span>
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {queue.length === 0 ? (
          <div className="p-6 text-center text-gray-500 bg-white rounded-lg shadow-md">
            No patients in queue.
          </div>
        ) : (
          queue.map((patient, index) => (
            <div
              key={patient._id}
              className={`p-6 rounded-lg shadow-md border-2 ${
                index === 0
                  ? "bg-green-50 border-green-500"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-lg font-bold text-gray-900">
                      #{index + 1}
                    </span>
                    {index === 0 && (
                      <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                        Now Serving
                      </span>
                    )}
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mb-1">
                    {patient.patientName}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    ID: {patient.patientId}
                  </p>
                  <p className="text-sm text-gray-600">
                    Appointment Time:{" "}
                    {new Date(patient.appointmentTime).toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Doctor: {patient.doctorName}
                  </p>
                </div>
                <div className="space-y-2">
                  {index === 0 && (
                    <button
                      onClick={() => handleMarkAsServed(patient._id)}
                      className="block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                    >
                      Mark as Served
                    </button>
                  )}
                  {index > 0 && (
                    <button
                      onClick={() => handleMoveToNext(patient._id)}
                      className="block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                    >
                      Move Up
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PatientQueue;
