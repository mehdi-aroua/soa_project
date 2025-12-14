import api from './api';

const noteService = {
    // Get all notes for a student
    getStudentNotes: async (studentId) => {
        const response = await api.get(`/notes/student/${studentId}`);
        return response.data;
    },

    // Get notes for current user (student)
    getMyNotes: async (studentId) => {
        const response = await api.get(`/notes/my-notes?student_id=${studentId}`);
        return response.data;
    },

    // Get average for a student
    getStudentAverage: async (studentId) => {
        try {
            const response = await api.get(`/notes/student/${studentId}/average`);
            return response.data;
        } catch (error) {
            // If no notes found, return null instead of throwing
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    // Get average for current user (student)
    getMyAverage: async (studentId) => {
        try {
            const response = await api.get(`/notes/my-average?student_id=${studentId}`);
            return response.data;
        } catch (error) {
            // If no notes found, return null instead of throwing
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    // Create a new note
    createNote: async (noteData) => {
        const response = await api.post('/notes', noteData);
        return response.data;
    },

    // Update a note
    updateNote: async (noteId, noteData) => {
        const response = await api.put(`/notes/${noteId}`, noteData);
        return response.data;
    },

    // Delete a note
    deleteNote: async (noteId) => {
        const response = await api.delete(`/notes/${noteId}`);
        return response.data;
    }
};

export default noteService;
