const express = require('express');
const router = express.Router();
const { getRecentAlerts } = require('../controllers/alertsController');

router.get('/recent', getRecentAlerts);

module.exports = router;
