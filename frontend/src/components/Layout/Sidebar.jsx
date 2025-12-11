import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const Sidebar = () => {
    const { user } = useAuth();

    const allMenuItems = [
        { path: '/dashboard', icon: '📊', label: 'Tableau de bord' },
        { path: '/students', icon: '👨‍🎓', label: 'Étudiants' },
        { path: '/courses', icon: '📚', label: 'Cours' },
        { path: '/users', icon: '👥', label: 'Utilisateurs' },
    ];

    // Filter menu items based on user role
    const menuItems = user?.role === 'ETUDIANT' 
        ? allMenuItems.filter(item => item.path === '/courses')
        : allMenuItems;

    return (
        <aside className="sidebar">
            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <span className="sidebar-icon">{item.icon}</span>
                        <span className="sidebar-label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
