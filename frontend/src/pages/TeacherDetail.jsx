import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PiArrowArcLeft } from "react-icons/pi";
import teacherService from "../services/teacherService";
import { useToast } from "../context/ToastContext";

const TeacherDetail = () => {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();

  useEffect(() => {
    fetchTeacherDetails();
  }, [id]);

  const fetchTeacherDetails = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getTeacherById(id);
      console.log("Teacher Details:", data.data);
      setTeacher(data.data);
      showToast("Teacher details loaded successfully", "success");
    } catch (error) {
      showToast("Error fetching teacher details", "error");
      console.error("Error fetching teacher details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="h-8 w-40 bg-gray-200 animate-pulse rounded"></div>
        <div className="space-y-6">
          <div className="h-[400px] w-full bg-gray-200 animate-pulse rounded"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 w-full bg-gray-200 animate-pulse rounded"></div>
            <div className="h-24 w-full bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <PiArrowArcLeft className="w-5 h-5 mr-2" />
          Back to Teachers
        </button>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-2xl font-semibold text-blue-600">
                    {teacher?.name?.charAt(0)}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {teacher?.name}
                  </h1>
                  <p className="text-gray-500">{teacher?.subject} Teacher</p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/teachers/edit/${id}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Professional Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                Professional Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Subject</label>
                  <p className="text-gray-900">{teacher?.subject}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">
                    Registration Number
                  </label>
                  <p className="text-gray-900">{teacher?.registrationNumber}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Role</label>
                  <p className="text-gray-900 capitalize">{teacher?.role}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">salary</label>
                  <p className="text-gray-900">{teacher?.staffId?.salary}</p>
                </div>
              </div>
            </div>

            {/* Class Assignments */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Class Assignments</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Lead Class</h3>
                  {teacher?.leadClass ? (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="font-medium text-blue-900">
                        {teacher.leadClass.name}
                      </p>
                      <p className="text-sm text-blue-700">
                        Section: {teacher.leadClass.section}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No lead class assigned</p>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium">Assigned Classes</h3>
                  {teacher?.assignedClass?.length > 0 ? (
                    <div className="space-y-2">
                      {teacher.assignedClass.map((classItem, index) => (
                        <div
                          key={classItem._id}
                          className="bg-gray-50 p-3 rounded-lg"
                        >
                          <p className="font-medium text-gray-900">
                            {classItem.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Section: {classItem.section}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      No additional classes assigned
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetail;
