import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CustomButton,
  CustomCard,
  CustomTable,
  SearchBar,
} from "../components/SharedComponents";
import staffServices from "../services/staffServices";
import { X } from "lucide-react";
import { useToast } from "../context/ToastContext";

const StaffListPage = () => {
  const navigate = useNavigate();
  const { department } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const showToast = useToast();

  useEffect(() => {
    const fetchStaffMembers = async () => {
      try {
        const response = await staffServices.getAllStaff();
        const departments = response.data;

        // Find the specific department and get its staff members
        const departmentData = departments.find(
          (dept) => dept.name === department
        );
        if (departmentData) {
          setStaffMembers(departmentData.staffMembers);
          showToast("Staff members loaded successfully", "success");
        } else {
          showToast("Department not found", "error");
          setError("Department not found");
        }
      } catch (err) {
        showToast("Failed to fetch staff members", "error");
        setError("Failed to fetch staff members");
        console.error("Staff fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffMembers();
  }, [department]);

  const handleDeleteStaff = async (staffId, e) => {
    e.stopPropagation();
    console.log("Staff Id:", staffId);
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        await staffServices.deleteStaff(staffId);
        setStaffMembers(staffMembers.filter((staff) => staff._id !== staffId));
        showToast("Staff member deleted successfully", "success");
      } catch (err) {
        showToast("Failed to delete staff member", "error");
        console.error("Delete staff error:", err);
      }
    }
  };

  const filteredStaff = staffMembers.filter(
    (staff) =>
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const headers = [
    "Name",
    "Position",
    "Contact",
    "Join Date",
    "Status",
    "Actions",
  ];

  const handleRowClick = (id) => {
    // console.log(id)
    navigate(`/staff-detail/${id}`);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <CustomButton
            variant="secondary"
            onClick={() => navigate("/staff-departments")}
            className="mr-4"
          >
            ←
          </CustomButton>
          <h1 className="text-2xl font-bold">{department}</h1>
        </div>
        {department != "Teaching" && department != "Administration" && (
          <CustomButton onClick={() => navigate("/add-staff")}>
            Add Staff
          </CustomButton>
        )}
      </div>

      <SearchBar onSearch={setSearchTerm} />

      <CustomCard>
        {filteredStaff.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No staff members found in this department
          </div>
        ) : (
          <CustomTable headers={headers}>
            {filteredStaff.map((staff) => (
              <tr
                key={staff._id}
                className="border-b cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleRowClick(staff._id)}
              >
                <td className="p-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                      {staff.name.charAt(0)}
                    </div>
                    <span>{staff.name}</span>
                  </div>
                </td>
                <td className="p-4">{staff.position}</td>
                <td className="p-4">
                  <div>
                    <div>{staff.email}</div>
                    <div className="text-sm text-gray-500">{staff.phoneNo}</div>
                  </div>
                </td>
                <td className="p-4">
                  {new Date(staff.joinDate).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Active
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    {/* <CustomButton
                      variant="secondary"
                      className="p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(staff);
                      }}
                    >
                      <Check className="w-4 h-4" />
                    </CustomButton> */}
                    <CustomButton
                      variant="danger"
                      className="p-1"
                      onClick={(e) => handleDeleteStaff(staff._id, e)}
                    >
                      <X className="w-4 h-4" />
                    </CustomButton>
                  </div>
                </td>
              </tr>
            ))}
          </CustomTable>
        )}
      </CustomCard>
    </div>
  );
};

export default StaffListPage;
