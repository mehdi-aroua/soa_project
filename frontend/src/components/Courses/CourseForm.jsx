import React, { useState, useEffect } from 'react';
import soapCourseService from '../../services/soapCourseService';
import ErrorMessage from '../Common/ErrorMessage';

const CourseForm = ({ course, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        id: '',
        code: '',
        nom: '',
        description: '',
        credits: 6,
        heures: 45,
        filiere: 'INFO',
        niveau: 'L1',
        salle: '',
        enseignantId: 0,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (course) {
            setFormData({
                id: course.id || '',
                code: course.code || '',
                nom: course.nom || course.name || '',
                description: course.description || '',
                credits: course.credits || 6,
                heures: course.heures || course.hours || 45,
                filiere: course.filiere || 'INFO',
                niveau: course.niveau || 'L1',
                salle: course.salle || '',
                enseignantId: course.enseignantId || 0,
            });
        }
    }, [course]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'number' ? parseInt(value, 10) || 0 : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (course) {
                // Update existing course
                const result = await soapCourseService.updateCourse(course.id, formData);
                console.log('Update result:', result);
            } else {
                // Create new course - need to generate an ID
                const dataWithId = {
                    ...formData,
                    id: formData.id || Date.now(), // Use timestamp as simple ID generator
                };
                const result = await soapCourseService.createCourse(dataWithId);
                console.log('Create result:', result);
            }
            onSuccess();
        } catch (err) {
            console.error('SOAP Error:', err);
            setError(err.message || 'Erreur lors de l\'enregistrement');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="course-form">
            <ErrorMessage message={error} onClose={() => setError('')} />

            {!course && (
                <div className="form-group">
                    <label htmlFor="id">ID du cours *</label>
                    <input
                        type="number"
                        id="id"
                        name="id"
                        value={formData.id}
                        onChange={handleChange}
                        required
                        min="1"
                        placeholder="Ex: 3"
                    />
                </div>
            )}

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="code">Code *</label>
                    <input
                        type="text"
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        required
                        placeholder="Ex: INF301"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="nom">Nom du cours *</label>
                    <input
                        type="text"
                        id="nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        required
                        placeholder="Ex: Base de Données"
                    />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Description du cours..."
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="credits">Crédits *</label>
                    <input
                        type="number"
                        id="credits"
                        name="credits"
                        value={formData.credits}
                        onChange={handleChange}
                        required
                        min="1"
                        max="30"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="heures">Heures *</label>
                    <input
                        type="number"
                        id="heures"
                        name="heures"
                        value={formData.heures}
                        onChange={handleChange}
                        required
                        min="1"
                        max="200"
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="filiere">Filière *</label>
                    <select
                        id="filiere"
                        name="filiere"
                        value={formData.filiere}
                        onChange={handleChange}
                        required
                    >
                        <option value="INFO">Informatique</option>
                        <option value="SCI">Sciences</option>
                        <option value="MATH">Mathématiques</option>
                        <option value="PHYS">Physique</option>
                        <option value="ECO">Économie</option>
                        <option value="GEST">Gestion</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="niveau">Niveau *</label>
                    <select
                        id="niveau"
                        name="niveau"
                        value={formData.niveau}
                        onChange={handleChange}
                        required
                    >
                        <option value="L1">L1</option>
                        <option value="L2">L2</option>
                        <option value="L3">L3</option>
                        <option value="M1">M1</option>
                        <option value="M2">M2</option>
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="salle">Salle</label>
                <input
                    type="text"
                    id="salle"
                    name="salle"
                    value={formData.salle}
                    onChange={handleChange}
                    placeholder="Ex: A101"
                />
            </div>

            <div className="form-actions">
                <button type="button" onClick={onCancel} className="btn btn-secondary">
                    Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
            </div>
        </form>
    );
};

export default CourseForm;
