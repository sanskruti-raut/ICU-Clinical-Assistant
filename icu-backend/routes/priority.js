const express = require('express');
const router = express.Router();
const { getPriorityList } = require('../controllers/priorityController');

router.get('/list', getPriorityList);

module.exports = router;
