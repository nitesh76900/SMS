import { useState, useEffect } from "react";
import {
  CustomButton,
  CustomInput,
  ProgressSteps,
  CustomCard,
} from "../components/SharedComponents";
import { useNavigate } from "react-router-dom";
import staffServices from "../services/staffServices";
import { useToast } from "../context/ToastContext";

const AddStaffForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNo: "",
    joinDate: new Date().toISOString().split("T")[0],
    department: "",
    position: "",
    salary: "",
    address: "",
    govId: "",
  });
  const [errors, setErrors] = useState({});
  const steps = [
    "Basic Info",
    "Department & Role",
    "Additional Details",
    "Review",
  ];
  const showToast = useToast();

  // Fetch departments when component mounts
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await staffServices.getAllStaff();
        console.log("Departments:", response.data);
        setDepartments(response.data);
        setLoading(false);
        showToast("Departments loaded successfully", "success");
      } catch (err) {
        console.error("Failed to fetch departments:", err);
        setLoading(false);
        showToast("Failed to fetch departments", "error");
      }
    };

    fetchDepartments();
  }, []);

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 0) {
      if (!formData.name) newErrors.name = "Name is required";
      if (!formData.email) newErrors.email = "Email is required";
      if (!formData.email.match(/.+@.+\..+/))
        newErrors.email = "Invalid email format";
      if (!formData.phoneNo) newErrors.phoneNo = "Phone number is required";
      if (!formData.phoneNo.match(/^\d{10}$/))
        newErrors.phoneNo = "Phone must be 10 digits";
    } else if (step === 1) {
      if (!formData.department) newErrors.department = "Department is required";
      if (!formData.position) newErrors.position = "Position is required";
    } else if (step === 2) {
      if (!formData.salary) newErrors.salary = "Salary is required";
      if (!formData.address) newErrors.address = "Address is required";
      if (!formData.govId) newErrors.govId = "Government ID is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    console.log("departments", departments);
    console.log("formData", formData);

    // Validate only for the current step
    if (validateStep(currentStep)) {
      // Only move to the next step, do not submit the form
      if (currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
      }
    } else {
      showToast("Please fill all required fields correctly", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure we are on the last step
    if (currentStep === steps.length - 1) {
      if (validateStep(currentStep)) {
        try {
          // Find the department object based on selected department ID
          const selectedDepartment = departments.find(
            (dept) => dept._id === formData.department
          );

          // Prepare the staff data
          const staffData = {
            ...formData,
            department: selectedDepartment._id, // Send department name instead of ID
            status: "Active", // Add default status
          };

          // Call the addStaff service
          await staffServices.addStaff(staffData);
          showToast("Staff member added successfully", "success");

          // Navigate back to staff list
          navigate("/staff");
        } catch (error) {
          showToast(error.message || "Failed to add staff member", "error");
          console.error("Error adding staff:", error);
        }
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <CustomInput
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
            />
            <CustomInput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />
            <CustomInput
              label="Phone Number"
              name="phoneNo"
              value={formData.phoneNo}
              onChange={handleChange}
              error={errors.phoneNo}
            />
            <CustomInput
              label="Join Date"
              name="joinDate"
              type="date"
              value={formData.joinDate}
              onChange={handleChange}
            />
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Department</option>
                {departments
                  .filter(
                    (dept) =>
                      dept.name !== "Teaching" && dept.name !== "Administration"
                  )
                  .map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
              </select>

              {errors.department && (
                <p className="text-sm text-red-600">{errors.department}</p>
              )}
            </div>
            <CustomInput
              label="Position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              error={errors.position}
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <CustomInput
              label="Salary"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              error={errors.salary}
            />
            <CustomInput
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              error={errors.address}
            />
            <CustomInput
              label="Government ID"
              name="govId"
              value={formData.govId}
              onChange={handleChange}
              error={errors.govId}
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Review Information</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(formData).map(([key, value]) => {
                // Get department name instead of ID for display
                if (key === "department" && value) {
                  const dept = departments.find((d) => d._id === value);
                  value = dept ? dept.name : value;
                }
                return (
                  <div key={key} className="border-b pb-2">
                    <div className="text-sm text-gray-500 capitalize">
                      {key.replace(/([A-Z])/g, " $1")}
                    </div>
                    <div className="font-medium">{value || "-"}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center mb-6">
        <CustomButton
          variant="secondary"
          onClick={() => navigate("/staff")}
          className="mr-4"
        >
          ←
        </CustomButton>
        <h1 className="text-2xl font-bold">Add New Staff Member</h1>
      </div>

      <CustomCard>
        <ProgressSteps steps={steps} currentStep={currentStep} />

        <form className="space-y-6">
          {renderStepContent()}

          <div className="flex justify-between mt-8">
            <CustomButton
              type="button"
              variant="secondary"
              onClick={() =>
                currentStep > 0 && setCurrentStep((prev) => prev - 1)
              }
              disabled={currentStep === 0}
            >
              Previous
            </CustomButton>

            {currentStep === steps.length - 1 ? (
              <CustomButton type="submit" onClick={handleSubmit}>
                Submit
              </CustomButton>
            ) : (
              <CustomButton type="button" onClick={handleNext}>
                Next
              </CustomButton>
            )}
          </div>
        </form>
      </CustomCard>
    </div>
  );
};

export default AddStaffForm;
