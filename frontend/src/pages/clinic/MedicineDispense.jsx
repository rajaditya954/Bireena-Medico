import React, { useState, useEffect } from "react";

const MedicineDispense = () => {
  const [dispensations, setDispensations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    patientId: "",
    medicineId: "",
    quantity: "",
    dispensedDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  useEffect(() => {
    fetchDispensations();
  }, []);

  const fetchDispensations = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await clinicService.getDispensations();
      // setDispensations(response.data);
      setDispensations([]);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching dispensations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDispenseMedicine = async (e) => {
    e.preventDefault();
    try {
      // TODO: Replace with actual API call
      // await clinicService.dispenseMedicine(formData);
      setFormData({
        patientId: "",
        medicineId: "",
        quantity: "",
        dispensedDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setShowForm(false);
      fetchDispensations();
    } catch (err) {
      setError(err.message);
      console.error("Error dispensing medicine:", err);
    }
  };

  const handleReverseMedicine = async (dispensationId) => {
    if (window.confirm("Are you sure you want to reverse this dispensation?")) {
      try {
        // TODO: Replace with actual API call
        // await clinicService.reverseDispensation(dispensationId);
        fetchDispensations();
      } catch (err) {
        setError(err.message);
        console.error("Error reversing dispensation:", err);
      }
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Medicine Dispense</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
        >
          {showForm ? "Cancel" : "Dispense Medicine"}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleDispenseMedicine}
          className="bg-white p-6 rounded-lg shadow-md space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient ID
            </label>
            <input
              type="text"
              name="patientId"
              value={formData.patientId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medicine ID
            </label>
            <input
              type="text"
              name="medicineId"
              value={formData.medicineId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dispensed Date
              </label>
              <input
                type="date"
                name="dispensedDate"
                value={formData.dispensedDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              rows="3"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Dispense Medicine
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {dispensations.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No dispensations recorded. Dispense a medicine to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Patient ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Medicine
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Dispensed Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {dispensations.map((dispensation) => (
                  <tr
                    key={dispensation._id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {dispensation.patientId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {dispensation.medicineName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {dispensation.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(
                        dispensation.dispensedDate
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {dispensation.notes}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() =>
                          handleReverseMedicine(dispensation._id)
                        }
                        className="text-red-600 hover:text-red-900 transition"
                      >
                        Reverse
                      </button>
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

export default MedicineDispense;
