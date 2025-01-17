import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import teacherService from "../services/teacherService";
import { useToast } from "../context/ToastContext";

// Shimmer loading effect component
const ShimmerLoader = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-200 rounded"></div>
      ))}
    </div>
  </div>
);

const Teachers = () => {
  // Initialize teachers as an empty array
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const navigate = useNavigate();
  const showToast = useToast();

  // Fetch teachers on component mount
  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await teacherService.getAllTeachers();
      console.log('response', response)
      
      // Ensure we're working with an array
      const teachersData = Array.isArray(response) ? response : 
                          Array.isArray(response.data) ? response.data : [];
      
      setTeachers(teachersData);
      if (teachersData.length > 0) {
        showToast("Teachers loaded successfully", "success");
      } else {
        showToast("No teachers found", "error");
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setTeachers([]); // Reset to empty array on error
      showToast(error.message || "Failed to fetch teachers", "error");
    } finally {
      setLoading(false);
    }
  };

  // Safe filtering function with null checks
  const filteredTeachers = teachers.filter(teacher => {
    if (!teacher) return false;
    
    const teacherName = teacher.name?.toLowerCase() || '';
    const teacherEmail = teacher.email?.toLowerCase() || '';
    const teacherSubject = teacher.subject?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch = 
      teacherName.includes(searchLower) ||
      teacherEmail.includes(searchLower) ||
      teacherSubject.includes(searchLower);

    const matchesSubject = 
      selectedSubject === "All Subjects" || 
      teacher.subject === selectedSubject;

    const matchesClass = 
      selectedClass === "All Classes" || 
      teacher.leadClass?.name === selectedClass;

    return matchesSearch && matchesSubject && matchesClass;
  });

  // Debug logging
  useEffect(() => {
    console.log('Teachers data:', teachers);
    console.log('Filtered teachers:', filteredTeachers);
  }, [teachers, filteredTeachers]);

  const getSubjects = () => {
    const uniqueSubjects = new Set(teachers.map(teacher => teacher.subject).filter(Boolean));
    return ['All Subjects', ...uniqueSubjects];
  };

  const getClasses = () => {
    const uniqueClasses = new Set(teachers.map(teacher => teacher.leadClass?.name).filter(Boolean));
    return ['All Classes', ...uniqueClasses];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teacher Management</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage and monitor all teachers in your institution
            </p>
          </div>
          <button
            onClick={() => navigate("/addteachers")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <span>+ Add Teacher</span>
          </button>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="search"
                placeholder="Search teachers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {getSubjects().map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {getClasses().map(className => (
                <option key={className} value={className}>{className}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Teachers List */}
        {loading ? (
          <ShimmerLoader />
        ) : filteredTeachers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-500">No teachers found matching your criteria</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Subject</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Class</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTeachers.map((teacher) => (
                    <tr key={teacher._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {teacher.name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                            <div className="text-sm text-gray-500">{teacher.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{teacher.subject || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{teacher.leadClass?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{teacher.leadClass?.section || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          teacher.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {teacher.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => navigate(`/teachers/${teacher._id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                          <button
                            onClick={() => navigate(`/teachers/edit/${teacher._id}`)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Teachers;