const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * POST /api/auth/login
 * Login de superusuario
 */
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                status: 'KO',
                message: 'Username y password son requeridos',
            });
        }

        if (username !== config.superuser.username || password !== config.superuser.password) {
            return res.status(401).json({
                status: 'KO',
                message: 'Credenciales inválidas',
            });
        }

        const token = jwt.sign(
            { username, role: 'superuser' },
            config.jwtSecret,
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            status: 'ok',
            message: 'Autenticacion exitosa',
            token,
        });
    } catch (error) {
        console.error('login error:', error);
        return res.status(500).json({
            status: 'KO',
            message: 'Error al autenticar',
        });
    }
};

module.exports = {
    login,
};
