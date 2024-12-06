import React, { useState, useEffect } from "react";
import { PiArrowArcLeft } from "react-icons/pi";
import { adminServices } from "../services/adminServices";
import { getAllClasses } from "../services/classService";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

const AddTeachersForm = () => {
  const navigate = useNavigate();
  const showToast = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNo: "",
    subject: "",
    salary: "",
    address: "",
    govId: "",
    joinDate: "",
    classes: [],
    leadClass: "",
  });

  const [errors, setErrors] = useState({});
  const [classesData, setClassesData] = useState([]);
  const [selectedClassSubjects, setSelectedClassSubjects] = useState({});
  const [loading, setLoading] = useState(false); // Add loading state

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const classesData = await getAllClasses();
      console.log("ClassesData:", classesData.data);
      setClassesData(classesData.data);

      // Initialize selectedClassSubjects
      const subjectsMap = classesData.data.reduce((acc, classItem) => {
        acc[classItem._id] = classItem.subjects || [];
        return acc;
      }, {});
      setSelectedClassSubjects(subjectsMap);
    } catch (err) {
      console.error(err);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Teacher name is required";

    const emailRegex = /.+@.+\..+/;
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Invalid email address";

    const phoneRegex = /^\d{10}$/;
    if (!formData.phoneNo.trim())
      newErrors.phoneNo = "Phone number is required";
    else if (!phoneRegex.test(formData.phoneNo))
      newErrors.phoneNo = "Phone number must be 10 digits";

    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.salary) newErrors.salary = "Salary is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.govId.trim()) newErrors.govId = "Government ID is required";
    if (!formData.joinDate) newErrors.joinDate = "Join date is required";
    if (formData.classes.length === 0)
      newErrors.classes = "Please assign at least one class";
    if (!formData.leadClass) newErrors.leadClass = "Please select a lead class";

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === "salary") {
      processedValue = value ? Number(value) : "";
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleClassSelection = (classId, subjectId) => {
    setFormData((prev) => {
      const classIndex = prev.classes.findIndex((c) => c.class === classId);
      if (classIndex === -1) {
        return {
          ...prev,
          classes: [...prev.classes, { class: classId, subject: subjectId }],
        };
      }
      const updatedClasses = [...prev.classes];
      updatedClasses[classIndex] = { class: classId, subject: subjectId };
      return { ...prev, classes: updatedClasses };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      setLoading(true); // Set loading to true
      try {
        await adminServices.addTeacher(formData);
        showToast("Teacher created successfully", "success");
        navigate("/teachers");
      } catch (error) {
        showToast(error.message || "Error saving teacher", "error");
        console.error("Error saving teacher:", error);
      } finally {
        setLoading(false); // Reset loading
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
          Teacher Registration
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
                Email<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Phone Number<span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phoneNo"
                value={formData.phoneNo}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Enter 10-digit number"
              />
              {errors.phoneNo && (
                <p className="text-red-500 text-sm mt-1">{errors.phoneNo}</p>
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

            <div>
              <label className="block text-sm font-medium mb-1">
                Salary<span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Enter salary amount"
              />
              {errors.salary && (
                <p className="text-red-500 text-sm mt-1">{errors.salary}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Join Date<span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="joinDate"
                value={formData.joinDate}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.joinDate && (
                <p className="text-red-500 text-sm mt-1">{errors.joinDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Address<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Enter full address"
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Government ID<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="govId"
                value={formData.govId}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Enter ID number"
              />
              {errors.govId && (
                <p className="text-red-500 text-sm mt-1">{errors.govId}</p>
              )}
            </div>
          </div>

          {/* Class Assignments */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Assign Classes & Subjects<span className="text-red-500">*</span>
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {classesData.map((classItem) => (
                  <div
                    key={classItem._id}
                    className="flex items-center space-x-4 p-2 border rounded"
                  >
                    <input
                      type="checkbox"
                      checked={formData.classes.some(
                        (c) => c.class === classItem._id
                      )}
                      onChange={(e) => {
                        if (e.target.checked) {
                          // Default to first subject if exists
                          const defaultSubject = classItem.subjects?.[0]?._id;
                          handleClassSelection(classItem._id, defaultSubject);
                        } else {
                          setFormData((prev) => ({
                            ...prev,
                            classes: prev.classes.filter(
                              (c) => c.class !== classItem._id
                            ),
                            leadClass:
                              prev.leadClass === classItem._id
                                ? ""
                                : prev.leadClass,
                          }));
                        }
                      }}
                      className="form-checkbox h-4 w-4"
                    />
                    <span>
                      {classItem.name}-{classItem.section}
                    </span>

                    {/* Subjects Dropdown */}
                    {formData.classes.some(
                      (c) => c.class === classItem._id
                    ) && (
                      <div className="flex items-center space-x-2">
                        <select
                          value={
                            formData.classes.find(
                              (c) => c.class === classItem._id
                            )?.subject || ""
                          }
                          onChange={(e) =>
                            handleClassSelection(classItem._id, e.target.value)
                          }
                          className="ml-4 p-1 border rounded flex-grow"
                        >
                          <option value="">Select Subject</option>
                          {selectedClassSubjects[classItem._id]?.map(
                            (subject) => (
                              <option key={subject._id} value={subject._id}>
                                {subject.subjectName}
                              </option>
                            )
                          )}
                        </select>

                        {/* Subjects Display */}
                        {/* <div className="text-sm text-gray-600">
                          Subjects:{" "}
                          {selectedClassSubjects[classItem._id]
                            ?.map((subject) => subject.name)
                            .join(", ") || "No subjects"}
                        </div> */}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {errors.classes && (
                <p className="text-red-500 text-sm mt-1">{errors.classes}</p>
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
                {formData.classes.map(({ class: classId }) => {
                  const classItem = classesData.find((c) => c._id === classId);
                  return (
                    <option key={classId} value={classId}>
                      {classItem?.name}-{classItem?.section}
                    </option>
                  );
                })}
              </select>
              {errors.leadClass && (
                <p className="text-red-500 text-sm mt-1">{errors.leadClass}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading} // Disable button when loading
            className={`w-full py-2 px-4 rounded font-semibold ${
              loading
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            }`}
          >
            {loading ? "Registering..." : "Register Teacher"} {/* Change text */}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTeachersForm;
