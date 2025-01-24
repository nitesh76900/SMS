import { useState, useEffect } from "react";
import {
  PiUserCircle,
  PiPencilSimple,
  PiPhone,
  PiMagnifyingGlass,
  PiX,
} from "react-icons/pi";
import { getAllParents, updateParent } from "../services/parentsServices";
import { useToast } from "../context/ToastContext";
import Loader from "../components/Loader/Loader";
import { useSelector } from "react-redux";
import { selectUser } from "../store/slices/userSlice";

const ParentsPage = () => {
  const user = useSelector(selectUser);
  const [role, setRole] = useState(null);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingParent, setEditingParent] = useState({
    fatherName: "",
    motherName: "",
    email: "",
    phoneNo: "",
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const showToast = useToast();

  useEffect(() => {
    console.log("user roleeeeeeeeee", user?.role);
    setRole(user?.role);
  }, [user]);

  // Fetch parents and classes on component mount
  useEffect(() => {
    Promise.all([fetchParents()]).finally(() => {
      setLoading(false);
    });
  }, []);

  const fetchParents = async () => {
    try {
      const response = await getAllParents();
      if (Array.isArray(response.data)) {
        setParents(response.data);
        showToast("Parents loaded successfully", "success");
      } else {
        console.error("Invalid data format:", response.data);
        setParents([]);
        showToast("Invalid data format received", "error");
      }
    } catch (error) {
      showToast("Failed to fetch parents", "error");
      console.error("Error fetching parents:", error);
    }
  };

  const handleEditClick = (parent) => {
    setEditingParent({ ...parent });
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    try {
      await updateParent(editingParent._id, {
        fatherName: editingParent.fatherName,
        motherName: editingParent.motherName,
        email: editingParent.email,
        phoneNo: editingParent.phoneNo,
      });
      showToast("Parent updated successfully", "success");
      setShowEditModal(false);
      setEditingParent(null);
      await fetchParents();
    } catch (error) {
      showToast("Failed to update parent", "error");
      console.error("Error updating parent:", error);
    }
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setEditingParent(null);
  };

  const filteredParents = parents.filter((parent) => {
    if (!parent || !parent.fatherName || !parent.motherName) {
      return false; // Skip undefined or incomplete parent objects
    }
    const searchValue =
      `${parent.fatherName} ${parent.motherName} ${parent.student?.name} ${parent.phoneNo}`.toLowerCase();
    return searchValue.includes(searchTerm.toLowerCase());
  });

  // Modal Component
  const EditModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Edit Parent</h3>
          <button
            onClick={handleEditCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <PiX className="text-xl" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="fatherName"
              className="block text-sm font-medium text-gray-700"
            >
              Father's Name
            </label>
            <input
              type="text"
              id="fatherName"
              value={editingParent?.fatherName || ""}
              onChange={(e) =>
                setEditingParent((prev) => ({
                  ...prev,
                  fatherName: e.target.value,
                }))
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="motherName"
              className="block text-sm font-medium text-gray-700"
            >
              Mother's Name
            </label>
            <input
              type="text"
              id="motherName"
              value={editingParent?.motherName || ""}
              onChange={(e) =>
                setEditingParent((prev) => ({
                  ...prev,
                  motherName: e.target.value,
                }))
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={editingParent?.email || ""}
              onChange={(e) =>
                setEditingParent((prev) => ({ ...prev, email: e.target.value }))
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="phoneNo"
              className="block text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNo"
              value={editingParent?.phoneNo || ""}
              onChange={(e) =>
                setEditingParent((prev) => ({
                  ...prev,
                  phoneNo: e.target.value,
                }))
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleEditCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleEditSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Parents
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and view parent information
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <PiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Search by parent or student name, phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <Loader />
        ) : (
          /* Parents Table */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
                    No.
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
                    Parent Name
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
                    Student Name
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
                    Phone
                  </th>
                  {(role === "superAdmin" || role === "admin") && (
                    <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredParents.map((parent, index) => (
                  <tr key={parent._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <PiUserCircle className="text-gray-600 text-2xl" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {parent?.fatherName || "N/A"}
                          </span>
                          <span className="text-sm text-gray-500">
                            {parent?.motherName || "N/A"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">
                        {parent.student?.name || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <PiPhone className="text-gray-400" />
                        <span>{parent?.phoneNo || "N/A"}</span>
                      </div>
                    </td>
                    {(role === "superAdmin" || role === "admin") && (
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleEditClick(parent)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            <PiPencilSimple className="text-lg" />
                            Edit
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && <EditModal />}
    </div>
  );
};

export default ParentsPage;
