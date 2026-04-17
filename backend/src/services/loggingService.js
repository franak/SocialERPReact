const Log = require('../models/Log');

/**
 * Crea un registro de log en MongoDB.
 * @param {object} logData - Datos del log
 * @returns {Promise}
 */
const createLog = async (logData) => {
    try {
        const log = new Log(logData);
        await log.save();
        return log;
    } catch (error) {
        console.error('Logging error:', error.message);
        // No lanzan error para no interrumpir el flujo principal
    }
};

/**
 * Obtiene logs con filtros opcionales.
 * @param {object} filters - Filtros (configName, route, statusCode, etc.)
 * @param {number} limit - Límite de registros
 * @param {number} skip - Offset para paginación
 * @returns {Promise<Array>}
 */
const getLogs = async (filters = {}, limit = 50, skip = 0) => {
    try {
        const query = {};

        if (filters.configName) query.configName = filters.configName;
        if (filters.route) query.route = filters.route;
        if (filters.statusCode) query.statusCode = filters.statusCode;
        if (filters.method) query.method = filters.method;

        if (filters.fromDate && filters.toDate) {
            query.timestamp = {
                $gte: new Date(filters.fromDate),
                $lte: new Date(filters.toDate),
            };
        }

        const logs = await Log.find(query).sort({ timestamp: -1 }).limit(limit).skip(skip);
        const total = await Log.countDocuments(query);

        return { logs, total };
    } catch (error) {
        console.error('Get logs error:', error.message);
        throw error;
    }
};

module.exports = {
    createLog,
    getLogs,
};
