const { callExternalApi } = require('../services/externalApiService');
const { resolveApiUrl } = require('../services/configResolver');

/**
 * GET /api/empresa
 * Obtiene datos de la empresa (equivalente a WEB_DatosConexion)
 */
const getEmpresa = async (req, res) => {
    try {
        const configName = req.configName;
        const apiUrl = resolveApiUrl(configName);

        req.externalApiUrl = apiUrl;

        const response = await callExternalApi(
            apiUrl,
            '/apirest/admrest/?proceso=WEB_DatosConexion',
            'GET'
        );

        return res.status(200).json(response);
    } catch (error) {
        console.error('getEmpresa error:', error);
        return res.status(500).json({
            status: 'KO',
            message: error.message || 'Error al obtener datos de empresa',
        });
    }
};

/**
 * GET /api/empresa/logo/:uuidEmpresa
 * Obtiene el logotipo de la empresa desde /apirest/crmsit/?proceso=getfoto&mss={UUID}
 */
const getEmpresaLogo = async (req, res) => {
    try {
        const { uuidEmpresa } = req.params;
        const configName = req.configName;
        const apiUrl = resolveApiUrl(configName);

        req.externalApiUrl = apiUrl;

        const response = await callExternalApi(
            apiUrl,
            `/apirest/crmsit/?proceso=getfoto&mss=${uuidEmpresa}`,
            'GET',
            null,
            { responseType: 'arraybuffer' },
            true // Return full response to access headers
        );

        // Detect content type from response or default to image/png
        const contentType = response.headers?.['content-type'] || 'image/png';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24h

        return res.status(200).send(response.data);
    } catch (error) {
        console.error('getEmpresaLogo error:', error);
        return res.status(500).json({
            status: 'KO',
            message: error.message || 'Error al obtener logotipo de empresa',
        });
    }
};

/**
 * GET /api/server-info
 * Obtiene información del servidor
 */
const getServerInfo = async (req, res) => {
    try {
        const configName = req.configName;
        const apiUrl = resolveApiUrl(configName);

        req.externalApiUrl = apiUrl;

        const response = await callExternalApi(
            apiUrl,
            '/apirest/admrest/serverinfo',
            'GET'
        );

        return res.status(200).json(response);
    } catch (error) {
        console.error('getServerInfo error:', error);
        return res.status(500).json({
            status: 'KO',
            message: error.message || 'Error al obtener info del servidor',
        });
    }
};

module.exports = {
    getEmpresa,
    getEmpresaLogo,
    getServerInfo,
};
