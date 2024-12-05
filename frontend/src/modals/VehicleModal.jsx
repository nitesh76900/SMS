import React from "react";
import { X } from "lucide-react";

export const VehicleModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editingItem,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {editingItem ? "Edit Vehicle" : "Add New Vehicle"}
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    value={formData.type || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="bus">Bus</option>
                    <option value="van">Van</option>
                    <option value="minibus">Minibus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    value={formData.registrationNumber || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registrationNumber: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capacity: parseInt(e.target.value),
                      })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fuel Type
                  </label>
                  <select
                    value={formData.fuelType || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, fuelType: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Select fuel type</option>
                    <option value="diesel">Diesel</option>
                    <option value="petrol">Petrol</option>
                    <option value="electric">Electric</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Daily Fuel Consumption (L)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.dailyFuelConsumption || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dailyFuelConsumption: parseFloat(e.target.value),
                      })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Mileage
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.mileage || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mileage: parseInt(e.target.value),
                      })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Insurance Expiry
                  </label>
                  <input
                    type="date"
                    value={formData.insuranceExpiry || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        insuranceExpiry: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Availability Status
                  </label>
                  <select
                    value={formData.availabilityStatus || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        availabilityStatus: e.target.value,
                      })
                    }
                    Completed
                    VehicleModal
                    Component
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Select status</option>
                    <option value="available">Available</option>
                    <option value="in maintenance">In Maintenance</option>
                    <option value="in use">In Use</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Last Maintenance Date
                  </label>
                  <input
                    type="date"
                    value={formData.lastMaintenanceDate || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lastMaintenanceDate: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <button
                type="submit"
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
              >
                {editingItem ? "Save Changes" : "Add Vehicle"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VehicleModal;
