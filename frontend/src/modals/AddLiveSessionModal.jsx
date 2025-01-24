import React from 'react';

const AddLiveSessionModal = ({
  showModal,
  onClose,
  selectedSession,
  formData,
  handleInputChange,
  handleStudentSelection,
  handleSubmit,
  teachers,
  classes,
  classStudents
}) => {
  return (
    <>
      {showModal && (
        // Change position to absolute and adjust left margin to match your sidebar width
        <div className="absolute top-0 right-0 bottom-0 left-64 bg-white z-50 overflow-y-auto"> {/* Adjust left-64 based on your sidebar width */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between pb-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedSession ? "Edit Session" : "Create New Session"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="py-8">
              <div className="max-w-3xl mx-auto space-y-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Link
                  </label>
                  <input
                    type="url"
                    name="sessionLink"
                    value={formData.sessionLink}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teacher
                    </label>
                    <select
                      name="teacher"
                      value={formData.teacher}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="" disabled>
                        Select a teacher
                      </option>
                      {teachers.map((teacher, index) => (
                        <option key={index} value={teacher._id}>
                          {teacher.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class
                    </label>
                    <select
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="" disabled>
                        Select a class
                      </option>
                      {classes &&
                        classes.map((cls) => (
                          <option key={cls._id} value={cls._id}>
                            {cls.name}-{cls.section}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Students
                  </label>
                  <select
                    multiple
                    name="students"
                    value={formData.students}
                    onChange={handleStudentSelection}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px]"
                    required
                  >
                    {classStudents.length > 0 ? (
                      classStudents.map((student) => (
                        <option key={student._id} value={student._id}>
                          {student.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No students available</option>
                    )}
                  </select>
                  <p className="text-sm text-gray-500 mt-2">
                    Hold Ctrl/Cmd to select multiple students
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      name="startFrom"
                      value={formData.startFrom}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      min="15"
                      max="180"
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-10 flex justify-end gap-4 max-w-3xl mx-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  {selectedSession ? "Update Session" : "Create Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddLiveSessionModal;