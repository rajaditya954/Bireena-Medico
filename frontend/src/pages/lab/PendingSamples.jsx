import React, { useState, useEffect } from "react";

const PendingSamples = () => {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSamples, setSelectedSamples] = useState([]);

  useEffect(() => {
    fetchPendingSamples();
  }, []);

  const fetchPendingSamples = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await labService.getPendingSamples();
      // setSamples(response.data);
      setSamples([]);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching pending samples:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sampleId) => {
    setSelectedSamples((prev) =>
      prev.includes(sampleId)
        ? prev.filter((id) => id !== sampleId)
        : [...prev, sampleId]
    );
  };

  const handleMarkAsProcessed = async () => {
    if (selectedSamples.length === 0) {
      alert("Please select at least one sample");
      return;
    }

    try {
      // TODO: Replace with actual API call
      // await labService.markSamplesAsProcessed(selectedSamples);
      setSelectedSamples([]);
      fetchPendingSamples();
    } catch (err) {
      setError(err.message);
      console.error("Error marking samples as processed:", err);
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
    <div className="min-h-screen bg-[#F2F9F6] -mx-4 -mt-4 p-4 sm:-mx-6 sm:-mt-6 sm:p-6 lg:-mx-8 lg:-mt-8 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#0f281e]">Pending Samples</h1>
        {selectedSamples.length > 0 && (
          <button
            onClick={handleMarkAsProcessed}
            className="px-4 py-2 bg-[#0B4B34] text-white rounded-lg hover:bg-[#063323] transition font-semibold"
          >
            Mark as Processed ({selectedSamples.length})
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {samples.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No pending samples. All samples have been processed!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-100 bg-white">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  <th className="px-6 py-4">
                    <input type="checkbox" className="rounded border-gray-300 text-[#0B4B34] focus:ring-[#0B4B34]" />
                  </th>
                  <th className="px-6 py-4">
                    Sample ID
                  </th>
                  <th className="px-6 py-4">
                    Patient Name
                  </th>
                  <th className="px-6 py-4">
                    Test Type
                  </th>
                  <th className="px-6 py-4">
                    Received Date
                  </th>
                  <th className="px-6 py-4">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {samples.map((sample) => (
                  <tr
                    key={sample._id}
                    className="border-b border-gray-100 transition-colors duration-150 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedSamples.includes(sample._id)}
                        onChange={() => handleSelectSample(sample._id)}
                        className="rounded border-gray-300 text-[#0B4B34] focus:ring-[#0B4B34]"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#0B4B34] font-mono">
                      {sample.sampleId}
                    </td>
                    <td className="px-6 py-4 text-[13px] font-bold text-[#0f281e]">
                      {sample.patientName}
                    </td>
                    <td className="px-6 py-4 text-[13px] font-medium text-[#0f281e]">
                      {sample.testType}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 tabular-nums">
                      {new Date(sample.receivedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                        {sample.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingSamples;
