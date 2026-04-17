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

    // CORS - Soporta múltiples orígenes (separados por comas o JSON)
    corsOrigin: (() => {
        const corsEnv = process.env.CORS_ORIGIN || 'http://localhost:3001';
        
        // Si comienza con '[', intenta parsear como JSON
        if (corsEnv.trim().startsWith('[')) {
            try {
                return JSON.parse(corsEnv);
            } catch (e) {
                console.warn('CORS_ORIGIN JSON parse error:', e.message);
                return corsEnv;
            }
        }
        
        // Si contiene comas, divide en array
        if (corsEnv.includes(',')) {
            return corsEnv.split(',').map(origin => origin.trim());
        }
        
        // Si es un único origen, retórnalo como string
        return corsEnv;
    })(),
};

module.exports = config;
