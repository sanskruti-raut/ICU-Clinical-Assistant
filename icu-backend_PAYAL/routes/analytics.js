const express = require('express');
const router = express.Router();
const pool = require('../db');
const { getAnalyticsSummary } = require('../utils/analytics');

router.get('/analytics-summary', async (req, res) => {
  try {
    const summary = await getAnalyticsSummary(pool);
    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating ICU summary");
  }
});

module.exports = router;
