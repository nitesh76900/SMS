import { useState } from "react";
import {
  PiUser,
  PiPhone,
  PiEnvelope,
  PiBriefcase,
  PiArrowLeft,
  PiUserPlus,
} from "react-icons/pi";
import { addConnection } from "../services/connectionService";
import { useToast } from "../context/ToastContext";

function AddConnectionForm() {
  const showToast = useToast();

  const [formData, setFormData] = useState({
    name: "Bob Green",
    phone: "1122334455",
    email: "bobgreen@example.com",
    profession: "Other", // Capitalized to match select options
    otherProfession: "", // Include this even though it's missing in the initial data
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[-\s]/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.profession) {
      newErrors.profession = "Please select a profession";
    }

    if (formData.profession === "Other" && !formData.otherProfession.trim()) {
      newErrors.otherProfession = "Please specify the profession";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleProfessionChange = (e) => {
    const { value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      profession: value,
      otherProfession: value === "Other" ? "" : prevData.otherProfession,
    }));
    if (errors.profession) {
      setErrors((prev) => ({ ...prev, profession: undefined }));
    }
    showToast(`Selected profession: ${value}`, "info");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const submissionData = {
          name: formData.name,
          email: formData.email,
          profession: formData.profession.toLowerCase(),
          phoneNo: formData.phone,
          ...(formData.profession === "Other" && {
            otherProfession: formData.otherProfession,
          }),
        };
        await addConnection(submissionData);
        showToast("Connection added successfully", "success");
        window.history.back();
      } catch (error) {
        console.log("Error adding connection:", error);
        showToast("Failed to add connection", "error");
      }
    } else {
      showToast("Please fill in all required fields correctly", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <PiArrowLeft className="mr-2 text-lg" />
          Back to Connections
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <PiUserPlus className="text-blue-600 text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Add New Connection
                </h1>
                <p className="text-sm text-gray-500">
                  Fill in the information below to add a new connection
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="name"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PiUser className="text-gray-400 text-lg" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.name ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter full name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="phone"
              >
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PiPhone className="text-gray-400 text-lg" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.phone ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter phone number"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PiEnvelope className="text-gray-400 text-lg" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter email address"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="profession"
              >
                Connection Type
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PiBriefcase className="text-gray-400 text-lg" />
                </div>
                <select
                  id="profession"
                  name="profession"
                  value={formData.profession}
                  onChange={handleProfessionChange}
                  className={`block w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white ${
                    errors.profession ? "border-red-300" : "border-gray-300"
                  }`}
                >
                  <option value="">Select connection type</option>
                  <option value="Student">Student</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Parent">Parent</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              {errors.profession && (
                <p className="mt-1 text-sm text-red-600">{errors.profession}</p>
              )}
            </div>

            {formData.profession === "Other" && (
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="otherProfession"
                >
                  Specify Connection Type
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PiBriefcase className="text-gray-400 text-lg" />
                  </div>
                  <input
                    type="text"
                    id="otherProfession"
                    name="otherProfession"
                    value={formData.otherProfession}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.otherProfession
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                    placeholder="Specify connection type"
                  />
                </div>
                {errors.otherProfession && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.otherProfession}
                  </p>
                )}
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <PiUserPlus className="text-lg" />
                Add Connection
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddConnectionForm;
