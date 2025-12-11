import React, { useState, useEffect } from 'react';
import studentService from '../../services/studentService';
import ErrorMessage from '../Common/ErrorMessage';

const StudentForm = ({ student, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        matricule: '',
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        dateNaissance: '',
        filiere: 'Informatique',
        niveau: 'L1',
        anneeInscription: new Date().getFullYear(),
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (student) {
            setFormData({
                matricule: student.matricule || '',
                nom: student.nom || '',
                prenom: student.prenom || '',
                email: student.email || '',
                telephone: student.telephone || '',
                dateNaissance: student.dateNaissance || '',
                filiere: student.filiere || 'Informatique',
                niveau: student.niveau || 'L1',
                anneeInscription: student.anneeInscription || new Date().getFullYear(),
            });
        }
    }, [student]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Compute fullname from nom and prenom
            const fullname = `${formData.nom} ${formData.prenom}`.trim();

            // Calculate age from dateNaissance or use a default
            let age = 20; // default age
            if (formData.dateNaissance) {
                const birthDate = new Date(formData.dateNaissance);
                const today = new Date();
                age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
            }

            // Prepare data with required fields
            const dataToSend = {
                ...formData,
                fullname,
                age,
            };

            if (student) {
                await studentService.updateStudent(student.id, dataToSend);
            } else {
                await studentService.createStudent(dataToSend);
            }
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.detail || 'Erreur lors de l\'enregistrement');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="student-form">
            <ErrorMessage message={error} onClose={() => setError('')} />

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="matricule">Matricule *</label>
                    <input
                        type="text"
                        id="matricule"
                        name="matricule"
                        value={formData.matricule}
                        onChange={handleChange}
                        required
                        disabled={!!student}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="anneeInscription">Année d'inscription *</label>
                    <input
                        type="number"
                        id="anneeInscription"
                        name="anneeInscription"
                        value={formData.anneeInscription}
                        onChange={handleChange}
                        required
                        min="2000"
                        max="2100"
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="nom">Nom *</label>
                    <input
                        type="text"
                        id="nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="prenom">Prénom *</label>
                    <input
                        type="text"
                        id="prenom"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="telephone">Téléphone</label>
                    <input
                        type="tel"
                        id="telephone"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="dateNaissance">Date de naissance</label>
                    <input
                        type="date"
                        id="dateNaissance"
                        name="dateNaissance"
                        value={formData.dateNaissance}
                        onChange={handleChange}
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
                        <option value="Informatique">Informatique</option>
                        <option value="Mathématiques">Mathématiques</option>
                        <option value="Physique">Physique</option>
                        <option value="Chimie">Chimie</option>
                        <option value="Biologie">Biologie</option>
                        <option value="Économie">Économie</option>
                        <option value="Gestion">Gestion</option>
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

export default StudentForm;
