import React, { useState, useEffect } from "react";
import DriverService from "../../services/DriverService";
import { toast } from "react-hot-toast";

const DriverForm = ({ onClose, onSave, driverId }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNo: "",
    address: "",
    govId: "",
    licenseNumber: "",
    experience: "",
    dateOfBirth: "",
    licenseExpiryDate: "",
    salary: "",
    img: null,
  });

  useEffect(() => {
    if (driverId) {
      fetchDriverData();
    }
  }, [driverId]);

  const fetchDriverData = async () => {
    try {
      setLoading(true);
      const response = await DriverService.getDriver(driverId);
      const driver = response.data;

      const formatDate = (date) =>
        date ? new Date(date).toISOString().split("T")[0] : "";

      setFormData({
        name: driver.staffId.name || "",
        email: driver.staffId.email || "",
        phoneNo: driver.staffId.phoneNo || "",
        address: driver.staffId.address || "",
        govId: driver.staffId.govId || "",
        licenseNumber: driver.licenseNumber || "",
        experience: driver.experience || "",
        dateOfBirth: formatDate(driver.dateOfBirth) || "",
        licenseExpiryDate: formatDate(driver.licenseExpiryDate) || "",
        salary: driver.staffId.salary || "",
        img: driver?.img.url || null,
      });
    } catch (error) {
      toast.error("Failed to fetch driver details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, img: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true); // Set loading to true
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      let response;
      if (driverId) {
        response = await DriverService.updateDriver(driverId, data);
      } else {
        response = await DriverService.addDriver(data);
      }

      toast.success(
        driverId ? "Driver updated successfully" : "Driver added successfully"
      );
      onSave(response.data);
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to save driver");
    } finally {
      setLoading(false); // Set loading back to false
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed left-60 inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            {driverId ? "Edit Driver" : "Add New Driver"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phoneNo"
                    value={formData.phoneNo}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Government ID
                  </label>
                  <input
                    type="text"
                    name="govId"
                    value={formData.govId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                Professional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Number
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience (years)
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Expiry Date
                  </label>
                  <input
                    type="date"
                    name="licenseExpiryDate"
                    value={formData.licenseExpiryDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary
                  </label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Photo Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Photo</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                {formData?.img && (
                  <div className="flex justify-center">
                    <img
                      src={
                        formData?.img instanceof File
                          ? URL.createObjectURL(formData?.img)
                          : formData?.img
                      }
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                disabled={loading} // Disable the button when loading
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DriverForm;
