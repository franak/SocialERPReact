const express = require('express');
const router = express.Router();

const { getAllEventos } = require('../controllers/calendarioController');
const authMiddleware = require('../middleware/authMiddleware');

// All admin routes require JWT authentication
router.use(authMiddleware);

// Admin: get all events (optionally filtered)
router.get('/calendarios', getAllEventos);

module.exports = router;
