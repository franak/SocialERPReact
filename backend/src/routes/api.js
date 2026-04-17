const express = require('express');
const router = express.Router();

const { getEmpresa, getEmpresaLogo, getServerInfo } = require('../controllers/empresaController');
const { registrarPresencia, getNominas, getNominaPdf, getHistorialPresencia } = require('../controllers/presenciaController');
const { getConfigNameFromRequest } = require('../services/configResolver');

// Middleware para resolver config
router.use((req, res, next) => {
    req.configName = getConfigNameFromRequest(req);
    next();
});

// Rutas públicas
router.get('/empresa', getEmpresa);
router.get('/empresa/logo/:uuidEmpresa', getEmpresaLogo);
router.get('/server-info', getServerInfo);
router.post('/control-presencia', registrarPresencia);
router.get('/nominas', getNominas);
router.get('/nominas/pdf', getNominaPdf);
router.get('/historial-presencia', getHistorialPresencia);

module.exports = router;
