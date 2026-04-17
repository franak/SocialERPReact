import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { saveEmployeeCode, hasEmployeeCode, getEmployeeCode, saveUltimoParte, saveUUIDCentral } from '../utils/session';
import { SECTIONS } from '../config/sections';
import Modal from '../components/Modal';
import AppHeader from '../components/AppHeader';
import '../styles/LandingPage.css';

export default function LandingPage() {
    const navigate = useNavigate();
    const [empleadoCode, setEmpleadoCode] = useState(() => getEmployeeCode() || '');
    const [empresa, setEmpresa] = useState(null);
    const [loading, setLoading] = useState(true);
    const [validatingSection, setValidatingSection] = useState(null);
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        message: '',
        type: 'info',
    });

    // Fetch empresa data on mount (same as RelojPage did)
    useEffect(() => {
        let previousLogoUrl = null;

        loadEmpresa();

        return () => {
            if (previousLogoUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(previousLogoUrl);
            }
        };

        async function loadEmpresa() {
            try {
                const data = await apiService.fetchEmpresa();
                const empresaData = data.result || data;

                // Fetch logo if UUIDEmpresa is available
                let logoUrl = null;
                if (empresaData?.UUIDEmpresa) {
                    logoUrl = await apiService.fetchEmpresaLogo(empresaData.UUIDEmpresa);
                }

                setEmpresa({ ...empresaData, logoUrl });
                previousLogoUrl = logoUrl;
                setLoading(false);
            } catch (err) {
                console.error('Error cargando empresa:', err);
                setModalConfig({
                    isOpen: true,
                    message: err.message || 'Error al cargar empresa',
                    type: 'error',
                });
                setLoading(false);
            }
        }
    }, []);

    const handleValidateAndNavigate = async (section) => {
        if (!empleadoCode.trim()) {
            setModalConfig({
                isOpen: true,
                message: 'Introduce tu código de empleado para acceder',
                type: 'warning',
            });
            return;
        }

        try {
            setLoading(true);
            setValidatingSection(section.id);

            // Validate employee code by calling "ultimo parte"
            const payload = {
                Funcion: 'CrearParte',
                Tipo: 'ultimo',
                UUIDCentral: empresa?.UUIDEmpresa || 'unknown',
                ClaveEmpleado: empleadoCode,
                GPS: 'n/d',
                userAgent: navigator.userAgent,
                Hora: new Date().toISOString(),
                IP: '',
            };

            const response = await apiService.submitPresencia(payload);

            // Save employee code and ultimo parte data to session
            saveEmployeeCode(empleadoCode);
            saveUltimoParte(response);
            const uuidToSave = payload.UUIDCentral !== 'unknown' ? payload.UUIDCentral : '';
            if (uuidToSave) {
                saveUUIDCentral(uuidToSave);
            }
            navigate(section.route);
        } catch (err) {
            console.error('Error validando código de empleado:', err);
            // If the server returns 200 with an error status in body, handle it
            if (err.status === 'KO' || err.message) {
                setModalConfig({
                    isOpen: true,
                    message: err.message || 'Código de empleado no válido',
                    type: 'error',
                });
            } else {
                setModalConfig({
                    isOpen: true,
                    message: 'Error de conexión al validar el código',
                    type: 'error',
                });
            }
        } finally {
            setLoading(false);
            setValidatingSection(null);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && empleadoCode.trim()) {
            // Navigate to first available section by default
            const firstSection = SECTIONS[0];
            if (firstSection) {
                handleValidateAndNavigate(firstSection);
            }
        }
    };

    return (
        <div className="landing-container">
            <AppHeader />
            <div className={`landing-card ${loading ? 'loading' : ''}`}>
                {/* Loading overlay */}
                {loading && (
                    <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                        <p className="loading-text">Cargando...</p>
                    </div>
                )}

                {/* Logo y nombre empresa */}
                {empresa?.logoUrl && (
                    <div className="empresa-logo-wrapper">
                        <img src={empresa.logoUrl} alt={empresa.nombreEmpresa || 'Company logo'} className="empresa-logo" />
                    </div>
                )}
                {empresa?.nombreEmpresa && (
                    <h2 className="empresa-name">{empresa.nombreEmpresa}</h2>
                )}

                {/* Header */}
                <div className="landing-header">
                    <h1 className="landing-title">Portal del Empleado</h1>
                    <p className="landing-subtitle">Selecciona una sección para continuar</p>
                </div>

                {/* Employee Code Input */}
                <div className="employee-code-group">
                    <label className="employee-code-label">Código de Empleado</label>
                    <div className="employee-code-input-wrapper">
                        <input
                            type="text"
                            value={empleadoCode}
                            onChange={(e) => setEmpleadoCode(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Introduce tu código"
                            disabled={loading}
                            className="employee-code-input"
                            autoComplete="off"
                        />
                        {hasEmployeeCode() && empleadoCode === getEmployeeCode() && (
                            <span className="session-badge">Sesión activa</span>
                        )}
                    </div>
                </div>

                {/* Sections Grid */}
                <div className="sections-grid">
                    {SECTIONS.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => handleValidateAndNavigate(section)}
                            disabled={loading}
                            className={`section-card ${validatingSection === section.id ? 'validating' : ''}`}
                        >
                            <span className="section-icon">{section.icon}</span>
                            <div className="section-info">
                                <h3 className="section-name">{section.name}</h3>
                                <p className="section-description">{section.description}</p>
                            </div>
                            {validatingSection === section.id && (
                                <div className="section-spinner">Validando...</div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Footer */}
                <div className="landing-footer">
                    <span className="footer-version">v0.2.0</span>
                </div>
            </div>

            {/* Modal */}
            <Modal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
                message={modalConfig.message}
                type={modalConfig.type}
                duration={4000}
            />
        </div>
    );
}
