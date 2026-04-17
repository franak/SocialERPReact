import React, { useEffect, useState, useMemo } from 'react';
import { apiService } from '../services/api';
import Modal from '../components/Modal';
import AppHeader from '../components/AppHeader';
import { getEmployeeCode, getUUIDCentral } from '../utils/session';
import '../styles/HistorialPage.css';

const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function HistorialPage() {
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(false);
    const [anio, setAnio] = useState(new Date().getFullYear().toString());
    const [mes, setMes] = useState('');
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        message: '',
        type: 'info',
    });

    const empleadoCode = getEmployeeCode();
    const uuidCentral = getUUIDCentral();

    const fetchHistorial = async () => {
        try {
            setLoading(true);
            const response = await apiService.fetchHistorialPresencia(empleadoCode, uuidCentral);
            console.log('Historial response:', response);
            
            if (response.message) {
                try {
                    const data = JSON.parse(response.message);
                    setRegistros(data);
                } catch (parseErr) {
                    console.error('Error parsing historial:', parseErr);
                    setRegistros([]);
                }
            } else if (Array.isArray(response)) {
                setRegistros(response);
            } else {
                setRegistros([]);
            }
        } catch (err) {
            console.error('Error fetching historial:', err);
            setModalConfig({
                isOpen: true,
                message: err.message || 'Error al cargar historial',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (empleadoCode && uuidCentral) {
            fetchHistorial();
        } else if (empleadoCode) {
            setModalConfig({
                isOpen: true,
                message: 'Sesión vencada. Por favor, vuelve a introducir tu código en la pantalla principal.',
                type: 'warning',
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [empleadoCode, uuidCentral]);

    const parseSecondsToTime = (seconds) => {
        if (!seconds || seconds === 0) return '-';
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const parseSecondsToHours = (seconds) => {
        if (!seconds || seconds === 0) return '-';
        const hours = seconds / 3600;
        return hours.toFixed(2);
    };

    const getYearFromFecha = (fecha) => {
        if (!fecha) return '';
        return fecha.split('-')[0];
    };

    const getMesFromFecha = (fecha) => {
        if (!fecha) return '';
        const mesNum = parseInt(fecha.split('-')[1], 10) - 1;
        return MESES[mesNum] || '';
    };

    const getDiaSemana = (fecha) => {
        if (!fecha) return '';
        const dt = new Date(fecha);
        return DIAS_SEMANA[dt.getDay()];
    };

    const availableYears = useMemo(() => {
        const years = new Set(registros.map(r => getYearFromFecha(r.Fecha)).filter(Boolean));
        return Array.from(years).sort((a, b) => b - a);
    }, [registros]);

    const filteredRegistros = useMemo(() => {
        let filtered = registros;
        if (anio) {
            filtered = filtered.filter(r => {
                const year = getYearFromFecha(r.Fecha);
                const mesFecha = r.Fecha ? r.Fecha.split('-')[1] : '';
                return year === anio && (!mes || mes === mesFecha);
            });
        }
        return filtered.sort((a, b) => {
            return b.Fecha.localeCompare(a.Fecha);
        });
    }, [registros, anio, mes]);

    useEffect(() => {
        if (availableYears.length > 0 && !anio) {
            setAnio(availableYears[0]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [availableYears]);

    return (
        <div className="historial-page-wrapper">
            <AppHeader />
            <div className="historial-container">
                <div className={`historial-card ${loading ? 'loading' : ''}`}>
                    <div className="historial-header">
                        <h1 className="historial-title">Historial de Presencia</h1>
                        <span className="historial-subtitle">Registro de entradas y salidas</span>
                    </div>

                    {registros.length > 0 && (
                        <div className="historial-filters">
                            <div className="filter-group">
                                <label htmlFor="anio">Año:</label>
                                <select
                                    id="anio"
                                    value={anio}
                                    onChange={(e) => setAnio(e.target.value)}
                                >
                                    {availableYears.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-group">
                                <label htmlFor="mes">Mes:</label>
                                <select
                                    id="mes"
                                    value={mes}
                                    onChange={(e) => setMes(e.target.value)}
                                >
                                    <option value="">Todos</option>
                                    {MESES.map((m, idx) => (
                                        <option key={idx} value={(idx + 1).toString().padStart(2, '0')}>{m}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div className="loading-overlay">
                            <div className="loading-spinner"></div>
                            <p className="loading-text">Cargando historial...</p>
                        </div>
                    )}

                    {!loading && filteredRegistros.length === 0 && registros.length > 0 && (
                        <div className="empty-state">
                            <p className="empty-message">No se encontraron registros para el filtro seleccionado</p>
                        </div>
                    )}

                    {!loading && filteredRegistros.length === 0 && registros.length === 0 && (
                        <div className="empty-state">
                            <p className="empty-message">No se encontraron registros de presencia</p>
                        </div>
                    )}

                    {!loading && filteredRegistros.length > 0 && (
                        <div className="historial-list">
                            <table className="historial-table">
                                <thead>
                                    <tr>
                                        <th>Año</th>
                                        <th>Mes</th>
                                        <th>Día</th>
                                        <th>Hora Entrada</th>
                                        <th>Hora Salida</th>
                                        <th>Total Horas</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRegistros.map((reg, idx) => (
                                        <tr key={reg.Fecha || idx}>
                                            <td className="anio-cell">
                                                {getYearFromFecha(reg.Fecha)}
                                            </td>
                                            <td className="mes-cell">
                                                {getMesFromFecha(reg.Fecha)}
                                            </td>
                                            <td className="dia-cell">
                                                {getDiaSemana(reg.Fecha)}
                                            </td>
                                            <td className="entrada-cell">
                                                {parseSecondsToTime(reg.Entrada)}
                                            </td>
                                            <td className="salida-cell">
                                                {parseSecondsToTime(reg.Salida)}
                                            </td>
                                            <td className="total-cell">
                                                {reg.Salida && reg.Entrada ? parseSecondsToHours(reg.Salida - reg.Entrada) : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

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