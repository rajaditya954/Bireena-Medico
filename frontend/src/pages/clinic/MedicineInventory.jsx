import React, { useState, useEffect } from "react";

const MedicineInventory = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    unitPrice: "",
    batchNumber: "",
    expiryDate: "",
  });

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await clinicService.getMedicines();
      // setMedicines(response.data);
      setMedicines([]);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching medicines:", err);
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

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    try {
      // TODO: Replace with actual API call
      // await clinicService.addMedicine(formData);
      setFormData({
        name: "",
        quantity: "",
        unitPrice: "",
        batchNumber: "",
        expiryDate: "",
      });
      setShowForm(false);
      fetchMedicines();
    } catch (err) {
      setError(err.message);
      console.error("Error adding medicine:", err);
    }
  };

  const handleUpdateQuantity = async (medicineId, newQuantity) => {
    try {
      // TODO: Replace with actual API call
      // await clinicService.updateMedicine(medicineId, { quantity: newQuantity });
      fetchMedicines();
    } catch (err) {
      setError(err.message);
      console.error("Error updating medicine:", err);
    }
  };

  const handleDeleteMedicine = async (medicineId) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      try {
        // TODO: Replace with actual API call
        // await clinicService.deleteMedicine(medicineId);
        fetchMedicines();
      } catch (err) {
        setError(err.message);
        console.error("Error deleting medicine:", err);
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
        <h1 className="text-3xl font-bold text-gray-900">Medicine Inventory</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
        >
          {showForm ? "Cancel" : "Add Medicine"}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleAddMedicine}
          className="bg-white p-6 rounded-lg shadow-md space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medicine Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
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
                Unit Price
              </label>
              <input
                type="number"
                step="0.01"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch Number
            </label>
            <input
              type="text"
              name="batchNumber"
              value={formData.batchNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date
            </label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Add Medicine
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {medicines.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No medicines in inventory. Add one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Medicine Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Batch Number
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Expiry Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((medicine) => (
                  <tr
                    key={medicine._id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {medicine.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {medicine.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      ₹{medicine.unitPrice}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {medicine.batchNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(medicine.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() =>
                          handleDeleteMedicine(medicine._id)
                        }
                        className="text-red-600 hover:text-red-900 transition"
                      >
                        Delete
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

export default MedicineInventory;
