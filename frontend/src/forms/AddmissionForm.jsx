import React, { useState, useEffect } from "react";
import { adminServices } from "../services/adminServices";
import {
  FaUserGraduate,
  FaEnvelope,
  FaPhone,
  FaBirthdayCake,
  FaVenusMars,
  FaHome,
  FaUserCircle,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaMoneyBillWave,
} from "react-icons/fa";
import { useToast } from "../context/ToastContext";
import { getAllClasses } from "../services/classService";
import { useNavigate } from "react-router-dom";
const AdmissionForm = () => {
  const [classes, setClasses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const showToast = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    studentemail: "",
    studentPhone: "",
    admissionYear: "",
    gender: "",
    studentAddress: "",
    fatherName: "",
    motherName: "",
    parentEmail: "",
    parentPhone: "",
    parentAddress: "",
    classId: "",
    dob: "",
    batch: "",
    admissionFee: 0,
    tuitionFee: 0,
    computerFee: 0,
    examFee: 0,
    fine: 0,
    miscellaneous: 0,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await getAllClasses();
      console.log("Classes:", response.data);
      if (response && response.data) {
        setClasses(response.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total fee
  const calculateTotalFee = () => {
    const {
      admissionFee,
      tuitionFee,
      computerFee,
      examFee,
      fine,
      miscellaneous,
    } = formData;
    return (
      parseFloat(admissionFee) +
      parseFloat(tuitionFee) +
      parseFloat(computerFee) +
      parseFloat(examFee) +
      parseFloat(fine) +
      parseFloat(miscellaneous)
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Clear any existing error for the field
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name) {
      newErrors.name = "Student name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    }

    // Email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!formData.studentemail) {
      newErrors.studentemail = "Email is required";
    } else if (!emailRegex.test(formData.studentemail)) {
      newErrors.studentemail = "Please enter a valid email address";
    }

    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!formData.studentPhone) {
      newErrors.studentPhone = "Phone number is required";
    } else if (!phoneRegex.test(formData.studentPhone)) {
      newErrors.studentPhone = "Please enter a valid 10-digit mobile number";
    }

    // Admission year validation
    if (!formData.admissionYear) {
      newErrors.admissionYear = "Admission year is required";
    } else if (
      isNaN(formData.admissionYear) ||
      formData.admissionYear < 1900 ||
      formData.admissionYear > new Date().getFullYear()
    ) {
      newErrors.admissionYear = "Please enter a valid admission year";
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    // Student address validation
    if (!formData.studentAddress) {
      newErrors.studentAddress = "Student address is required";
    }

    // Father's name validation
    if (!formData.fatherName) {
      newErrors.fatherName = "Father's name is required";
    } else if (formData.fatherName.length < 2) {
      newErrors.fatherName = "Father's name must be at least 2 characters long";
    }

    // Mother's name validation
    if (!formData.motherName) {
      newErrors.motherName = "Mother's name is required";
    } else if (formData.motherName.length < 2) {
      newErrors.motherName = "Mother's name must be at least 2 characters long";
    }

    // Parent email validation
    if (!formData.parentEmail) {
      newErrors.parentEmail = "Parent's email is required";
    } else if (!emailRegex.test(formData.parentEmail)) {
      newErrors.parentEmail = "Please enter a valid email address";
    }

    // Parent phone validation
    if (!formData.parentPhone) {
      newErrors.parentPhone = "Parent's phone number is required";
    } else if (!phoneRegex.test(formData.parentPhone)) {
      newErrors.parentPhone = "Please enter a valid 10-digit mobile number";
    }

    // Parent address validation
    if (!formData.parentAddress) {
      newErrors.parentAddress = "Parent's address is required";
    }

    // Class validation
    if (!formData.classId) {
      newErrors.classId = "Class is required";
    }

    // Date of birth validation
    if (!formData.dob) {
      newErrors.dob = "Date of birth is required";
    } else {
      const dobDate = new Date(formData.dob);
      const currentDate = new Date();
      if (dobDate >= currentDate) {
        newErrors.dob = "Please enter a valid date of birth";
      }
    }

    // Batch validation
    if (!formData.batch) {
      newErrors.batch = "Batch is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        console.log("Student Addmision Data:", formData);
        const response = await adminServices.studentAdmission(formData);

        if (response.success) {
          showToast("Student admission completed successfully", "success");
          // Reset form or redirect
          setFormData({
            name: "",
            studentemail: "",
            studentPhone: "",
            admissionYear: "",
            gender: "",
            studentAddress: "",
            fatherName: "",
            motherName: "",
            parentEmail: "",
            parentPhone: "",
            parentAddress: "",
            classId: "",
            dob: "",
            batch: "",
            admissionFee: 0,
            tuitionFee: 0,
            computerFee: 0,
            examFee: 0,
            fine: 0,
            miscellaneous: 0,
          });
          navigate("/students");
        } else {
          showToast(response.error, "error");
          // If there are specific field errors in the response, update the errors state
          if (response.fieldErrors) {
            setErrors(response.fieldErrors);
          }
        }
      } catch (error) {
        showToast("An unexpected error occurred. Please try again.", "error");
        console.error("Admission submission error:", error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setErrors(newErrors);
      // Scroll to the first error
      const firstError = document.querySelector(".text-red-500");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <FaUserGraduate className="mr-2" />
        Student Admission Form
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaUserGraduate className="inline mr-2" />
              Student Name
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter student name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaEnvelope className="inline mr-2" />
              Email
              <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="studentemail"
              value={formData.studentemail}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter email address"
            />
            {errors.studentemail && (
              <p className="text-red-500 text-sm mt-1">{errors.studentemail}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaPhone className="inline mr-2" />
              Phone Number
              <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="studentPhone"
              value={formData.studentPhone}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter 10-digit phone number"
            />
            {errors.studentPhone && (
              <p className="text-red-500 text-sm mt-1">{errors.studentPhone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaCalendarAlt className="inline mr-2" />
              Admission Year
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="admissionYear"
              value={formData.admissionYear}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter admission year"
            />
            {errors.admissionYear && (
              <p className="text-red-500 text-sm mt-1">
                {errors.admissionYear}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaVenusMars className="inline mr-2" />
              Gender
              <span className="text-red-500">*</span>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && (
              <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
            )}
          </div>

          {/* Class Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaChalkboardTeacher className="inline mr-2" />
              Class
              <span className="text-red-500">*</span>
            </label>
            <select
              name="classId"
              value={formData.classId}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {classes &&
                classes.map((cls, index) => {
                  return (
                    <option key={index} value={cls._id}>
                      {cls.name}-{cls.section}
                    </option>
                  );
                })}
            </select>
            {errors.classId && (
              <p className="text-red-500 text-sm mt-1">{errors.classId}</p>
            )}
          </div>

          {/* Date of Birth Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaBirthdayCake className="inline mr-2" />
              Date of Birth
              <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.dob && (
              <p className="text-red-500 text-sm mt-1">{errors.dob}</p>
            )}
          </div>

          {/* Batch Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaCalendarAlt className="inline mr-2" />
              Batch
            </label>
            <input
              type="text"
              name="batch"
              value={formData.batch}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter batch"
            />
            {errors.batch && (
              <p className="text-red-500 text-sm mt-1">{errors.batch}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaHome className="inline mr-2" />
              Student's Address
              <span className="text-red-500">*</span>
            </label>
            <textarea
              name="studentAddress"
              value={formData.studentAddress}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter student's address"
              rows="3"
            />
            {errors.studentAddress && (
              <p className="text-red-500 text-sm mt-1">
                {errors.studentAddress}
              </p>
            )}
          </div>
        </div>
        {/* Parent Details */}
        <div className="border-b pb-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaUserCircle className="mr-2" />
            Parent Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaUserCircle className="inline mr-2" />
                Father's Name
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter father's name"
              />
              {errors.fatherName && (
                <p className="text-red-500 text-sm mt-1">{errors.fatherName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaUserCircle className="inline mr-2" />
                Mother's Name
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="motherName"
                value={formData.motherName}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter mother's name"
              />
              {errors.motherName && (
                <p className="text-red-500 text-sm mt-1">{errors.motherName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaEnvelope className="inline mr-2" />
                Parent's Email
                <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="parentEmail"
                value={formData.parentEmail}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter parent's email"
              />
              {errors.parentEmail && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.parentEmail}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaPhone className="inline mr-2" />
                Parent's Phone
                <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter parent's phone number"
              />
              {errors.parentPhone && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.parentPhone}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaHome className="inline mr-2" />
                Parent's Address
                <span className="text-red-500">*</span>
              </label>
              <textarea
                name="parentAddress"
                value={formData.parentAddress}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter parent's address"
                rows="3"
              />
              {errors.parentAddress && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.parentAddress}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Fee Structure Section */}
        <div className="border-b pb-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaMoneyBillWave className="mr-2" />
            Fee Structure
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              "admissionFee",
              "tuitionFee",
              "computerFee",
              "examFee",
              "fine",
              "miscellaneous",
            ].map((feeField) => (
              <div key={feeField}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {feeField.replace(/([A-Z])/g, " $1").trim()}
                </label>
                <input
                  type="number"
                  name={feeField}
                  value={formData[feeField]}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Enter ${feeField}`}
                />
              </div>
            ))}

            {/* Total Fee Display */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Fee
              </label>
              <input
                type="text"
                readOnly
                value={`₹ ${calculateTotalFee()}`}
                className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdmissionForm;
