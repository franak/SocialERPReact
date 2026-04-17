const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');

const config = require('./config');
const logRequest = require('./middleware/logRequest');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const calendarioRoutes = require('./routes/calendario');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Servir archivos estáticos del frontend compilado
const frontendPath = path.join(__dirname, '../../frontend/build');
app.use(express.static(frontendPath));

// Conectar a MongoDB
mongoose
    .connect(config.mongodbUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('✓ MongoDB conectado'))
    .catch((err) => {
        console.error('✗ Error conectando a MongoDB:', err.message);
        process.exit(1);
    });

// Middleware de logging para cada request
app.use(logRequest);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend online' });
});

// Rutas
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/calendario', calendarioRoutes);
app.use('/api/admin', adminRoutes);

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({
        status: 'KO',
        message: 'Error interno del servidor',
    });
});

// Servir index.html para rutas del frontend (React Router)
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
        if (err) {
            res.status(404).json({
                status: 'KO',
                message: 'Ruta no encontrada',
            });
        }
    });
});

const PORT = config.port;
app.listen(PORT, () => {
    console.log(`✓ Servidor escuchando en puerto ${PORT}`);
    console.log(`✓ Frontend: http://localhost:${PORT}`);
    console.log(`✓ API: http://localhost:${PORT}/api`);
});
