import React, { useState, useEffect } from 'react';
import noteService from '../../services/noteService';
import Modal from '../Common/Modal';
import Loading from '../Common/Loading';
import ErrorMessage from '../Common/ErrorMessage';

const StudentNotesModal = ({ isOpen, onClose, student }) => {
    const [notes, setNotes] = useState([]);
    const [average, setAverage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [formData, setFormData] = useState({
        course_code: '',
        note: '',
        type_exam: 'DS',
        coefficient: 1
    });

    useEffect(() => {
        if (isOpen && student) {
            loadNotes();
        }
    }, [isOpen, student]);

    const loadNotes = async () => {
        try {
            setLoading(true);
            setError('');
            const [notesData, avgData] = await Promise.all([
                noteService.getStudentNotes(student.id),
                noteService.getStudentAverage(student.id)
            ]);
            setNotes(notesData);
            setAverage(avgData);
        } catch (err) {
            setError('Erreur lors du chargement des notes');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            await noteService.createNote({
                student_id: student.id,
                course_code: formData.course_code,
                note: parseFloat(formData.note),
                type_exam: formData.type_exam,
                coefficient: parseFloat(formData.coefficient) || 1
            });
            setFormData({ course_code: '', note: '', type_exam: 'DS', coefficient: 1 });
            setIsAddingNote(false);
            loadNotes();
        } catch (err) {
            if (err.response?.data?.detail) {
                setError(err.response.data.detail);
            } else {
                setError('Erreur lors de l\'ajout de la note');
            }
            console.error(err);
        }
    };

    const handleDelete = async (noteId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
            return;
        }
        try {
            await noteService.deleteNote(noteId);
            loadNotes();
        } catch (err) {
            setError('Erreur lors de la suppression');
            console.error(err);
        }
    };

    // Group notes by type
    const dsNotes = notes.filter(n => n.type_exam === 'DS');
    const tpNotes = notes.filter(n => n.type_exam === 'TP');
    const otherNotes = notes.filter(n => !['DS', 'TP'].includes(n.type_exam));

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Notes de ${student?.prenom} ${student?.nom}`}
        >
            <div className="notes-modal-content">
                <ErrorMessage message={error} onClose={() => setError('')} />

                {loading ? (
                    <Loading message="Chargement des notes..." />
                ) : (
                    <>
                        {/* Moyenne Display */}
                        <div className="notes-moyenne-section">
                            <div className="moyenne-badge">
                                <span className="moyenne-label">Moyenne Générale</span>
                                <span className={`moyenne-value ${average?.average >= 10 ? 'passing' : 'failing'}`}>
                                    {average ? `${average.average}/20` : 'N/A'}
                                </span>
                            </div>
                            {average && (
                                <span className="moyenne-info">
                                    ({average.total_notes} note{average.total_notes > 1 ? 's' : ''}, coef: {average.total_coefficient})
                                </span>
                            )}
                        </div>

                        {/* Notes Tables */}
                        <div className="notes-tables">
                            {/* DS Notes */}
                            <div className="notes-section">
                                <h4>📝 Notes DS</h4>
                                {dsNotes.length === 0 ? (
                                    <p className="no-notes">Aucune note DS</p>
                                ) : (
                                    <table className="notes-table">
                                        <thead>
                                            <tr>
                                                <th>Matière</th>
                                                <th>Note</th>
                                                <th>Coef</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dsNotes.map(note => (
                                                <tr key={note.id}>
                                                    <td>{note.course_code}</td>
                                                    <td className={note.note >= 10 ? 'passing' : 'failing'}>
                                                        {note.note}/20
                                                    </td>
                                                    <td>{note.coefficient}</td>
                                                    <td>
                                                        <button
                                                            onClick={() => handleDelete(note.id)}
                                                            className="btn btn-sm btn-danger"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            {/* TP Notes */}
                            <div className="notes-section">
                                <h4>💻 Notes TP</h4>
                                {tpNotes.length === 0 ? (
                                    <p className="no-notes">Aucune note TP</p>
                                ) : (
                                    <table className="notes-table">
                                        <thead>
                                            <tr>
                                                <th>Matière</th>
                                                <th>Note</th>
                                                <th>Coef</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tpNotes.map(note => (
                                                <tr key={note.id}>
                                                    <td>{note.course_code}</td>
                                                    <td className={note.note >= 10 ? 'passing' : 'failing'}>
                                                        {note.note}/20
                                                    </td>
                                                    <td>{note.coefficient}</td>
                                                    <td>
                                                        <button
                                                            onClick={() => handleDelete(note.id)}
                                                            className="btn btn-sm btn-danger"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            {/* Other Notes */}
                            {otherNotes.length > 0 && (
                                <div className="notes-section">
                                    <h4>📋 Autres Notes</h4>
                                    <table className="notes-table">
                                        <thead>
                                            <tr>
                                                <th>Matière</th>
                                                <th>Type</th>
                                                <th>Note</th>
                                                <th>Coef</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {otherNotes.map(note => (
                                                <tr key={note.id}>
                                                    <td>{note.course_code}</td>
                                                    <td>{note.type_exam}</td>
                                                    <td className={note.note >= 10 ? 'passing' : 'failing'}>
                                                        {note.note}/20
                                                    </td>
                                                    <td>{note.coefficient}</td>
                                                    <td>
                                                        <button
                                                            onClick={() => handleDelete(note.id)}
                                                            className="btn btn-sm btn-danger"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Add Note Form */}
                        {isAddingNote ? (
                            <form onSubmit={handleSubmit} className="add-note-form">
                                <h4>➕ Ajouter une note</h4>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Matière (Code)</label>
                                        <input
                                            type="text"
                                            name="course_code"
                                            value={formData.course_code}
                                            onChange={handleInputChange}
                                            placeholder="Ex: SOA, MATH..."
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Note (/20)</label>
                                        <input
                                            type="number"
                                            name="note"
                                            value={formData.note}
                                            onChange={handleInputChange}
                                            min="0"
                                            max="20"
                                            step="0.5"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Type</label>
                                        <select
                                            name="type_exam"
                                            value={formData.type_exam}
                                            onChange={handleInputChange}
                                        >
                                            <option value="DS">DS</option>
                                            <option value="TP">TP</option>
                                            <option value="EXAMEN">Examen</option>
                                            <option value="CC">CC</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Coefficient</label>
                                        <input
                                            type="number"
                                            name="coefficient"
                                            value={formData.coefficient}
                                            onChange={handleInputChange}
                                            min="0.5"
                                            max="10"
                                            step="0.5"
                                        />
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="btn btn-secondary" onClick={() => setIsAddingNote(false)}>
                                        Annuler
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        💾 Enregistrer
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <button className="btn btn-primary add-note-btn" onClick={() => setIsAddingNote(true)}>
                                ➕ Ajouter une note
                            </button>
                        )}
                    </>
                )}
            </div>
        </Modal>
    );
};

export default StudentNotesModal;
