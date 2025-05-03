const express = require('express');
const router = express.Router();
const { getLatestVital, checkForAlert } = require('../simulator');

router.get('/alerts', (req, res) => {
  const vital = getLatestVital();
  const alert = checkForAlert(vital);
  res.json(alert ? { alert } : {});
});

module.exports = router;
