import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import '../styles/AdminHomePage.css';

export default function AdminHomePage() {
    const navigate = useNavigate();

    return (
        <div className="admin-home-wrapper">
            <AppHeader />
            <div className="admin-home-container">
                <div className="admin-home-card">
                    <div className="admin-home-header">
                        <h1>Panel de Administración</h1>
                        <p className="admin-home-subtitle">Selecciona una sección para continuar</p>
                    </div>

                    <div className="admin-sections-grid">
                        <button 
                            className="admin-section-card"
                            onClick={() => navigate('/admin/logs')}
                        >
                            <span className="admin-section-icon">📋</span>
                            <div className="admin-section-info">
                                <h3 className="admin-section-name">Log de Eventos</h3>
                                <p className="admin-section-description">
                                    Ver registros de actividad del sistema
                                </p>
                            </div>
                        </button>

                        <button 
                            className="admin-section-card"
                            onClick={() => navigate('/admin/calendarios')}
                        >
                            <span className="admin-section-icon">📅</span>
                            <div className="admin-section-info">
                                <h3 className="admin-section-name">Calendarios de Empleados</h3>
                                <p className="admin-section-description">
                                    Gestionar calendarios laborales y ausencias
                                </p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}