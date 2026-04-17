const express = require('express');
const router = express.Router();

const {
    getEventos,
    createEvento,
    updateEvento,
    deleteEvento,
} = require('../controllers/calendarioController');

// Employee endpoints (no JWT required, but claveEmpleado in query/body acts as access key)
router.get('/', getEventos);
router.post('/', createEvento);
router.put('/:uuid', updateEvento);
router.delete('/:uuid', deleteEvento);

module.exports = router;
