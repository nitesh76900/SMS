// services/authService.js
import api from './api';

const  AuthService = {
    // Login service
    async login(loginId, password) {
        console.log('Login function called with:', { loginId, password });
        try {
            const response = await api.post('/auth/login', {
                loginId,
                password
            });
            console.log('Login response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw this.handleError(error);
        }
    },

    // Logout service
    async logout() {
        console.log('Logout function called');
        try {
            const response = await api.get('/auth/logout');
            console.log('Logout response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Logout error:', error);
            throw this.handleError(error);
        }
    },
    // Error handler
    handleError(error) {
        if (error.response) {
            throw {
                message: error.response.data.error || 'An error occurred',
                status: error.response.status
            };
        } else if (error.request) {
            throw {
                message: 'No response from server',
                status: 503
            };
        } else {
            throw {
                message: error.message || 'An error occurred',
                status: 500
            };
        }
    }
}

export default  AuthService;