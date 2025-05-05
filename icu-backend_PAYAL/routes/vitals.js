const express = require('express');
const router = express.Router();
const pool = require('../db');
const {
  preloadVitalsForSubject,
  startSubjectSimulation,
  getLatestForSubject,
  simulatedVitals
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
  console.log('API request for vitals stream for patient ' + subjectId);

  try {
    // If no simulator exists for this subject, preload and start it
    if (!getLatestForSubject(subjectId)) {
      console.log('No simulator found for patient ' + subjectId + ', starting one');

      // Check global vitals first to see if we already have data for this patient
      let patientVitals = simulatedVitals.filter(vital => String(vital.subject_id) === String(subjectId));

      if (patientVitals.length === 0) {
        console.log('No vitals in global pool, querying database for patient ' + subjectId);
        patientVitals = await preloadVitalsForSubject(pool, subjectId);
      } else {
        console.log('Found ' + patientVitals.length + ' vitals in global pool for patient ' + subjectId);
      }

      if (patientVitals.length === 0) {
        console.log('No vitals found for patient ' + subjectId);
        return res.status(404).json({ error: 'No vitals found for subject' });
      }

      startSubjectSimulation(subjectId, patientVitals);
    }

    const vital = getLatestForSubject(subjectId);
    console.log('Returning latest vital for patient ' + subjectId + ': ' + (vital ? 'data available' : 'no data'));
    res.json(vital || {});
  } catch (err) {
    console.error('Error streaming vitals for patient ' + subjectId + ': ' + err);
    res.status(500).send("Error streaming vitals");
  }
});

module.exports = router;
