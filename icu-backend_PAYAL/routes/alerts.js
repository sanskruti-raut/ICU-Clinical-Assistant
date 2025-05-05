const express = require('express');
const router = express.Router();
const { getLatestVital, checkForAlert } = require('../simulator');

// Keep track of active alerts (up to 5 most recent)
let activeAlerts = [];

router.get('/alerts', (req, res) => {
  const vital = getLatestVital();
  const alert = checkForAlert(vital);
  
  if (alert) {
    // Check if this exact alert is already in our list
    if (!activeAlerts.includes(alert)) {
      // Add new alert to the beginning of the array
      activeAlerts.unshift(alert);
      // Keep only the 5 most recent alerts
      if (activeAlerts.length > 5) {
        activeAlerts = activeAlerts.slice(0, 5);
      }
    }
  }
  
  res.json({ alerts: activeAlerts });
});

module.exports = router;
