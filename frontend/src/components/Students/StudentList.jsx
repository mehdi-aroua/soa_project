import React, { useState, useEffect } from 'react';
import studentService from '../../services/studentService';
import StudentForm from './StudentForm';
import Modal from '../Common/Modal';
import Loading from '../Common/Loading';
import ErrorMessage from '../Common/ErrorMessage';
import './Students.css';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            setLoading(true);
            const data = await studentService.getAllStudents({ limit: 100 });
            setStudents(data);
        } catch (err) {
            setError('Erreur lors du chargement des étudiants');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            loadStudents();
            return;
        }

        try {
            setLoading(true);
            const data = await studentService.searchStudents(searchQuery);
            setStudents(data);
        } catch (err) {
            setError('Erreur lors de la recherche');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
            return;
        }

        try {
            await studentService.deleteStudent(id);
            loadStudents();
        } catch (err) {
            setError('Erreur lors de la suppression');
        }
    };

    const handleEdit = (student) => {
        setEditingStudent(student);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingStudent(null);
        setIsModalOpen(true);
    };

    const handleFormSuccess = () => {
        setIsModalOpen(false);
        setEditingStudent(null);
        loadStudents();
    };

    if (loading && students.length === 0) {
        return <Loading message="Chargement des étudiants..." />;
    }

    return (
        <div className="students-container">
            <div className="students-header">
                <h1>Gestion des Étudiants</h1>
                <button onClick={handleAdd} className="btn btn-primary">
                    ➕ Ajouter un étudiant
                </button>
            </div>

            <ErrorMessage message={error} onClose={() => setError('')} />

            <div className="students-search">
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="Rechercher par nom, prénom ou matricule..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="btn btn-primary">
                        🔍 Rechercher
                    </button>
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery('');
                                loadStudents();
                            }}
                            className="btn btn-secondary"
                        >
                            ✕ Effacer
                        </button>
                    )}
                </form>
            </div>

            <div className="students-table-container">
                <table className="students-table">
                    <thead>
                        <tr>
                            <th>Matricule</th>
                            <th>Nom</th>
                            <th>Prénom</th>
                            <th>Email</th>
                            <th>Filière</th>
                            <th>Niveau</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                                    Aucun étudiant trouvé
                                </td>
                            </tr>
                        ) : (
                            students.map((student) => (
                                <tr key={student.id}>
                                    <td>{student.matricule}</td>
                                    <td>{student.nom}</td>
                                    <td>{student.prenom}</td>
                                    <td>{student.email}</td>
                                    <td>
                                        <span className="badge badge-info">{student.filiere}</span>
                                    </td>
                                    <td>
                                        <span className="badge badge-primary">{student.niveau}</span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                onClick={() => handleEdit(student)}
                                                className="btn btn-sm btn-secondary"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(student.id)}
                                                className="btn btn-sm btn-danger"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingStudent ? 'Modifier l\'étudiant' : 'Ajouter un étudiant'}
            >
                <StudentForm
                    student={editingStudent}
                    onSuccess={handleFormSuccess}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default StudentList;
