import api from './api';

const authService = {
    // Register new user
    register: async (userData) => {
        console.log('Registering user:', userData);
        try {
            const response = await api.post('/auth/register', userData);
            
            console.log('Registration response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Registration error:', error.response?.data || error.message);
            throw error;
        }
    },

    // Login user
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        const { access_token, refresh_token } = response.data;

        // Store tokens
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        // Get user info
        const user = await authService.getCurrentUser();
        localStorage.setItem('user', JSON.stringify(user));

        return { user, access_token, refresh_token };
    },

    // Logout user
    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
        }
    },

    // Get current user
    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    // Validate token
    validateToken: async () => {
        try {
            const response = await api.get('/auth/validate');
            return response.data.valid;
        } catch (error) {
            return false;
        }
    },

    // Get all users (admin only)
    getAllUsers: async () => {
        const response = await api.get('/auth/users');
        return response.data;
    },

    // Check if user is logged in
    isAuthenticated: () => {
        return !!localStorage.getItem('access_token');
    },

    // Get stored user
    getStoredUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
};

export default authService;
