import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import studentService from '../../services/studentService';
import soapCourseService from '../../services/soapCourseService';
import authService from '../../services/authService';
import Loading from '../Common/Loading';
import './Layout.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        students: 0,
        courses: 0,
        users: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            // Load students
            try {
                const students = await studentService.getAllStudents({ limit: 1000 });
                setStats(prev => ({ ...prev, students: students.length }));
            } catch (error) {
                console.error('Error loading students:', error);
            }

            // Load courses
            try {
                const courses = await soapCourseService.getAllCourses();
                setStats(prev => ({ ...prev, courses: courses.length }));
            } catch (error) {
                console.error('Error loading courses:', error);
            }

            // Load users
            try {
                const users = await authService.getAllUsers();
                setStats(prev => ({ ...prev, users: users.length }));
            } catch (error) {
                console.error('Error loading users:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading message="Chargement du tableau de bord..." />;
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Tableau de bord</h1>
                <p>Vue d'ensemble de la plateforme universitaire</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-icon">👨‍🎓</div>
                    </div>
                    <div className="stat-value">{stats.students}</div>
                    <div className="stat-label">Étudiants</div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-icon">📚</div>
                    </div>
                    <div className="stat-value">{stats.courses}</div>
                    <div className="stat-label">Cours</div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-icon">👥</div>
                    </div>
                    <div className="stat-value">{stats.users}</div>
                    <div className="stat-label">Utilisateurs</div>
                </div>
            </div>

            <div className="quick-actions">
                <h2>Actions rapides</h2>
                <div className="actions-grid">
                    <div className="action-card" onClick={() => navigate('/students')}>
                        <div className="action-card-icon">➕</div>
                        <div className="action-card-label">Ajouter un étudiant</div>
                    </div>

                    <div className="action-card" onClick={() => navigate('/courses')}>
                        <div className="action-card-icon">📖</div>
                        <div className="action-card-label">Créer un cours</div>
                    </div>

                    <div className="action-card" onClick={() => navigate('/students')}>
                        <div className="action-card-icon">🔍</div>
                        <div className="action-card-label">Rechercher</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
