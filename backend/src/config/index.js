require('dotenv').config();

const config = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',

    // MongoDB
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/socialerp',

    // API externo
    defaultApiUrl: process.env.API_DEFAULT_URL || 'https://fc.socialerp.net:8050',
    apiConfigMap: (() => {
        try {
            if (!process.env.API_CONFIG_MAP) {
                return { default: { url: 'https://fc.socialerp.net:8443', token: '' } };
            }
            const parsed = JSON.parse(process.env.API_CONFIG_MAP);
            const result = {};
            for (const [key, value] of Object.entries(parsed)) {
                if (typeof value === 'string') {
                    result[key] = { url: value, token: '' };
                } else {
                    result[key] = { url: value.url || '', token: value.token || '' };
                }
            }
            return result;
        } catch (e) {
            console.warn('API_CONFIG_MAP parsing error:', e.message);
            return { default: { url: 'https://fc.socialerp.net:8443', token: '' } };
        }
    })(),

    // Superusuario
    superuser: {
        username: process.env.SUPERUSER_USERNAME || 'admin',
        password: process.env.SUPERUSER_PASSWORD || 'admin123',
    },

    // JWT
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',

    // CORS
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3001',
};

module.exports = config;
