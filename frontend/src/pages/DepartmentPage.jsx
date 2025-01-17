import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import staffServices from "../services/staffServices";
import { useToast } from "../context/ToastContext";

const DepartmentPage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const showToast = useToast();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await staffServices.getAllStaff();
        const departmentsData = response.data;
        console.log(departmentsData)

        // Format departments with staff count
        const formattedDepartments = departmentsData.map((dept) => ({
          _id: dept._id,
          name: dept.name,
          staff: dept.staffMembers.length,
        }));

        setDepartments(formattedDepartments);
        showToast("Departments loaded successfully", "success");
      } catch (err) {
        showToast("Failed to fetch departments", "error");
        setError("Failed to fetch departments");
        console.error("Department fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (newDepartmentName.trim()) {
      try {
        await staffServices.addDepartment({ name: newDepartmentName });
        showToast("Department added successfully", "success");
        setDepartments([...departments, { name: newDepartmentName, staff: 0 }]);
        setNewDepartmentName("");
        setIsModalOpen(false);
      } catch (err) {
        showToast("Failed to add department", "error");
        console.error("Add department error:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/staff")}
            className="p-2 mr-4 hover:bg-gray-100 rounded"
          >
            ←&nbsp;Back
          </button>
          <h1 className="text-2xl font-bold">Departments</h1>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          + Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {departments.map((dept, index) => (
          <div
            key={index}
            onClick={() =>
              navigate(`/staff-list/${encodeURIComponent(dept.name)}`)
            }
            className="p-6 border rounded-lg cursor-pointer hover:shadow-md transition-all bg-white"
          >
            <h3 className="text-lg font-semibold mb-2">{dept.name}</h3>
            <p className="text-gray-600">Staff: {dept.staff}</p>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Department</h2>
            <form onSubmit={handleAddDepartment}>
              <input
                type="text"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
                placeholder="Enter department name"
                className="w-full p-2 border rounded mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentPage;
