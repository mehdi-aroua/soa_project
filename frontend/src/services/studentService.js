import api from './api';

const studentService = {
    // Get all students with optional filters
    getAllStudents: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.filiere) params.append('filiere', filters.filiere);
        if (filters.niveau) params.append('niveau', filters.niveau);
        if (filters.annee) params.append('annee', filters.annee);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);

        const response = await api.get(`/students?${params.toString()}`);
        return response.data;
    },

    // Get student by ID
    getStudentById: async (id) => {
        const response = await api.get(`/students/${id}`);
        return response.data;
    },

    // Create new student
    createStudent: async (studentData) => {
        const response = await api.post('/students', studentData);
        return response.data;
    },

    // Update student
    updateStudent: async (id, studentData) => {
        const response = await api.put(`/students/${id}`, studentData);
        return response.data;
    },

    // Delete student (soft delete)
    deleteStudent: async (id) => {
        const response = await api.delete(`/students/${id}`);
        return response.data;
    },

    // Get student by email
    getStudentByEmail: async (email) => {
        const response = await api.get(`/students/by-email/${encodeURIComponent(email)}`);
        return response.data;
    },

    // Search students
    searchStudents: async (query, page = 1, limit = 10) => {
        const response = await api.get(`/students/search?q=${query}&page=${page}&limit=${limit}`);
        return response.data;
    },

    // Update student profile
    updateProfile: async (id, profileData) => {
        const response = await api.patch(`/students/${id}/profile`, profileData);
        return response.data;
    },

    // Get academic history
    getAcademicHistory: async (id) => {
        const response = await api.get(`/students/${id}/history`);
        return response.data;
    },

    // Add academic history
    addAcademicHistory: async (id, historyData) => {
        const response = await api.post(`/students/${id}/history`, historyData);
        return response.data;
    },

    // Delete academic history
    deleteAcademicHistory: async (studentId, historyId) => {
        const response = await api.delete(`/students/${studentId}/history/${historyId}`);
        return response.data;
    },
};

export default studentService;
