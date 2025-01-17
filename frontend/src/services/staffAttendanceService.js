import api from './api';

const StaffAttendanceService = {
    getAttendance: async (date) => {
        console.log('date', date)
        try {
            const response = await api.get('/staff-attendance', {
                params: { date }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Error fetching attendance');
        }
    },

    updateAttendance: async ({staffId, date, status}) => {
        try {
            const response = await api.post('/staff-attendance/update', {
                staffId,
                date,
                status
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Error updating attendance');
        }
    }
};

export default StaffAttendanceService;