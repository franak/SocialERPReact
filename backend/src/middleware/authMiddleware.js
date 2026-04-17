const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Middleware para validar autenticación de superusuario.
 */
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ status: 'KO', message: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ status: 'KO', message: 'Token inválido' });
    }
};

module.exports = authMiddleware;
