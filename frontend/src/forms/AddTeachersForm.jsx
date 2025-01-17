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
    leadClass: "", // Now optional
  });

  const [errors, setErrors] = useState({});
  const [classesData, setClassesData] = useState([]);
  const [selectedClassSubjects, setSelectedClassSubjects] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const classesData = await getAllClasses();
      setClassesData(classesData.data);
      const subjectsMap = classesData.data.reduce((acc, classItem) => {
        acc[classItem._id] = classItem.subjects || [];
        return acc;
      }, {});
      setSelectedClassSubjects(subjectsMap);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch classes", "error");
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
      setLoading(true);
      try {
        let response =await adminServices.addTeacher(formData);
        if(!response.success){
          showToast(response.error || "Error registering teacher", "error");
          return;
        }
        showToast("Teacher registered successfully", "success");
        navigate("/teachers");
      } catch (error) {
        showToast(error.message || "Error registering teacher", "error");
      } finally {
        setLoading(false);
      }
    } else {
      setErrors(newErrors);
      showToast("Please fill all required fields", "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate("/teachers")}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
      >
        <PiArrowArcLeft className="w-5 h-5 mr-2" />
        Back to Teachers
      </button>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">
          Teacher Registration
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Name<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter full name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Email<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Phone Number<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNo"
                  value={formData.phoneNo}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter 10-digit number"
                />
                {errors.phoneNo && (
                  <p className="text-red-500 text-sm">{errors.phoneNo}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Government ID<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  name="govId"
                  value={formData.govId}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter ID number"
                />
                {errors.govId && (
                  <p className="text-red-500 text-sm">{errors.govId}</p>
                )}
              </div>
            </div>
          </div>

          {/* Professional Information Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">
              Professional Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Subject<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter primary subject"
                />
                {errors.subject && (
                  <p className="text-red-500 text-sm">{errors.subject}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Salary<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter salary amount"
                />
                {errors.salary && (
                  <p className="text-red-500 text-sm">{errors.salary}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Join Date<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="date"
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {errors.joinDate && (
                  <p className="text-red-500 text-sm">{errors.joinDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Address<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter full address"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm">{errors.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Class Assignment Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">
              Class Assignments
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Assign Classes & Subjects
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="space-y-3 max-h-48 overflow-y-auto p-4 border border-gray-200 rounded-lg">
                  {classesData.map((classItem) => (
                    <div
                      key={classItem._id}
                      className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.classes.some(
                          (c) => c.class === classItem._id
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
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
                        className="form-checkbox h-5 w-5 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 font-medium">
                        {classItem.name}-{classItem.section}
                      </span>

                      {formData.classes.some(
                        (c) => c.class === classItem._id
                      ) && (
                        <select
                          value={
                            formData.classes.find(
                              (c) => c.class === classItem._id
                            )?.subject || ""
                          }
                          onChange={(e) =>
                            handleClassSelection(classItem._id, e.target.value)
                          }
                          className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      )}
                    </div>
                  ))}
                </div>
                {errors.classes && (
                  <p className="text-red-500 text-sm">{errors.classes}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Lead Class <span className="text-gray-400">(Optional)</span>
                </label>
                <select
                  value={formData.leadClass}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      leadClass: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Lead Class (Optional)</option>
                  {formData.classes.map(({ class: classId }) => {
                    const classItem = classesData.find(
                      (c) => c._id === classId
                    );
                    return (
                      <option key={classId} value={classId}>
                        {classItem?.name}-{classItem?.section}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white shadow-lg hover:shadow-xl"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Registering Teacher...
                </span>
              ) : (
                "Register Teacher"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeachersForm;
