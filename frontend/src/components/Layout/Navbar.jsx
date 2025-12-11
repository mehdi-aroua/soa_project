import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <h2>🎓 Gestion Universitaire</h2>
            </div>

            <div className="navbar-user">
                <div className="user-info">
                    <span className="user-name">{user?.full_name || user?.email}</span>
                    <span className="user-role badge badge-primary">{user?.role}</span>
                </div>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                    Déconnexion
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
