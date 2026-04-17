import React, { useEffect, useState, useCallback } from 'react';
import { apiService } from '../services/api';
import Modal from '../components/Modal';
import AppHeader from '../components/AppHeader';
import { getEmployeeCode } from '../utils/session';
import '../styles/CalendarioPage.css';

const TIPOS_EVENTO = ['Vacaciones', 'Baja Laboral', 'Ausencia'];
const ESTADOS = ['Incompleta', 'Pendiente', 'En Curso', 'Procesada', 'No procesable', 'Rechazada'];
const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export default function CalendarioPage() {
    const [view, setView] = useState('calendar'); // 'calendar' | 'list'
    const [currentDate, setCurrentDate] = useState(new Date());
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingEvento, setEditingEvento] = useState(null);
    const [formData, setFormData] = useState({
        tipoEvento: 'Vacaciones',
        fechaInicio: '',
        fechaFin: '',
        descripcion: '',
    });
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        message: '',
        type: 'info',
    });

    const empleadoCode = getEmployeeCode();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Fetch eventos on mount and when view changes
    useEffect(() => {
        if (empleadoCode) {
            fetchEventos();
        }
    }, [empleadoCode, view]);

    const fetchEventos = async () => {
        try {
            setLoading(true);
            const response = await apiService.getCalendario(empleadoCode);
            if (response.status === 'ok') {
                setEventos(response.data || []);
            }
        } catch (err) {
            console.error('Error fetching eventos:', err);
            setModalConfig({
                isOpen: true,
                message: err.message || 'Error al cargar eventos',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const handleOpenForm = (evento = null) => {
        if (evento) {
            setEditingEvento(evento);
            setFormData({
                tipoEvento: evento.tipoEvento,
                fechaInicio: evento.fechaInicio?.split('T')[0] || '',
                fechaFin: evento.fechaFin?.split('T')[0] || '',
                descripcion: evento.descripcion || '',
            });
        } else {
            setEditingEvento(null);
            setFormData({
                tipoEvento: 'Vacaciones',
                fechaInicio: '',
                fechaFin: '',
                descripcion: '',
            });
        }
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingEvento(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.fechaInicio || !formData.fechaFin) {
            setModalConfig({
                isOpen: true,
                message: 'Fecha inicio y fecha fin son requeridas',
                type: 'warning',
            });
            return;
        }

        try {
            setLoading(true);

            const payload = {
                claveEmpleado: empleadoCode,
                tipoEvento: formData.tipoEvento,
                fechaInicio: formData.fechaInicio,
                fechaFin: formData.fechaFin,
                descripcion: formData.descripcion,
                summary: formData.tipoEvento,
            };

            let response;
            if (editingEvento) {
                response = await apiService.updateCalendario(editingEvento.uuid, payload);
            } else {
                response = await apiService.createCalendario(payload);
            }

            if (response.status === 'ok') {
                setModalConfig({
                    isOpen: true,
                    message: editingEvento ? 'Evento actualizado' : 'Evento creado',
                    type: 'success',
                });
                handleCloseForm();
                fetchEventos();
            }
        } catch (err) {
            console.error('Error saving evento:', err);
            setModalConfig({
                isOpen: true,
                message: err.message || 'Error al guardar evento',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (uuid) => {
        try {
            setLoading(true);
            const response = await apiService.deleteCalendario(uuid);
            if (response.status === 'ok') {
                setModalConfig({
                    isOpen: true,
                    message: 'Evento eliminado',
                    type: 'success',
                });
                fetchEventos();
            }
        } catch (err) {
            setModalConfig({
                isOpen: true,
                message: err.message || 'Error al eliminar evento',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    // Calendar grid calculations
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDay = firstDayOfMonth.getDay(); // 0=Sun
    const adjustedStartDay = startDay === 0 ? 6 : startDay - 1; // Convert to Mon=0
    const daysInMonth = lastDayOfMonth.getDate();

    const calendarDays = [];
    // Padding days
    for (let i = 0; i < adjustedStartDay; i++) {
        calendarDays.push(null);
    }
    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
        calendarDays.push(d);
    }

    // Get eventos for a specific day
    const getEventosForDay = (day) => {
        if (!day) return [];
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const date = new Date(dateStr);
        return eventos.filter((ev) => {
            const start = new Date(ev.fechaInicio);
            const end = new Date(ev.fechaFin);
            return date >= start && date <= end;
        });
    };

    // Today highlight
    const today = new Date();
    const isToday = (day) =>
        day &&
        today.getDate() === day &&
        today.getMonth() === month &&
        today.getFullYear() === year;

    return (
        <div className="calendario-page-wrapper">
            <AppHeader />
            <div className="calendario-container">
                <div className={`calendario-card ${loading ? 'loading' : ''}`}>
                    {/* Header */}
                    <div className="calendario-header">
                        <h1 className="calendario-title">Calendario</h1>
                        <div className="calendario-controls">
                            <button className="view-toggle-btn" onClick={() => setView(view === 'calendar' ? 'list' : 'calendar')}>
                                {view === 'calendar' ? 'Vista Lista' : 'Vista Calendario'}
                            </button>
                            <button className="new-event-btn" onClick={() => handleOpenForm()}>
                                + Nuevo Evento
                            </button>
                        </div>
                    </div>

                    {view === 'calendar' && (
                        <>
                            {/* Month Navigation */}
                            <div className="month-nav">
                                <button onClick={handlePrevMonth}>&larr;</button>
                                <h2>
                                    {MESES[month]} {year}
                                </h2>
                                <button onClick={handleNextMonth}>&rarr;</button>
                            </div>

                            {/* Calendar Grid */}
                            <div className="calendar-grid">
                                {/* Day headers */}
                                {DIAS_SEMANA.map((dia) => (
                                    <div key={dia} className="calendar-day-header">
                                        {dia}
                                    </div>
                                ))}
                                {/* Days */}
                                {calendarDays.map((day, idx) => {
                                    const dayEventos = getEventosForDay(day);
                                    return (
                                        <div
                                            key={idx}
                                            className={`calendar-day ${!day ? 'empty' : ''} ${isToday(day) ? 'today' : ''}`}
                                        >
                                            {day && (
                                                <>
                                                    <span className="day-number">{day}</span>
                                                    {dayEventos.slice(0, 2).map((ev) => (
                                                        <div
                                                            key={ev.uuid}
                                                            className={`event-chip event-${ev.tipoEvento.replace(' ', '-').toLowerCase()}`}
                                                            title={`${ev.tipoEvento}: ${ev.estado}`}
                                                        >
                                                            {ev.tipoEvento}
                                                        </div>
                                                    ))}
                                                    {dayEventos.length > 2 && (
                                                        <span className="more-events">+{dayEventos.length - 2}</span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {view === 'list' && (
                        <div className="list-view">
                            {eventos.length === 0 ? (
                                <p className="empty-list">No hay eventos registrados</p>
                            ) : (
                                <table className="event-table">
                                    <thead>
                                        <tr>
                                            <th>Tipo</th>
                                            <th>Desde</th>
                                            <th>Hasta</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {eventos.map((ev) => (
                                            <tr key={ev.uuid}>
                                                <td>
                                                    <span className={`event-badge event-${ev.tipoEvento.replace(' ', '-').toLowerCase()}`}>
                                                        {ev.tipoEvento}
                                                    </span>
                                                </td>
                                                <td>{ev.fechaInicio?.split('T')[0]}</td>
                                                <td>{ev.fechaFin?.split('T')[0]}</td>
                                                <td>
                                                    <span className={`status-badge status-${ev.estado.toLowerCase().replace(' ', '-')}`}>
                                                        {ev.estado}
                                                    </span>
                                                </td>
                                                <td className="actions-cell">
                                                    <button className="btn-edit" onClick={() => handleOpenForm(ev)}>
                                                        Editar
                                                    </button>
                                                    <button className="btn-delete" onClick={() => handleDelete(ev.uuid)}>
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Event Form Modal */}
            {showForm && (
                <div className="form-overlay" onClick={handleCloseForm}>
                    <div className="form-card" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingEvento ? 'Editar Evento' : 'Nuevo Evento'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="tipoEvento">Tipo de Evento</label>
                                <select
                                    id="tipoEvento"
                                    value={formData.tipoEvento}
                                    onChange={(e) => setFormData({ ...formData, tipoEvento: e.target.value })}
                                    disabled={loading}
                                >
                                    {TIPOS_EVENTO.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="fechaInicio">Fecha Inicio</label>
                                    <input
                                        id="fechaInicio"
                                        type="date"
                                        value={formData.fechaInicio}
                                        onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                                        disabled={loading}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="fechaFin">Fecha Fin</label>
                                    <input
                                        id="fechaFin"
                                        type="date"
                                        value={formData.fechaFin}
                                        onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="descripcion">Descripción</label>
                                <textarea
                                    id="descripcion"
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    disabled={loading}
                                    rows={3}
                                />
                            </div>
                            <div className="form-buttons">
                                <button type="button" className="btn-cancel" onClick={handleCloseForm}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-submit" disabled={loading}>
                                    {loading ? 'Guardando...' : editingEvento ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
