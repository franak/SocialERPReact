const express = require('express');
const router = express.Router();

const { getEventLogs } = require('../controllers/logsController');
const { login } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/login', login);

router.use(authMiddleware);

// Admin: get event logs
router.get('/logs', getEventLogs);

module.exports = router;
