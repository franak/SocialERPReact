import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import AppHeader from '../components/AppHeader';
import '../styles/AdminCalendariosPage.css';

const TIPOS_EVENTO = ['Todos', 'Vacaciones', 'Baja Laboral', 'Ausencia'];
const ESTADOS = ['Todos', 'Incompleta', 'Pendiente', 'En Curso', 'Procesada', 'No procesable', 'Rechazada'];

export default function AdminCalendariosPage() {
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        claveEmpleado: '',
        tipoEvento: 'Todos',
        estado: 'Todos',
    });

    useEffect(() => {
        fetchEventos();
    }, []);

    const fetchEventos = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filters.claveEmpleado) params.claveEmpleado = filters.claveEmpleado;
            if (filters.tipoEvento !== 'Todos') params.tipoEvento = filters.tipoEvento;
            if (filters.estado !== 'Todos') params.estado = filters.estado;

            const response = await apiService.getAdminCalendarios(params);
            if (response.status === 'ok') {
                setEventos(response.data || []);
                setError('');
            } else {
                setError(response.message || 'Error al cargar eventos');
            }
        } catch (err) {
            console.error('Error cargando calendarios:', err);
            setError(err.message || 'Error al cargar eventos');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleApplyFilters = () => {
        fetchEventos();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('es-ES');
    };

    return (
        <div className="admin-page-wrapper">
            <AppHeader />
            <div className="admin-container">
                <div className="admin-card">
                    <div className="admin-header">
                        <h1>Calendarios de Empleados</h1>
                    </div>

                    {/* Filters */}
                    <div className="admin-filters">
                        <div className="filter-group">
                            <label htmlFor="filter-empleado">Código Empleado:</label>
                            <input
                                id="filter-empleado"
                                type="text"
                                value={filters.claveEmpleado}
                                onChange={(e) => handleFilterChange('claveEmpleado', e.target.value)}
                                placeholder="Buscar por código"
                                disabled={loading}
                            />
                        </div>
                        <div className="filter-group">
                            <label htmlFor="filter-tipo">Tipo:</label>
                            <select
                                id="filter-tipo"
                                value={filters.tipoEvento}
                                onChange={(e) => handleFilterChange('tipoEvento', e.target.value)}
                                disabled={loading}
                            >
                                {TIPOS_EVENTO.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label htmlFor="filter-estado">Estado:</label>
                            <select
                                id="filter-estado"
                                value={filters.estado}
                                onChange={(e) => handleFilterChange('estado', e.target.value)}
                                disabled={loading}
                            >
                                {ESTADOS.map((e) => (
                                    <option key={e} value={e}>
                                        {e}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button onClick={handleApplyFilters} disabled={loading} className="btn-refresh">
                            {loading ? 'Cargando...' : 'Filtrar'}
                        </button>
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}

                    {/* Events Table */}
                    <div className="events-table-container">
                        {eventos.length === 0 ? (
                            <p className="empty-list">No se encontraron eventos con los filtros aplicados</p>
                        ) : (
                            <table className="events-table">
                                <thead>
                                    <tr>
                                        <th>Código Empleado</th>
                                        <th>Tipo</th>
                                        <th>Fecha Desde</th>
                                        <th>Fecha Hasta</th>
                                        <th>Estado</th>
                                        <th>Descripción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {eventos.map((ev) => (
                                        <tr key={ev.uuid}>
                                            <td className="employee-code">{ev.claveEmpleado}</td>
                                            <td>
                                                <span className={`event-badge event-${ev.tipoEvento.replace(' ', '-').toLowerCase()}`}>
                                                    {ev.tipoEvento}
                                                </span>
                                            </td>
                                            <td>{formatDate(ev.fechaInicio)}</td>
                                            <td>{formatDate(ev.fechaFin)}</td>
                                            <td>
                                                <span className={`status-badge status-${ev.estado.toLowerCase().replace(' ', '-')}`}>
                                                    {ev.estado}
                                                </span>
                                            </td>
                                            <td className="description-cell">{ev.descripcion || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="results-count">
                        {eventos.length} evento{eventos.length !== 1 ? 's' : ''} encontrado{eventos.length !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>
        </div>
    );
}
