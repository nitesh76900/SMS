import { useState, useEffect } from "react";
import {
  PiUserPlus,
  PiUserCircle,
  PiPencilSimple,
  PiTrash,
  PiEnvelope,
  PiPhone,
  PiMagnifyingGlass,
  PiCaretDown,
  PiX,
} from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import {
  getAllConnections,
  updateConnection,
  deleteConnection,
} from "../services/connectionService";
import { useToast } from "../context/ToastContext";
import Loader from "../components/Loader/Loader";
import { useSelector } from "react-redux";
import { selectUser } from "../store/slices/userSlice";

const Connections = () => {
  const user = useSelector(selectUser);
  const [role, setRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("");
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState(null);
  const [editingConnection, setEditingConnection] = useState(null);

  const navigate = useNavigate();
  const showToast = useToast();

  useEffect(() => {
    console.log("user roleeeeeeeeee", user?.role);
    setRole(user?.role);
  }, [user]);

  // Fetch connections on component mount
  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const data = await getAllConnections();
      console.log("Connections:", data);
      if (data) {
        setConnections(data.data);
        showToast("Connections loaded successfully", "success");
      }
    } catch (err) {
      setError("Failed to fetch connections");
      showToast("Failed to load connections", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      teacher: "bg-blue-100 text-blue-800",
      student: "bg-green-100 text-green-800",
      parent: "bg-purple-100 text-purple-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[type] || colors["other"];
  };

  const handleEditClick = (connection) => {
    setEditingConnection({ ...connection });
    setShowEditModal(true);
    showToast("Editing connection", "info");
  };

  const handleEditSave = async () => {
    try {
      console.log("Editing Connection Data:", editingConnection);
      const response = await updateConnection(
        editingConnection._id,
        editingConnection
      );
      if (response) {
        setConnections(
          connections.map((conn) =>
            conn.id === editingConnection.id ? response : conn
          )
        );
        showToast("Connection updated successfully", "success");
        setShowEditModal(false);
        setEditingConnection(null);
        fetchConnections();
      }
    } catch (err) {
      setError("Failed to update connection");
      showToast("Failed to update connection", "error");
      console.error(err);
    }
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setEditingConnection(null);
  };

  const handleDeleteClick = (connection) => {
    setConnectionToDelete(connection);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (connectionToDelete) {
      try {
        await deleteConnection(connectionToDelete._id);
        showToast("Connection deleted successfully", "success");
        setConnections(
          connections.filter((c) => c.id !== connectionToDelete.id)
        );
        setShowDeleteModal(false);
        setConnectionToDelete(null);
        fetchConnections();
      } catch (err) {
        setError("Failed to delete connection");
        showToast("Failed to delete connection", "error");
        console.error(err);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setConnectionToDelete(null);
  };

  const filteredData = connections
    .filter((contact) =>
      Object.values(contact).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .filter((contact) => {
      if (sortType === "") return true;
      return contact.type === sortType;
    });

  if (loading) {
    return <Loader />;
  }

  const handleProfessionChange = (e) => {
    const value = e.target.value;
    setEditingConnection((prev) => ({
      ...prev,
      profession: value,
      // Clear otherProfession when switching away from "other"
      otherProfession: value === "other" ? prev.otherProfession : "",
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Connections
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your network of students, teachers, and parents
          </p>
        </div>
        {(role === "superAdmin" || role === "admin") && (
          <button
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => navigate("/addconnection")}
          >
            <PiUserPlus className="text-lg" />
            Add Connection
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <PiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
            <div className="relative w-full md:w-[200px]">
              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value)}
                className="w-full appearance-none px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white pr-10 transition-colors"
              >
                <option value="">All Connections</option>
                <option value="Teacher">Teachers</option>
                <option value="Student">Students</option>
                <option value="Parent">Parents</option>
                <option value="other">Others</option>
              </select>
              <PiCaretDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
                  Name
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
                  Type
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
                  Contact Information
                </th>
                {(role === "superAdmin" || role === "admin") && (
                  <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((contact, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <PiUserCircle className="text-gray-600 text-2xl" />
                      </div>
                      <span className="font-medium text-gray-900">
                        {contact.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                        contact.profession
                      )}`}
                    >
                      {contact.profession === "other"
                        ? contact.otherProfession
                        : contact.profession}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <PiEnvelope className="text-gray-400 text-lg" />
                        <span className="text-gray-600">{contact.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <PiPhone className="text-gray-400 text-lg" />
                        <span className="text-gray-600">{contact.phoneNo}</span>
                      </div>
                    </div>
                  </td>
                  {(role === "superAdmin" || role === "admin") && (
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(contact)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          <PiPencilSimple className="text-lg" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(contact)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                          <PiTrash className="text-lg" />
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Edit Connection
              </h3>
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
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={editingConnection.name}
                  onChange={(e) =>
                    setEditingConnection({
                      ...editingConnection,
                      name: e.target.value,
                    })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="profession"
                  className="block text-sm font-medium text-gray-700"
                >
                  Connection Type
                </label>
                <select
                  id="profession"
                  value={editingConnection.profession}
                  onChange={handleProfessionChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select connection type</option>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="parent">Parent</option>
                  <option value="other">other</option>
                </select>
              </div>

              {editingConnection.profession === "other" && (
                <div>
                  <label
                    htmlFor="otherProfession"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Specify Connection Type
                  </label>
                  <input
                    type="text"
                    id="otherProfession"
                    value={editingConnection.otherProfession || ""}
                    onChange={(e) =>
                      setEditingConnection({
                        ...editingConnection,
                        otherProfession: e.target.value,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

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
                  value={editingConnection.email}
                  onChange={(e) =>
                    setEditingConnection({
                      ...editingConnection,
                      email: e.target.value,
                    })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="phoneNo"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone
                </label>
                <input
                  type="tel"
                  id="phoneNo"
                  value={editingConnection.phoneNo || ""}
                  onChange={(e) =>
                    setEditingConnection({
                      ...editingConnection,
                      phoneNo: e.target.value,
                    })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Delete Connection
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete {connectionToDelete?.name}? This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Connections;
