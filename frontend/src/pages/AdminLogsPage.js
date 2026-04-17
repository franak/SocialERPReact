import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import AppHeader from '../components/AppHeader';
import '../styles/AdminPage.css';

export default function AdminLogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [limit, setLimit] = useState(50);
    const [skip, setSkip] = useState(0);
    const [total, setTotal] = useState(0);
    const [configFilter, setConfigFilter] = useState('');

    useEffect(() => {
        loadLogs();
    }, [skip, limit, configFilter]);

    const loadLogs = async () => {
        try {
            setLoading(true);
            const filters = configFilter ? { configName: configFilter } : {};
            const response = await apiService.fetchLogs(filters, limit, skip);

            if (response.status === 'ok') {
                setLogs(response.data || []);
                setTotal(response.pagination?.total || 0);
                setError('');
            } else {
                setError(response.message || 'Error al cargar logs');
            }
        } catch (err) {
            console.error('Error cargando logs:', err);
            setError(err.message || 'Error al cargar logs');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('es-ES');
    };

    const hasMore = skip + limit < total;

    return (
        <div className="admin-page-wrapper">
            <AppHeader />
            <div className="admin-container">
                <div className="admin-card">
                    <div className="admin-header">
                        <h1>Log de Eventos</h1>
                    </div>

                    <div className="admin-filters">
                        <div className="filter-group">
                            <label htmlFor="config-filter">Config:</label>
                            <input
                                id="config-filter"
                                type="text"
                                value={configFilter}
                                onChange={(e) => {
                                    setConfigFilter(e.target.value);
                                    setSkip(0);
                                }}
                                placeholder="Ej: default, cliente1"
                                disabled={loading}
                            />
                        </div>
                        <button onClick={loadLogs} disabled={loading} className="btn-refresh">
                            {loading ? 'Cargando...' : 'Actualizar'}
                        </button>
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}

                    <div className="logs-table-container">
                        <table className="logs-table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Ruta</th>
                                    <th>Config</th>
                                    <th>Método</th>
                                    <th>Status</th>
                                    <th>IP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length > 0 ? (
                                    logs.map((log) => (
                                        <tr key={log._id}>
                                            <td>{formatDate(log.timestamp)}</td>
                                            <td>{log.route}</td>
                                            <td>{log.configName}</td>
                                            <td>{log.method}</td>
                                            <td className={log.statusCode >= 400 ? 'status-error' : 'status-ok'}>
                                                {log.statusCode}
                                            </td>
                                            <td>{log.ip}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="no-data">
                                            Sin registros
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="pagination">
                        <button
                            onClick={() => setSkip(Math.max(0, skip - limit))}
                            disabled={skip === 0 || loading}
                            className="btn-pag"
                        >
                            ← Anterior
                        </button>
                        <span className="pag-info">
                            {skip + 1} - {Math.min(skip + limit, total)} de {total}
                        </span>
                        <button
                            onClick={() => setSkip(skip + limit)}
                            disabled={!hasMore || loading}
                            className="btn-pag"
                        >
                            Siguiente →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
