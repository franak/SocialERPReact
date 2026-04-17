const axios = require('axios');

let sessionCookie = null;

const setSessionCookie = (cookie) => {
    sessionCookie = cookie;
};

const getSessionCookie = () => sessionCookie;

const clearSessionCookie = () => {
    sessionCookie = null;
};

/**
 * Realiza un request al API externo.
 * @param {string} apiUrl - URL base del API externo
 * @param {string} endpoint - Ruta del endpoint (ej: '/apirest/admrest')
 * @param {string} method - Método HTTP (GET, POST, etc.)
 * @param {object} data - Payload para POST
 * @param {object} extraConfig - Additional axios config (e.g., responseType)
 * @param {boolean} returnFullResponse - If true, returns full axios response instead of just data
 * @param {string} apiToken - Token/API key para la cabecera X-API-KEY
 * @returns {object} Respuesta del API externo
 */
const callExternalApi = async (apiUrl, endpoint, method = 'GET', data = null, extraConfig = {}, returnFullResponse = false, apiToken = '') => {
    try {
        const url = `${apiUrl}${endpoint}`;
        const headers = {
            'X-API-KEY': apiToken || 'aaabbbccc',
        };

        if (sessionCookie) {
            headers['Cookie'] = sessionCookie;
        }

        const config = {
            method,
            url,
            headers,
            ...extraConfig,
        };

        if (method === 'POST' && data) {
            config.data = data;
        }

        const response = await axios(config);

        const setCookieHeader = response.headers['set-cookie'];
        if (setCookieHeader) {
            const cookieMatch = setCookieHeader.find(c => c.startsWith('4DSID'));
            if (cookieMatch) {
                sessionCookie = cookieMatch.split(';')[0];
            }
        }

        return returnFullResponse ? response : response.data;
    } catch (error) {
        console.error('External API error:', error.message);
        throw {
            status: 'KO',
            message: error.response?.data?.message || error.message,
            details: error.response?.data,
        };
    }
};

module.exports = {
    callExternalApi,
    setSessionCookie,
    getSessionCookie,
    clearSessionCookie,
};
