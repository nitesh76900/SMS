import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllClasses } from "../services/classService";
import teacherService from "../services/teacherService";
import { useToast } from "../context/ToastContext";
import Loader from "../components/Loader/Loader";
import { selectUser } from "../store/slices/userSlice";
import { useSelector } from "react-redux";
const Class = () => {
  const [classes, setClasses] = useState([]);
  const [teachersMap, setTeachersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const showToast = useToast();
  const user = useSelector(selectUser);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await getAllClasses();

      if (response && response.data) {
        const classesData = response.data;
        setClasses(classesData);

        // Fetch teachers for each class
        const teacherPromises = classesData.map(async (classItem) => {
          if (classItem.classTeacher) {
            try {
              const teacherResponse = await teacherService.getTeacherById(
                classItem.classTeacher
              );
              return {
                [classItem._id]: {
                  name: teacherResponse.data.name || "Unknown Teacher",
                  // subject: teacherResponse.data.staffId?.subject || "N/A",
                },
              };
            } catch (teacherError) {
              console.error(
                `Failed to fetch teacher for class ${classItem.name}:`,
                teacherError
              );
              return { [classItem._id]: null };
            }
          }
          return { [classItem._id]: null };
        });

        // Wait for all teacher fetches to complete
        const teachersResults = await Promise.all(teacherPromises);

        // Convert array of objects to a single object
        const teachersMap = teachersResults.reduce(
          (acc, curr) => ({
            ...acc,
            ...curr,
          }),
          {}
        );

        setTeachersMap(teachersMap);
        showToast("Classes loaded successfully", "success");
      }
    } catch (err) {
      setError("Failed to fetch classes. Please try again later.");
      showToast("Failed to fetch classes", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = () => {
    navigate("/add-class");
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Classes</h1>
        {(user?.role === "admin" || user?.role === "superAdmin") && (
          <button
            onClick={handleAddClass}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Class
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((classItem) => (
          <div
            key={classItem._id}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">{classItem.name}</h2>
                <p className="text-gray-600">Section: {classItem.section}</p>
              </div>
            </div>

            {/* Display Class Teacher */}
            <div className="flex mb-4">
              <h3 className="font-semibold">Class Teacher:</h3>
              {teachersMap[classItem._id] ? (
                <div>
                  <p className="text-gray-600 ml-2">
                    {teachersMap[classItem._id].name}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 italic ml-2">No teacher assigned</p>
              )}
            </div>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Subjects:</h3>
              <ul className="list-disc list-inside">
                {classItem.subjects?.map((subject, index) => (
                  <li key={index} className="text-gray-600">
                    {subject.subjectName}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold">Number of Students:</h3>
              <p className="text-gray-600">{classItem.students?.length || 0}</p>
            </div>

            <div className="text-sm text-gray-500">
              Created: {new Date(classItem.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Class;
