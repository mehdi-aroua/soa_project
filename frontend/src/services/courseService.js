import api from './api';

const courseService = {
    // Get all courses
    getAllCourses: async () => {
        const response = await api.get('/courses');
        return response.data;
    },

    // Get course by ID
    getCourseById: async (id) => {
        const response = await api.get(`/courses/${id}`);
        return response.data;
    },

    // Create new course
    createCourse: async (courseData) => {
        const response = await api.post('/courses', courseData);
        return response.data;
    },

    // Update course
    updateCourse: async (id, courseData) => {
        const response = await api.put(`/courses/${id}`, courseData);
        return response.data;
    },

    // Delete course
    deleteCourse: async (id) => {
        const response = await api.delete(`/courses/${id}`);
        return response.data;
    },

    // Get courses by filiere
    getCoursesByFiliere: async (filiere) => {
        const response = await api.get(`/courses/filiere/${filiere}`);
        return response.data;
    },

    // Enroll student in course
    enrollStudent: async (studentId, courseId) => {
        const response = await api.post('/courses/enroll', { studentId, courseId });
        return response.data;
    },

    // Get enrollments by student
    getEnrollmentsByStudent: async (studentId) => {
        const response = await api.get(`/courses/enrollments/student/${studentId}`);
        return response.data;
    },

    // Get enrollments by course
    getEnrollmentsByCourse: async (courseId) => {
        const response = await api.get(`/courses/enrollments/course/${courseId}`);
        return response.data;
    },

    // Create schedule
    createSchedule: async (scheduleData) => {
        const response = await api.post('/courses/schedules', scheduleData);
        return response.data;
    },

    // Get schedules by course
    getSchedulesByCourse: async (courseId) => {
        const response = await api.get(`/courses/schedules/course/${courseId}`);
        return response.data;
    },
};

export default courseService;
