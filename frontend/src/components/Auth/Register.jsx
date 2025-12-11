import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ErrorMessage from '../Common/ErrorMessage';
import './Login.css';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        role: 'ETUDIANT',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await register(formData);
            setSuccess('Inscription réussie ! Redirection vers la page de connexion...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Erreur lors de l\'inscription. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-background"></div>
            <div className="login-card">
                <div className="login-header">
                    <h1>Créer un compte</h1>
                    <p>Rejoignez la plateforme universitaire</p>
                </div>

                <ErrorMessage message={error} onClose={() => setError('')} />
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="full_name">Nom complet</label>
                        <input
                            type="text"
                            id="full_name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            placeholder="Jean Dupont"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="votre.email@exemple.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Mot de passe</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            minLength={8}
                        />
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'block', marginTop: '0.5rem' }}>
                            Le mot de passe doit contenir :<br />
                            • Minimum 8 caractères<br />
                            • Au moins 1 lettre majuscule<br />
                            • Au moins 1 symbole (!@#$%^&*)<br />
                            Exemple : <strong>Password123!</strong>
                        </small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">Rôle</label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                        >
                            <option value="ETUDIANT">Étudiant</option>
                            <option value="PROFESSEUR">Professeur</option>
                            <option value="ADMIN">Administrateur</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                        {loading ? 'Inscription...' : 'S\'inscrire'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>
                        Déjà un compte ?{' '}
                        <Link to="/login" className="link-primary">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
