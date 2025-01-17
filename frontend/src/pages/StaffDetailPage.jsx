import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  IdCard,
  MapPin,
  UserCircle,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import StaffService from "../services/staffServices";
import { useToast } from "../context/ToastContext";
// Staff Detail View Component
const StaffDetailView = () => {
  const [staffData, setStaffData] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();
  const showToast = useToast();

  useEffect(() => {
    fetchStaffData();
  }, [id]);

  const fetchStaffData = async () => {
    try {
      console.log("fetchStaffData called with ID:", id);
      const response = await StaffService.getStaff(id);
      console.log("StaffData:", response.data);
      setStaffData(response.data);
      showToast("Staff details loaded successfully", "success");
    } catch (error) {
      console.log("Failed to fetch Staff");
      console.log("Error:", error);
      showToast("Failed to fetch staff details", "error");
    }
  };

  const StaffDetailCard = ({ title, icon, children }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    staffData && (
      <>
        <div className="p-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{staffData.name}</h1>
              <p className="text-gray-500">{staffData.position}</p>
            </div>
          </div>
  
          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <StaffDetailCard
              title="Basic Information"
              icon={<UserCircle className="w-5 h-5 text-blue-600" />}
            >
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{staffData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role Type</p>
                  <p className="font-medium">
                    {staffData.teacherOrAdmin || "Not Specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Staff ID</p>
                  <p className="font-medium">{staffData._id}</p>
                </div>
              </div>
            </StaffDetailCard>
  
            {/* Contact Information */}
            <StaffDetailCard
              title="Contact Information"
              icon={<Mail className="w-5 h-5 text-blue-600" />}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p>{staffData.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <p>{staffData.phoneNo}</p>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                  <p>{staffData.address}</p>
                </div>
              </div>
            </StaffDetailCard>
  
            {/* Employment Details */}
            <StaffDetailCard
              title="Employment Details"
              icon={<Building className="w-5 h-5 text-blue-600" />}
            >
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{staffData?.department && staffData?.department?.name}</p>
                </div>
              
                <div>
                  <p className="text-sm text-gray-500">Join Date</p>
                  <p className="font-medium">
                    {new Date(staffData.joinDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </StaffDetailCard>
  
            {/* Additional Information */}
            <StaffDetailCard
              title="Additional Information"
              icon={<IdCard className="w-5 h-5 text-blue-600" />}
            >
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Government ID</p>
                  <p className="font-medium">{staffData.govId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Salary</p>
                  <p className="font-medium">
                    ₹{parseInt(staffData.salary).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-medium">
                    {new Date(staffData.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </StaffDetailCard>
          </div>
  
          {/* Action Buttons */}
          {/* <div className="mt-8 flex justify-end gap-4">
            <button
              className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
              onClick={() => console.log("Edit clicked")}
            >
              Edit Details
            </button>
          </div> */}
        </div>
      </>
    )
  );
  
};
export default StaffDetailView;