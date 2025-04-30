const express = require('express');
const router = express.Router();
const { getPatientsOverview } = require('../controllers/patientsController');

router.get('/overview', getPatientsOverview);

module.exports = router;
