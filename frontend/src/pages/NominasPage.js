import React, { useEffect, useState, useMemo } from 'react';
import { apiService } from '../services/api';
import Modal from '../components/Modal';
import AppHeader from '../components/AppHeader';
import { getEmployeeCode, getUUIDCuentaContable } from '../utils/session';
import '../styles/NominasPage.css';

const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function NominasPage() {
    const [nominas, setNominas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [anio, setAnio] = useState('');
    const [mes, setMes] = useState('');
    const [pdfData, setPdfData] = useState(null);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        message: '',
        type: 'info',
    });

    const empleadoCode = getEmployeeCode();
    const uuidCuentaContable = getUUIDCuentaContable();

    const fetchNominas = async () => {
        try {
            setLoading(true);
            const response = await apiService.fetchNominas(uuidCuentaContable);
            console.log('Nóminas response:', response);
            if (response?.result && Array.isArray(response.result)) {
                setNominas(response.result);
            } else if (response && Array.isArray(response)) {
                setNominas(response);
            } else {
                setNominas([]);
            }
        } catch (err) {
            console.error('Error fetching nóminas:', err);
            setModalConfig({
                isOpen: true,
                message: err.message || 'Error al cargar nóminas',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (empleadoCode && uuidCuentaContable) {
            fetchNominas();
        } else if (empleadoCode) {
            setModalConfig({
                isOpen: true,
                message: 'No se encontró UUID de cuenta contable. Por favor, valida tu código desde la pantalla principal.',
                type: 'warning',
            });
        }
    }, [empleadoCode, uuidCuentaContable]);

    const getYearFromFecha = (fechaDesde) => {
        if (!fechaDesde) return '';
        const dt = new Date(fechaDesde);
        return dt.getFullYear().toString();
    };

    const getMesFromFecha = (fechaDesde) => {
        if (!fechaDesde) return '';
        const dt = new Date(fechaDesde);
        return MESES[dt.getMonth()];
    };

    const formatPeriodo = (fechaDesde, fechaHasta) => {
        if (!fechaDesde || !fechaHasta) return '-';
        const from = new Date(fechaDesde);
        const to = new Date(fechaHasta);

        const diaDesde = from.getDate();
        const mesNombreDesde = MESES[from.getMonth()];
        const anioDesde = from.getFullYear();

        const diaHasta = to.getDate();
        const mesNombreHasta = MESES[to.getMonth()];
        const anioHasta = to.getFullYear();

        return `del ${diaDesde} de ${mesNombreDesde} de ${anioDesde} al ${diaHasta} de ${mesNombreHasta} de ${anioHasta}`;
    };

    const extractPdfBase64 = (response) => {
        if (!response) return null;
        if (typeof response === 'string') return response;
        if (response.ArchivoBase64) return response.ArchivoBase64;
        if (response.archivoBase64) return response.archivoBase64;
        if (response.result?.ArchivoBase64) return response.result.ArchivoBase64;
        if (response.result?.archivoBase64) return response.result.archivoBase64;
        if (response.result?.Nomina?.ArchivoBase64) return response.result.Nomina.ArchivoBase64;
        if (response.result?.Nomina?.archivoBase64) return response.result.Nomina.archivoBase64;
        if (response.data?.ArchivoBase64) return response.data.ArchivoBase64;
        if (response.data?.archivoBase64) return response.data.archivoBase64;
        if (Array.isArray(response) && response.length > 0) {
            return extractPdfBase64(response[0]);
        }
        return null;
    };

    const availableYears = useMemo(() => {
        const years = new Set(nominas.map(n => getYearFromFecha(n.FechaDesde)).filter(Boolean));
        return Array.from(years).sort((a, b) => b - a);
    }, [nominas]);

    const filteredNominas = useMemo(() => {
        if (!anio) return nominas;
        return nominas.filter(n => {
            const year = getYearFromFecha(n.FechaDesde);
            const mesFecha = (new Date(n.FechaDesde).getMonth() + 1).toString();
            return year === anio && (!mes || mes === mesFecha);
        });
    }, [nominas, anio, mes]);

    useEffect(() => {
        if (availableYears.length > 0 && !anio) {
            setAnio(availableYears[0]);
        }
    }, [availableYears]);

    const handleDownloadPdf = async (nomina) => {
        console.log('Descargando PDF para:', nomina);
        try {
            setLoading(true);
            const response = await apiService.fetchNominaPdf(nomina.UUIDNomina, uuidCuentaContable);
            console.log('Nomina PDF response:', response);

            const archivoBase64 = extractPdfBase64(response);
            if (archivoBase64) {
                setPdfData(archivoBase64);
                setShowPdfModal(true);
            } else {
                console.warn('No se encontró ArchivoBase64 en la respuesta del PDF:', response);
                setModalConfig({
                    isOpen: true,
                    message: 'No se pudo obtener el PDF de la nómina',
                    type: 'warning',
                });
            }
        } catch (err) {
            console.error('Error fetching PDF:', err);
            setModalConfig({
                isOpen: true,
                message: err.message || 'Error al descargar PDF',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadFile = (base64, fileName) => {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);
    };

    return (
        <div className="nominas-page-wrapper">
            <AppHeader />
            <div className="nominas-container">
                <div className={`nominas-card ${loading ? 'loading' : ''}`}>
                    <div className="nominas-header">
                        <h1 className="nominas-title">Nóminas</h1>
                        <span className="nominas-subtitle">Consulta tus recibos de pago</span>
                    </div>

                    {nominas.length > 0 && (
                        <div className="nominas-filters">
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
                                        <option key={idx} value={(idx + 1).toString()}>{m}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div className="loading-overlay">
                            <div className="loading-spinner"></div>
                            <p className="loading-text">Cargando nóminas...</p>
                        </div>
                    )}

                    {!loading && filteredNominas.length === 0 && nominas.length > 0 && (
                        <div className="empty-state">
                            <p className="empty-message">No se encontraron nóminas para el filtro seleccionado</p>
                        </div>
                    )}

                    {!loading && filteredNominas.length === 0 && nominas.length === 0 && (
                        <div className="empty-state">
                            <p className="empty-message">No se encontraron nóminas</p>
                        </div>
                    )}

                    {!loading && filteredNominas.length > 0 && (
                        <div className="nominas-list">
                            <table className="nominas-table">
                                <thead>
                                    <tr>
                                        <th>Año</th>
                                        <th>Mes</th>
                                        <th>Período</th>
                                        <th>Fecha Pago</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredNominas.map((nomina) => (
                                        <tr key={nomina.UUIDNomina}>
                                            <td className="anio-cell">
                                                {getYearFromFecha(nomina.FechaDesde)}
                                            </td>
                                            <td className="mes-cell">
                                                {getMesFromFecha(nomina.FechaDesde)}
                                            </td>
                                            <td className="periodo-cell">
                                                {formatPeriodo(nomina.FechaDesde, nomina.FechaHasta)}
                                            </td>
                                            <td className="fecha-pago-cell">
                                                {nomina.FechaPago}
                                            </td>
                                            <td className="actions-cell">
                                                <button
                                                    className="download-btn"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleDownloadPdf(nomina);
                                                    }}
                                                    title="Descargar PDF"
                                                >
                                                    📄
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {nominas.length > 0 && availableYears.length === 0 && (
                        <div className="empty-state">
                            <p className="empty-message">No hay nóminas con datos válidos</p>
                        </div>
                    )}
                </div>
            </div>

            {/* PDF Modal */}
            {showPdfModal && pdfData && (
                <div className="pdf-modal-overlay" onClick={() => setShowPdfModal(false)}>
                    <div className="pdf-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="pdf-modal-header">
                            <h2>Vista Previa PDF</h2>
                            <div className="pdf-modal-actions">
                                <button
                                    className="btn-download"
                                    onClick={() => handleDownloadFile(pdfData, 'nomina.pdf')}
                                >
                                    Descargar
                                </button>
                                <button
                                    className="btn-close"
                                    onClick={() => setShowPdfModal(false)}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                        <div className="pdf-viewer">
                            <iframe
                                src={`data:application/pdf;base64,${pdfData}`}
                                title="Nómina PDF"
                            />
                        </div>
                    </div>
                </div>
            )}

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