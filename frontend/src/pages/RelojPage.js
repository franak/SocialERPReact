import React, { useEffect, useState, useCallback, useRef } from 'react';
import { apiService } from '../services/api';
import Modal from '../components/Modal';
import AppHeader from '../components/AppHeader';
import { getEmployeeCode, hasEmployeeCode, saveEmployeeCode, clearEmployeeCode, getUltimoParte, saveUltimoParte } from '../utils/session';
import '../styles/RelojPage.css';

export default function RelojPage() {
    const [empresa, setEmpresa] = useState(null);
    const [empleadoCode, setEmpleadoCode] = useState(() => getEmployeeCode() || '');
    const [ultimoParte, setUltimoParte] = useState(() => getUltimoParte());
    const [showUltimoButton, setShowUltimoButton] = useState(!getUltimoParte());
    const [loading, setLoading] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        message: '',
        type: 'info',
    });
    const [currentTime, setCurrentTime] = useState(new Date());
    const [opciones, setOpciones] = useState({
        HoraExtra: false,
    });
    const inputRef = useRef(null);
    const showEmployeeInput = !hasEmployeeCode();

    // Focus input when showing inline employee input
    useEffect(() => {
        if (showEmployeeInput && inputRef.current) {
            inputRef.current.focus();
        }
    }, [showEmployeeInput]);

    const fetchUltimoparteOnLoad = async (uuidEmpresa) => {
        if (!empleadoCode || !uuidEmpresa) return;

        try {
            const payload = {
                Funcion: 'CrearParte',
                Tipo: 'ultimo',
                UUIDCentral: uuidEmpresa,
                ClaveEmpleado: empleadoCode,
                GPS: 'n/d',
                userAgent: navigator.userAgent,
                Hora: new Date().toISOString(),
                IP: '',
            };

            const response = await apiService.submitPresencia(payload);
            if (response.status === 'ok') {
                setUltimoParte(response);
                saveUltimoParte(response);
                setShowUltimoButton(false);
            }
        } catch (err) {
            console.error('Error fetching ultimo parte on load:', err);
        }
    };

    const fetchUltimoParteData = async () => {
        if (!empleadoCode || !empresa?.UUIDEmpresa) return;

        try {
            const payload = {
                Funcion: 'CrearParte',
                Tipo: 'ultimo',
                UUIDCentral: empresa.UUIDEmpresa,
                ClaveEmpleado: empleadoCode,
                GPS: 'n/d',
                userAgent: navigator.userAgent,
                Hora: new Date().toISOString(),
                IP: '',
            };

            const response = await apiService.submitPresencia(payload);
            if (response.status === 'ok') {
                setUltimoParte(response);
                saveUltimoParte(response);
                setShowUltimoButton(false);
            }
        } catch (err) {
            console.error('Error fetching ultimo parte:', err);
        }
    };

    useEffect(() => {
        let previousLogoUrl = null;

        loadEmpresa();

        // Actualiza la hora cada segundo
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => {
            clearInterval(timer);
            // Cleanup previous blob URL
            if (previousLogoUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(previousLogoUrl);
            }
        };

        async function loadEmpresa() {
            try {
                setLoading(true);
                const data = await apiService.fetchEmpresa();
                const empresaData = data.result || data;

                // Fetch logo if UUIDEmpresa is available
                let logoUrl = null;
                if (empresaData?.UUIDEmpresa) {
                    logoUrl = await apiService.fetchEmpresaLogo(empresaData.UUIDEmpresa);
                }

                setEmpresa({ ...empresaData, logoUrl });
                previousLogoUrl = logoUrl;

                // Fetch ultimo parte if employee code exists and no saved data
                if (empleadoCode && !getUltimoParte()) {
                    fetchUltimoparteOnLoad(empresaData.UUIDEmpresa);
                }
            } catch (err) {
                console.error('Error cargando empresa:', err);
                setModalConfig({
                    isOpen: true,
                    message: err.message || 'Error al cargar empresa',
                    type: 'error',
                });
            } finally {
                setLoading(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCloseModal = useCallback(() => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
        if (showEmployeeInput) {
            setEmpleadoCode('');
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }
    }, [showEmployeeInput]);

    const toggleOpcion = (opcion) => {
        setOpciones(prev => ({
            ...prev,
            [opcion]: !prev[opcion],
        }));
    };

    const formatMessage = (message) => {
        if (!message) return '';
        return message.replace(/\r?\n/g, '<br/>');
    };

    const handlePresencia = async (tipo) => {
        if (!empleadoCode.trim()) {
            setModalConfig({
                isOpen: true,
                message: 'Introduce tu código de empleado',
                type: 'warning',
            });
            return;
        }

        try {
            setLoading(true);

            const payload = {
                Funcion: 'CrearParte',
                Tipo: tipo,
                UUIDCentral: empresa?.UUIDEmpresa || 'unknown',
                ClaveEmpleado: empleadoCode,
                GPS: 'n/d',
                userAgent: navigator.userAgent,
                Hora: new Date().toISOString(),
                IP: '',
                HoraExtra: opciones.HoraExtra,
            };

            const response = await apiService.submitPresencia(payload);

            if (response.status === 'ok') {
                saveEmployeeCode(empleadoCode);
                setEmpleadoCode(getEmployeeCode());

                // Actualizar panel de info con ultimo parte para entrada/salida/ultimo
                await fetchUltimoParteData();

                setModalConfig({
                    isOpen: true,
                    message: `${tipo.charAt(0).toUpperCase() + tipo.slice(1)}: ${response.message || 'Registrado exitosamente'}`,
                    type: 'success',
                });
                // Reset options
                setOpciones({ HoraExtra: false });
            } else {
                setModalConfig({
                    isOpen: true,
                    message: response.message || 'Error desconocido',
                    type: 'error',
                });
            }
        } catch (err) {
            console.error('Error registrando presencia:', err);
            setModalConfig({
                isOpen: true,
                message: err.message || 'Error al registrar presencia',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reloj-page-wrapper">
            <AppHeader />
            <div className="reloj-container">
                <div className={`reloj-card ${loading ? 'loading' : ''}`}>
                    {/* Logo y nombre empresa */}
                    <div className="empresa-header">
                        {empresa?.logoUrl && (
                            <div className="empresa-logo-wrapper">
                                <img src={empresa.logoUrl} alt={empresa.nombreEmpresa || 'Company logo'} className="empresa-logo" />
                            </div>
                        )}
                        {empresa?.nombreEmpresa && (
                            <h1 className="empresa-name">{empresa.nombreEmpresa}</h1>
                        )}
                    </div>

                    {/* Reloj digital */}
                    <div className="reloj-digital">
                        <div className="time-display">
                            {currentTime.toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                            })}
                        </div>
                        <div className="date-display">
                            {currentTime.toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </div>
                    </div>

                    {/* Código de empleado (mostrar input si no hay sesión, texto si hay sesión) */}
                    {showEmployeeInput ? (
                        <>
                            <p className="instruction">Introduce tu código de empleado</p>
                            <div className="input-group">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={empleadoCode}
                                    onChange={(e) => setEmpleadoCode(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handlePresencia('entrada');
                                        }
                                    }}
                                    placeholder="Código de empleado"
                                    disabled={loading}
                                    className="input-codigo"
                                    autoComplete="off"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="empleado-activo">
                            <span className="empleado-label">Código de empleado:</span>
                            <span className="empleado-codigo">{empleadoCode}</span>
                        </div>
                    )}

                    {/* Panel de información del último parte */}
                    {ultimoParte && ultimoParte.message && (
                        <div className="info-panel">
                            <div
                                className="info-panel-content"
                                dangerouslySetInnerHTML={{ __html: formatMessage(ultimoParte.message) }}
                            />
                        </div>
                    )}

                    {/* Opciones */}
                    <div className="opciones-group">
                        <h3 className="opciones-title">Opciones</h3>
                        <label className="opcion-item">
                            <input
                                type="checkbox"
                                checked={opciones.HoraExtra}
                                onChange={() => toggleOpcion('HoraExtra')}
                                disabled={loading}
                            />
                            <span className="opcion-label">horas extras preavisadas</span>
                        </label>
                    </div>

                    {/* Botones */}
                    <div className={`buttons-group ${showUltimoButton ? 'buttons-group--three' : ''}`}>
                        <button
                            onClick={() => handlePresencia('entrada')}
                            disabled={loading}
                            className="btn btn-entrada"
                        >
                            {loading ? 'Procesando...' : 'Entrada'}
                        </button>
                        <button
                            onClick={() => handlePresencia('salida')}
                            disabled={loading}
                            className="btn btn-salida"
                        >
                            {loading ? 'Procesando...' : 'Salida'}
                        </button>
                        {showUltimoButton && (
                            <button
                                onClick={() => handlePresencia('ultimo')}
                                disabled={loading}
                                className="btn btn-ultimo"
                            >
                                {loading ? 'Procesando...' : 'Último parte'}
                            </button>
                        )}
                    </div>

                    {/* Mensajes - Ahora se muestran en modal */}

                    {/* Footer */}
                    <div className="reloj-footer">
                        <small>v0.2.0</small>
                    </div>
                </div>
            </div>

            {/* Modal de notificaciones */}
            <Modal
                isOpen={modalConfig.isOpen}
                onClose={handleCloseModal}
                message={modalConfig.message}
                type={modalConfig.type}
                duration={4000}
            />
        </div>
    );
}