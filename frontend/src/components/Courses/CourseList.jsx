import React, { useState, useEffect } from 'react';
import courseService from '../../services/courseService';
import noteService from '../../services/noteService';
import studentService from '../../services/studentService';
import Loading from '../Common/Loading';
import ErrorMessage from '../Common/ErrorMessage';
import Modal from '../Common/Modal';
import CourseForm from './CourseForm';
import { useAuth } from '../../context/AuthContext';
import './Courses.css';

const CourseList = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [myNotes, setMyNotes] = useState([]);
    const [studentProfile, setStudentProfile] = useState(null);

    useEffect(() => {
        loadCourses();
        if (user?.role === 'ETUDIANT') {
            loadStudentProfile();
        }
    }, [user]);

    const loadCourses = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await courseService.getAllCourses();
            setCourses(data);
        } catch (err) {
            console.error('SOAP Error:', err);
            setError('Erreur lors du chargement des cours: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadStudentProfile = async () => {
        try {
            // Get student directly by email
            const profile = await studentService.getStudentByEmail(user.email);
            if (profile) {
                setStudentProfile(profile);
                // Now load notes with the student ID
                await loadMyNotes(profile.id);
            }
        } catch (err) {
            console.error('Error loading student profile:', err);
        }
    };

    const loadMyNotes = async (studentId) => {
        try {
            const notes = await noteService.getMyNotes(studentId);
            setMyNotes(notes);
        } catch (err) {
            console.error('Error loading notes:', err);
            // Don't block course loading if notes fail
        }
    };

    const getCourseNotes = (courseCode) => {
        if (!courseCode) return { ds: null, tp: null, cc: null, examen: null, other: [] };

        const courseNotes = myNotes.filter(n => n.course_code === courseCode);
        return {
            ds: courseNotes.find(n => n.type_exam === 'DS'),
            tp: courseNotes.find(n => n.type_exam === 'TP'),
            cc: courseNotes.find(n => n.type_exam === 'CC'),
            examen: courseNotes.find(n => n.type_exam === 'EXAMEN'),
            other: courseNotes.filter(n => !['DS', 'TP', 'CC', 'EXAMEN'].includes(n.type_exam))
        };
    };

    const calculateAverage = (notes) => {
        const courseNotes = [];
        if (notes.ds) courseNotes.push(notes.ds);
        if (notes.tp) courseNotes.push(notes.tp);
        if (notes.cc) courseNotes.push(notes.cc);
        if (notes.examen) courseNotes.push(notes.examen);
        courseNotes.push(...notes.other);

        if (courseNotes.length === 0) return null;

        const totalPoints = courseNotes.reduce((sum, n) => sum + (n.note * n.coefficient), 0);
        const totalCoef = courseNotes.reduce((sum, n) => sum + n.coefficient, 0);

        return totalCoef > 0 ? (totalPoints / totalCoef).toFixed(2) : null;
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
            return;
        }

        try {
            await courseService.deleteCourse(id);
            loadCourses();
        } catch (err) {
            setError('Erreur lors de la suppression: ' + err.message);
        }
    };

    const handleEdit = (course) => {
        setEditingCourse(course);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingCourse(null);
        setIsModalOpen(true);
    };

    const handleFormSuccess = () => {
        setIsModalOpen(false);
        setEditingCourse(null);
        loadCourses();
    };

    if (loading) {
        return <Loading message="Chargement des cours..." />;
    }

    return (
        <div className="courses-container">
            <div className="courses-header">
                <h1>{user?.role === 'ETUDIANT' ? 'Mes Cours' : 'Gestion des Cours'}</h1>
                {user?.role !== 'ETUDIANT' && (
                    <button onClick={handleAdd} className="btn btn-primary">
                        ➕ Ajouter un cours
                    </button>
                )}
            </div>

            <ErrorMessage message={error} onClose={() => setError('')} />

            <div className="courses-grid">
                {courses.length === 0 ? (
                    <div className="empty-state">
                        <p>Aucun cours disponible</p>
                    </div>
                ) : (
                    courses.map((course) => {
                        const notes = user?.role === 'ETUDIANT' ? getCourseNotes(course.code) : null;
                        const average = notes ? calculateAverage(notes) : null;

                        return (
                            <div key={course.id} className="course-card">
                                <div className="course-header">
                                    <h3>{course.nom || course.name}</h3>
                                    <span className="course-code">{course.code}</span>
                                </div>

                                <p className="course-description">{course.description}</p>

                                <div className="course-details">
                                    <div className="course-detail-item">
                                        <span className="label">Crédits:</span>
                                        <span className="value">{course.credits}</span>
                                    </div>
                                    <div className="course-detail-item">
                                        <span className="label">Heures:</span>
                                        <span className="value">{course.heures || course.hours}h</span>
                                    </div>
                                    <div className="course-detail-item">
                                        <span className="label">Filière:</span>
                                        <span className="badge badge-info">{course.filiere}</span>
                                    </div>
                                    <div className="course-detail-item">
                                        <span className="label">Niveau:</span>
                                        <span className="badge badge-primary">{course.niveau}</span>
                                    </div>
                                    {course.salle && (
                                        <div className="course-detail-item">
                                            <span className="label">Salle:</span>
                                            <span className="value">{course.salle}</span>
                                        </div>
                                    )}
                                </div>

                                {user?.role === 'ETUDIANT' && (
                                    <div className="course-notes-section">
                                        <div className="notes-divider"></div>
                                        <h4>📊 Mes Notes</h4>
                                        <div className="notes-grid">
                                            <div className="note-item">
                                                <span className="note-label">DS</span>
                                                <span className={`note-value ${!notes?.ds ? 'na' : notes.ds.note >= 10 ? 'passing' : 'failing'}`}>
                                                    {notes?.ds ? `${notes.ds.note}/20` : '-'}
                                                </span>
                                            </div>
                                            <div className="note-item">
                                                <span className="note-label">TP</span>
                                                <span className={`note-value ${!notes?.tp ? 'na' : notes.tp.note >= 10 ? 'passing' : 'failing'}`}>
                                                    {notes?.tp ? `${notes.tp.note}/20` : '-'}
                                                </span>
                                            </div>
                                            <div className="note-item">
                                                <span className="note-label">CC</span>
                                                <span className={`note-value ${!notes?.cc ? 'na' : notes.cc.note >= 10 ? 'passing' : 'failing'}`}>
                                                    {notes?.cc ? `${notes.cc.note}/20` : '-'}
                                                </span>
                                            </div>
                                            <div className="note-item">
                                                <span className="note-label">EXAMEN</span>
                                                <span className={`note-value ${!notes?.examen ? 'na' : notes.examen.note >= 10 ? 'passing' : 'failing'}`}>
                                                    {notes?.examen ? `${notes.examen.note}/20` : '-'}
                                                </span>
                                            </div>
                                            <div className="note-item average">
                                                <span className="note-label">Moyenne</span>
                                                <span className={`note-value ${!average ? 'na' : parseFloat(average) >= 10 ? 'passing' : 'failing'}`}>
                                                    {average ? `${average}/20` : '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {user?.role !== 'ETUDIANT' && (
                                    <div className="course-actions">
                                        <button
                                            onClick={() => handleEdit(course)}
                                            className="btn btn-sm btn-secondary"
                                        >
                                            ✏️ Modifier
                                        </button>
                                        <button
                                            onClick={() => handleDelete(course.id)}
                                            className="btn btn-sm btn-danger"
                                        >
                                            🗑️ Supprimer
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCourse ? 'Modifier le cours' : 'Ajouter un cours'}
            >
                <CourseForm
                    course={editingCourse}
                    onSuccess={handleFormSuccess}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default CourseList;

