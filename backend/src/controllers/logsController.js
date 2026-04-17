const { getLogs } = require('../services/loggingService');

/**
 * GET /api/logs
 * Obtiene registros de eventos (solo superusuario)
 */
const getEventLogs = async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 50, 200);
        const skip = parseInt(req.query.skip) || 0;

        const filters = {
            configName: req.query.configName,
            route: req.query.route,
            statusCode: req.query.statusCode ? parseInt(req.query.statusCode) : null,
            method: req.query.method,
            fromDate: req.query.fromDate,
            toDate: req.query.toDate,
        };

        // Limpia filtros nulos
        Object.keys(filters).forEach((key) => {
            if (!filters[key]) delete filters[key];
        });

        const { logs, total } = await getLogs(filters, limit, skip);

        return res.status(200).json({
            status: 'ok',
            data: logs,
            pagination: {
                total,
                limit,
                skip,
                hasMore: skip + limit < total,
            },
        });
    } catch (error) {
        console.error('getEventLogs error:', error);
        return res.status(500).json({
            status: 'KO',
            message: error.message || 'Error al obtener logs',
        });
    }
};

module.exports = {
    getEventLogs,
};
