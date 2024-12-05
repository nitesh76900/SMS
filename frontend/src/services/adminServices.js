import api from "./api";

export const adminServices = {
  // Student Admission Service
  studentAdmission: async (formData) => {
    console.log("Starting student admission with data:", formData);
    try {
      const response = await api.post("/admin/new-addmission", {
        name: formData.name,
        studentemail: formData.studentemail,
        studentPhone: formData.studentPhone,
        admissionYear: parseInt(formData.admissionYear),
        gender: formData.gender,
        studentAddress: formData.studentAddress,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        parentEmail: formData.parentEmail,
        parentPhone: formData.parentPhone,
        parentAddress: formData.parentAddress,
        classId: formData.classId,
        dob: formData.dob,
        batch: formData.batch,
        addmissionFee: parseFloat(formData.admissionFee) || 0,
        tuitionFee: parseFloat(formData.tuitionFee) || 0,
        computerFee: parseFloat(formData.computerFee) || 0,
        examFee: parseFloat(formData.examFee) || 0,
        fine: parseFloat(formData.fine) || 0,
        miscellaneous: parseFloat(formData.miscellaneous) || 0,
      });
      console.log("Student admission successful:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error during student admission:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to process admission",
      };
    }
  },

  // Add Teacher Service
  addTeacher: async (teacherData) => {
    console.log("Starting to add teacher with data:", teacherData);
    try {
      const response = await api.post("/admin/add-teacher", teacherData);
      console.log("Teacher added successfully:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error during adding teacher:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to add teacher",
      };
    }
  },

  // Add Class Service
  addClass: async (classData) => {
    console.log("Starting to add class with data:", classData);
    try {
      const response = await api.post("/admin/add-class", classData);
      console.log("Class added successfully:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error during adding class:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to add class",
      };
    }
  },

  // Add Admin Service
  addAdmin: async (adminData) => {
    console.log("Starting to add admin with data:", adminData);
    try {
      const response = await api.post("/admin/add-admin", adminData);
      console.log("Admin added successfully:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error during adding admin:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to add admin",
      };
    }
  },

  updateParentAndStudent: async (studentId, updateData) => {
    try {
      // Validate input
      if (!studentId) {
        throw new Error("Student ID is required");
      }

      // Validate update data structure
      const requiredFields = [
        "fatherName",
        "motherName",
        "parentEmail",
        "parentPhone",
        "parentAddress",
        "name",
        "studentemail",
        "studentPhone",
        "studentAddress",
        "dob",
        "gender",
        "batch",
        "classId",
        "admissionFee",
        "tuitionFee",
        "computerFee",
        "examFee",
        "fine",
        "miscellaneous",
      ];

      requiredFields.forEach((field) => {
        if (updateData[field] === undefined || updateData[field] === null) {
          throw new Error(`${field} is required for update`);
        }
      });

      // Make API call to update student and parent
      const response = await api.put(
        `admin/update-student-data/${studentId}`,
        updateData,
        {
          headers: {
            "Content-Type": "application/json",
            // You might need to add authorization headers depending on your setup
            // 'Authorization': `Bearer ${yourAuthToken}`
          },
        }
      );

      // Return updated data
      return {
        success: true,
        studentData: response.data.studentData,
        parentData: response.data.parentData,
        message: response.data.message,
      };
    } catch (error) {
      // Handle different types of errors
      console.error("Error in updateParentAndStudentService:", error);

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(
          error.response.data.error ||
            "Failed to update student and parent data"
        );
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error("No response received from server");
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(error.message || "An unexpected error occurred");
      }
    }
  },
};
