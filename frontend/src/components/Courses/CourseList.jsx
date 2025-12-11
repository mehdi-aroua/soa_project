import React, { useState, useEffect } from 'react';
import soapCourseService from '../../services/soapCourseService';
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

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await soapCourseService.getAllCourses();
            setCourses(data);
        } catch (err) {
            console.error('SOAP Error:', err);
            setError('Erreur lors du chargement des cours (SOAP): ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
            return;
        }

        try {
            await soapCourseService.deleteCourse(id);
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
        return <Loading message="Chargement des cours via SOAP..." />;
    }

    return (
        <div className="courses-container">
            <div className="courses-header">
                <h1>{user?.role === 'ETUDIANT' ? 'Mes Cours' : 'Gestion des Cours (SOAP)'}</h1>
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
                    courses.map((course) => (
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
                    ))
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

