const { createLog } = require('../services/loggingService');
const { getConfigNameFromRequest } = require('../services/configResolver');

/**
 * Middleware para registrar cada request y response en MongoDB.
 */
const logRequest = async (req, res, next) => {
    const startTime = Date.now();
    const configName = getConfigNameFromRequest(req);

    // Captura el originalSend para interceptar la respuesta
    const originalSend = res.send;
    const originalSendFile = res.sendFile;

    let responseBody = null;
    let isBinaryResponse = false;

    res.send = function (data) {
        responseBody = data;
        // Detect binary responses (Buffer, binary strings starting with image markers)
        if (Buffer.isBuffer(data) || (typeof data === 'string' && (data.startsWith('') || data.includes('JFIF') || data.includes('PNG')))) {
            isBinaryResponse = true;
        }
        return originalSend.call(this, data);
    };

    // Override sendFile for binary file serving
    res.sendFile = function () {
        isBinaryResponse = true;
        return originalSendFile.apply(this, arguments);
    };

    // Ejecuta el siguiente middleware/ruta y luego loguea
    res.on('finish', async () => {
        const duration = Date.now() - startTime;
        const contentType = res.get('Content-Type') || '';
        const isBinary = isBinaryResponse || contentType.startsWith('image/') || contentType.startsWith('application/octet-stream');

        const logData = {
            timestamp: new Date(),
            route: `${req.method} ${req.path}`,
            method: req.method,
            configName,
            externalApiUrl: req.externalApiUrl || null,
            requestBody: req.method !== 'GET' ? req.body : null,
            responseBody: (!isBinary && responseBody) ? (() => {
                try { return JSON.parse(responseBody); } catch { return responseBody; }
            })() : null,
            statusCode: res.statusCode,
            userAgent: req.get('user-agent'),
            ip: req.ip,
            username: req.user?.username || null,
            error: res.statusCode >= 400 ? 'Error' : null,
        };

        await createLog(logData);
    });

    next();
};

module.exports = logRequest;
