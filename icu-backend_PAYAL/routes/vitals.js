const express = require('express');
const router = express.Router();
const pool = require('../db');
const {
  preloadVitalsForSubject,
  startSubjectSimulation,
  getLatestForSubject
} = require('../simulator');

// Default streaming endpoint
router.get('/vitals/stream', (req, res) => {
  const { getLatestVital } = require('../simulator');
  const vital = getLatestVital();
  res.json(vital || {});
});

// New subject-specific streaming endpoint
router.get('/vitals/stream/:subject_id', async (req, res) => {
  const subjectId = req.params.subject_id;

  try {
    // If no simulator exists for this subject, preload and start it
    if (!getLatestForSubject(subjectId)) {
      const vitals = await preloadVitalsForSubject(pool, subjectId);
      if (vitals.length === 0) return res.status(404).json({ error: 'No vitals found for subject' });
      startSubjectSimulation(subjectId, vitals);
    }

    const vital = getLatestForSubject(subjectId);
    res.json(vital || {});
  } catch (err) {
    console.error(err);
    res.status(500).send("Error streaming vitals");
  }
});

module.exports = router;
