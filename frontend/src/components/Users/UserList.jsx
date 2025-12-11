import React, { useState, useEffect } from 'react';
import authService from '../../services/authService';
import Loading from '../Common/Loading';
import ErrorMessage from '../Common/ErrorMessage';
import './Users.css';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await authService.getAllUsers();
            setUsers(data);
        } catch (err) {
            setError('Erreur lors du chargement des utilisateurs');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading message="Chargement des utilisateurs..." />;
    }

    return (
        <div className="users-container">
            <div className="users-header">
                <h1>Gestion des Utilisateurs</h1>
            </div>

            <ErrorMessage message={error} onClose={() => setError('')} />

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nom complet</th>
                            <th>Email</th>
                            <th>Rôle</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                                    Aucun utilisateur trouvé
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.full_name || '-'}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`badge badge-${getRoleBadgeClass(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const getRoleBadgeClass = (role) => {
    switch (role) {
        case 'ADMIN':
            return 'error';
        case 'PROFESSEUR':
            return 'warning';
        case 'ETUDIANT':
            return 'info';
        default:
            return 'primary';
    }
};

export default UserList;
