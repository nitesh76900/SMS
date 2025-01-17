import React, { useEffect, useState } from "react";
import { PiArrowArcLeft } from "react-icons/pi";
import { adminServices } from "../services/adminServices";
import { getAllClasses } from "../services/classService";
import { useNavigate, useParams } from "react-router-dom";
import teacherService from "../services/teacherService";
import { useToast } from "../context/ToastContext";

const AddTeachersForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    registrationNumber: "",
    subject: "",
    assignedClasses: [],
    leadClass: "",
    role: "teacher",
    salary: "",
  });

  const [errors, setErrors] = useState({});
  const [classesData, setClassesData] = useState([]);
  const showToast = useToast();

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      fetchTeacherData();
    }
    fetchClasses();
  }, [id]);

  const fetchTeacherData = async () => {
    try {
      const response = await teacherService.getTeacherById(id);
      const teacherData = response.data;
      // Transform the incoming data to match form structure
      setFormData({
        name: teacherData.name,
        registrationNumber: teacherData.registrationNumber,
        subject: teacherData.subject,
        assignedClasses: teacherData.assignedClass.map((cls) => ({
          _id: cls._id,
          name: cls.name,
          section: cls.section,
        })),
        leadClass: teacherData.leadClass._id,
        role: teacherData.role,
        staffId:teacherData.staffId._id,
        salary: teacherData.staffId.salary,
      });
    } catch (error) {
      showToast("Error fetching teacher details", "error");
      console.error("Error fetching teacher data:", error);
    }
  };

  const fetchClasses = async () => {
    try {
      const classesData = await getAllClasses();
      setClassesData(classesData.data);
    } catch (err) {
      console.error(err);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Teacher name is required";
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (formData.assignedClasses.length === 0) {
      newErrors.assignedClasses = "Please assign at least one class";
    }
    if (!formData.leadClass) {
      newErrors.leadClass = "Please select a lead class";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleClassSelection = (classData, isChecked) => {
    setFormData((prev) => {
      let updatedClasses;
      if (isChecked) {
        updatedClasses = [...prev.assignedClasses, classData];
      } else {
        updatedClasses = prev.assignedClasses.filter(
          (c) => c._id !== classData._id
        );
        // If removed class was lead class, reset lead class
        if (prev.leadClass === classData._id) {
          return {
            ...prev,
            assignedClasses: updatedClasses,
            leadClass: "",
          };
        }
      }
      return {
        ...prev,
        assignedClasses: updatedClasses,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      try {
        const submissionData = {
          ...formData,
          assignedClass: formData.assignedClasses.map((cls) => cls._id),
          leadClass: formData.leadClass,
        };

        if (isEditing) {
          await teacherService.updateTeacher(id, submissionData);
          showToast("Teacher updated successfully", "success");
        } else {
          await adminServices.addTeacher(submissionData);
          showToast("Teacher created successfully", "success");
        }
        navigate("/teachers");
      } catch (error) {
        showToast(error.message || "Error saving teacher", "error");
        console.error("Error saving teacher:", error);
      }
    } else {
      setErrors(newErrors);
      showToast("Please fill all required fields", "error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button
        onClick={() => navigate("/teachers")}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-800"
      >
        <PiArrowArcLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {isEditing ? "Edit Teacher" : "Teacher Registration"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Basic Information */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Enter full name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Subject<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Enter primary subject"
              />
              {errors.subject && (
                <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
              )}
            </div>

            {isEditing && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Registration Number
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  disabled
                  className="w-full p-2 border rounded bg-gray-100"
                />
              </div>
            )}
          </div>

          {/* Class Assignments */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Assign Classes<span className="text-red-500">*</span>
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {classesData.map((classItem) => (
                  <div
                    key={classItem._id}
                    className="flex items-center space-x-4 p-2 border rounded"
                  >
                    <input
                      type="checkbox"
                      checked={formData.assignedClasses.some(
                        (c) => c._id === classItem._id
                      )}
                      onChange={(e) => {
                        handleClassSelection(classItem, e.target.checked);
                      }}
                      className="form-checkbox h-4 w-4"
                    />
                    <span>{`${classItem.name} - Section ${classItem.section}`}</span>
                  </div>
                ))}
              </div>
              {errors.assignedClasses && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.assignedClasses}
                </p>
              )}
            </div>

            {/* Lead Class Selection */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Lead Class<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.leadClass}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    leadClass: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Lead Class</option>
                {formData.assignedClasses.map((classItem) => (
                  <option key={classItem._id} value={classItem._id}>
                    {`${classItem.name} - Section ${classItem.section}`}
                  </option>
                ))}
              </select>
              {errors.leadClass && (
                <p className="text-red-500 text-sm mt-1">{errors.leadClass}</p>
              )}
            </div>
          </div>
          <div>
                <label className="block text-sm font-medium mb-1">
                  teacher salary
                </label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  className="w-full p-2 border rounded bg-gray-100"
                  onChange={(e) => setFormData(prev => ({
                    ...prev, 
                    salary: e.target.value
                  }))}
                />
              </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors font-semibold"
          >
            {isEditing ? "Update Teacher" : "Register Teacher"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTeachersForm;
