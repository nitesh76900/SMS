import api from './api';

const studentService = {
    // Get all students
    getAllStudents: async () => {
        console.log('StudentService: Fetching all students...');
        try {
            const response = await api.get('/student');
            console.log('StudentService: Successfully fetched all students:', response.data);
            return response.data;
        } catch (error) {
            console.error('StudentService: Error fetching all students:', error.response?.data || error.message);
            throw error;
        }
    },

    // Get student by ID
    getStudentById: async (id) => {
        console.log(`StudentService: Fetching student with ID ${id}...`);
        try {
            const response = await api.get(`/student/${id}`);
            console.log('StudentService: Successfully fetched student details:', response.data);
            return response.data;
        } catch (error) {
            console.error('StudentService: Error fetching student details:', error.response?.data || error.message);
            throw error;
        }
    },

    // Get students by class ID
    getStudentsByClass: async (classId) => {
        console.log(`StudentService: Fetching students for class ID ${classId}...`);
        try {
            const response = await api.get(`/student/student-by-class/${classId}`);
            console.log('StudentService: Successfully fetched students by class:', response.data);
            return response.data;
        } catch (error) {
            console.error('StudentService: Error fetching students by class:', error.response?.data || error.message);
            throw error;
        }
    },

    // Update student
    updateStudent: async (id, studentData) => {
        console.log(`StudentService: Updating student with ID ${id}...`, studentData);
        try {
            const response = await api.put(`/student/${id}`, studentData);
            console.log('StudentService: Successfully updated student:', response.data);
            return response.data;
        } catch (error) {
            console.error('StudentService: Error updating student:', error.response?.data || error.message);
            throw error;
        }
    },

    // Delete student
    deleteStudent: async (id) => {
        console.log(`StudentService: Deleting student with ID ${id}...`);
        try {
            const response = await api.delete(`/student/${id}`);
            console.log('StudentService: Successfully deleted student:', response.data);
            return response.data;
        } catch (error) {
            console.error('StudentService: Error deleting student:', error.response?.data || error.message);
            throw error;
        }
    },

    // Add fee payment
    addFeePayment: async (paymentData) => {
        console.log('StudentService: Adding fee payment...', paymentData);
        try {
            const response = await api.post('/student/fee-payment', paymentData);
            console.log('StudentService: Successfully added fee payment:', response.data);
            return response.data;
        } catch (error) {
            console.error('StudentService: Error adding fee payment:', error.response?.data || error.message);
            throw error;
        }
    },

    // Get all receipts
    getAllReceipts: async () => {
        console.log('StudentService: Fetching all receipts...');
        try {
            const response = await api.get('/student/receipt');
            console.log('StudentService: Successfully fetched all receipts:', response.data);
            return response.data;
        } catch (error) {
            console.error('StudentService: Error fetching receipts:', error.response?.data || error.message);
            throw error;
        }
    },

    // Get receipt by ID
    getReceiptById: async (id) => {
        console.log(`StudentService: Fetching receipt with ID ${id}...`);
        try {
            const response = await api.get(`/student/receipt/${id}`);
            console.log('StudentService: Successfully fetched receipt:', response.data);
            return response.data;
        } catch (error) {
            console.error('StudentService: Error fetching receipt:', error.response?.data || error.message);
            throw error;
        }
    },

    // Get all receipts by student ID
    getReceiptsByStudent: async (studentId) => {
        console.log(`StudentService: Fetching receipts for student ID ${studentId}...`);
        try {
            const response = await api.get(`/student/receipt/student/${studentId}`);
            console.log('StudentService: Successfully fetched student receipts:', response.data);
            return response.data;
        } catch (error) {
            console.error('StudentService: Error fetching student receipts:', error.response?.data || error.message);
            throw error;
        }
    },

    // Send fee reminder email
    sendFeeReminder: async (studentId) => {
        console.log(`StudentService: Sending fee reminder email for student ID ${studentId}...`);
        try {
            const response = await api.get(`/student/fee/reminder-by-email/${studentId}`);
            console.log('StudentService: Successfully sent fee reminder:', response.data);
            return response.data;
        } catch (error) {
            console.error('StudentService: Error sending fee reminder:', error.response?.data || error.message);
            throw error;
        }
    }
};

export default studentService;