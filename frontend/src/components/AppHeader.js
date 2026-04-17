import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getEmployeeCode, clearAllSession } from '../utils/session';
import '../styles/AppHeader.css';

export default function AppHeader() {
    const navigate = useNavigate();
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [employeeCode, setEmployeeCode] = useState(() => getEmployeeCode());
    const dropdownRef = useRef(null);

    useEffect(() => {
        setEmployeeCode(getEmployeeCode());
    }, [location]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleEmployeeLogout = () => {
        clearAllSession();
        setEmployeeCode(null);
        setDropdownOpen(false);
        window.location.reload();
    };

    const handleNavigateHome = () => {
        if (location.pathname !== '/') {
            navigate('/');
        }
    };

    const getSectionName = () => {
        const path = location.pathname;
        if (path === '/') return 'Portal del Empleado';
        if (path === '/reloj') return 'Registro Horario';
        if (path === '/calendario') return 'Calendario';
        if (path === '/nominas') return 'Nóminas';
        if (path === '/historial') return 'Historial';
        return '';
    };

    const sectionName = getSectionName();

    return (
        <header className="app-header">
            <div className="header-left">
                <button className="header-home-btn" onClick={handleNavigateHome} title="Volver al inicio">
                    &#8962;
                </button>
                <div className="header-info">
                    <span className="header-section-name">{sectionName}</span>
                    {employeeCode && (
                        <span className="header-employee-code">
                            <span className="code-label">Empleado:</span> {employeeCode}
                        </span>
                    )}
                </div>
            </div>

            <div className="header-right">
                {/* Dropdown menu - only show when there's an active session */}
                {(employeeCode || location.pathname === '/') && (
                    <div className="header-dropdown-wrapper" ref={dropdownRef}>
                        <button
                            className="header-menu-btn"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            aria-expanded={dropdownOpen}
                        >
                            &#9776;
                        </button>
                        {dropdownOpen && (
                            <div className="header-dropdown">
                                {!employeeCode ? (
                                    <button className="dropdown-item" onClick={() => { navigate('/login'); setDropdownOpen(false); }}>
                                        Login Admin
                                    </button>
                                ) : (
                                    <button className="dropdown-item dropdown-item--danger" onClick={handleEmployeeLogout}>
                                        Cerrar sesión
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
