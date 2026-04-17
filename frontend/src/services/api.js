import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

/**
 * Obtiene token del localStorage y lo añade a headers.
 */
const getAuthToken = () => localStorage.getItem('adminToken');

export const apiService = {
    /**
     * GET /api/empresa
     */
    fetchEmpresa: async (config = null) => {
        try {
            const params = config ? { config } : {};
            const response = await api.get('/empresa', { params });
            console.log('fetchEmpresa response:', response.data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { status: 'KO', message: error.message };
        }
    },

    /**
     * GET /api/empresa/logo/:uuidEmpresa
     * Fetches company logo as a blob URL
     */
    fetchEmpresaLogo: async (uuidEmpresa) => {
        try {
            const response = await api.get(`/empresa/logo/${uuidEmpresa}`, {
                responseType: 'blob',
            });
            return URL.createObjectURL(response.data);
        } catch (error) {
            console.warn('Could not fetch company logo:', error.message);
            return null;
        }
    },

    /**
     * POST /api/control-presencia
     */
    submitPresencia: async (payload, config = null) => {
        try {
            const params = config ? { config } : {};
            const response = await api.post('/control-presencia', payload, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { status: 'KO', message: error.message };
        }
    },

    /**
     * GET /api/server-info
     */
    fetchServerInfo: async (config = null) => {
        try {
            const params = config ? { config } : {};
            const response = await api.get('/server-info', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { status: 'KO', message: error.message };
        }
    },

    /**
     * POST /api/auth/login
     */
    login: async (username, password) => {
        try {
            const response = await api.post('/auth/login', { username, password });
            if (response.data.token) {
                localStorage.setItem('adminToken', response.data.token);
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { status: 'KO', message: error.message };
        }
    },

    /**
     * GET /api/auth/logs
     */
    fetchLogs: async (filters = {}, limit = 50, skip = 0) => {
        try {
            const token = getAuthToken();
            if (!token) {
                throw new Error('No autenticado');
            }

            const params = { limit, skip, ...filters };
            const response = await api.get('/auth/logs', {
                params,
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { status: 'KO', message: error.message };
        }
    },

    /**
     * Logout (limpia token local)
     */
    logout: () => {
        localStorage.removeItem('adminToken');
    },

    /**
     * Verifica si está autenticado
     */
    isAuthenticated: () => !!getAuthToken(),

    /**
     * GET /api/calendario?claveEmpleado=xxx
     */
    getCalendario: async (claveEmpleado) => {
        try {
            const response = await api.get('/calendario', {
                params: { claveEmpleado },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { status: 'KO', message: error.message };
        }
    },

    /**
     * POST /api/calendario
     */
    createCalendario: async (payload) => {
        try {
            const response = await api.post('/calendario', payload);
            return response.data;
        } catch (error) {
            throw error.response?.data || { status: 'KO', message: error.message };
        }
    },

    /**
     * PUT /api/calendario/:uuid
     */
    updateCalendario: async (uuid, payload) => {
        try {
            const response = await api.put(`/calendario/${uuid}`, payload);
            return response.data;
        } catch (error) {
            throw error.response?.data || { status: 'KO', message: error.message };
        }
    },

    /**
     * DELETE /api/calendario/:uuid
     */
    deleteCalendario: async (uuid) => {
        try {
            const response = await api.delete(`/calendario/${uuid}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { status: 'KO', message: error.message };
        }
    },

    /**
     * GET /api/admin/calendarios (admin only)
     */
    getAdminCalendarios: async (filters = {}) => {
        try {
            const token = getAuthToken();
            if (!token) {
                throw new Error('No autenticado');
            }
            const response = await api.get('/admin/calendarios', {
                params: filters,
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { status: 'KO', message: error.message };
        }
    },

    /**
     * GET /api/nominas?UUIDCuentaContable=xxx
     * Obtiene las nóminas del empleado desde el API externo
     */
    fetchNominas: async (uuidCuentaContable) => {
        try {
            const response = await api.get('/nominas', {
                params: { UUIDCuentaContable: uuidCuentaContable },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { status: 'KO', message: error.message };
        }
    },

    /**
     * GET /api/nominas/pdf?UUIDNomina=xxx&UUIDCuentaContable=xxx
     * Obtiene el PDF de la nómina desde el API externo
     */
    fetchNominaPdf: async (uuidNomina, uuidCuentaContable) => {
        try {
            const response = await api.get('/nominas/pdf', {
                params: { UUIDNomina: uuidNomina, UUIDCuentaContable: uuidCuentaContable },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { status: 'KO', message: error.message };
        }
    },

    /**
     * GET /api/historial-presencia?ClaveEmpleado=xxx&UUIDCentral=xxx
     * Obtiene el historial de control de presencia
     */
    fetchHistorialPresencia: async (claveEmpleado, uuidCentral) => {
        try {
            const response = await api.get('/historial-presencia', {
                params: { ClaveEmpleado: claveEmpleado, UUIDCentral: uuidCentral },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { status: 'KO', message: error.message };
        }
    },
};
