const config = require('../config');

const resolveApiConfig = (configName) => {
    const defaultConfig = { url: config.defaultApiUrl, token: '' };
    if (!configName) {
        return config.apiConfigMap.default || defaultConfig;
    }
    return config.apiConfigMap[configName] || config.apiConfigMap.default || defaultConfig;
};

const resolveApiUrl = (configName) => {
    return resolveApiConfig(configName).url;
};

const resolveApiToken = (configName) => {
    return resolveApiConfig(configName).token;
};

const getConfigNameFromRequest = (req) => {
    if (req.query.config) {
        return req.query.config;
    }

    const host = req.get('host');
    if (host) {
        const parts = host.split('.');
        if (parts.length > 1 && parts[0] !== 'www') {
            const subdomain = parts[0];
            if (config.apiConfigMap[subdomain]) {
                return subdomain;
            }
        }
    }

    return 'default';
};

module.exports = {
    resolveApiUrl,
    resolveApiToken,
    getConfigNameFromRequest,
};
