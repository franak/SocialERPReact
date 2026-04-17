const { callExternalApi } = require('../services/externalApiService');
const { resolveApiUrl, resolveApiToken } = require('../services/configResolver');

/**
 * Convierte saltos de línea de texto plano a etiquetas <br> de HTML.
 * @param {string} texto - El texto original con caracteres \n o \r.
 * @returns {string} - El texto procesado con etiquetas HTML.
 */
function convertirSaltosLineaHTML(texto) {
    return texto.replace(/\r?\n/g, '<br/>');
}

/**
 * POST /api/control-presencia
 * Envía registro de presencia (entrada, salida, último parte)
 */
const registrarPresencia = async (req, res) => {
    try {
        const configName = req.configName;
        const apiUrl = resolveApiUrl(configName);
        const apiToken = resolveApiToken(configName);

        req.externalApiUrl = apiUrl;

        const payload = {
            Funcion: req.body.Funcion || 'CrearParte',
            Tipo: req.body.Tipo,
            UUIDCentral: req.body.UUIDCentral,
            ClaveEmpleado: req.body.ClaveEmpleado,
            GPS: req.body.GPS || 'n/d',
            userAgent: req.body.userAgent,
            Hora: req.body.Hora,
            IP: req.body.IP || '',
            HoraExtra: req.body.HoraExtra || false,
        };

        let response = await callExternalApi(
            apiUrl,
            '/apirest/controlpresencia',
            'POST',
            payload,
            {},
            false,
            apiToken
        );

        if (req.body.Tipo === 'ultimo' && response.UUIDCuentaContable) {
            response = { ...response, uuidCuentaContableSession: response.UUIDCuentaContable };
        }

        return res.status(200).json(response);
    } catch (error) {
        console.error('registrarPresencia error:', error);
        return res.status(500).json({
            status: 'KO',
            message: error.message || 'Error al registrar presencia',
        });
    }
};

/**
 * GET /api/nominas
 * Obtiene las nóminas del empleado desde el API externo
 */
const getNominas = async (req, res) => {
    try {
        const configName = req.configName;
        const apiUrl = resolveApiUrl(configName);
        const apiToken = resolveApiToken(configName);

        const uuidCuentaContable = req.query.UUIDCuentaContable;

        if (!uuidCuentaContable) {
            return res.status(400).json({
                status: 'KO',
                message: 'UUIDCuentaContable es requerido',
            });
        }

        const response = await callExternalApi(
            apiUrl,
            `/apirest/st_documentos/?proceso=Nominas&UUIDCuentaContable=${uuidCuentaContable}`,
            'GET',
            null,
            {},
            false,
            apiToken
        );

        return res.status(200).json(response);
    } catch (error) {
        console.error('getNominas error:', error);
        return res.status(500).json({
            status: 'KO',
            message: error.message || 'Error al obtener nóminas',
        });
    }
};

/**
 * GET /api/nominas/pdf
 * Obtiene el PDF de la nómina desde el API externo
 */
const getNominaPdf = async (req, res) => {
    try {
        const configName = req.configName;
        const apiUrl = resolveApiUrl(configName);
        const apiToken = resolveApiToken(configName);

        const { UUIDNomina, UUIDCuentaContable } = req.query;

        if (!UUIDNomina || !UUIDCuentaContable) {
            return res.status(400).json({
                status: 'KO',
                message: 'UUIDNomina y UUIDCuentaContable son requeridos',
            });
        }

        const response = await callExternalApi(
            apiUrl,
            `/apirest/st_documentos/?proceso=nominapdf&UUIDNomina=${UUIDNomina}&UUIDCuentaContable=${UUIDCuentaContable}`,
            'GET',
            null,
            {},
            false,
            apiToken
        );

        return res.status(200).json(response);
    } catch (error) {
        console.error('getNominaPdf error:', error);
        return res.status(500).json({
            status: 'KO',
            message: error.message || 'Error al obtener PDF de nómina',
        });
    }
};

/**
 * GET /api/historial-presencia
 * Obtiene el historial de control de presencia del empleado
 */
const getHistorialPresencia = async (req, res) => {
    try {
        const configName = req.configName;
        const apiUrl = resolveApiUrl(configName);
        const apiToken = resolveApiToken(configName);

        const { ClaveEmpleado, UUIDCentral } = req.query;

        if (!ClaveEmpleado || !UUIDCentral) {
            return res.status(400).json({
                status: 'KO',
                message: 'ClaveEmpleado y UUIDCentral son requeridos',
            });
        }

        const payload = {
            Funcion: 'CrearParte',
            Tipo: 'todos',
            UUIDCentral: UUIDCentral,
            ClaveEmpleado: ClaveEmpleado,
            GPS: 'n/d',
            userAgent: '',
            Hora: new Date().toISOString(),
            IP: '',
            HoraExtra: false,
        };

        const response = await callExternalApi(
            apiUrl,
            '/apirest/controlpresencia',
            'POST',
            payload,
            {},
            false,
            apiToken
        );

        return res.status(200).json(response);
    } catch (error) {
        console.error('getHistorialPresencia error:', error);
        return res.status(500).json({
            status: 'KO',
            message: error.message || 'Error al obtener historial de presencia',
        });
    }
};

module.exports = {
    registrarPresencia,
    getNominas,
    getNominaPdf,
    getHistorialPresencia,
};
