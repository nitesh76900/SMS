import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addClass } from "../services/classService";
import { useToast } from "../context/ToastContext";

const AddClassForm = () => {
  const navigate = useNavigate();
  const showToast = useToast();
  const [formData, setFormData] = useState({
    name: "",
    section: "",
    classSubjects: [], // Changed from subjects to classSubjects and simplified structure
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [subjectInput, setSubjectInput] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubjectInputChange = (e) => {
    setSubjectInput(e.target.value);
  };

  const addSubject = () => {
    if (subjectInput.trim()) {
      setFormData({
        ...formData,
        classSubjects: [...formData.classSubjects, subjectInput.trim()], // Now storing just the subject name
      });
      setSubjectInput("");
    }
  };

  const handleSubjectKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSubject();
    }
  };

  const removeSubject = (index) => {
    const newSubjects = formData.classSubjects.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      classSubjects: newSubjects,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.section) {
      setError("Please fill in all required fields");
      showToast("Please fill in all required fields", "error");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await addClass(formData);
      if (response) {
        showToast("Class created successfully", "success");
        navigate("/class");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Failed to create class. Please try again.";
      setError(errorMessage);
      showToast(errorMessage, "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add New Class</h1>
        <button
          onClick={() => navigate("/class")}
          className="text-gray-600 hover:text-gray-800"
        >
          Back to Classes
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Class Name*
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Section*
          </label>
          <input
            type="text"
            name="section"
            value={formData.section}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subjects
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={subjectInput}
              onChange={handleSubjectInputChange}
              onKeyPress={handleSubjectKeyPress}
              placeholder="Enter subject name"
              className="flex-1 p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={addSubject}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add
            </button>
          </div>

          <div className="mt-2 space-y-2">
            {formData.classSubjects.map((subject, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-2 rounded"
              >
                <span>{subject}</span>
                <button
                  type="button"
                  onClick={() => removeSubject(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/class")}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? "Creating..." : "Create Class"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddClassForm;
